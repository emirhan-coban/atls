import { useTheme } from '../theme/ThemeContext';
import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
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
import { CONTINENT_FILTERS, ContinentFilter, inContinent } from '../data/continents';
import { authService } from '../services/authService';
import { generateHandle } from '../services/storageService';
import Heading from './ui/Heading';

import { useStyles } from './OnboardingScreen.styles';

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
          <TouchableOpacity accessibilityRole="button" accessibilityLabel={currentLang === 'tr' ? 'Geri' : 'Back'}
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

            <Heading style={styles.hookMainTitle}>
              {t?.onboardingPromise || 'Dünyanın ne kadarını gezdin?'}
            </Heading>

            <Text style={styles.hookSubTitle}>
              {t?.onboardingPromiseSub || 'Seyahatlerini haritalandır, ülkelerini işaretle ve kişisel dünya pasaportunu başlat.'}
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
              <Heading style={styles.stepTitle}>{t?.homeTitle || 'Nerede Yaşıyorsun?'}</Heading>
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
              <TextInput accessibilityLabel={t?.searchHomePlaceholder || 'Ülke ara (örn. Türkiye, Almanya)...'}
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
              <Heading style={styles.stepTitle}>
                {t?.visitedTitle || (currentLang === 'tr' ? 'Gittiğin Ülkeleri Seç' : 'Select Visited Countries')}
              </Heading>
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
                <TextInput accessibilityLabel={t?.searchHomePlaceholder || 'Gittiğin ülkeleri filtrele...'}
                  value={visitedSearch}
                  onChangeText={setVisitedSearch}
                  placeholder={t?.searchHomePlaceholder || 'Gittiğin ülkeleri filtrele...'}
                  placeholderTextColor={colors.text.secondary}
                  style={styles.searchInputCompact}
                  autoCorrect={false}
                />
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.continentChipsRow}>
                {CONTINENT_FILTERS.map((c) => (
                  <TouchableOpacity
                    key={c.id}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setContinentFilter(c.id);
                    }}
                    style={[styles.continentChip, continentFilter === c.id && styles.continentChipActive]}
                  >
                    <Text style={[styles.continentChipText, continentFilter === c.id && styles.continentChipTextActive]}>
                      {c[currentLang]}
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

            <Heading style={styles.payoffTitle}>
              {t?.resultTitle || 'Pasaportun Şekillendi! 🌍'}
            </Heading>
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
                <Text style={styles.statTrioLabel}>{currentLang === 'tr' ? 'ÜLKE İŞARETİ' : 'MARKED'}</Text>
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
            <TouchableOpacity accessibilityRole="button" accessibilityLabel={currentLang === 'tr' ? 'Geri' : 'Back'} onPress={() => setIsOtpStep(false)} style={styles.backBtn}>
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
                <Heading style={styles.stepTitle}>{t?.otpTitle || 'E-postanızı Doğrulayın'}</Heading>
                <Text style={styles.stepSub}>
                  {email} adresine gönderilen 6 haneli güvenlik kodunu girin.
                </Text>
              </View>

              {/* 6 Digit Input Boxes */}
              <View style={styles.otpBoxesRow}>
                {otpDigits.map((digit, idx) => (
                  <View key={idx} style={[styles.otpBox, digit && styles.otpBoxFilled]}>
                    <TextInput
                      accessibilityLabel={currentLang === 'tr' ? `Doğrulama kodu, ${idx + 1}. hane` : `Verification code, digit ${idx + 1}`}
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
              <Heading style={styles.savePassportTitle}>
                {t?.savePassportTitle || 'Pasaportunu Kaydet & Kilitle'}
              </Heading>
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
                <TouchableOpacity accessible={false}
                  activeOpacity={1}
                  onPress={() => nameInputRef.current?.focus()}
                  style={[styles.inputBox, focusedField === 'name' && styles.inputBoxFocused]}
                >
                  <User size={18} color={focusedField === 'name' ? colors.gold.base : colors.text.muted} />
                  <TextInput accessibilityLabel={t?.fullName || 'Ad Soyad'}
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

              <TouchableOpacity accessible={false}
                activeOpacity={1}
                onPress={() => emailInputRef.current?.focus()}
                style={[styles.inputBox, focusedField === 'email' && styles.inputBoxFocused]}
              >
                <Mail size={18} color={focusedField === 'email' ? colors.gold.base : colors.text.muted} />
                <TextInput accessibilityLabel={t?.email || 'E-posta adresi'}
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

              <TouchableOpacity accessible={false}
                activeOpacity={1}
                onPress={() => passwordInputRef.current?.focus()}
                style={[styles.inputBox, focusedField === 'password' && styles.inputBoxFocused]}
              >
                <Lock size={18} color={focusedField === 'password' ? colors.gold.base : colors.text.muted} />
                <TextInput accessibilityLabel={authTab === 'register' ? 'Şifre (en az 8 karakter)' : 'Şifre'}
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
                <TouchableOpacity accessibilityRole="button" accessibilityLabel={showPassword ? (currentLang === 'tr' ? 'Şifreyi gizle' : 'Hide password') : (currentLang === 'tr' ? 'Şifreyi göster' : 'Show password')} onPress={() => setShowPassword((p) => !p)} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
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

