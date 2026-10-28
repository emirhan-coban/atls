import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ActivityIndicator, Alert, LogBox } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { translations } from './src/localization/translations';
import { useAppStore, useCountryStore, useProfileStore } from './src/stores';
import { Country, ActiveTab } from './src/stores/types';
import { theme } from './src/theme';
import HomeScreen from './src/components/HomeScreen';
import ExploreScreen from './src/components/ExploreScreen';
import PassportScreen from './src/components/PassportScreen';
import BottomNav from './src/components/BottomNav';
import AddCountryModal from './src/components/AddCountryModal';
import OnboardingScreen from './src/components/OnboardingScreen';
import AuthScreen from './src/components/AuthScreen';
import PassportShareModal from './src/components/PassportShareModal';
import CountryDetailModal from './src/components/CountryDetailModal';
import CountryStatusModal from './src/components/CountryStatusModal';
import ConfettiCannon from './src/components/ConfettiCannon';
import { ErrorBoundary } from './src/components/ErrorBoundary';

// Silence on-screen warning popups/banners during screen recording and demos
LogBox.ignoreAllLogs(true);

export default function App() {
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
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  const [selectedCountryDetailId, setSelectedCountryDetailId] = useState<string | null>(null);
  const [countryToEdit, setCountryToEdit] = useState<Country | null>(null);

  // Load saved state on mount (offline-first & Supabase sync via Zustand AppStore)
  useEffect(() => {
    initApp();
  }, [initApp]);

  const t = translations[currentLang];

  const handleToggleLang = () => {
    toggleLang();
  };

  const handleCompleteOnboarding = async (onboardingPayload: any = {}) => {
    await completeOnboarding(onboardingPayload);
  };

  const handleAddCountry = (newCountry: any) => {
    addCountry(newCountry);
    setShowConfetti(true);
  };

  const handleUpdateCountry = (updatedCountry: any) => {
    updateCountry(updatedCountry);
  };

  const handleRemoveCountry = (countryId: string) => {
    removeCountry(countryId);
  };

  const handleTabChange = (tabId: string) => {
    if (tabId === 'passport' || tabId === 'profile') {
      setActiveTab('passport');
    } else if (tabId === 'explore') {
      setActiveTab('explore');
    } else {
      setActiveTab('home');
    }
  };

  const handleLoginSuccess = async (userData: any) => {
    const sessionData = await loginSuccess(userData);
    if (sessionData?.countries) {
      useCountryStore.getState().setCountries(sessionData.countries);
    } else {
      clearCountries();
    }
  };

  const handleUpdateProfile = (updatedProfile: any) => {
    updateProfile(updatedProfile);
  };

  const handleLogout = async () => {
    clearCountries();
    await logout();
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount();
      clearCountries();
    } catch (e) {
      console.warn('[App] deleteAccount notice:', e);
    } finally {
      setTimeout(() => {
        Alert.alert(
          t?.deleteAccount || 'Hesap Silindi',
          t?.accountDeletedMsg || 'Hesabınız ve tüm verileriniz başarıyla silindi.'
        );
      }, 300);
    }
  };

  // Loading screen before persistent storage is ready
  if (!isLoaded) {
    return (
      <View style={[styles.container, styles.centerLoader]}>
        <ActivityIndicator size="large" color={theme.colors.primary[600]} />
      </View>
    );
  }

  // 1. If user hasn't completed onboarding, show onboarding
  if (!hasCompletedOnboarding) {
    return (
      <SafeAreaProvider>
        <StatusBar style="light" />
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
        <StatusBar style="light" />
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
          <StatusBar style="light" />

        {/* Viewport */}
        <View style={styles.screenContainer}>
          {activeTab === 'home' && (
            <HomeScreen
              countries={countries}
              profile={profile}
              onOpenAddModal={() => setIsAddModalOpen(true)}
              onNavigateToPassport={() => setActiveTab('passport')}
              onNavigateToExplore={() => setActiveTab('explore')}
              onSelectCountry={(id: string) => setSelectedCountryDetailId(id)}
              t={t}
              currentLang={currentLang}
              onToggleLang={handleToggleLang}
              onOpenAuth={() => setActiveTab('passport')}
            />
          )}

          {activeTab === 'explore' && (
            <ExploreScreen
              countries={countries}
              profile={profile}
              onAddToWishlist={handleAddCountry}
              t={t}
              currentLang={currentLang}
              onToggleLang={handleToggleLang}
            />
          )}

          {activeTab === 'passport' && (
            <PassportScreen
              profile={profile}
              countries={countries}
              onRemoveCountry={handleRemoveCountry}
              onUpdateCountry={handleUpdateCountry}
              onOpenAddModal={() => setIsAddModalOpen(true)}
              onOpenShareModal={() => setIsShareModalOpen(true)}
              onUpdateProfile={handleUpdateProfile}
              onLogout={handleLogout}
              onDeleteAccount={handleDeleteAccount}
              onSelectCountry={(id: string) => setSelectedCountryDetailId(id)}
              t={t}
              currentLang={currentLang}
              onToggleLang={handleToggleLang}
            />
          )}
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

        {/* Celebration Confetti */}
        <ConfettiCannon active={showConfetti} onFinish={() => setShowConfetti(false)} />
      </SafeAreaView>
    </SafeAreaProvider>
  </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07090E',
  },
  screenContainer: {
    flex: 1,
  },
  centerLoader: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
