import React from 'react';
import Button from './ui/Button';
import { View, ScrollView } from 'react-native';
import { Share2, CalendarClock, BookOpen } from 'lucide-react-native';
import EditProfileModal from './EditProfileModal';
import CountryStatusModal from './CountryStatusModal';
import { tPassportScreen } from '../localization/screens/PassportScreen';
import { usePassportScreen } from './passport/usePassportScreen';
import { PassportCard } from './passport/PassportCard';
import { StatsTiles } from './passport/StatsTiles';
import { CountryList } from './passport/CountryList';
import { AccountSheet } from './passport/AccountSheet';
import { PassportScreenProps } from './passport/shared';

function PassportScreen({
  profile,
  countries,
  onRemoveCountry,
  onUpdateCountry,
  onOpenAddModal,
  onOpenShareModal,
  onUpdateProfile,
  onLogout,
  onDeleteAccount,
  onCreateAccount,
  onOpenJourney,
  onOpenPlanner,
  onSelectCountry,
  t,
  currentLang,
  onToggleLang,
  isAccountModalOpen: isAccountModalOpenExternal,
  onCloseAccountModal: onCloseAccountModalExternal }: PassportScreenProps) {
  const ctx = usePassportScreen({ profile, countries, onRemoveCountry, onUpdateCountry, onOpenAddModal, onOpenShareModal, onUpdateProfile, onLogout, onDeleteAccount, onCreateAccount, onOpenJourney, onOpenPlanner, onSelectCountry, t, currentLang, onToggleLang, isAccountModalOpen: isAccountModalOpenExternal, onCloseAccountModal: onCloseAccountModalExternal });
  const { handleShare, isEditProfileOpen, selectedCountryToEdit, setIsEditProfileOpen, setSelectedCountryToEdit, styles } = ctx;

  return (
    <>
      <View style={styles.outerWrapper}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* TRAVEL PASSPORT CARD (Theme-adaptive luxury card) */}
          <PassportCard ctx={ctx} />

      {/* STATS TILES (Interactive Filter) */}
      <StatsTiles ctx={ctx} />

      {/* FILTERED COUNTRY LIST */}
      <CountryList ctx={ctx} />

      {/* PRIMARY CTA: SHARE YOUR PASSPORT (4:3 Photo Card) */}
      {onOpenPlanner && (
        <Button
          onPress={onOpenPlanner}
          variant="secondary"
          label={tPassportScreen('trip_planner', currentLang)}
          icon={(color) => <CalendarClock size={16} color={color} />}
          style={styles.shareButton}
        />
      )}

      {onOpenJourney && (
        <Button
          onPress={onOpenJourney}
          variant="secondary"
          label={tPassportScreen('travel_journal', currentLang)}
          icon={(color) => <BookOpen size={16} color={color} />}
          style={styles.shareButton}
        />
      )}

      <Button
        onPress={handleShare}
        label={t.sharePassport}
        icon={(color) => <Share2 size={16} color={color} />}
        style={styles.shareButton}
      />

      </ScrollView>
    </View>

    {/* ACCOUNT MANAGEMENT MODAL (App Store Guideline 5.1.1(v) Compliant) */}
    <AccountSheet ctx={ctx} />

    <EditProfileModal
      isOpen={isEditProfileOpen}
      onClose={() => setIsEditProfileOpen(false)}
      profile={profile}
      onSaveProfile={onUpdateProfile}
      onDeleteAccount={onDeleteAccount}
      t={t}
      currentLang={currentLang}
    />

    <CountryStatusModal
      isOpen={Boolean(selectedCountryToEdit)}
      onClose={() => setSelectedCountryToEdit(null)}
      country={selectedCountryToEdit}
      onUpdateCountry={(updated) => {
        if (onUpdateCountry) onUpdateCountry(updated);
      }}
      onRemoveCountry={(id) => {
        if (onRemoveCountry) onRemoveCountry(id);
      }}
      t={t}
      currentLang={currentLang}
    />
    </>
  );
}

export default React.memo(PassportScreen);
