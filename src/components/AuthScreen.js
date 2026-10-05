import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { 
  Mail, 
  Lock, 
  User, 
  ArrowRight,
  Eye,
  EyeOff,
  Languages,
  ShieldCheck,
  Apple,
} from 'lucide-react-native';
import Svg, { Path } from 'react-native-svg';
import { authService } from '../services/authService';
import { generateHandle } from '../services/storageService';

const GoogleIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24">
    <Path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
    />
    <Path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
    />
    <Path
      fill="#FBBC05"
      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.97 0 12s.45 3.83 1.25 5.42l4.03-3.15z"
    />
    <Path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
    />
  </Svg>
);

export default function AuthScreen({
  onLoginSuccess,
  t,
  currentLang,
  onToggleLang,
}) {
  const [tab, setTab] = useState('login'); // 'login' | 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    const trimmedEmail = email.trim();
    const trimmedName = name.trim();

    if (tab === 'register' && !trimmedName) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert('Bilgi', currentLang === 'tr' ? 'Lütfen adınızı ve soyadınızı giriniz.' : 'Please enter your full name.');
      return;
    }

    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert('Bilgi', currentLang === 'tr' ? 'Lütfen geçerli bir e-posta adresi giriniz.' : 'Please enter a valid email address.');
      return;
    }

    if (!password || password.length < 6) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert('Bilgi', currentLang === 'tr' ? 'Şifreniz en az 6 karakter olmalıdır.' : 'Password must be at least 6 characters.');
      return;
    }

    try {
      setIsLoading(true);
      let authResult;

      if (tab === 'register') {
        authResult = await authService.signUp({
          email: trimmedEmail,
          password,
          name: trimmedName,
        });
      } else {
        authResult = await authService.signIn({
          email: trimmedEmail,
          password,
        });
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      const cleanName = trimmedName || authResult?.user?.user_metadata?.name || trimmedEmail.split('@')[0] || 'Traveler';
      const cleanHandle = generateHandle(cleanName);

      onLoginSuccess({
        name: cleanName,
        handle: cleanHandle,
        email: trimmedEmail,
        avatarInitials: cleanName.substring(0, 2).toUpperCase(),
      });

      // If user registered with trigger fallback
      if (tab === 'register' && authResult?.isTriggerFallback) {
        Alert.alert(
          currentLang === 'tr' ? 'Hesap Oluşturuldu' : 'Account Created',
          currentLang === 'tr'
            ? 'Hesabınız başarıyla oluşturuldu! Supabase bulut veritabanını etkinleştirmek için Supabase SQL Editor üzerinden schema.sql dosyasını çalıştırmanız önerilir.'
            : 'Account created! To enable cloud database sync, please run schema.sql in your Supabase SQL Editor.'
        );
      }
    } catch (err) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      let errorMsg = err.message || (currentLang === 'tr' ? 'İşlem sırasında bir hata oluştu.' : 'An error occurred.');
      if (errorMsg.includes('Invalid login credentials')) {
        errorMsg = currentLang === 'tr' ? 'E-posta adresi veya şifre hatalı. Lütfen kontrol ediniz.' : 'Invalid email or password.';
      } else if (errorMsg.includes('User already registered')) {
        errorMsg = currentLang === 'tr' ? 'Bu e-posta adresi ile zaten kayıtlı bir hesap var. Lütfen giriş yapınız.' : 'An account already exists with this email. Please log in.';
      } else if (errorMsg.includes('Email not confirmed')) {
        errorMsg = currentLang === 'tr' ? 'E-posta adresiniz henüz onaylanmamış. Lütfen e-postanızı kontrol ediniz.' : 'Email is not confirmed yet. Please check your inbox.';
      } else if (errorMsg.includes('Password should be at least')) {
        errorMsg = currentLang === 'tr' ? 'Şifreniz en az 6 karakter olmalıdır.' : 'Password must be at least 6 characters.';
      }

      Alert.alert(currentLang === 'tr' ? 'İşlem Başarısız' : 'Action Failed', errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    try {
      setIsLoading(true);
      const res = await authService.signInWithApple();
      if (!res) return; // Cancelled

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const cleanName = res?.profile?.name || res?.user?.user_metadata?.name || 'Traveler';
      const cleanHandle = res?.profile?.handle || generateHandle(cleanName);

      onLoginSuccess({
        name: cleanName,
        handle: cleanHandle,
        email: res?.user?.email || res?.profile?.email || 'apple_traveler@icloud.com',
        avatarInitials: cleanName.substring(0, 2).toUpperCase(),
      });
    } catch (err) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        currentLang === 'tr' ? 'Apple Girişi' : 'Apple Sign-In',
        err.message || 'Lütfen tekrar deneyiniz.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      const res = await authService.signInWithGoogle();
      if (!res) return; // Cancelled

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const cleanName = res?.profile?.name || res?.user?.user_metadata?.full_name || res?.user?.user_metadata?.name || 'Google Traveler';
      const cleanHandle = res?.profile?.handle || generateHandle(cleanName);

      onLoginSuccess({
        name: cleanName,
        handle: cleanHandle,
        email: res?.user?.email || res?.profile?.email || 'traveler@gmail.com',
        avatarInitials: cleanName.substring(0, 2).toUpperCase(),
      });
    } catch (err) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        currentLang === 'tr' ? 'Google Girişi' : 'Google Sign-In',
        err.message || 'Lütfen tekrar deneyiniz.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.topBar}>
        <View style={styles.logoRow}>
          <Text style={styles.logoText}>atls</Text>
          <Text style={styles.logoDot}>.</Text>
        </View>

        {onToggleLang && (
          <TouchableOpacity
            onPress={() => {
              Haptics.selectionAsync();
              onToggleLang();
            }}
            activeOpacity={0.7}
            style={styles.langPill}
          >
            <Languages size={13} color="#2563EB" />
            <Text style={styles.langPillText}>
              {t?.langSwitch || (currentLang === 'tr' ? 'EN' : 'TR')}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Welcome Text */}
          <View style={styles.headerTextCol}>
            <Text style={styles.mainTitle}>
              {tab === 'login' 
                ? (currentLang === 'tr' ? 'Pasaportuna Giriş Yap' : 'Welcome Back')
                : (currentLang === 'tr' ? 'Hesabını Oluştur' : 'Create Your Passport')}
            </Text>
            <Text style={styles.subTitle}>
              {tab === 'login'
                ? (currentLang === 'tr' 
                    ? 'Ziyaret ettiğin ve yaşadığın tüm ülkeleri senkronize etmek için hesabına giriş yap.' 
                    : 'Sign in to synchronize all your visited and lived countries securely.')
                : (currentLang === 'tr'
                    ? 'Kişisel dünya seyahat pasaportunu başlatmak için bilgilerini doldur.'
                    : 'Fill in your details to start your personal world passport.')}
            </Text>
          </View>

          {/* Tab Switcher */}
          <View style={styles.tabBar}>
            <TouchableOpacity
              onPress={() => {
                Haptics.selectionAsync();
                setTab('login');
              }}
              activeOpacity={0.8}
              style={[styles.tabItem, tab === 'login' && styles.tabItemActive]}
            >
              <Text style={[styles.tabText, tab === 'login' && styles.tabTextActive]}>
                {t?.loginTab || 'Giriş Yap'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                Haptics.selectionAsync();
                setTab('register');
              }}
              activeOpacity={0.8}
              style={[styles.tabItem, tab === 'register' && styles.tabItemActive]}
            >
              <Text style={[styles.tabText, tab === 'register' && styles.tabTextActive]}>
                {t?.registerTab || 'Kayıt Ol'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {tab === 'register' && (
              <View style={styles.inputBox}>
                <User size={18} color="#94A3B8" />
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder={t?.fullName || 'Ad Soyad'}
                  placeholderTextColor="#94A3B8"
                  autoCapitalize="words"
                  autoCorrect={false}
                  style={styles.input}
                />
              </View>
            )}

            <View style={styles.inputBox}>
              <Mail size={18} color="#94A3B8" />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder={t?.email || 'E-posta adresi'}
                placeholderTextColor="#94A3B8"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="emailAddress"
                style={styles.input}
              />
            </View>

            <View style={styles.inputBox}>
              <Lock size={18} color="#94A3B8" />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder={t?.password || 'Şifre (en az 6 karakter)'}
                placeholderTextColor="#94A3B8"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="password"
                style={styles.input}
              />
              <TouchableOpacity
                onPress={() => setShowPassword((prev) => !prev)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                {showPassword ? (
                  <EyeOff size={18} color="#94A3B8" />
                ) : (
                  <Eye size={18} color="#94A3B8" />
                )}
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={handleSubmit}
              activeOpacity={0.85}
              disabled={isLoading}
              style={[styles.primaryBtn, isLoading && { opacity: 0.7 }]}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Text style={styles.primaryBtnText}>
                    {tab === 'login' ? (t?.loginTab || 'Giriş Yap') : (t?.registerTab || 'Kayıt Ol')}
                  </Text>
                  <ArrowRight size={17} color="#FFFFFF" strokeWidth={2.5} />
                </>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>{currentLang === 'tr' ? 'VEYA' : 'OR'}</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social Logins */}
            <View style={styles.socialCol}>
              {Platform.OS === 'ios' && (
                <TouchableOpacity
                  onPress={handleAppleSignIn}
                  activeOpacity={0.85}
                  disabled={isLoading}
                  style={styles.appleBtn}
                >
                  <Apple size={18} color="#000000" />
                  <Text style={styles.appleBtnText}>
                    {currentLang === 'tr' ? 'Apple ile Devam Et' : 'Continue with Apple'}
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={handleGoogleSignIn}
                activeOpacity={0.85}
                disabled={isLoading}
                style={styles.googleBtn}
              >
                <GoogleIcon />
                <Text style={styles.googleBtnText}>
                  {currentLang === 'tr' ? 'Google ile Devam Et' : 'Continue with Google'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Security & Official Badge */}
          <View style={styles.securityBadge}>
            <ShieldCheck size={14} color="#2563EB" />
            <Text style={styles.securityText}>
              {currentLang === 'tr' 
                ? 'Resmi Biyometrik Pasaport & Güvenli Bulut Eşitleme' 
                : 'Verified Biometric Passport & Secure Cloud Sync'}
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 14,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  logoText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#090B10',
    letterSpacing: -0.8,
  },
  logoDot: {
    fontSize: 28,
    fontWeight: '900',
    color: '#2563EB',
  },
  langPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    height: 36,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  langPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2563EB',
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 40,
  },
  headerTextCol: {
    marginBottom: 24,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.6,
    marginBottom: 8,
  },
  subTitle: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 21,
    fontWeight: '400',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    padding: 4,
    marginBottom: 20,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 11,
    alignItems: 'center',
    borderRadius: 12,
  },
  tabItemActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#0F172A',
    fontWeight: '800',
  },
  form: {
    gap: 13,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '600',
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2563EB',
    borderRadius: 22,
    paddingVertical: 17,
    marginTop: 8,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 14,
    elevation: 4,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(37, 99, 235, 0.06)',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 16,
    marginTop: 32,
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.12)',
  },
  securityText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 10,
    marginBottom: 6,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  socialCol: {
    gap: 10,
  },
  appleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#0F172A',
    borderRadius: 22,
    paddingVertical: 15,
  },
  appleBtnText: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '800',
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 22,
    paddingVertical: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  googleBtnText: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '800',
  },
});
