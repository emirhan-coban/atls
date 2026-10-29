import { supabase, isSupabaseConfigured } from './supabase';
import { storageService, buildNewProfile } from './storageService';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

WebBrowser.maybeCompleteAuthSession();

// Configure Native Google Sign-In (no web redirect or browser domain needed)
const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '';
const GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || '';

try {
  GoogleSignin.configure({
    webClientId: GOOGLE_WEB_CLIENT_ID || undefined,
    iosClientId: GOOGLE_IOS_CLIENT_ID || undefined,
    scopes: ['https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/userinfo.profile'],
  });
} catch (e: any) {
  console.log('[authService] GoogleSignin configure notice:', e?.message);
}

export const authService = {
  // Sign up with Email & Password
  async signUp({ email, password, name }: { email: string; password: string; name?: string }): Promise<any> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: name || 'Traveler',
            },
          },
        });

        if (error) throw error;

        // Guarantee profile exists in public.profiles table
        if (data?.user) {
          try {
            const cleanName = name || email.split('@')[0] || 'Traveler';
            const localProfile = buildNewProfile({ name: cleanName, email });
            await supabase.from('profiles').upsert({
              id: data.user.id,
              email: email,
              name: cleanName,
              handle: localProfile.handle,
              avatar_initials: localProfile.avatarInitials,
              passport_no: localProfile.passportNo,
            });
          } catch (profileErr: any) {
            console.warn('[authService] Profile upsert notice:', profileErr);
          }
        }

        // If session was not created immediately, an OTP confirmation email has been dispatched
        const needsOtp = Boolean(data?.user && !data?.session);

        return { ...data, needsOtp };
      } catch (err: any) {
        // If Supabase has a database trigger error (schema not executed yet)
        if (err.message && err.message.includes('Database error saving new user')) {
          console.warn('[authService] Supabase trigger error (schema.sql needed in SQL editor):', err.message);
          // Graceful local fallback so user is never blocked from app testing
          const profile = buildNewProfile({ name, email });
          await storageService.saveProfile(profile);
          return { user: { email, id: 'local-user' }, profile, isTriggerFallback: true, needsOtp: false };
        }
        throw err;
      }
    }

    // Offline / Local fallback: Build fresh profile
    const profile = buildNewProfile({ name, email });
    await storageService.saveProfile(profile);
    return { user: { email, id: 'local-user' }, profile, needsOtp: false };
  },

  // Verify OTP Code for Sign-Up Confirmation
  async verifyOtp({ email, token, name }: { email: string; token: string; name?: string }): Promise<any> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: token.trim(),
        type: 'signup',
      });

      if (error) throw error;

      // Ensure profile in database has name and handle
      if (data?.user) {
        try {
          const cleanName = name || data.user.user_metadata?.name || email.split('@')[0] || 'Traveler';
          const localProfile = buildNewProfile({ name: cleanName, email });
          await supabase.from('profiles').upsert({
            id: data.user.id,
            email: email,
            name: cleanName,
            handle: localProfile.handle,
            avatar_initials: localProfile.avatarInitials,
            passport_no: localProfile.passportNo,
          });
        } catch (pErr: any) {
          console.warn('[authService] verifyOtp profile upsert notice:', pErr);
        }
      }

      return data;
    }

    // Offline fallback
    const profile = buildNewProfile({ name: name || email.split('@')[0], email });
    await storageService.saveProfile(profile);
    return { user: { email, id: 'local-user' }, profile, session: { user: { email } } };
  },

  // Resend OTP Code
  async resendOtp({ email }: { email: string }): Promise<any> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });
      if (error) throw error;
      return data;
    }
    return true;
  },

  // Sign in with Email & Password
  async signIn({ email, password }: { email: string; password: string }): Promise<any> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        return data;
      } catch (err: any) {
        throw err;
      }
    }

    // Offline fallback: Update existing profile email
    const profile = buildNewProfile({
      name: email.split('@')[0],
      email,
    });
    await storageService.saveProfile(profile);
    return { user: { email, id: 'local-user' }, profile };
  },

  // Sign in with Apple
  async signInWithApple(): Promise<any> {
    try {
      const isAvailable = await AppleAuthentication.isAvailableAsync();
      if (!isAvailable) {
        throw new Error('Apple Authentication is not supported on this device');
      }

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      const userEmail = credential.email || 'apple_traveler@icloud.com';
      let fullName = 'Traveler';
      if (credential.fullName) {
        const parts = [credential.fullName.givenName, credential.fullName.familyName].filter(Boolean);
        if (parts.length > 0) fullName = parts.join(' ');
      }

      if (isSupabaseConfigured && supabase && credential.identityToken) {
        try {
          const { data, error } = await supabase.auth.signInWithIdToken({
            provider: 'apple',
            token: credential.identityToken,
          });

          if (error) throw error;

          if (data?.user) {
            try {
              const cleanName = fullName !== 'Traveler' ? fullName : (data.user.email?.split('@')[0] || 'Traveler');
              const localProfile = buildNewProfile({ name: cleanName, email: data.user.email || userEmail });
              await supabase.from('profiles').upsert({
                id: data.user.id,
                email: data.user.email || userEmail,
                name: cleanName,
                handle: localProfile.handle,
                avatar_initials: localProfile.avatarInitials,
                passport_no: localProfile.passportNo,
              });
            } catch (pErr: any) {
              console.log('[authService] Profile upsert notice:', pErr);
            }
          }
          return data;
        } catch (supabaseErr: any) {
          console.log('[authService] Supabase Apple Auth note:', supabaseErr.message);
        }
      }

      // Local / Offline fallback
      const profile = buildNewProfile({ name: fullName, email: userEmail });
      await storageService.saveProfile(profile);
      return { user: { email: userEmail, id: credential.user || 'apple-user' }, profile };
    } catch (err: any) {
      if (err.code === 'ERR_REQUEST_CANCELED') {
        return null; // User tapped cancel
      }
      throw err;
    }
  },

  // Sign in with Google (Native iOS Sheet first, Web OAuth fallback)
  async signInWithGoogle(): Promise<any> {
    try {
      // 1. Try Native Google Sign-In if client ID is configured (no browser, no redirect)
      if (GOOGLE_IOS_CLIENT_ID || GOOGLE_WEB_CLIENT_ID) {
        try {
          await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: false });
          const response: any = await GoogleSignin.signIn();

          if (response?.type === 'cancelled') {
            return null; // User cancelled
          }

          const idToken = response?.data?.idToken || response?.idToken;
          const googleUser = response?.data?.user || response?.user;

          if (idToken && isSupabaseConfigured && supabase) {
            const { data, error } = await supabase.auth.signInWithIdToken({
              provider: 'google',
              token: idToken,
            });

            if (error) throw error;

            if (data?.user) {
              const cleanName = googleUser?.name || data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'Traveler';
              const localProfile = buildNewProfile({ name: cleanName, email: data.user.email });
              await supabase.from('profiles').upsert({
                id: data.user.id,
                email: data.user.email,
                name: cleanName,
                handle: localProfile.handle,
                avatar_initials: localProfile.avatarInitials,
                passport_no: localProfile.passportNo,
              });
              return data;
            }
          } else if (googleUser) {
            const cleanName = googleUser.name || 'Traveler';
            const profile = buildNewProfile({ name: cleanName, email: googleUser.email });
            await storageService.saveProfile(profile);
            return { user: { email: googleUser.email, id: googleUser.id || 'google-user' }, profile };
          }
        } catch (nativeErr: any) {
          if (nativeErr?.code === 'SIGN_IN_CANCELLED' || nativeErr?.code === '12501') {
            return null;
          }
          console.log('[authService] Native Google Sign-In note:', nativeErr?.message);
        }
      }

      // 2. Fallback: Web OAuth
      const redirectUrl = makeRedirectUri({ scheme: 'atls' });

      if (isSupabaseConfigured && supabase) {
        try {
          const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: redirectUrl,
              skipBrowserRedirect: true,
            },
          });

          if (error) throw error;

          if (data?.url) {
            const authResult = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);
            if (authResult.type === 'success' && authResult.url) {
              const url = authResult.url;
              // Extract tokens from query or hash fragment
              const hashIndex = url.indexOf('#');
              const queryIndex = url.indexOf('?');
              const paramString = hashIndex !== -1 ? url.substring(hashIndex + 1) : (queryIndex !== -1 ? url.substring(queryIndex + 1) : '');
              const params = new URLSearchParams(paramString);
              const code = params.get('code');
              const accessToken = params.get('access_token');
              const refreshToken = params.get('refresh_token');

              let sessionRes = null;
              if (code) {
                sessionRes = await supabase.auth.exchangeCodeForSession(code);
              } else if (accessToken && refreshToken) {
                sessionRes = await supabase.auth.setSession({
                  access_token: accessToken,
                  refresh_token: refreshToken,
                });
              }

              if (sessionRes?.data?.user) {
                const user = sessionRes.data.user;
                const cleanName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Traveler';
                const localProfile = buildNewProfile({ name: cleanName, email: user.email });
                await supabase.from('profiles').upsert({
                  id: user.id,
                  email: user.email,
                  name: cleanName,
                  handle: localProfile.handle,
                  avatar_initials: localProfile.avatarInitials,
                  passport_no: localProfile.passportNo,
                });
                return sessionRes.data;
              }
            } else if (authResult.type === 'cancel' || authResult.type === 'dismiss') {
              return null; // User cancelled
            }
          }
        } catch (oauthErr: any) {
          console.log('[authService] Supabase Google OAuth note:', oauthErr.message);
        }
      }

      // 3. Local / Offline fallback
      const profile = buildNewProfile({ name: 'Google Traveler', email: 'traveler@gmail.com' });
      await storageService.saveProfile(profile);
      return { user: { email: 'traveler@gmail.com', id: 'google-user' }, profile };
    } catch (err: any) {
      throw err;
    }
  },

  // Sign out
  async signOut(): Promise<any> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.auth.signOut();
        if (error) console.warn('[authService] SignOut error:', error);
      } catch (e: any) {
        console.warn('[authService] SignOut exception:', e);
      }
    }
  },

  // Check current session
  async getSession(): Promise<any> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        return session;
      } catch (e: any) {
        console.warn('[authService] getSession error:', e);
      }
    }
    return null;
  },

};
