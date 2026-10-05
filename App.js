import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { initialCountries, initialProfile } from './src/data/travelData';
import { translations } from './src/localization/translations';
import { storageService } from './src/services/storageService';
import HomeScreen from './src/components/HomeScreen';
import PassportScreen from './src/components/PassportScreen';
import BottomNav from './src/components/BottomNav';
import AddCountryModal from './src/components/AddCountryModal';
import OnboardingScreen from './src/components/OnboardingScreen';
import AuthScreen from './src/components/AuthScreen';
import PassportShareModal from './src/components/PassportShareModal';

export default function App() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentLang, setCurrentLang] = useState('tr'); // Default to Turkish
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [countries, setCountries] = useState(initialCountries);
  const [profile, setProfile] = useState(initialProfile);
  const [activeTab, setActiveTab] = useState('home');
  
  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Load saved state on mount (offline-first & Supabase sync)
  useEffect(() => {
    async function loadData() {
      const data = await storageService.loadInitialData(initialProfile, initialCountries);
      setCurrentLang(data.lang);
      setHasCompletedOnboarding(data.hasCompletedOnboarding);
      setIsAuthenticated(Boolean(data.isAuthenticated));
      if (data.profile) setProfile(data.profile);
      if (data.countries) setCountries(data.countries);
      setIsLoaded(true);
    }
    loadData();
  }, []);

  const t = translations[currentLang];

  const handleToggleLang = () => {
    setCurrentLang((prev) => {
      const next = prev === 'tr' ? 'en' : 'tr';
      storageService.saveLang(next);
      return next;
    });
  };

  const handleCompleteOnboarding = () => {
    setHasCompletedOnboarding(true);
    storageService.saveOnboarding(true);
  };

  const handleAddCountry = (newCountry) => {
    setCountries((prev) => [newCountry, ...prev.filter((c) => c.id !== newCountry.id)]);
    storageService.addCountry(newCountry);
  };

  const handleUpdateCountry = (updatedCountry) => {
    setCountries((prev) => [updatedCountry, ...prev.filter((c) => c.id !== updatedCountry.id)]);
    storageService.updateCountry(updatedCountry);
  };

  const handleRemoveCountry = (countryId) => {
    setCountries((prev) => prev.filter((c) => c.id !== countryId));
    storageService.removeCountry(countryId);
  };

  const handleTabChange = (tabId) => {
    if (tabId === 'passport' || tabId === 'profile') {
      setActiveTab('passport');
    } else {
      setActiveTab('home');
    }
  };

  const handleLoginSuccess = (userData) => {
    setProfile((prev) => {
      const updated = {
        ...prev,
        ...userData,
      };
      storageService.saveProfile(updated);
      return updated;
    });
    setIsAuthenticated(true);
    storageService.saveAuth(true);
  };

  const handleUpdateProfile = (updatedProfile) => {
    setProfile(updatedProfile);
    storageService.saveProfile(updatedProfile);
  };

  const handleLogout = async () => {
    setIsAuthenticated(false);
    await storageService.clearAuth();
  };

  // Loading screen before persistent storage is ready
  if (!isLoaded) {
    return (
      <View style={[styles.container, styles.centerLoader]}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  // 1. If user hasn't completed onboarding, show onboarding
  if (!hasCompletedOnboarding) {
    return (
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <OnboardingScreen
          onComplete={handleCompleteOnboarding}
          t={t}
          currentLang={currentLang}
          onToggleLang={handleToggleLang}
        />
      </SafeAreaProvider>
    );
  }

  // 2. If user is NOT authenticated, show mandatory AuthScreen (no guest mode, goes directly here after onboarding)
  if (!isAuthenticated) {
    return (
      <SafeAreaProvider>
        <StatusBar style="dark" />
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
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <StatusBar style="dark" />

        {/* Viewport */}
        <View style={styles.screenContainer}>
          {activeTab === 'home' ? (
            <HomeScreen
              countries={countries}
              profile={profile}
              onOpenAddModal={() => setIsAddModalOpen(true)}
              onNavigateToPassport={() => setActiveTab('passport')}
              onSelectCountry={(id) => {}}
              t={t}
              currentLang={currentLang}
              onToggleLang={handleToggleLang}
              onOpenAuth={() => setActiveTab('passport')}
            />
          ) : (
            <PassportScreen
              profile={profile}
              countries={countries}
              onRemoveCountry={handleRemoveCountry}
              onUpdateCountry={handleUpdateCountry}
              onOpenAddModal={() => setIsAddModalOpen(true)}
              onOpenShareModal={() => setIsShareModalOpen(true)}
              onUpdateProfile={handleUpdateProfile}
              onLogout={handleLogout}
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
          existingCountryIds={countries.map((c) => c.id)}
          existingCountries={countries}
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
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  screenContainer: {
    flex: 1,
  },
  centerLoader: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
