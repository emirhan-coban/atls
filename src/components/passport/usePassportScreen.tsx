import { useTheme } from '../../theme/ThemeContext';
import { useAppStore } from '../../stores/useAppStore';
import { useTripStore } from '../../stores/useTripStore';
import { exportAndShare } from '../../utils/exportFiles';
import { pickAndImportBackup } from '../../utils/importFiles';
import { jt } from '../../localization/journey';
import { useState } from 'react';
import { Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { PASSPORT_THEMES, PassportThemeKey } from '../../theme/passportThemes';
import { Country } from '../../stores/types';
import { getDynamicLocation } from '../../utils/locationHelper';
import { useStyles } from '../PassportScreen.styles';
import { PassportScreenProps } from './shared';

export function usePassportScreen({
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
  onCloseAccountModal: onCloseAccountModalExternal,
}: PassportScreenProps) {
  const { colors } = useTheme();
  const styles = useStyles();
  const allTrips = useTripStore((state) => state.trips);

  const handleExport = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const run = async (format: any) => {
      try {
        await exportAndShare(format, { profile, countries, trips: allTrips });
      } catch (err) {
        console.warn('[Passport] export failed:', err);
        Alert.alert(jt('exportFailed', currentLang));
      }
    };
    Alert.alert(jt('exportData', currentLang), jt('exportChoose', currentLang), [
      { text: 'JSON', onPress: () => run('json') },
      { text: 'CSV', onPress: () => run('csv') },
      { text: jt('cancel', currentLang), style: 'cancel' },
    ]);
  };

  const handleImport = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const run = async () => {
      try {
        const result = await pickAndImportBackup();
        if (result.kind === 'cancelled') return;
        if (result.kind === 'invalid') return Alert.alert(jt('importInvalid', currentLang));
        Alert.alert(
          result.countries + result.trips === 0
            ? jt('importNothing', currentLang)
            : jt('importDone', currentLang, { countries: result.countries, trips: result.trips })
        );
      } catch (err) {
        console.warn('[Passport] import failed:', err);
        Alert.alert(jt('importFailed', currentLang));
      }
    };
    Alert.alert(jt('importConfirmTitle', currentLang), jt('importConfirmMsg', currentLang), [
      { text: jt('importChoose', currentLang), onPress: run },
      { text: jt('cancel', currentLang), style: 'cancel' },
    ]);
  };

  const themePreference = useAppStore((state) => state.themePreference);
  const setThemePreference = useAppStore((state) => state.setThemePreference);
  const [activeTab, setActiveTab] = useState('all');
  const [isEditing, setIsEditing] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [internalAccountModalOpen, setInternalAccountModalOpen] = useState(false);
  const isAccountModalOpen = isAccountModalOpenExternal !== undefined ? isAccountModalOpenExternal : internalAccountModalOpen;
  const setIsAccountModalOpen = (val: boolean) => {
    if (onCloseAccountModalExternal && !val) {
      onCloseAccountModalExternal();
    }
    setInternalAccountModalOpen(val);
  };
  const [selectedCountryToEdit, setSelectedCountryToEdit] = useState<Country | null>(null);

  const visitedCountries = countries.filter((c) => c.status === 'visited');
  const livedCountries = countries.filter((c) => c.status === 'lived');
  const wantCountries = countries.filter((c) => c.status === 'want');

  const currentThemeKey = profile?.passportTheme || 'classic_navy';
  const currentTheme = PASSPORT_THEMES[currentThemeKey as PassportThemeKey] || PASSPORT_THEMES.classic_navy;

  // Dynamic MRZ Code based on profile
  const cleanNameForMrz = (profile.name || 'TRAVELER')
    .toUpperCase()
    .replace(/[^A-Z]/g, '<');
  const cleanDocNo = (profile.passportNo || 'AT000000')
    .replace(/[^A-Z0-9]/g, '');
  const mrzCodeString = `P<WLD${cleanNameForMrz}<<<<<<<<<<<<<<<<<<<<<<${cleanDocNo}`.slice(0, 36);

  const handleShare = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (onOpenShareModal) {
      onOpenShareModal();
    }
  };

  const handleTabPress = (tab: string) => {
    Haptics.selectionAsync();
    setActiveTab((prev) => (prev === tab ? 'all' : tab));
  };

  const getFilteredList = () => {
    switch (activeTab) {
      case 'lived':
        return livedCountries;
      case 'want':
        return wantCountries;
      case 'visited':
        return visitedCountries;
      case 'all':
      default:
        return countries;
    }
  };

  const locationInfo = getDynamicLocation(profile, countries, currentLang);

  return { activeTab, colors, countries, currentLang, currentTheme, getFilteredList, handleExport, handleImport, handleShare, handleTabPress, isAccountModalOpen, isEditProfileOpen, isEditing, livedCountries, locationInfo, mrzCodeString, onCreateAccount, onDeleteAccount, onLogout, onOpenAddModal, onOpenJourney, onOpenPlanner, onRemoveCountry, onSelectCountry, onUpdateCountry, onUpdateProfile, profile, selectedCountryToEdit, setIsAccountModalOpen, setIsEditProfileOpen, setIsEditing, setSelectedCountryToEdit, setThemePreference, styles, t, themePreference, visitedCountries, wantCountries };
}

export type PassportCtx = ReturnType<typeof usePassportScreen>;
