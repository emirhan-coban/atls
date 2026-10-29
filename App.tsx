import { makeStyles, ThemeProvider } from './src/theme/ThemeContext';
import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, View, Alert, LogBox, AppState } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { InstrumentSerif_400Regular, InstrumentSerif_400Regular_Italic } from '@expo-google-fonts/instrument-serif';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { translations } from './src/localization/translations';
import { useAppStore, useCountryStore, useProfileStore, usePlanStore, useTripStore } from './src/stores';
import { Country } from './src/stores/types';
import HomeScreen from './src/components/HomeScreen';
import ExploreScreen from './src/components/ExploreScreen';
import PassportScreen from './src/components/PassportScreen';
import BottomNav from './src/components/BottomNav';
import AppHeader from './src/components/AppHeader';
import AddCountryModal from './src/components/AddCountryModal';
import OnboardingScreen from './src/components/OnboardingScreen';
import AuthScreen from './src/components/AuthScreen';
import PassportShareModal from './src/components/PassportShareModal';
import CountryDetailModal from './src/components/CountryDetailModal';
import CountryStatusModal from './src/components/CountryStatusModal';
import CelebrationLayer from './src/components/CelebrationLayer';
import { useCelebrationStore } from './src/stores/useCelebrationStore';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import JourneyModal from './src/components/JourneyModal';
import PlannerModal from './src/components/PlannerModal';
import { useProgressStore } from './src/stores/useProgressStore';
import { SkeletonItem, SkeletonCountryCard } from './src/components/SkeletonLoader';
import { storageService } from './src/services/storageService';
import { refreshMemoryReminders } from './src/services/memoryReminders';
import { clearVault } from './src/utils/vault';

// Silence on-screen warning popups/banners only for screen recordings and demos
// (set EXPO_PUBLIC_DEMO_MODE=1); normal builds keep warnings visible.
if (process.env.EXPO_PUBLIC_DEMO_MODE === '1') {
  LogBox.ignoreAllLogs(true);
}

