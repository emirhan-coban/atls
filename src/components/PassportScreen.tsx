import React from 'react';
import { View, ScrollView } from 'react-native';
import EditProfileModal from './EditProfileModal';
import CountryStatusModal from './CountryStatusModal';
import { usePassportScreen } from './passport/usePassportScreen';
import { PassportHeader } from './passport/PassportHeader';
import { SegmentTabs } from './passport/SegmentTabs';
import { StatsPanel } from './passport/StatsPanel';
import { CountryFilter } from './passport/CountryFilter';
import { TripsPanel } from './passport/TripsPanel';
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
  const { isEditProfileOpen, segment, selectedCountryToEdit, setIsEditProfileOpen, setSelectedCountryToEdit, styles } = ctx;

  return (
    <>
      <View style={styles.outerWrapper}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <PassportHeader ctx={ctx} />
          <SegmentTabs ctx={ctx} />

          {segment === 'stats' && <StatsPanel ctx={ctx} />}
          {segment === 'countries' && (
            <>
              <CountryFilter ctx={ctx} />
              <CountryList ctx={ctx} />
            </>
          )}
          {segment === 'trips' && <TripsPanel ctx={ctx} />}

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
