import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import * as AppleAuthentication from 'expo-apple-authentication';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle,
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

const AppleIcon = () => (
  <Svg width={15} height={18} viewBox="0 0 384 512">
    <Path
      fill="#FFFFFF"
      d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"
    />
  </Svg>
);

export default function AuthModal({
  isOpen,
  onClose,
  onLoginSuccess,
  t,
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
      Alert.alert('Bilgi', 'Lütfen adınızı ve soyadınızı giriniz.');
      return;
    }

    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert('Bilgi', 'Lütfen geçerli bir e-posta adresi giriniz.');
      return;
    }

    if (!password || password.length < 6) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert('Bilgi', 'Şifreniz en az 6 karakter olmalıdır.');
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

      onClose();
    } catch (err) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      
      // Friendly localized error translations
      let errorMsg = err.message || 'İşlem sırasında bir hata oluştu.';
      if (errorMsg.includes('Invalid login credentials')) {
        errorMsg = 'E-posta adresi veya şifre hatalı. Lütfen kontrol ediniz.';
      } else if (errorMsg.includes('User already registered')) {
        errorMsg = 'Bu e-posta adresiyle zaten kayıtlı bir hesap var. Lütfen giriş yapınız.';
      } else if (errorMsg.includes('Email not confirmed')) {
        errorMsg = 'E-posta adresiniz henüz doğrulanmamış. Lütfen e-postanızı kontrol ediniz.';
      } else if (errorMsg.includes('Password should be at least')) {
        errorMsg = 'Şifreniz en az 6 karakter olmalıdır.';
      }

      Alert.alert('İşlem Başarısız', errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    try {
      setIsLoading(true);
      const res = await authService.signInWithApple();
      if (!res) return;

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const cleanName = res?.profile?.name || res?.user?.user_metadata?.name || 'Traveler';
      const cleanHandle = res?.profile?.handle || generateHandle(cleanName);

      onLoginSuccess({
        name: cleanName,
        handle: cleanHandle,
        email: res?.user?.email || res?.profile?.email || 'apple_traveler@icloud.com',
        avatarInitials: cleanName.substring(0, 2).toUpperCase(),
      });
      onClose();
    } catch (err) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Apple ile Giriş', err.message || 'Lütfen tekrar deneyiniz.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      const res = await authService.signInWithGoogle();
      if (!res) return;

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const cleanName = res?.profile?.name || res?.user?.user_metadata?.full_name || res?.user?.user_metadata?.name || 'Google Traveler';
      const cleanHandle = res?.profile?.handle || generateHandle(cleanName);

      onLoginSuccess({
        name: cleanName,
        handle: cleanHandle,
        email: res?.user?.email || res?.profile?.email || 'traveler@gmail.com',
        avatarInitials: cleanName.substring(0, 2).toUpperCase(),
      });
      onClose();
    } catch (err) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Google ile Giriş', err.message || 'Lütfen tekrar deneyiniz.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuest = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal visible={isOpen} animationType="fade" transparent={true}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

        <View style={styles.content}>
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.header}>
            <View>
              <View style={styles.brandRow}>
                <Text style={styles.title}>atls</Text>
                <Text style={styles.dot}>.</Text>
              </View>
              <Text style={styles.subtitle}>{t?.authSubtitle || 'Pasaportunuzu eşitlemek için giriş yapın.'}</Text>
            </View>

            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <X size={16} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Tab Switcher */}
          <View style={styles.tabBar}>
            <TouchableOpacity
              onPress={() => {
                Haptics.selectionAsync();
                setTab('login');
              }}
              style={[styles.tabItem, tab === 'login' && styles.tabItemActive]}
            >
              <Text
                style={[
                  styles.tabText,
                  tab === 'login' && styles.tabTextActive,
                ]}
              >
                {t?.loginTab || 'Giriş Yap'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                Haptics.selectionAsync();
                setTab('register');
              }}
              style={[styles.tabItem, tab === 'register' && styles.tabItemActive]}
            >
              <Text
                style={[
                  styles.tabText,
                  tab === 'register' && styles.tabTextActive,
                ]}
              >
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
              <Text style={styles.dividerText}>{t?.or || 'VEYA'}</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social Logins */}
            <View style={styles.socialCol}>
              {Platform.OS === 'ios' && (
                <TouchableOpacity
                  onPress={handleAppleSignIn}
                  activeOpacity={0.85}
                  disabled={isLoading}
                  style={[styles.socialBtn, styles.appleBtn]}
                >
                  <AppleIcon />
                  <Text style={styles.appleBtnText}>
                    {t?.continueWithApple || 'Apple ile Devam Et'}
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={handleGoogleSignIn}
                activeOpacity={0.85}
                disabled={isLoading}
                style={[styles.socialBtn, styles.googleBtn]}
              >
                <GoogleIcon />
                <Text style={styles.googleBtnText}>
                  {t?.continueWithGoogle || 'Google ile Devam Et'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Guest Mode CTA */}
          <TouchableOpacity
            onPress={handleGuest}
            activeOpacity={0.7}
            style={styles.guestBtn}
          >
            <Text style={styles.guestBtnText}>{t?.guestMode || 'Misafir Olarak Devam Et'}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingHorizontal: 22,
    paddingTop: 14,
    paddingBottom: 40,
  },
  handle: {
    width: 44,
    height: 5,
    backgroundColor: '#E2E8F0',
    borderRadius: 2.5,
    alignSelf: 'center',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.6,
  },
  dot: {
    fontSize: 26,
    fontWeight: '900',
    color: '#2563EB',
  },
  subtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    padding: 3,
    marginBottom: 16,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 13,
  },
  tabItemActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#0F172A',
    fontWeight: '800',
  },
  form: {
    gap: 12,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 52,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '600',
    paddingVertical: 0,
  },
  primaryBtn: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2563EB',
    borderRadius: 20,
    marginTop: 6,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 3,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  guestBtn: {
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: 6,
  },
  guestBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
    marginBottom: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  socialCol: {
    gap: 10,
  },
  socialBtn: {
    height: 50,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  appleBtn: {
    backgroundColor: '#000000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  appleBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  googleBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  googleBtnText: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
});
