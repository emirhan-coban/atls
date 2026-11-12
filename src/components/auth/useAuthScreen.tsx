import { useTheme } from '../../theme/ThemeContext';
import { useState, useEffect, useRef } from 'react';
import { TextInput, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { authService } from '../../services/authService';
import { generateHandle } from '../../services/storageService';
import { useStyles } from '../AuthScreen.styles';
import { tAuthScreen } from '../../localization/screens/AuthScreen';
import { isValidEmailAddress, AuthScreenProps } from './shared';

export function useAuthScreen({
  onLoginSuccess,
  t,
  currentLang,
  onToggleLang }: AuthScreenProps) {
  const { colors } = useTheme();
  const styles = useStyles();
  const [tab, setTab] = useState('login'); // 'login' | 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // OTP Verification state
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [otpTimer, setOtpTimer] = useState(60);
  const [canResendOtp, setCanResendOtp] = useState(false);
  const otpInputsRef = useRef<(TextInput | null)[]>([]);
  const nameInputRef = useRef<TextInput>(null);
  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);

  // Password Strength Evaluation
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  const getPasswordStrength = () => {
    if (!password) return { score: 0, label: '', color: colors.text.soft };
    let score = 0;
    if (hasMinLength) score++;
    if (hasUppercase) score++;
    if (hasNumber) score++;

    if (score <= 1) {
      return { score: 1, label: t?.strengthWeak || 'Zayıf', color: colors.danger };
    }
    if (score === 2) {
      return { score: 2, label: t?.strengthMedium || 'Orta', color: colors.gold.base };
    }
    return { score: 3, label: t?.strengthStrong || 'Güçlü', color: colors.status.lived.color };
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
  const handleOtpChange = (val: string, index: number) => {
    const clean = val.replace(/[^0-9]/g, '');
    const updated = [...otpDigits];

    // If user pastes full 6 digit code
    if (clean.length > 1) {
      const chars = clean.slice(0, 6).split('');
      chars.forEach((c: string, i: number) => {
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

  const handleOtpKeyPress = (e: any, index: number) => {
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
        tAuthScreen('information_missing', currentLang),
        tAuthScreen('please_enter_your_full_name', currentLang)
      );
      return;
    }

    if (!isValidEmailAddress(trimmedEmail)) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert(
        tAuthScreen('invalid_email', currentLang),
        t?.invalidEmail || (tAuthScreen('please_enter_a_valid_email_address', currentLang))
      );
      return;
    }

    if (tab === 'register') {
      if (!hasMinLength || !hasUppercase || !hasNumber) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        Alert.alert(
          tAuthScreen('insecure_password', currentLang),
          t?.passwordTooWeak || (tAuthScreen('password_must_be_at_least_8_chars', currentLang))
        );
        return;
      }
    } else {
      if (!password || password.length < 6) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        Alert.alert(
          tAuthScreen('information_missing', currentLang),
          tAuthScreen('please_enter_your_password', currentLang)
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
          name: trimmedName });

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
          avatarInitials: cleanName.substring(0, 2).toUpperCase() });
      } else {
        // Sign In
        const authResult = await authService.signIn({
          email: trimmedEmail,
          password });

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        const cleanName = authResult?.user?.user_metadata?.name || trimmedEmail.split('@')[0] || 'Traveler';
        const cleanHandle = generateHandle(cleanName);

        onLoginSuccess({
          name: cleanName,
          handle: cleanHandle,
          email: trimmedEmail,
          avatarInitials: cleanName.substring(0, 2).toUpperCase() });
      }
    } catch (err: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      let errorMsg = err.message || (tAuthScreen('an_error_occurred', currentLang));
      if (errorMsg.includes('Invalid login credentials')) {
        errorMsg = tAuthScreen('invalid_email_or_password', currentLang);
      } else if (errorMsg.includes('User already registered')) {
        errorMsg = tAuthScreen('an_account_already_exists_with_thi', currentLang);
      } else if (errorMsg.includes('Email not confirmed')) {
        // Switch to OTP step if existing account unconfirmed
        setIsOtpStep(true);
        setOtpTimer(60);
        setCanResendOtp(false);
        return;
      }

      Alert.alert(tAuthScreen('action_failed', currentLang), errorMsg);
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
        tAuthScreen('incomplete_code', currentLang),
        tAuthScreen('please_enter_the_full_6_digit_code', currentLang)
      );
      return;
    }

    try {
      setIsLoading(true);
      const res = await authService.verifyOtp({
        email: email.trim(),
        token,
        name: name.trim() });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      const cleanName = name.trim() || res?.user?.user_metadata?.name || email.split('@')[0] || 'Traveler';
      const cleanHandle = generateHandle(cleanName);

      onLoginSuccess({
        name: cleanName,
        handle: cleanHandle,
        email: email.trim(),
        avatarInitials: cleanName.substring(0, 2).toUpperCase() });
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        tAuthScreen('verification_failed', currentLang),
        t?.otpInvalidCode || (tAuthScreen('invalid_code_please_try_again', currentLang))
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
        tAuthScreen('code_sent', currentLang),
        t?.otpCodeSent || (tAuthScreen('a_new_verification_code_has_been_s', currentLang))
      );
    } catch (err: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        tAuthScreen('error', currentLang),
        err.message || 'Kod tekrar gönderilemedi.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Guest mode: everything stays on this device until the user creates an account
  const handleGuest = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const guestName = tAuthScreen('traveler', currentLang);
    onLoginSuccess({
      name: guestName,
      handle: generateHandle(guestName),
      email: '',
      avatarInitials: guestName.substring(0, 2).toUpperCase(),
      isGuest: true });
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
        avatarInitials: cleanName.substring(0, 2).toUpperCase() });
    } catch (err: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        tAuthScreen('apple_sign_in', currentLang),
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
        avatarInitials: cleanName.substring(0, 2).toUpperCase() });
    } catch (err: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        tAuthScreen('google_sign_in', currentLang),
        err.message || 'Lütfen tekrar deneyiniz.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return { canResendOtp, colors, currentLang, email, emailInputRef, focusedField, handleAppleSignIn, handleGoogleSignIn, handleGuest, handleOtpChange, handleOtpKeyPress, handleResendOtp, handleSubmit, handleVerifyOtp, hasMinLength, hasNumber, hasUppercase, isLoading, isOtpStep, name, nameInputRef, onToggleLang, otpDigits, otpInputsRef, otpTimer, password, passwordInputRef, setEmail, setFocusedField, setIsOtpStep, setName, setPassword, setShowPassword, setTab, showPassword, strength, styles, t, tab };
}

export type AuthCtx = ReturnType<typeof useAuthScreen>;