function AppContent() {
  const [fontsLoaded, fontError] = useFonts({ InstrumentSerif_400Regular, InstrumentSerif_400Regular_Italic });
  const styles = useStyles();
  const isLoaded = useAppStore((state) => state.isLoaded);
  const currentLang = useAppStore((state) => state.currentLang);
  const hasCompletedOnboarding = useAppStore((state) => state.hasCompletedOnboarding);
  const activeTab = useAppStore((state) => state.activeTab);
  const isAddModalOpen = useAppStore((state) => state.isAddModalOpen);
  const isShareModalOpen = useAppStore((state) => state.isShareModalOpen);
  const initApp = useAppStore((state) => state.initApp);
  const toggleLang = useAppStore((state) => state.toggleLang);
  const setActiveTab = useAppStore((state) => state.setActiveTab);
  const setIsAddModalOpen = useAppStore((state) => state.setIsAddModalOpen);
  const setIsShareModalOpen = useAppStore((state) => state.setIsShareModalOpen);
  const completeOnboarding = useAppStore((state) => state.completeOnboarding);

  const countries = useCountryStore((state) => state.countries);
  const addCountry = useCountryStore((state) => state.addCountry);
  const updateCountry = useCountryStore((state) => state.updateCountry);
  const removeCountry = useCountryStore((state) => state.removeCountry);
  const clearCountries = useCountryStore((state) => state.clearCountries);

  const profile = useProfileStore((state) => state.profile);
  const isAuthenticated = useProfileStore((state) => state.isAuthenticated);
  const updateProfile = useProfileStore((state) => state.updateProfile);
  const loginSuccess = useProfileStore((state) => state.loginSuccess);
  const logout = useProfileStore((state) => state.logout);
  const deleteAccount = useProfileStore((state) => state.deleteAccount);
  const ensureLegacyTrips = useTripStore((state) => state.ensureLegacyTrips);
  const tripsHydrated = useTripStore((state) => state.isHydrated);
  const startAccountUpgrade = useProfileStore((state) => state.startAccountUpgrade);
  const selectedCountryDetailId = useAppStore((state) => state.selectedCountryId);
  const setSelectedCountryDetailId = useAppStore((state) => state.setSelectedCountryId);
  const [countryToEdit, setCountryToEdit] = useState<Country | null>(null);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState<boolean>(false);
  const [isJourneyOpen, setIsJourneyOpen] = useState<boolean>(false);
  const [isPlannerOpen, setIsPlannerOpen] = useState<boolean>(false);
  const trips = useTripStore((state) => state.trips);
  const checkUnlocks = useProgressStore((state) => state.checkUnlocks);
  const badgeQueue = useProgressStore((state) => state.queue);

  // Load saved state on mount (offline-first & Supabase sync via Zustand AppStore)
  useEffect(() => {
    initApp();
  }, [initApp]);

  // Every visited country gets a trip, so the timeline and statistics also cover older data
  useEffect(() => {
    if (tripsHydrated) {
      ensureLegacyTrips(countries);
    }
  }, [countries, tripsHydrated, ensureLegacyTrips]);

  // Unlock badges when countries or trips change; a new badge shows a banner with confetti
  useEffect(() => {
    if (tripsHydrated) {
      checkUnlocks(countries, profile, trips);
    }
  }, [countries, trips, profile, tripsHydrated, checkUnlocks]);

  useEffect(() => {
    if (badgeQueue.length > 0) {
      useCelebrationStore.getState().burstConfetti();
    }
  }, [badgeQueue.length]);

  // Retry any cloud writes that failed while offline whenever the app returns to the foreground
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        storageService.flushOutbox();
      }
    });
    return () => subscription.remove();
  }, []);

  const t = translations[currentLang];

  const handleToggleLang = useCallback(() => {
    toggleLang();
  }, [toggleLang]);

  const handleOpenProfile = useCallback(() => {
    if (activeTab !== 'passport') {
      setActiveTab('passport');
    } else {
      setIsAccountModalOpen(true);
    }
  }, [activeTab, setActiveTab]);

  const handleCompleteOnboarding = async (onboardingPayload: any = {}) => {
    await completeOnboarding(onboardingPayload);
  };

  const handleAddCountry = useCallback((newCountry: any) => {
    addCountry(newCountry);
    if (newCountry?.id && newCountry.status !== 'want') {
      useCelebrationStore.getState().showStamp({
        countryId: newCountry.id,
        status: newCountry.status,
        year: newCountry.visitedYear || newCountry.year,
        month: newCountry.visitedMonth || newCountry.month,
      });
    }
  }, [addCountry]);

  const handleUpdateCountry = useCallback((updatedCountry: any) => {
    updateCountry(updatedCountry);
  }, [updateCountry]);

  const handleRemoveCountry = useCallback((countryId: string) => {
    removeCountry(countryId);
  }, [removeCountry]);

  const handleTabChange = useCallback((tabId: string) => {
    if (tabId === 'passport' || tabId === 'profile') {
      setActiveTab('passport');
    } else if (tabId === 'explore') {
      setActiveTab('explore');
    } else {
      setActiveTab('home');
    }
  }, [setActiveTab]);

  const handleOpenAddModal = useCallback(() => setIsAddModalOpen(true), [setIsAddModalOpen]);
  const handleOpenShareModal = useCallback(() => setIsShareModalOpen(true), [setIsShareModalOpen]);
  const handleNavigateToPassport = useCallback(() => setActiveTab('passport'), [setActiveTab]);
  const handleNavigateToExplore = useCallback(() => setActiveTab('explore'), [setActiveTab]);
  const handleSelectCountryDetail = useCallback((id: string) => setSelectedCountryDetailId(id), []);

  const handleLoginSuccess = async (userData: any) => {
    const sessionData = await loginSuccess(userData);
    if (sessionData?.countries) {
      useCountryStore.getState().setCountries(sessionData.countries);
    }
    if (sessionData?.trips) {
      useTripStore.getState().setTrips(sessionData.trips);
    }
    if (sessionData?.plans) {
      usePlanStore.getState().setPlans(sessionData.plans);
      usePlanStore.getState().restoreReminders(useAppStore.getState().currentLang).catch(() => {});
    }
  };

  const handleUpdateProfile = useCallback((updatedProfile: any) => {
    updateProfile(updatedProfile);
  }, [updateProfile]);

  const handleLogout = useCallback(async () => {
    clearCountries();
    useTripStore.getState().clearTrips();
    usePlanStore.getState().clearPlans();
    await refreshMemoryReminders(false, currentLang);
    await clearVault();
    await logout();
  }, [clearCountries, currentLang, logout]);

  const handleDeleteAccount = useCallback(async () => {
    try {
      await deleteAccount();
      clearCountries();
      useTripStore.getState().clearTrips();
      usePlanStore.getState().clearPlans();
      await refreshMemoryReminders(false, currentLang);
      await clearVault();
      setTimeout(() => {
        Alert.alert(
          t?.deleteAccount || 'Hesap Silindi',
          t?.accountDeletedMsg || 'Hesabınız ve tüm verileriniz başarıyla silindi.'
        );
      }, 300);
    } catch (e) {
      console.warn('[App] deleteAccount failed:', e);
      Alert.alert(
        currentLang === 'tr' ? 'Hesap silinemedi' : 'Could not delete account',
        currentLang === 'tr'
          ? 'Hesabınız silinemedi. İnternet bağlantınızı kontrol edip tekrar deneyin.'
          : 'Your account could not be deleted. Check your connection and try again.'
      );
    }
  }, [clearCountries, currentLang, deleteAccount, t]);

  // Stable callbacks: the three screens are memoised, and inline arrows would re-render all of them on every tab change
  const openJourney = useCallback(() => setIsJourneyOpen(true), []);
  const openPlanner = useCallback(() => setIsPlannerOpen(true), []);
  const closeAccountModal = useCallback(() => setIsAccountModalOpen(false), []);

  // Loading screen before persistent storage is ready
  // Wait for storage and the display font so headings never flash in the fallback face
  if (!isLoaded || (!fontsLoaded && !fontError)) {
    return (
      <View style={[styles.container, styles.loadingScreen]}>
        <SkeletonItem width={96} height={32} borderRadius={10} />
        <SkeletonItem width="64%" height={26} borderRadius={10} />
        <SkeletonCountryCard />
        <SkeletonCountryCard />
      </View>
    );
  }

  // 1. If user hasn't completed onboarding, show onboarding
  if (!hasCompletedOnboarding) {
    return (
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <OnboardingScreen
          onComplete={handleCompleteOnboarding}
          t={t}
          currentLang={currentLang}
          onToggleLang={handleToggleLang}
        />
      </SafeAreaProvider>
    );
  }

  // 2. If user is NOT authenticated, show mandatory AuthScreen
  if (!isAuthenticated) {
    return (
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <AuthScreen
          onLoginSuccess={handleLoginSuccess}
          t={t}
          currentLang={currentLang}
          onToggleLang={handleToggleLang}
        />
      </SafeAreaProvider>
    );
  }

  // 3. Main App View
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
          <StatusBar style="auto" />

          {/* Universal Sticky Top Header Bar (100% Fixed & Consistent Across All Tabs) */}
          <AppHeader
            currentLang={currentLang}
            onToggleLang={handleToggleLang}
            onOpenProfile={handleOpenProfile}
          />

        {/* Viewport with instant tab switching (Keep-Alive) */}
        <View style={styles.screenContainer}>
          <View style={[styles.screenWrapper, { display: activeTab === 'home' ? 'flex' : 'none' }]}>
            <HomeScreen
              countries={countries}
              profile={profile}
              onOpenAddModal={handleOpenAddModal}
              onNavigateToPassport={handleNavigateToPassport}
              onNavigateToExplore={handleNavigateToExplore}
              onSelectCountry={handleSelectCountryDetail}
              t={t}
              currentLang={currentLang}
              onToggleLang={handleToggleLang}
              onOpenAuth={handleNavigateToPassport}
              tripCount={trips.length}
              onOpenJourney={openJourney}
              onOpenPlanner={openPlanner}
            />
          </View>

          <View style={[styles.screenWrapper, { display: activeTab === 'explore' ? 'flex' : 'none' }]}>
            <ExploreScreen
              countries={countries}
              profile={profile}
              onAddToWishlist={handleAddCountry}
              onMarkVisited={handleAddCountry}
              t={t}
              currentLang={currentLang}
              onSelectCountry={handleSelectCountryDetail}
              onToggleLang={handleToggleLang}
            />
          </View>

          <View style={[styles.screenWrapper, { display: activeTab === 'passport' ? 'flex' : 'none' }]}>
            <PassportScreen
              profile={profile}
              countries={countries}
              onRemoveCountry={handleRemoveCountry}
              onUpdateCountry={handleUpdateCountry}
              onOpenAddModal={handleOpenAddModal}
              onOpenShareModal={handleOpenShareModal}
              onUpdateProfile={handleUpdateProfile}
              onLogout={handleLogout}
              onDeleteAccount={handleDeleteAccount}
              onCreateAccount={startAccountUpgrade}
              onOpenJourney={openJourney}
              onOpenPlanner={openPlanner}
              onSelectCountry={handleSelectCountryDetail}
              t={t}
              currentLang={currentLang}
              onToggleLang={handleToggleLang}
              isAccountModalOpen={isAccountModalOpen}
              onCloseAccountModal={closeAccountModal}
            />
          </View>
        </View>

        {/* Floating Capsule Bottom Dock */}
        <BottomNav activeTab={activeTab} onTabChange={handleTabChange} t={t} />

        {/* Modal: Add Country */}
        <AddCountryModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAddCountry={handleAddCountry}
          onUpdateCountry={handleUpdateCountry}
          existingCountryIds={countries.map((c) => c.id) as any}
          existingCountries={countries as any}
          t={t}
          currentLang={currentLang}
        />

        {/* Modal: 4:3 Passport Photo Card Modal */}
        <PassportShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          profile={profile}
          countries={countries}
          t={t}
          currentLang={currentLang}
        />

        {/* Modal: Country Detail Sheet */}
        <CountryDetailModal
          isOpen={Boolean(selectedCountryDetailId)}
          countryId={selectedCountryDetailId}
          countries={countries}
          onClose={() => setSelectedCountryDetailId(null)}
          onStampVisited={handleAddCountry}
          onUpdateCountry={handleUpdateCountry}
          onOpenEditModal={(country) => setCountryToEdit(country)}
          onOpenShareModal={(country) => setIsShareModalOpen(true)}
          currentLang={currentLang}
          t={t}
        />

        {/* Modal: Edit Country Status */}
        <CountryStatusModal
          isOpen={Boolean(countryToEdit)}
          country={countryToEdit}
          onClose={() => setCountryToEdit(null)}
          onUpdateCountry={handleUpdateCountry}
          onRemoveCountry={handleRemoveCountry}
          currentLang={currentLang}
          t={t}
        />

        {/* Travel journal: timeline, statistics, badges */}
        <PlannerModal visible={isPlannerOpen} onClose={() => setIsPlannerOpen(false)} currentLang={currentLang} />

        <JourneyModal
          visible={isJourneyOpen}
          onClose={() => setIsJourneyOpen(false)}
          countries={countries}
          trips={trips}
          profile={profile}
          currentLang={currentLang}
        />

        {/* Stamp, badge banner and confetti (modals mount their own layer, see CelebrationLayer) */}
        <CelebrationLayer hostId="app" currentLang={currentLang} />
      </SafeAreaView>
    </SafeAreaProvider>
  </ErrorBoundary>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

const useStyles = makeStyles((colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvas.base,
  },
  screenContainer: {
    flex: 1,
  },
  screenWrapper: {
    flex: 1,
  },
  loadingScreen: {
    paddingTop: 72,
    paddingHorizontal: 20,
    gap: 16,
  },
}));
