import { fonts } from '../theme/typography';
import { makeStyles, useTheme } from '../theme/ThemeContext';
import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Dimensions,
  Platform,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';
import {
  Globe2,
  Compass,
  ArrowRight,
  Check,
  CheckCircle2,
  Circle,
  Search,
  MapPin,
  Sparkles,
  Award,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  Languages,
  ChevronLeft,
  KeyRound,
} from 'lucide-react-native';
import Svg, { Path } from 'react-native-svg';
import WorldMap from './WorldMap';
import { availableCatalog, CatalogCountry } from '../data/travelData';
import { Country } from '../stores/types';
import { authService } from '../services/authService';
import { generateHandle } from '../services/storageService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Popular countries for quick selection
const POPULAR_HOME_IDS = ['TR', 'DE', 'GB', 'US', 'FR', 'NL', 'AZ', 'IT'];

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

const AppleIcon = () => {
  const { colors } = useTheme();
  return (
  <Svg width={15} height={18} viewBox="0 0 384 512">
    <Path
      fill={colors.text.primary}
      d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"
    />
  </Svg>
  );
};

const isValidEmail = (email: string) => {
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(String(email).trim().toLowerCase());
};

interface OnboardingScreenProps {
  onComplete: (payload: { onboardingCountries: Country[]; homeLocation: string; userData: any }) => void;
  t: Record<string, any>;
  currentLang?: 'tr' | 'en';
  onToggleLang: () => void;
}

