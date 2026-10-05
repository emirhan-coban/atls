import { supabase, isSupabaseConfigured } from './supabase';
import { storageService, buildNewProfile } from './storageService';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession();

export const authService = {
  // Sign up with Email & Password
  async signUp({ email, password, name }) {
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
          } catch (profileErr) {
            console.warn('[authService] Profile upsert notice:', profileErr);
          }
        }

        // If session was not returned directly from signUp, attempt immediate sign-in
        if (!data?.session) {
          try {
            const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
              email,
              password,
            });
            if (!signInErr && signInData?.session) {
              data.session = signInData.session;
              data.user = signInData.user || data.user;
            }
          } catch (autoSignErr) {
            // Ignore if email confirmation is temporarily enforced on server
          }
        }

        return data;
      } catch (err) {
        // If Supabase has a database trigger error (schema not executed yet)
        if (err.message && err.message.includes('Database error saving new user')) {
          console.warn('[authService] Supabase trigger error (schema.sql needed in SQL editor):', err.message);
          // Graceful local fallback so user is never blocked from app testing
          const profile = buildNewProfile({ name, email });
          await storageService.saveProfile(profile);
          return { user: { email, id: 'local-user' }, profile, isTriggerFallback: true };
        }
        throw err;
      }
    }

    // Offline / Local fallback: Build fresh profile
    const profile = buildNewProfile({ name, email });
    await storageService.saveProfile(profile);
    return { user: { email, id: 'local-user' }, profile };
  },

  // Sign in with Email & Password
  async signIn({ email, password }) {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        return data;
      } catch (err) {
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
  async signInWithApple() {
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
            } catch (pErr) {
              console.warn('[authService] Profile upsert notice:', pErr);
            }
          }
          return data;
        } catch (supabaseErr) {
          console.warn('[authService] Supabase Apple Auth note:', supabaseErr.message);
        }
      }

      // Local / Offline fallback
      const profile = buildNewProfile({ name: fullName, email: userEmail });
      await storageService.saveProfile(profile);
      return { user: { email: userEmail, id: credential.user || 'apple-user' }, profile };
    } catch (err) {
      if (err.code === 'ERR_REQUEST_CANCELED') {
        return null; // User tapped cancel
      }
      throw err;
    }
  },

  // Sign in with Google
  async signInWithGoogle() {
    try {
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
              const accessToken = params.get('access_token');
              const refreshToken = params.get('refresh_token');

              if (accessToken && refreshToken) {
                const sessionRes = await supabase.auth.setSession({
                  access_token: accessToken,
                  refresh_token: refreshToken,
                });

                if (sessionRes.data?.user) {
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
              }
            } else if (authResult.type === 'cancel' || authResult.type === 'dismiss') {
              return null; // User cancelled
            }
          }
        } catch (oauthErr) {
          console.warn('[authService] Supabase Google OAuth note:', oauthErr.message);
        }
      }

      // Local / Offline fallback
      const profile = buildNewProfile({ name: 'Google Traveler', email: 'traveler@gmail.com' });
      await storageService.saveProfile(profile);
      return { user: { email: 'traveler@gmail.com', id: 'google-user' }, profile };
    } catch (err) {
      throw err;
    }
  },

  // Sign out
  async signOut() {
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.auth.signOut();
        if (error) console.warn('[authService] SignOut error:', error);
      } catch (e) {
        console.warn('[authService] SignOut exception:', e);
      }
    }
  },

  // Check current session
  async getSession() {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        return session;
      } catch (e) {
        console.warn('[authService] getSession error:', e);
      }
    }
    return null;
  },
};
