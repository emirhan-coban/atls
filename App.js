import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { initialCountries, initialProfile } from './src/data/travelData';
import { translations } from './src/localization/translations';
import HomeScreen from './src/components/HomeScreen';
import PassportScreen from './src/components/PassportScreen';
import BottomNav from './src/components/BottomNav';
import AddCountryModal from './src/components/AddCountryModal';
import OnboardingScreen from './src/components/OnboardingScreen';
import AuthModal from './src/components/AuthModal';
import SpotifyShareModal from './src/components/SpotifyShareModal';

export default function App() {
  const [currentLang, setCurrentLang] = useState('tr'); // Default to Turkish
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [countries, setCountries] = useState(initialCountries);
  const [profile, setProfile] = useState(initialProfile);
  const [activeTab, setActiveTab] = useState('home');
  
  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const t = translations[currentLang];

  const handleToggleLang = () => {
    setCurrentLang((prev) => (prev === 'tr' ? 'en' : 'tr'));
  };

  const handleAddCountry = (newCountry) => {
    setCountries((prev) => [newCountry, ...prev]);
  };

  const handleRemoveCountry = (countryId) => {
    setCountries((prev) => prev.filter((c) => c.id !== countryId));
  };

  const handleTabChange = (tabId) => {
    if (tabId === 'passport' || tabId === 'profile') {
      setActiveTab('passport');
    } else {
      setActiveTab('home');
    }
  };

  const handleLoginSuccess = (userData) => {
    setProfile((prev) => ({
      ...prev,
      ...userData,
    }));
  };

  // 1. If user hasn't completed onboarding, show onboarding
  if (!hasCompletedOnboarding) {
    return (
      <SafeAreaProvider>
        <StatusBar style="light" />
        <OnboardingScreen
          onComplete={() => setHasCompletedOnboarding(true)}
          t={t}
          currentLang={currentLang}
          onToggleLang={handleToggleLang}
        />
      </SafeAreaProvider>
    );
  }

  // 2. Main App View
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
              onOpenAuth={() => setIsAuthModalOpen(true)}
            />
          ) : (
            <PassportScreen
              profile={profile}
              countries={countries}
              onRemoveCountry={handleRemoveCountry}
              onOpenAddModal={() => setIsAddModalOpen(true)}
              onOpenShareModal={() => setIsShareModalOpen(true)}
              t={t}
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
          existingCountryIds={countries.map((c) => c.id)}
          t={t}
        />

        {/* Modal: Login / Register Auth */}
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onLoginSuccess={handleLoginSuccess}
          t={t}
        />

        {/* Modal: Spotify-Style Story Share Card */}
        <SpotifyShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          profile={profile}
          countries={countries}
          t={t}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FBFBFD',
  },
  screenContainer: {
    flex: 1,
  },
});
