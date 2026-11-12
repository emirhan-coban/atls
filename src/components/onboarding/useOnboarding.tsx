import { useTheme } from '../../theme/ThemeContext';
import { useState, useMemo, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Languages, ChevronLeft } from 'lucide-react-native';
import { availableCatalog, CatalogCountry } from '../../data/travelData';
import { ContinentFilter, inContinent } from '../../data/continents';
import { authService } from '../../services/authService';
import { generateHandle } from '../../services/storageService';
import { useStyles } from '../OnboardingScreen.styles';
import { tOnboardingScreen } from '../../localization/screens/OnboardingScreen';
import { isValidEmail, OnboardingScreenProps } from './shared';

export function useOnboarding({ onComplete, t, currentLang = 'tr', onToggleLang }: OnboardingScreenProps) {
  const { colors } = useTheme();
  const styles = useStyles();
  // Funnel Step: 1 = Hook, 2 = Home Country, 3 = Visited Countries, 4 = Payoff/Badge, 5 = Wishlist, 6 = Save/Auth
  const [step, setStep] = useState(1);
  const [isMapInteracting, setIsMapInteracting] = useState(false);

  // User Selections
  const [homeCountry, setHomeCountry] = useState<CatalogCountry | null>(null);
  const [visitedIds, setVisitedIds] = useState<string[]>([]);
  const [wishlistIds] = useState<string[]>([]); // wishlist is picked in Explore after sign-up

  // Search & Filter States
  const [homeSearch, setHomeSearch] = useState('');
  const [visitedSearch, setVisitedSearch] = useState('');
  const [continentFilter, setContinentFilter] = useState('all');

  // Auth Form States (Step 6)
  const [authTab, setAuthTab] = useState('register');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // OTP Verification States (Step 6 sub-step)
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [otpTimer, setOtpTimer] = useState(60);
  const [canResendOtp, setCanResendOtp] = useState(false);
  const otpInputsRef = useRef<(TextInput | null)[]>([]);
  const nameInputRef = useRef<TextInput>(null);
  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);

  // Password rules
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  const getPasswordStrength = () => {
    if (!password) return { score: 0, label: '', color: colors.text.soft };
    let score = 0;
    if (hasMinLength) score++;
    if (hasUppercase) score++;
    if (hasNumber) score++;
    if (score <= 1) return { score: 1, label: t?.strengthWeak || 'Zayıf', color: colors.danger };
    if (score === 2) return { score: 2, label: t?.strengthMedium || 'Orta', color: colors.gold.base };
    return { score: 3, label: t?.strengthStrong || 'Güçlü', color: colors.status.lived.color };
  };
  const strength = getPasswordStrength();

  // OTP Timer
  useEffect(() => {
    let interval = null;
    if (isOtpStep && otpTimer > 0) {
      interval = setInterval(() => setOtpTimer((p) => p - 1), 1000);
    } else if (otpTimer === 0) {
      setCanResendOtp(true);
    }
    return () => clearInterval(interval);
  }, [isOtpStep, otpTimer]);

  // Combined country list for the live WorldMap preview
  const mapPreviewCountries = useMemo(() => {
    const list: any[] = [];
    if (homeCountry) {
      list.push({ id: homeCountry.id, status: 'lived' });
    }
    visitedIds.forEach((id) => {
      if (!homeCountry || id !== homeCountry.id) {
        list.push({ id, status: 'visited' });
      }
    });
    wishlistIds.forEach((id) => {
      if (!list.some((c) => c.id === id)) {
        list.push({ id, status: 'want' });
      }
    });
    return list;
  }, [homeCountry, visitedIds, wishlistIds]);

  // Stats calculation
  const totalCount = (homeCountry ? 1 : 0) + visitedIds.filter((id) => !homeCountry || id !== homeCountry.id).length;
  const exploredPercent = Math.min(100, Math.round((totalCount / 195) * 100 * 10) / 10);

  // Count unique continents
  const visitedContinentsCount = useMemo(() => {
    const set = new Set();
    if (homeCountry?.continent) set.add(homeCountry.continent);
    visitedIds.forEach((id) => {
      const match = availableCatalog.find((c) => c.id === id);
      if (match?.continent) set.add(match.continent);
    });
    return Math.max(1, set.size);
  }, [homeCountry, visitedIds]);

  // Filtered lists
  const filteredHomeCatalog = useMemo(() => {
    if (!homeSearch.trim()) return availableCatalog;
    const q = homeSearch.toLowerCase();
    return availableCatalog.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.nameTr && c.nameTr.toLowerCase().includes(q))
    );
  }, [homeSearch]);

  const filteredVisitedCatalog = useMemo(() => {
    let list = availableCatalog;
    list = list.filter((c) => inContinent(c.continent, continentFilter as ContinentFilter));
    if (visitedSearch.trim()) {
      const q = visitedSearch.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.nameTr && c.nameTr.toLowerCase().includes(q))
      );
    }
    return list;
  }, [visitedSearch, continentFilter]);

  // Toggle country in visited list
  const toggleVisitedCountry = (id: string) => {
    Haptics.selectionAsync();
    setVisitedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((cId) => cId !== id);
      }
      return [...prev, id];
    });
  };

  // Assemble full country models to transfer to passport
  const buildPayloadCountries = () => {
    const result: any[] = [];
    if (homeCountry) {
      result.push({
        ...homeCountry,
        status: 'lived',
        visitedYear: null,
        notes: tOnboardingScreen('home_base_residence', currentLang) });
    }
    visitedIds.forEach((id) => {
      if (!homeCountry || id !== homeCountry.id) {
        const item = availableCatalog.find((c) => c.id === id);
        if (item) {
          result.push({
            ...item,
            status: 'visited',
            visitedYear: null,
            notes: '' });
        }
      }
    });
    wishlistIds.forEach((id) => {
      const item = availableCatalog.find((c) => c.id === id);
      if (item && !result.some((c) => c.id === id)) {
        result.push({
          ...item,
          status: 'want',
          visitedYear: null,
          notes: tOnboardingScreen('bucket_list_destination', currentLang) });
      }
    });
    return result;
  };

  // Complete Onboarding & Save
  const finalizeOnboarding = (userData: any) => {
    const finalCountries = buildPayloadCountries();
    const locationName = homeCountry ? (currentLang === 'tr' ? homeCountry.nameTr : homeCountry.name) : 'Global Citizen';
    onComplete({
      onboardingCountries: finalCountries,
      homeLocation: locationName,
      userData });
  };

  // Auth Submit
  const handleAuthSubmit = async () => {
    const trimmedEmail = email.trim();
    const trimmedName = name.trim();

    if (authTab === 'register' && !trimmedName) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert('Eksik Bilgi', tOnboardingScreen('please_enter_your_full_name', currentLang));
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert('Geçersiz E-posta', t?.invalidEmail || 'Lütfen geçerli bir e-posta adresi giriniz.');
      return;
    }

    if (authTab === 'register') {
      if (!hasMinLength || !hasUppercase || !hasNumber) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        Alert.alert('Güvensiz Şifre', t?.passwordTooWeak || 'Şifreniz en az 8 karakter olmalı, 1 büyük harf ve 1 rakam içermelidir.');
        return;
      }
    } else if (!password || password.length < 6) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert('Eksik Bilgi', 'Lütfen şifrenizi giriniz.');
      return;
    }

    try {
      setIsLoading(true);
      if (authTab === 'register') {
        const authResult = await authService.signUp({
          email: trimmedEmail,
          password,
          name: trimmedName });

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        if (authResult?.needsOtp) {
          setIsOtpStep(true);
          setOtpTimer(60);
          setCanResendOtp(false);
          setOtpDigits(['', '', '', '', '', '']);
          return;
        }

        const cleanName = trimmedName || authResult?.user?.user_metadata?.name || trimmedEmail.split('@')[0] || 'Traveler';
        const cleanHandle = generateHandle(cleanName);

        finalizeOnboarding({
          name: cleanName,
          handle: cleanHandle,
          email: trimmedEmail,
          avatarInitials: cleanName.substring(0, 2).toUpperCase() });
      } else {
        const authResult = await authService.signIn({
          email: trimmedEmail,
          password });

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        const cleanName = authResult?.user?.user_metadata?.name || trimmedEmail.split('@')[0] || 'Traveler';
        const cleanHandle = generateHandle(cleanName);

        finalizeOnboarding({
          name: cleanName,
          handle: cleanHandle,
          email: trimmedEmail,
          avatarInitials: cleanName.substring(0, 2).toUpperCase() });
      }
    } catch (err: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      let errorMsg = err.message || 'İşlem sırasında bir hata oluştu.';
      if (errorMsg.includes('Invalid login credentials')) {
        errorMsg = 'E-posta veya şifre hatalı. Lütfen kontrol ediniz.';
      } else if (errorMsg.includes('User already registered')) {
        errorMsg = 'Bu e-posta adresi ile zaten kayıtlı bir hesap var. Giriş yapabilirsiniz.';
      }
      Alert.alert('Hata', errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // OTP Verification
  const handleVerifyOtp = async () => {
    const token = otpDigits.join('');
    if (token.length !== 6) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert('Eksik Kod', 'Lütfen 6 haneli doğrulama kodunu giriniz.');
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

      finalizeOnboarding({
        name: cleanName,
        handle: cleanHandle,
        email: email.trim(),
        avatarInitials: cleanName.substring(0, 2).toUpperCase() });
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Hata', t?.otpInvalidCode || 'Geçersiz doğrulama kodu.');
    } finally {
      setIsLoading(false);
    }
  };

  // Guest mode: everything stays on this device until the user creates an account
  const handleGuest = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const guestName = tOnboardingScreen('traveler', currentLang);
    finalizeOnboarding({
      name: guestName,
      handle: generateHandle(guestName),
      email: '',
      avatarInitials: guestName.substring(0, 2).toUpperCase(),
      isGuest: true });
  };

  // Apple & Google Sign In
  const handleSocialAuth = async (provider: 'apple' | 'google') => {
    try {
      setIsLoading(true);
      const res = provider === 'apple' ? await authService.signInWithApple() : await authService.signInWithGoogle();
      if (!res) return;

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const cleanName = res?.profile?.name || res?.user?.user_metadata?.full_name || res?.user?.user_metadata?.name || 'Traveler';
      const cleanHandle = res?.profile?.handle || generateHandle(cleanName);

      finalizeOnboarding({
        name: cleanName,
        handle: cleanHandle,
        email: res?.user?.email || res?.profile?.email || 'traveler@atls.app',
        avatarInitials: cleanName.substring(0, 2).toUpperCase() });
    } catch (err: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Giriş Başarısız', err.message || 'Lütfen tekrar deneyiniz.');
    } finally {
      setIsLoading(false);
    }
  };

  // Top Bar Progress Component
  const renderTopBar = (currentStepIndex: number, totalSteps = 4) => (
    <View style={styles.funnelHeader}>
      <View style={styles.topBarRow}>
        {currentStepIndex > 1 ? (
          <TouchableOpacity accessibilityRole="button" accessibilityLabel={tOnboardingScreen('back', currentLang)}
            onPress={() => {
              Haptics.selectionAsync();
              setStep((s) => (s === 6 ? 4 : s - 1));
            }}
            style={styles.backBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ChevronLeft size={22} color={colors.text.primary} strokeWidth={2.5} />
          </TouchableOpacity>
        ) : (
          <View style={styles.logoRow}>
            <Text style={styles.logoText}>atls</Text>
            <Text style={styles.logoDot}>.</Text>
          </View>
        )}

        {/* Progress Bar */}
        <View style={styles.stepProgressTrack}>
          <View
            style={[
              styles.stepProgressBar,
              { width: `${(currentStepIndex / totalSteps) * 100}%` },
            ]}
          />
        </View>

        {/* Language switch */}
        <TouchableOpacity
          onPress={() => {
            Haptics.selectionAsync();
            onToggleLang();
          }}
          style={styles.langPill}
          activeOpacity={0.7}
        >
          <Languages size={12} color={colors.gold.base} />
          <Text style={styles.langPillText}>{currentLang.toUpperCase()}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return { authTab, colors, continentFilter, currentLang, email, emailInputRef, exploredPercent, filteredHomeCatalog, filteredVisitedCatalog, focusedField, handleAuthSubmit, handleGuest, handleSocialAuth, handleVerifyOtp, hasMinLength, hasNumber, hasUppercase, homeCountry, homeSearch, isLoading, isMapInteracting, isOtpStep, mapPreviewCountries, name, nameInputRef, onToggleLang, otpDigits, otpInputsRef, password, passwordInputRef, renderTopBar, setAuthTab, setContinentFilter, setEmail, setFocusedField, setHomeCountry, setHomeSearch, setIsMapInteracting, setIsOtpStep, setName, setOtpDigits, setPassword, setShowPassword, setStep, setVisitedSearch, showPassword, step, strength, styles, t, toggleVisitedCountry, totalCount, visitedContinentsCount, visitedIds, visitedSearch };
}

export type OnboardingCtx = ReturnType<typeof useOnboarding>;
