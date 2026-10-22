import React, { useState, useEffect, useRef } from 'react';
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
  Check,
  CheckCircle2,
  Circle,
  KeyRound,
  RefreshCw,
  Edit3,
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

// Email validation regex (standard RFC 5322 compatible)
const isValidEmailAddress = (email) => {
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(String(email).trim().toLowerCase());
};

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
  const [focusedField, setFocusedField] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // OTP Verification state
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [otpTimer, setOtpTimer] = useState(60);
  const [canResendOtp, setCanResendOtp] = useState(false);
  const otpInputsRef = useRef([]);

  // Password Strength Evaluation
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  const getPasswordStrength = () => {
    if (!password) return { score: 0, label: '', color: '#E2E8F0' };
    let score = 0;
    if (hasMinLength) score++;
    if (hasUppercase) score++;
    if (hasNumber) score++;

    if (score <= 1) {
      return { score: 1, label: t?.strengthWeak || 'Zayıf', color: '#EF4444' };
    }
    if (score === 2) {
      return { score: 2, label: t?.strengthMedium || 'Orta', color: '#F59E0B' };
    }
    return { score: 3, label: t?.strengthStrong || 'Güçlü', color: '#10B981' };
  };

  const strength = getPasswordStrength();

  // OTP Countdown Timer
  useEffect(() => {
    let interval = null;
    if (isOtpStep && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    } else if (otpTimer === 0) {
      setCanResendOtp(true);
    }
    return () => clearInterval(interval);
  }, [isOtpStep, otpTimer]);

  // Handle OTP digit entry with auto-forward and backspace
  const handleOtpChange = (val, index) => {
    const clean = val.replace(/[^0-9]/g, '');
    const updated = [...otpDigits];

    // If user pastes full 6 digit code
    if (clean.length > 1) {
      const chars = clean.slice(0, 6).split('');
      chars.forEach((c, i) => {
        updated[i] = c;
      });
      setOtpDigits(updated);
      otpInputsRef.current[Math.min(chars.length, 5)]?.focus();
      return;
    }

    updated[index] = clean;
    setOtpDigits(updated);

    if (clean && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  // Submit Sign-In or Sign-Up
  const handleSubmit = async () => {
    const trimmedEmail = email.trim();
    const trimmedName = name.trim();

    if (tab === 'register' && !trimmedName) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert(
        currentLang === 'tr' ? 'Eksik Bilgi' : 'Information Missing',
        currentLang === 'tr' ? 'Lütfen adınızı ve soyadınızı giriniz.' : 'Please enter your full name.'
      );
      return;
    }

    if (!isValidEmailAddress(trimmedEmail)) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert(
        currentLang === 'tr' ? 'Geçersiz E-posta' : 'Invalid Email',
        t?.invalidEmail || (currentLang === 'tr' ? 'Lütfen geçerli bir e-posta adresi giriniz.' : 'Please enter a valid email address.')
      );
      return;
    }

    if (tab === 'register') {
      if (!hasMinLength || !hasUppercase || !hasNumber) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        Alert.alert(
          currentLang === 'tr' ? 'Güvensiz Şifre' : 'Insecure Password',
          t?.passwordTooWeak || (currentLang === 'tr' ? 'Şifreniz en az 8 karakter olmalı, 1 büyük harf ve 1 rakam içermelidir.' : 'Password must be at least 8 chars with 1 uppercase and 1 number.')
        );
        return;
      }
    } else {
      if (!password || password.length < 6) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        Alert.alert(
          currentLang === 'tr' ? 'Eksik Bilgi' : 'Information Missing',
          currentLang === 'tr' ? 'Lütfen şifrenizi giriniz.' : 'Please enter your password.'
        );
        return;
      }
    }

    try {
      setIsLoading(true);

      if (tab === 'register') {
        const authResult = await authService.signUp({
          email: trimmedEmail,
          password,
          name: trimmedName,
        });

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // If email confirmation is required, transition to OTP view
        if (authResult?.needsOtp) {
          setIsOtpStep(true);
          setOtpTimer(60);
          setCanResendOtp(false);
          setOtpDigits(['', '', '', '', '', '']);
          setTimeout(() => {
            otpInputsRef.current[0]?.focus();
          }, 400);
          return;
        }

        // Direct session created (or trigger fallback)
        const cleanName = trimmedName || authResult?.user?.user_metadata?.name || trimmedEmail.split('@')[0] || 'Traveler';
        const cleanHandle = generateHandle(cleanName);

        onLoginSuccess({
          name: cleanName,
          handle: cleanHandle,
          email: trimmedEmail,
          avatarInitials: cleanName.substring(0, 2).toUpperCase(),
        });
      } else {
        // Sign In
        const authResult = await authService.signIn({
          email: trimmedEmail,
          password,
        });

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        const cleanName = authResult?.user?.user_metadata?.name || trimmedEmail.split('@')[0] || 'Traveler';
        const cleanHandle = generateHandle(cleanName);

        onLoginSuccess({
          name: cleanName,
          handle: cleanHandle,
          email: trimmedEmail,
          avatarInitials: cleanName.substring(0, 2).toUpperCase(),
        });
      }
    } catch (err) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      let errorMsg = err.message || (currentLang === 'tr' ? 'İşlem sırasında bir hata oluştu.' : 'An error occurred.');
      if (errorMsg.includes('Invalid login credentials')) {
        errorMsg = currentLang === 'tr' ? 'E-posta adresi veya şifre hatalı. Lütfen kontrol ediniz.' : 'Invalid email or password.';
      } else if (errorMsg.includes('User already registered')) {
        errorMsg = currentLang === 'tr' ? 'Bu e-posta adresi ile zaten kayıtlı bir hesap var. Lütfen giriş yapınız.' : 'An account already exists with this email. Please log in.';
      } else if (errorMsg.includes('Email not confirmed')) {
        // Switch to OTP step if existing account unconfirmed
        setIsOtpStep(true);
        setOtpTimer(60);
        setCanResendOtp(false);
        return;
      }

      Alert.alert(currentLang === 'tr' ? 'İşlem Başarısız' : 'Action Failed', errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Verify OTP submission
  const handleVerifyOtp = async () => {
    const token = otpDigits.join('');
    if (token.length !== 6) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert(
        currentLang === 'tr' ? 'Eksik Kod' : 'Incomplete Code',
        currentLang === 'tr' ? 'Lütfen 6 haneli kodu eksiksiz giriniz.' : 'Please enter the full 6-digit code.'
      );
      return;
    }

    try {
      setIsLoading(true);
      const res = await authService.verifyOtp({
        email: email.trim(),
        token,
        name: name.trim(),
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      const cleanName = name.trim() || res?.user?.user_metadata?.name || email.split('@')[0] || 'Traveler';
      const cleanHandle = generateHandle(cleanName);

      onLoginSuccess({
        name: cleanName,
        handle: cleanHandle,
        email: email.trim(),
        avatarInitials: cleanName.substring(0, 2).toUpperCase(),
      });
    } catch (err) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        currentLang === 'tr' ? 'Doğrulama Başarısız' : 'Verification Failed',
        t?.otpInvalidCode || (currentLang === 'tr' ? 'Geçersiz veya süresi dolmuş kod. Lütfen tekrar deneyiniz.' : 'Invalid code. Please try again.')
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP Code
  const handleResendOtp = async () => {
    if (!canResendOtp) return;
    try {
      setIsLoading(true);
      await authService.resendOtp({ email: email.trim() });
      setOtpTimer(60);
      setCanResendOtp(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        currentLang === 'tr' ? 'Kod Gönderildi' : 'Code Sent',
        t?.otpCodeSent || (currentLang === 'tr' ? 'Yeni bir güvenlik kodu e-posta adresinize gönderildi.' : 'A new verification code has been sent.')
      );
    } catch (err) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        currentLang === 'tr' ? 'Hata' : 'Error',
        err.message || 'Kod tekrar gönderilemedi.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Apple Sign In
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

  // Google Sign In
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

  // If OTP Step is active
  if (isOtpStep) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.topBar}>
          <View style={styles.logoRow}>
            <Text style={styles.logoText}>atls</Text>
            <Text style={styles.logoDot}>.</Text>
          </View>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardContainer}
        >
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            <View style={styles.headerTextCol}>
              <View style={styles.otpIconBadge}>
                <KeyRound size={28} color="#2563EB" strokeWidth={2} />
              </View>

              <Text style={styles.mainTitle}>
                {t?.otpTitle || (currentLang === 'tr' ? 'E-postanızı Doğrulayın' : 'Verify Your Email')}
              </Text>
              
              <Text style={styles.subTitle}>
                {currentLang === 'tr' 
                  ? 'Kişisel pasaportunuzu güvenceye almak için gönderilen 6 haneli güvenlik kodunu girin.' 
                  : 'Enter the 6-digit security code sent to protect your passport.'}
              </Text>

              {/* Target Email Capsule with Edit Button */}
              <View style={styles.emailBadge}>
                <Mail size={14} color="#2563EB" />
                <Text style={styles.emailBadgeText} numberOfLines={1}>{email}</Text>
                <TouchableOpacity
                  onPress={() => setIsOtpStep(false)}
                  style={styles.editEmailBtn}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Edit3 size={13} color="#64748B" />
                </TouchableOpacity>
              </View>
            </View>

            {/* 6 Digit Input Boxes */}
            <View style={styles.otpBoxesRow}>
              {otpDigits.map((digit, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.otpBox,
                    digit ? styles.otpBoxFilled : null,
                    focusedField === `otp_${idx}` ? styles.otpBoxFocused : null,
                  ]}
                >
                  <TextInput
                    ref={(el) => (otpInputsRef.current[idx] = el)}
                    value={digit}
                    onChangeText={(val) => handleOtpChange(val, idx)}
                    onKeyPress={(e) => handleOtpKeyPress(e, idx)}
                    onFocus={() => setFocusedField(`otp_${idx}`)}
                    onBlur={() => setFocusedField(null)}
                    keyboardType="number-pad"
                    maxLength={idx === 0 ? 6 : 1}
                    selectTextOnFocus
                    style={styles.otpInput}
                  />
                </View>
              ))}
            </View>

            {/* Verify Button */}
            <TouchableOpacity
              onPress={handleVerifyOtp}
              activeOpacity={0.85}
              disabled={isLoading}
              style={[styles.primaryBtn, isLoading && { opacity: 0.7 }]}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Text style={styles.primaryBtnText}>
                    {t?.otpVerifyBtn || (currentLang === 'tr' ? 'Doğrula ve Pasaporta Gir' : 'Verify & Enter Passport')}
                  </Text>
                  <ArrowRight size={17} color="#FFFFFF" strokeWidth={2.5} />
                </>
              )}
            </TouchableOpacity>

            {/* Resend Code Section */}
            <View style={styles.resendRow}>
              {canResendOtp ? (
                <TouchableOpacity
                  onPress={handleResendOtp}
                  style={styles.resendBtn}
                  activeOpacity={0.7}
                  disabled={isLoading}
                >
                  <RefreshCw size={14} color="#2563EB" />
                  <Text style={styles.resendBtnText}>
                    {t?.otpResend || (currentLang === 'tr' ? 'Kodu Tekrar Gönder' : 'Resend Code')}
                  </Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.timerText}>
                  {t?.otpResendIn?.replace('{seconds}', otpTimer) || `${otpTimer}s sonra tekrar gönder`}
                </Text>
              )}
            </View>

            {/* Back to Edit Button */}
            <TouchableOpacity
              onPress={() => setIsOtpStep(false)}
              style={styles.backBtn}
              activeOpacity={0.7}
            >
              <Text style={styles.backBtnText}>
                {t?.otpChangeEmail || (currentLang === 'tr' ? 'Farklı bir e-posta ile dene' : 'Try with different email')}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // Standard Login / Register View
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
              <View
                style={[
                  styles.inputBox,
                  focusedField === 'name' && styles.inputBoxFocused,
                ]}
              >
                <User size={18} color={focusedField === 'name' ? '#2563EB' : '#94A3B8'} />
                <TextInput
                  value={name}
                  onChangeText={setName}
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => setFocusedField(null)}
                  placeholder={t?.fullName || 'Ad Soyad'}
                  placeholderTextColor="#94A3B8"
                  autoCapitalize="words"
                  autoCorrect={false}
                  style={styles.input}
                />
              </View>
            )}

            <View
              style={[
                styles.inputBox,
                focusedField === 'email' && styles.inputBoxFocused,
              ]}
            >
              <Mail size={18} color={focusedField === 'email' ? '#2563EB' : '#94A3B8'} />
              <TextInput
                value={email}
                onChangeText={setEmail}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                placeholder={t?.email || 'E-posta adresi'}
                placeholderTextColor="#94A3B8"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="emailAddress"
                style={styles.input}
              />
            </View>

            <View
              style={[
                styles.inputBox,
                focusedField === 'password' && styles.inputBoxFocused,
              ]}
            >
              <Lock size={18} color={focusedField === 'password' ? '#2563EB' : '#94A3B8'} />
              <TextInput
                value={password}
                onChangeText={setPassword}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                placeholder={tab === 'register' ? (t?.password || 'Şifre (en az 8 karakter)') : (t?.password || 'Şifre')}
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

            {/* Password Strength Indicator (Register Tab Only) */}
            {tab === 'register' && password.length > 0 && (
              <View style={styles.strengthCard}>
                <View style={styles.strengthHeaderRow}>
                  <Text style={styles.strengthTitle}>
                    {t?.passwordStrength || 'Şifre Gücü'}:{' '}
                    <Text style={{ color: strength.color, fontWeight: '800' }}>
                      {strength.label}
                    </Text>
                  </Text>
                </View>

                {/* 3 Step Colored Progress Bar */}
                <View style={styles.strengthBarRow}>
                  <View
                    style={[
                      styles.strengthBarSegment,
                      { backgroundColor: strength.score >= 1 ? strength.color : '#E2E8F0' },
                    ]}
                  />
                  <View
                    style={[
                      styles.strengthBarSegment,
                      { backgroundColor: strength.score >= 2 ? strength.color : '#E2E8F0' },
                    ]}
                  />
                  <View
                    style={[
                      styles.strengthBarSegment,
                      { backgroundColor: strength.score >= 3 ? strength.color : '#E2E8F0' },
                    ]}
                  />
                </View>

                {/* Requirements Checklist */}
                <View style={styles.criteriaList}>
                  <View style={styles.criteriaRow}>
                    {hasMinLength ? (
                      <CheckCircle2 size={13} color="#10B981" />
                    ) : (
                      <Circle size={13} color="#94A3B8" />
                    )}
                    <Text style={[styles.criteriaText, hasMinLength && styles.criteriaTextMet]}>
                      {t?.reqMinChars || 'En az 8 karakter'}
                    </Text>
                  </View>

                  <View style={styles.criteriaRow}>
                    {hasUppercase ? (
                      <CheckCircle2 size={13} color="#10B981" />
                    ) : (
                      <Circle size={13} color="#94A3B8" />
                    )}
                    <Text style={[styles.criteriaText, hasUppercase && styles.criteriaTextMet]}>
                      {t?.reqUppercase || 'En az 1 büyük harf'}
                    </Text>
                  </View>

                  <View style={styles.criteriaRow}>
                    {hasNumber ? (
                      <CheckCircle2 size={13} color="#10B981" />
                    ) : (
                      <Circle size={13} color="#94A3B8" />
                    )}
                    <Text style={[styles.criteriaText, hasNumber && styles.criteriaTextMet]}>
                      {t?.reqNumber || 'En az 1 rakam'}
                    </Text>
                  </View>
                </View>
              </View>
            )}

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
                  style={[styles.socialBtn, styles.appleBtn]}
                >
                  <AppleIcon />
                  <Text style={styles.appleBtnText}>
                    {t?.continueWithApple || (currentLang === 'tr' ? 'Apple ile Devam Et' : 'Continue with Apple')}
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
                  {t?.continueWithGoogle || (currentLang === 'tr' ? 'Google ile Devam Et' : 'Continue with Google')}
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
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  inputBoxFocused: {
    borderColor: '#2563EB',
    backgroundColor: '#FFFFFF',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '600',
  },
  strengthCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
    marginTop: -4,
  },
  strengthHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  strengthTitle: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  strengthBarRow: {
    flexDirection: 'row',
    gap: 6,
    height: 4,
  },
  strengthBarSegment: {
    flex: 1,
    height: '100%',
    borderRadius: 2,
  },
  criteriaList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingTop: 4,
  },
  criteriaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  criteriaText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  criteriaTextMet: {
    color: '#0F172A',
    fontWeight: '700',
  },
  primaryBtn: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2563EB',
    borderRadius: 22,
    marginTop: 8,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 3,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
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
  socialBtn: {
    height: 52,
    borderRadius: 22,
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
    fontSize: 15,
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
    shadowRadius: 4,
    elevation: 1,
  },
  googleBtnText: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },

  // OTP Styles
  otpIconBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#DBEAFE',
  },
  emailBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  emailBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  editEmailBtn: {
    padding: 2,
  },
  otpBoxesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 24,
    gap: 8,
  },
  otpBox: {
    flex: 1,
    height: 58,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  otpBoxFilled: {
    borderColor: '#94A3B8',
    backgroundColor: '#FFFFFF',
  },
  otpBoxFocused: {
    borderColor: '#2563EB',
    backgroundColor: '#FFFFFF',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  otpInput: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
    width: '100%',
    height: '100%',
  },
  resendRow: {
    alignItems: 'center',
    marginTop: 20,
  },
  resendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  resendBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563EB',
  },
  timerText: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '600',
  },
  backBtn: {
    alignItems: 'center',
    marginTop: 12,
    paddingVertical: 8,
  },
  backBtnText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
});