export default function OnboardingScreen({ onComplete, t, currentLang = 'tr', onToggleLang }: OnboardingScreenProps) {
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
    if (continentFilter !== 'all') {
      const filterLower = continentFilter.toLowerCase();
      if (filterLower === 'americas' || filterLower === 'america') {
        list = list.filter((c) =>
          (c.continent && c.continent.toLowerCase().includes('america')) ||
          (c.continentTr && c.continentTr.toLowerCase().includes('amerika'))
        );
      } else {
        list = list.filter((c) => c.continent?.toLowerCase() === filterLower);
      }
    }
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
        notes: currentLang === 'tr' ? 'Memleketim / Yaşadığım Yer' : 'Home Base / Residence',
      });
    }
    visitedIds.forEach((id) => {
      if (!homeCountry || id !== homeCountry.id) {
        const item = availableCatalog.find((c) => c.id === id);
        if (item) {
          result.push({
            ...item,
            status: 'visited',
            visitedYear: null,
            notes: '',
          });
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
          notes: currentLang === 'tr' ? 'Gelecek Seyahat Hedefi' : 'Bucket List Destination',
        });
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
      userData,
    });
  };

  // Auth Submit
  const handleAuthSubmit = async () => {
    const trimmedEmail = email.trim();
    const trimmedName = name.trim();

    if (authTab === 'register' && !trimmedName) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert('Eksik Bilgi', currentLang === 'tr' ? 'Lütfen adınızı ve soyadınızı giriniz.' : 'Please enter your full name.');
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
          name: trimmedName,
        });

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
          avatarInitials: cleanName.substring(0, 2).toUpperCase(),
        });
      } else {
        const authResult = await authService.signIn({
          email: trimmedEmail,
          password,
        });

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        const cleanName = authResult?.user?.user_metadata?.name || trimmedEmail.split('@')[0] || 'Traveler';
        const cleanHandle = generateHandle(cleanName);

        finalizeOnboarding({
          name: cleanName,
          handle: cleanHandle,
          email: trimmedEmail,
          avatarInitials: cleanName.substring(0, 2).toUpperCase(),
        });
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
        name: name.trim(),
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      const cleanName = name.trim() || res?.user?.user_metadata?.name || email.split('@')[0] || 'Traveler';
      const cleanHandle = generateHandle(cleanName);

      finalizeOnboarding({
        name: cleanName,
        handle: cleanHandle,
        email: email.trim(),
        avatarInitials: cleanName.substring(0, 2).toUpperCase(),
      });
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
    const guestName = currentLang === 'tr' ? 'Gezgin' : 'Traveler';
    finalizeOnboarding({
      name: guestName,
      handle: generateHandle(guestName),
      email: '',
      avatarInitials: guestName.substring(0, 2).toUpperCase(),
      isGuest: true,
    });
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
        avatarInitials: cleanName.substring(0, 2).toUpperCase(),
      });
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
          <TouchableOpacity
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

  // ══════════════════════════════════════════════════════════════════════
  // STEP 1: AÇILIŞ (THE HOOK)
  // ══════════════════════════════════════════════════════════════════════
  if (step === 1) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.hookTopBar}>
          <View style={styles.logoRow}>
            <Text style={styles.logoText}>atls</Text>
            <Text style={styles.logoDot}>.</Text>
          </View>

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

        <View style={styles.hookContent}>
          {/* Animated Vector World Map Preview */}
          <Animated.View entering={FadeIn.duration(800)} style={styles.hookMapWrapper}>
            <WorldMap
              countries={[]}
              activeFilter="all"
              interactive={false}
              t={t}
              currentLang={currentLang}
              showControls={false}
              style={styles.hookMapCard}
            />
          </Animated.View>

          {/* Headline & Value Proposition */}
          <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.hookTextCol}>
            <View style={styles.hookBadge}>
              <Compass size={12} color={colors.gold.base} strokeWidth={2.5} />
              <Text style={styles.hookBadgeText}>
                {currentLang === 'tr' ? 'DİJİTAL DÜNYA PASAPORTU' : 'DIGITAL WORLD PASSPORT'}
              </Text>
            </View>

            <Text style={styles.hookMainTitle}>
              {t?.onboardingPromise || 'Dünyanın ne kadarını gezdin?'}
            </Text>

            <Text style={styles.hookSubTitle}>
              {t?.onboardingPromiseSub || 'Seyahatlerini haritalandır, dijital sınır mühürlerini topla ve kişisel dünya pasaportunu başlat.'}
            </Text>
          </Animated.View>
        </View>

        {/* Action Button & Sign In Shortcut */}
        <Animated.View entering={FadeInUp.delay(300).duration(600)} style={styles.hookFooter}>
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setStep(2);
            }}
            activeOpacity={0.88}
            style={styles.primaryActionButton}
          >
            <Text style={styles.primaryActionButtonText}>
              {t?.startPassportBtn || 'Pasaportumu Başlat'}
            </Text>
            <ArrowRight size={19} color={colors.text.primary} strokeWidth={2.5} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              Haptics.selectionAsync();
              setAuthTab('login');
              setStep(6);
            }}
            style={styles.signInShortcutBtn}
            activeOpacity={0.7}
          >
            <Text style={styles.signInShortcutText}>
              {t?.alreadyHaveAccount || 'Zaten bir hesabın var mı? Giriş Yap'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    );
  }

  // ══════════════════════════════════════════════════════════════════════
  // STEP 2: MEMLEKET SEÇİMİ (HOME BASE)
  // ══════════════════════════════════════════════════════════════════════
  if (step === 2) {
    return (
      <SafeAreaView style={styles.container}>
        {renderTopBar(1, 4)}

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.flex1}
        >
          <ScrollView
            scrollEnabled={!isMapInteracting}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.stepScrollContent}
          >
            {/* Header */}
            <View style={styles.stepHeader}>
              <Text style={styles.stepTitle}>{t?.homeTitle || 'Nerede Yaşıyorsun?'}</Text>
              <Text style={styles.stepSub}>
                {t?.homeSub || 'Kişisel pasaportun doğduğun veya ikamet ettiğin evden başlar.'}
              </Text>
            </View>

            {/* Live Map Preview highlighting home */}
            <View style={styles.mapCardWrapper}>
              <WorldMap
                countries={mapPreviewCountries}
                activeFilter="all"
                interactive={true}
                onInteractionChange={setIsMapInteracting}
                t={t}
                currentLang={currentLang}
                showControls={false}
                style={styles.homeMapCard}
              />
              {homeCountry && (
                <View style={styles.selectedHomePill}>
                  <MapPin size={12} color={colors.status.lived.color} />
                  <Text style={styles.selectedHomePillText}>
                    {homeCountry.flag} {currentLang === 'tr' ? homeCountry.nameTr : homeCountry.name} (Ev)
                  </Text>
                </View>
              )}
            </View>

            {/* Search Box */}
            <View style={styles.searchBox}>
              <Search size={18} color={colors.text.secondary} />
              <TextInput
                value={homeSearch}
                onChangeText={setHomeSearch}
                placeholder={t?.searchHomePlaceholder || 'Ülke ara (örn. Türkiye, Almanya)...'}
                placeholderTextColor={colors.text.secondary}
                style={styles.searchInput}
                autoCorrect={false}
              />
            </View>

            {/* Popular Pills */}
            {!homeSearch && (
              <View style={styles.popularSection}>
                <Text style={styles.sectionLabel}>{t?.popularHomes || 'SIK SEÇİLENLER'}</Text>
                <View style={styles.chipsWrap}>
                  {POPULAR_HOME_IDS.map((id) => {
                    const country = availableCatalog.find((c) => c.id === id);
                    if (!country) return null;
                    const isSelected = homeCountry?.id === id;
                    return (
                      <TouchableOpacity
                        key={id}
                        onPress={() => {
                          Haptics.selectionAsync();
                          setHomeCountry(country);
                        }}
                        style={[styles.countryChip, isSelected && styles.countryChipActive]}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.chipFlag}>{country.flag}</Text>
                        <Text style={[styles.chipName, isSelected && styles.chipNameActive]}>
                          {currentLang === 'tr' ? country.nameTr : country.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Full Country List */}
            <View style={styles.countryListCol}>
              {filteredHomeCatalog.slice(0, 30).map((c) => {
                const isSelected = homeCountry?.id === c.id;
                return (
                  <TouchableOpacity
                    key={c.id}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setHomeCountry(c);
                    }}
                    style={[styles.countryListItem, isSelected && styles.countryListItemActive]}
                    activeOpacity={0.7}
                  >
                    <View style={styles.countryListLeft}>
                      <Text style={styles.countryFlagLarge}>{c.flag}</Text>
                      <View>
                        <Text style={[styles.countryListName, isSelected && styles.countryListNameActive]}>
                          {currentLang === 'tr' ? c.nameTr : c.name}
                        </Text>
                        <Text style={styles.countryListContinent}>{currentLang === 'tr' ? c.continentTr : c.continent}</Text>
                      </View>
                    </View>
                    {isSelected ? (
                      <CheckCircle2 size={20} color={colors.status.lived.color} />
                    ) : (
                      <Circle size={20} color={colors.text.soft} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          {/* Continue Button */}
          <View style={styles.stickyFooterBar}>
            <TouchableOpacity
              onPress={() => {
                if (!homeCountry) {
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                  Alert.alert('Lütfen Ülke Seçin', 'Lütfen yaşadığınız memleketinizi seçiniz.');
                  return;
                }
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                setStep(3);
              }}
              disabled={!homeCountry}
              style={[styles.primaryActionButton, !homeCountry && { opacity: 0.5 }]}
              activeOpacity={0.88}
            >
              <Text style={styles.primaryActionButtonText}>{t?.continueBtn || 'Devam Et'}</Text>
              <ArrowRight size={19} color={colors.text.primary} strokeWidth={2.5} />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // ══════════════════════════════════════════════════════════════════════
  // STEP 3: HIZLI DOLDURMA (GEZDİĞİN ÜLKELER)
  // ══════════════════════════════════════════════════════════════════════
  if (step === 3) {
    return (
      <SafeAreaView style={styles.container}>
        {renderTopBar(2, 4)}

        <View style={styles.flex1}>
          <ScrollView
            scrollEnabled={!isMapInteracting}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.visitedStepScrollContent}
          >
            {/* Prominent Step 3 Title & Purpose */}
            <View style={styles.visitedTitleSection}>
              <View style={styles.visitedStepBadge}>
                <Compass size={12} color={colors.gold.light} strokeWidth={2.5} />
                <Text style={styles.visitedStepBadgeText}>
                  {currentLang === 'tr' ? 'SEYAHAT GEÇMİŞİN' : 'TRAVEL FOOTPRINT'}
                </Text>
              </View>
              <Text style={styles.stepTitle}>
                {t?.visitedTitle || (currentLang === 'tr' ? 'Gittiğin Ülkeleri Seç' : 'Select Visited Countries')}
              </Text>
              <Text style={styles.stepSub}>
                {t?.visitedSub || (currentLang === 'tr'
                  ? 'Bugüne kadar ayak bastığın ülkeleri işaretle; haritan canlı olarak renklensin.'
                  : 'Select all the countries you’ve set foot in to colorize your live map.')}
              </Text>
            </View>

            {/* Live Vector Map Card - Fully proportional without clipping */}
            <View style={styles.mapCardWrapper}>
              <WorldMap
                countries={mapPreviewCountries}
                activeFilter="all"
                interactive={true}
                onInteractionChange={setIsMapInteracting}
                t={t}
                currentLang={currentLang}
                showControls={true}
                style={styles.visitedMapCard}
              />
            </View>

            {/* Live Stats Pill */}
            <View style={styles.visitedStatsRow}>
              <View style={styles.statPill}>
                <Globe2 size={13} color={colors.gold.base} />
                <Text style={styles.statPillText}>
                  {totalCount} {currentLang === 'tr' ? 'Ülke İşaretlendi' : 'Countries Marked'}
                </Text>
              </View>
              <View style={[styles.statPill, styles.statPillHighlight]}>
                <Text style={styles.statPillHighlightText}>%{exploredPercent} Dünya</Text>
              </View>
            </View>

            {/* Search & Continent Filters */}
            <View style={styles.filterSection}>
              <View style={styles.searchBoxCompact}>
                <Search size={16} color={colors.text.secondary} />
                <TextInput
                  value={visitedSearch}
                  onChangeText={setVisitedSearch}
                  placeholder={t?.searchHomePlaceholder || 'Gittiğin ülkeleri filtrele...'}
                  placeholderTextColor={colors.text.secondary}
                  style={styles.searchInputCompact}
                  autoCorrect={false}
                />
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.continentChipsRow}>
                {[
                  { id: 'all', label: currentLang === 'tr' ? 'Tümü' : 'All' },
                  { id: 'Europe', label: currentLang === 'tr' ? 'Avrupa' : 'Europe' },
                  { id: 'Asia', label: currentLang === 'tr' ? 'Asya' : 'Asia' },
                  { id: 'Americas', label: currentLang === 'tr' ? 'Amerika' : 'Americas' },
                  { id: 'Africa', label: currentLang === 'tr' ? 'Afrika' : 'Africa' },
                  { id: 'Oceania', label: currentLang === 'tr' ? 'Okyanusya' : 'Oceania' },
                ].map((c) => (
                  <TouchableOpacity
                    key={c.id}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setContinentFilter(c.id);
                    }}
                    style={[styles.continentChip, continentFilter === c.id && styles.continentChipActive]}
                  >
                    <Text style={[styles.continentChipText, continentFilter === c.id && styles.continentChipTextActive]}>
                      {c.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Section Heading & Counter */}
            <View style={styles.gridSectionHeadingRow}>
              <Text style={styles.sectionLabel}>
                {currentLang === 'tr' ? 'DOKUN VE HARİTANA EKLE' : 'TAP TO ADD TO MAP'}
              </Text>
              <Text style={styles.gridSelectedCountHint}>
                {visitedIds.length > 0
                  ? (currentLang === 'tr' ? `${visitedIds.length} ülke seçildi` : `${visitedIds.length} selected`)
                  : (currentLang === 'tr' ? 'Henüz seçilmedi' : 'None selected')}
              </Text>
            </View>

            {/* Interactive Flag Cards Grid */}
            <View style={styles.flagGrid}>
              {filteredVisitedCatalog.map((item) => {
                const isSelected = visitedIds.includes(item.id);
                const isHome = homeCountry?.id === item.id;
                return (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => {
                      if (isHome) return;
                      toggleVisitedCountry(item.id);
                    }}
                    style={[
                      styles.flagGridCard,
                      isSelected && styles.flagGridCardActive,
                      isHome && styles.flagGridCardHome,
                    ]}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.flagGridEmoji}>{item.flag}</Text>
                    <Text style={[styles.flagGridTitle, isSelected && styles.flagGridTitleActive]} numberOfLines={1}>
                      {currentLang === 'tr' ? item.nameTr : item.name}
                    </Text>
                    <View style={styles.flagGridCheck}>
                      {isHome ? (
                        <MapPin size={14} color={colors.status.lived.color} />
                      ) : isSelected ? (
                        <Check size={14} color={colors.status.visited.color} strokeWidth={3} />
                      ) : null}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          {/* Sticky Bottom Actions */}
          <View style={styles.stickyFooterBar}>
            <TouchableOpacity
              onPress={() => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                setStep(4);
              }}
              style={styles.primaryActionButton}
              activeOpacity={0.88}
            >
              <Text style={styles.primaryActionButtonText}>
                {totalCount > 1
                  ? (t?.seeResultsBtn?.replace('{count}', totalCount) || `Sonuçları Gör (${totalCount} Ülke)`)
                  : (t?.noVisitedYet || 'Sonuçları Gör')}
              </Text>
              <ArrowRight size={19} color={colors.text.primary} strokeWidth={2.5} />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ══════════════════════════════════════════════════════════════════════
  // STEP 4: SONUÇ & ROZET AÇILIŞI (THE DOPAMINE PAYOFF)
  // ══════════════════════════════════════════════════════════════════════
  if (step === 4) {
    const badgeName = totalCount >= 5 ? 'Küresel Kaşif' : (totalCount >= 2 ? 'Sınır Tanımaz' : 'İlk Adım');

    return (
      <SafeAreaView style={styles.container}>
        {renderTopBar(3, 4)}

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.payoffScrollContent}>
          <Animated.View entering={FadeInDown.duration(600)} style={styles.payoffHeader}>
            <View style={styles.celebrationBadge}>
              <Sparkles size={14} color={colors.gold.base} />
              <Text style={styles.celebrationBadgeText}>PASAPORTUN HAZIRLANIYOR</Text>
            </View>

            <Text style={styles.payoffTitle}>
              {t?.resultTitle || 'Pasaportun Şekillendi! 🌍'}
            </Text>
          </Animated.View>

          {/* Large Stat Box */}
          <Animated.View entering={FadeIn.delay(200).duration(700)} style={styles.statHeroBox}>
            <Text style={styles.statHeroPercent}>%{exploredPercent}</Text>
            <Text style={styles.statHeroLabel}>DÜNYA KEŞFİ TAMAMLANDI</Text>

            <View style={styles.statDivider} />

            <View style={styles.statTrioRow}>
              <View style={styles.statTrioItem}>
                <Text style={styles.statTrioNum}>{totalCount}</Text>
                <Text style={styles.statTrioLabel}>{t?.countriesLabel || 'ÜLKE'}</Text>
              </View>
              <View style={styles.statTrioItem}>
                <Text style={styles.statTrioNum}>{visitedContinentsCount}</Text>
                <Text style={styles.statTrioLabel}>{t?.continentsLabel || 'KITA'}</Text>
              </View>
              <View style={styles.statTrioItem}>
                <Text style={styles.statTrioNum}>{totalCount}</Text>
                <Text style={styles.statTrioLabel}>{t?.stampsLabel || 'MÜHÜR'}</Text>
              </View>
            </View>
          </Animated.View>

          {/* Unlocked Badge Showcase */}
          <Animated.View entering={FadeInUp.delay(350).duration(600)} style={styles.badgeUnlockCard}>
            <View style={styles.badgeUnlockHeader}>
              <Award size={16} color={colors.gold.deep} />
              <Text style={styles.badgeUnlockSub}>{t?.badgeUnlockedTitle || 'İLK ROZETİN AÇILDI'}</Text>
            </View>

            <View style={styles.badgeMedalIcon}>
              <Award size={48} color={colors.gold.deep} strokeWidth={1.8} />
            </View>

            <Text style={styles.badgeNameText}>{badgeName}</Text>
            <Text style={styles.badgeDescText}>
              {currentLang === 'tr'
                ? 'Seyahat izin resmi pasaport defterine işlendi. Dijital pasaport numaran tahsis edildi.'
                : 'Your border credentials have been minted and certified.'}
            </Text>
          </Animated.View>

          {/* Action Button */}
          <View style={styles.payoffActionWrap}>
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                setStep(6);
              }}
              style={styles.primaryActionButton}
              activeOpacity={0.88}
            >
              <Text style={styles.primaryActionButtonText}>
                {t?.finishWishlistBtn || 'Pasaportumu Kaydet'}
              </Text>
              <ArrowRight size={19} color={colors.text.primary} strokeWidth={2.5} />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ══════════════════════════════════════════════════════════════════════
  // STEP 6: HESAP OLUŞTURMA & PASAPORTU KAYDET (SAVE PASSPORT)
  // ══════════════════════════════════════════════════════════════════════
  if (step === 6) {
    // If OTP Sub-step is active
    if (isOtpStep) {
      return (
        <SafeAreaView style={styles.container}>
          <View style={styles.topBarRow}>
            <TouchableOpacity onPress={() => setIsOtpStep(false)} style={styles.backBtn}>
              <ChevronLeft size={22} color={colors.text.primary} />
            </TouchableOpacity>
            <Text style={styles.logoText}>atls<Text style={styles.logoDot}>.</Text></Text>
            <View style={{ width: 40 }} />
          </View>

          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex1}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.stepScrollContent}>
              <View style={styles.otpHeader}>
                <View style={styles.otpIconBadge}>
                  <KeyRound size={28} color={colors.gold.base} />
                </View>
                <Text style={styles.stepTitle}>{t?.otpTitle || 'E-postanızı Doğrulayın'}</Text>
                <Text style={styles.stepSub}>
                  {email} adresine gönderilen 6 haneli güvenlik kodunu girin.
                </Text>
              </View>

              {/* 6 Digit Input Boxes */}
              <View style={styles.otpBoxesRow}>
                {otpDigits.map((digit, idx) => (
                  <View key={idx} style={[styles.otpBox, digit && styles.otpBoxFilled]}>
                    <TextInput
                      ref={(el) => {
                        otpInputsRef.current[idx] = el;
                      }}
                      value={digit}
                      onChangeText={(val) => {
                        const clean = val.replace(/[^0-9]/g, '');
                        const updated = [...otpDigits];
                        if (clean.length > 1) {
                          clean.slice(0, 6).split('').forEach((c, i) => (updated[i] = c));
                          setOtpDigits(updated);
                          otpInputsRef.current[Math.min(clean.length, 5)]?.focus();
                          return;
                        }
                        updated[idx] = clean;
                        setOtpDigits(updated);
                        if (clean && idx < 5) otpInputsRef.current[idx + 1]?.focus();
                      }}
                      onKeyPress={(e) => {
                        if (e.nativeEvent.key === 'Backspace' && !otpDigits[idx] && idx > 0) {
                          otpInputsRef.current[idx - 1]?.focus();
                        }
                      }}
                      keyboardType="number-pad"
                      maxLength={idx === 0 ? 6 : 1}
                      selectTextOnFocus
                      style={styles.otpInput}
                    />
                  </View>
                ))}
              </View>

              <TouchableOpacity
                onPress={handleVerifyOtp}
                style={[styles.primaryActionButton, isLoading && { opacity: 0.7 }]}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={colors.text.primary} size="small" />
                ) : (
                  <>
                    <Text style={styles.primaryActionButtonText}>Doğrula ve Pasaporta Gir</Text>
                    <ArrowRight size={19} color={colors.text.primary} strokeWidth={2.5} />
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      );
    }

    return (
      <SafeAreaView style={styles.container}>
        {renderTopBar(4, 4)}

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex1}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.stepScrollContent}
          >
            {/* Value Preview Pill */}
            <View style={styles.savePassportHeaderCard}>
              <View style={styles.passportChip}>
                <Globe2 size={13} color={colors.gold.base} />
                <Text style={styles.passportChipText}>
                  {totalCount} Ülke • %{exploredPercent} Dünya Keşfi
                </Text>
              </View>
              <Text style={styles.savePassportTitle}>
                {t?.savePassportTitle || 'Pasaportunu Kaydet & Kilitle'}
              </Text>
              <Text style={styles.savePassportSub}>
                {t?.savePassportSub || 'Emek verdiğin bu harita ve istatistiklerinin silinmemesi için hesabını oluştur.'}
              </Text>
            </View>

            {/* Auth Tab Switcher */}
            <View style={styles.tabBar}>
              <TouchableOpacity
                onPress={() => {
                  Haptics.selectionAsync();
                  setAuthTab('register');
                }}
                style={[styles.tabItem, authTab === 'register' && styles.tabItemActive]}
              >
                <Text style={[styles.tabText, authTab === 'register' && styles.tabTextActive]}>
                  {t?.registerTab || 'Kayıt Ol'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  Haptics.selectionAsync();
                  setAuthTab('login');
                }}
                style={[styles.tabItem, authTab === 'login' && styles.tabItemActive]}
              >
                <Text style={[styles.tabText, authTab === 'login' && styles.tabTextActive]}>
                  {t?.loginTab || 'Giriş Yap'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Form */}
            <View style={styles.formCol}>
              {authTab === 'register' && (
                <TouchableOpacity
                  activeOpacity={1}
                  onPress={() => nameInputRef.current?.focus()}
                  style={[styles.inputBox, focusedField === 'name' && styles.inputBoxFocused]}
                >
                  <User size={18} color={focusedField === 'name' ? colors.gold.base : colors.text.muted} />
                  <TextInput
                    ref={nameInputRef}
                    value={name}
                    onChangeText={setName}
                    onFocus={() => setFocusedField('name')}
                    onBlur={() => setFocusedField(null)}
                    placeholder={t?.fullName || 'Ad Soyad'}
                    placeholderTextColor={colors.text.muted}
                    autoCapitalize="words"
                    autoCorrect={false}
                    style={styles.input}
                  />
                </TouchableOpacity>
              )}

              <TouchableOpacity
                activeOpacity={1}
                onPress={() => emailInputRef.current?.focus()}
                style={[styles.inputBox, focusedField === 'email' && styles.inputBoxFocused]}
              >
                <Mail size={18} color={focusedField === 'email' ? colors.gold.base : colors.text.muted} />
                <TextInput
                  ref={emailInputRef}
                  value={email}
                  onChangeText={setEmail}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  placeholder={t?.email || 'E-posta adresi'}
                  placeholderTextColor={colors.text.muted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  textContentType="emailAddress"
                  style={styles.input}
                />
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={1}
                onPress={() => passwordInputRef.current?.focus()}
                style={[styles.inputBox, focusedField === 'password' && styles.inputBoxFocused]}
              >
                <Lock size={18} color={focusedField === 'password' ? colors.gold.base : colors.text.muted} />
                <TextInput
                  ref={passwordInputRef}
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  placeholder={authTab === 'register' ? 'Şifre (en az 8 karakter)' : 'Şifre'}
                  placeholderTextColor={colors.text.muted}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  textContentType="password"
                  style={styles.input}
                />
                <TouchableOpacity onPress={() => setShowPassword((p) => !p)} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                  {showPassword ? <EyeOff size={18} color={colors.text.secondary} /> : <Eye size={18} color={colors.text.secondary} />}
                </TouchableOpacity>
              </TouchableOpacity>

              {/* Password Strength Checklist */}
              {authTab === 'register' && password.length > 0 && (
                <View style={styles.strengthCard}>
                  <View style={styles.strengthHeaderRow}>
                    <Text style={styles.strengthTitle}>
                      Şifre Gücü: <Text style={{ color: strength.color, fontWeight: '800' }}>{strength.label}</Text>
                    </Text>
                  </View>
                  <View style={styles.strengthBarRow}>
                    <View style={[styles.strengthBarSegment, { backgroundColor: strength.score >= 1 ? strength.color : colors.glass.hairline }]} />
                    <View style={[styles.strengthBarSegment, { backgroundColor: strength.score >= 2 ? strength.color : colors.glass.hairline }]} />
                    <View style={[styles.strengthBarSegment, { backgroundColor: strength.score >= 3 ? strength.color : colors.glass.hairline }]} />
                  </View>
                  <View style={styles.criteriaList}>
                    <View style={styles.criteriaRow}>
                      {hasMinLength ? <CheckCircle2 size={13} color={colors.status.lived.color} /> : <Circle size={13} color={colors.text.muted} />}
                      <Text style={[styles.criteriaText, hasMinLength && styles.criteriaTextMet]}>8+ karakter</Text>
                    </View>
                    <View style={styles.criteriaRow}>
                      {hasUppercase ? <CheckCircle2 size={13} color={colors.status.lived.color} /> : <Circle size={13} color={colors.text.muted} />}
                      <Text style={[styles.criteriaText, hasUppercase && styles.criteriaTextMet]}>1 büyük harf</Text>
                    </View>
                    <View style={styles.criteriaRow}>
                      {hasNumber ? <CheckCircle2 size={13} color={colors.status.lived.color} /> : <Circle size={13} color={colors.text.muted} />}
                      <Text style={[styles.criteriaText, hasNumber && styles.criteriaTextMet]}>1 rakam</Text>
                    </View>
                  </View>
                </View>
              )}

              <TouchableOpacity
                onPress={handleAuthSubmit}
                style={[styles.primaryActionButton, isLoading && { opacity: 0.7 }]}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={colors.text.primary} size="small" />
                ) : (
                  <>
                    <Text style={styles.primaryActionButtonText}>
                      {authTab === 'register' ? 'Pasaportumu Kaydet' : 'Giriş Yap ve Senkronize Et'}
                    </Text>
                    <ArrowRight size={19} color={colors.text.primary} strokeWidth={2.5} />
                  </>
                )}
              </TouchableOpacity>

              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>VEYA</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Social Logins */}
              <View style={styles.socialCol}>
                {Platform.OS === 'ios' && (
                  <TouchableOpacity
                    onPress={() => handleSocialAuth('apple')}
                    style={[styles.socialBtn, styles.appleBtn]}
                    disabled={isLoading}
                  >
                    <AppleIcon />
                    <Text style={styles.appleBtnText}>Apple ile Kaydet</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  onPress={() => handleSocialAuth('google')}
                  style={[styles.socialBtn, styles.googleBtn]}
                  disabled={isLoading}
                >
                  <GoogleIcon />
                  <Text style={styles.googleBtnText}>Google ile Kaydet</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleGuest} style={styles.guestBtn} disabled={isLoading}>
                  <Text style={styles.guestBtnText}>
                    {currentLang === 'tr' ? 'Hesap açmadan devam et' : 'Continue without an account'}
                  </Text>
                </TouchableOpacity>
                <Text style={styles.guestHint}>
                  {currentLang === 'tr'
                    ? 'Verilerin bu cihazda kalır. İstediğin zaman hesap oluşturup buluta taşıyabilirsin.'
                    : 'Your data stays on this device. You can create an account and sync it any time.'}
                </Text>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return null;
}

const useStyles = makeStyles((colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvas.base,
  },
  flex1: {
    flex: 1,
  },

  // ─── Header ───
  funnelHeader: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.glass.fillStrong,
  },
  topBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  backBtn: {
    padding: 4,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  logoText: {
    fontSize: 24,
    color: colors.text.primary,
    letterSpacing: -0.8,
    fontFamily: fonts.displayHeavy,
  },
  logoDot: {
    fontSize: 24,
    color: colors.gold.base,
    fontFamily: fonts.displayHeavy,
  },
  stepProgressTrack: {
    flex: 1,
    height: 5,
    backgroundColor: colors.glass.fillStrong,
    borderRadius: 3,
    overflow: 'hidden',
    marginHorizontal: 8,
  },
  stepProgressBar: {
    height: '100%',
    backgroundColor: colors.gold.base,
    borderRadius: 3,
  },
  langPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.glass.borderSoft,
    borderWidth: 1,
    borderColor: colors.glass.hairline,
    paddingHorizontal: 10,
    height: 32,
    borderRadius: 16,
  },
  langPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.gold.base,
  },

  // ─── Step 1: Hook ───
  hookTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  hookContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  hookMapWrapper: {
    width: '100%',
    marginBottom: 20,
    alignItems: 'center',
  },
  hookMapCard: {
    width: '100%',
    aspectRatio: 16 / 9.5,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.glass.hairline,
    backgroundColor: colors.canvas.raised,
    overflow: 'hidden',
  },
  hookTextCol: {
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  hookBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.gold.tint,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.gold.glow,
  },
  hookBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.gold.base,
    letterSpacing: 0.8,
  },
  hookMainTitle: {
    fontSize: 32,
    color: colors.text.primary,
    textAlign: 'center',
    letterSpacing: -0.9,
    lineHeight: 38,
    marginBottom: 12,
    fontFamily: fonts.display,
  },
  hookSubTitle: {
    fontSize: 15,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 23,
    fontWeight: '400',
    paddingHorizontal: 12,
  },
  hookFooter: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 24 : 32,
    gap: 14,
  },
  primaryActionButton: {
    height: 56,
    borderRadius: 24,
    backgroundColor: colors.gold.base,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: colors.gold.base,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 4,
  },
  primaryActionButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.canvas.base,
    letterSpacing: -0.2,
  },
  signInShortcutBtn: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  signInShortcutText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text.secondary,
  },

  // ─── Step 2: Home ───
  stepScrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 100,
  },
  stepHeader: {
    marginBottom: 16,
  },
  stepTitle: {
    fontSize: 24,
    color: colors.text.primary,
    letterSpacing: -0.5,
    marginBottom: 6,
    fontFamily: fonts.display,
  },
  stepSub: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  mapCardWrapper: {
    width: '100%',
    position: 'relative',
    marginBottom: 16,
  },
  homeMapCard: {
    width: '100%',
    aspectRatio: 16 / 9.5,
    borderRadius: 22,
    backgroundColor: colors.canvas.raised,
    borderWidth: 1,
    borderColor: colors.glass.hairline,
    overflow: 'hidden',
  },
  selectedHomePill: {
    position: 'absolute',
    bottom: 10,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.panel.base,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.glass.hairline,
  },
  selectedHomePillText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.text.primary,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.panel.base,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.glass.hairline,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
  popularSection: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.text.muted,
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  countryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.glass.fill,
    borderWidth: 1,
    borderColor: colors.glass.hairline,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  countryChipActive: {
    backgroundColor: colors.gold.tint,
    borderColor: colors.gold.base,
  },
  chipFlag: {
    fontSize: 15,
  },
  chipName: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text.secondary,
  },
  chipNameActive: {
    color: colors.gold.base,
    fontWeight: '800',
  },
  countryListCol: {
    gap: 8,
  },
  countryListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: colors.panel.base,
    borderWidth: 1,
    borderColor: colors.glass.fillStrong,
  },
  countryListItemActive: {
    borderColor: colors.status.lived.color,
    backgroundColor: colors.status.lived.light,
  },
  countryListLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  countryFlagLarge: {
    fontSize: 22,
  },
  countryListName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text.primary,
  },
  countryListNameActive: {
    color: colors.status.lived.color,
  },
  countryListContinent: {
    fontSize: 11,
    color: colors.text.muted,
  },
  stickyFooterBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.panel.raised,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 20,
    borderTopWidth: 1,
    borderTopColor: colors.glass.fillStrong,
  },

  // ─── Step 3: Visited Grid ───
  visitedStepScrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 110,
  },
  visitedTitleSection: {
    paddingBottom: 12,
    backgroundColor: 'transparent',
  },
  visitedStepBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.status.visited.light,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  visitedStepBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.status.visited.bright,
    letterSpacing: 0.8,
  },
  visitedMapCard: {
    width: '100%',
    aspectRatio: 16 / 9.5,
    borderRadius: 22,
    backgroundColor: colors.canvas.raised,
    borderWidth: 1,
    borderColor: colors.glass.hairline,
    overflow: 'hidden',
  },
  visitedStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.glass.borderSoft,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  statPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.text.primary,
  },
  statPillHighlight: {
    backgroundColor: colors.gold.tint,
    borderWidth: 1,
    borderColor: colors.gold.glow,
  },
  statPillHighlightText: {
    fontSize: 11,
    fontWeight: '900',
    color: colors.gold.base,
  },
  filterSection: {
    paddingVertical: 4,
    backgroundColor: 'transparent',
  },
  searchBoxCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.panel.base,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.glass.hairline,
    marginBottom: 8,
  },
  searchInputCompact: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.primary,
  },
  continentChipsRow: {
    gap: 6,
    paddingBottom: 4,
  },
  continentChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: colors.glass.borderSoft,
  },
  continentChipActive: {
    backgroundColor: colors.gold.base,
  },
  continentChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text.secondary,
  },
  continentChipTextActive: {
    color: colors.canvas.base,
  },
  visitedGridContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 110,
  },
  gridSectionHeadingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  gridSelectedCountHint: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.gold.base,
  },
  flagGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  flagGridCard: {
    width: (SCREEN_WIDTH - 50) / 2,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.panel.base,
    borderWidth: 1,
    borderColor: colors.glass.fillStrong,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
  },
  flagGridCardActive: {
    borderColor: colors.status.visited.color,
    backgroundColor: colors.status.visited.border,
    shadowColor: colors.status.visited.color,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 2,
  },
  flagGridCardHome: {
    borderColor: colors.status.lived.color,
    backgroundColor: colors.status.lived.light,
  },
  flagGridCardWishlist: {
    borderColor: colors.gold.base,
    backgroundColor: colors.gold.tint,
  },
  flagGridEmoji: {
    fontSize: 22,
  },
  flagGridTitle: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: colors.text.primary,
  },
  flagGridTitleActive: {
    color: colors.gold.light,
    fontWeight: '800',
  },
  flagGridTitleWishlist: {
    color: colors.gold.light,
    fontWeight: '800',
  },
  flagGridCheck: {
    width: 20,
    alignItems: 'center',
  },

  // ─── Step 4: Payoff ───
  payoffScrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },
  payoffHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  celebrationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.gold.tint,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.gold.glow,
  },
  celebrationBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.gold.base,
    letterSpacing: 0.8,
  },
  payoffTitle: {
    fontSize: 26,
    color: colors.text.primary,
    textAlign: 'center',
    letterSpacing: -0.6,
    fontFamily: fonts.display,
  },
  statHeroBox: {
    width: '100%',
    backgroundColor: colors.panel.base,
    borderRadius: 30,
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.glass.hairline,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 5,
  },
  statHeroPercent: {
    fontSize: 64,
    fontWeight: '900',
    color: colors.gold.base,
    letterSpacing: -2,
    lineHeight: 68,
  },
  statHeroLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.text.secondary,
    letterSpacing: 1.2,
    marginTop: 4,
  },
  statDivider: {
    width: '100%',
    height: 1,
    backgroundColor: colors.glass.hairline,
    marginVertical: 20,
  },
  statTrioRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  statTrioItem: {
    alignItems: 'center',
  },
  statTrioNum: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.text.primary,
  },
  statTrioLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.text.secondary,
    letterSpacing: 0.8,
    marginTop: 2,
  },
  badgeUnlockCard: {
    width: '100%',
    backgroundColor: colors.gold.tint,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.gold.border,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
  },
  badgeUnlockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 14,
  },
  badgeUnlockSub: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.gold.light,
    letterSpacing: 1,
  },
  badgeMedalIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.gold.tint,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.gold.border,
  },
  badgeNameText: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.text.primary,
    marginBottom: 6,
  },
  badgeDescText: {
    fontSize: 12,
    color: colors.gold.light,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 12,
  },
  payoffActionWrap: {
    width: '100%',
  },

  // ─── Step 5: Wishlist ───
  stepHeaderWithAction: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 10,
  },
  stepHeaderLeft: {
    flex: 1,
    paddingRight: 12,
  },
  skipSmallBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: colors.glass.fillStrong,
  },
  skipSmallText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text.secondary,
  },

  // ─── Step 6: Save Passport ───
  savePassportHeaderCard: {
    marginBottom: 20,
  },
  passportChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.gold.tint,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  passportChipText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.gold.base,
  },
  savePassportTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.text.primary,
    letterSpacing: -0.6,
    marginBottom: 6,
  },
  savePassportSub: {
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 19,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.glass.fill,
    borderRadius: 16,
    padding: 4,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: colors.glass.fillStrong,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
  },
  tabItemActive: {
    backgroundColor: colors.glass.hairline,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text.muted,
  },
  tabTextActive: {
    color: colors.text.primary,
    fontWeight: '800',
  },
  formCol: {
    gap: 12,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.panel.base,
    borderRadius: 18,
    paddingHorizontal: 16,
    height: 54,
    borderWidth: 1,
    borderColor: colors.glass.hairline,
  },
  inputBoxFocused: {
    borderColor: colors.gold.base,
    backgroundColor: colors.panel.raised,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    color: colors.text.primary,
    fontWeight: '600',
    paddingVertical: 0,
  },
  strengthCard: {
    backgroundColor: colors.panel.base,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.glass.hairline,
    gap: 8,
  },
  strengthHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  strengthTitle: {
    fontSize: 11,
    color: colors.text.secondary,
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
    color: colors.text.muted,
    fontWeight: '600',
  },
  criteriaTextMet: {
    color: colors.text.primary,
    fontWeight: '700',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.glass.hairline,
  },
  dividerText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.text.muted,
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
    backgroundColor: colors.canvas.surface,
    borderWidth: 1,
    borderColor: colors.glass.fillActive,
  },
  appleBtnText: {
    color: colors.text.primary,
    fontSize: 15,
    fontWeight: '700',
  },
  googleBtn: {
    backgroundColor: colors.glass.fillStrong,
    borderWidth: 1,
    borderColor: colors.glass.hairline,
  },
  guestBtn: {
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestBtnText: {
    color: colors.gold.light,
    fontSize: 14,
    fontWeight: '700',
  },
  guestHint: {
    color: colors.text.muted,
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
    paddingHorizontal: 12,
  },
  googleBtnText: {
    color: colors.text.primary,
    fontSize: 15,
    fontWeight: '700',
  },

  // ─── OTP ───
  otpHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  otpIconBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.gold.tint,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: colors.gold.glow,
  },
  otpBoxesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginVertical: 20,
  },
  otpBox: {
    flex: 1,
    height: 58,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.glass.hairline,
    backgroundColor: colors.panel.base,
    justifyContent: 'center',
    alignItems: 'center',
  },
  otpBoxFilled: {
    borderColor: colors.gold.base,
    backgroundColor: colors.panel.raised,
  },
  otpInput: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.text.primary,
    textAlign: 'center',
    width: '100%',
    height: '100%',
  },
}));
