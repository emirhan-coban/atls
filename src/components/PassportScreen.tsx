import Sheet from './ui/Sheet';
import Button from './ui/Button';
import EmptyState from './EmptyState';
import { useTheme } from '../theme/ThemeContext';
import { useAppStore } from '../stores/useAppStore';
import { useTripStore } from '../stores/useTripStore';
import { exportAndShare } from '../utils/exportFiles';
import { pickAndImportBackup } from '../utils/importFiles';
import { PRIVACY_URL } from '../utils/links';
import { jt } from '../localization/journey';
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import * as WebBrowser from 'expo-web-browser';
import {
  ShieldCheck,
  Check,
  MapPin,
  Edit3,
  Share2,
  Trash2,
  QrCode,
  Sparkles,
  Plus,
  LogOut,
  ShieldAlert,
  X,
  ChevronRight,
  Cloud,
  Download,
  Upload,
  FileText,
  CalendarClock,
  BookOpen,
  Sun,
  Moon,
  Smartphone,
} from 'lucide-react-native';
import { getLocalizedCountryName, formatCountryDate } from '../data/travelData';
import { PASSPORT_THEMES, PassportThemeKey } from '../theme/passportThemes';
import { Country, Profile, ThemePreference } from '../stores/types';
import EditProfileModal from './EditProfileModal';
import CountryStatusModal from './CountryStatusModal';
import AnimatedCounter from './AnimatedCounter';
import { getDynamicLocation } from '../utils/locationHelper';

import { useStyles } from './PassportScreen.styles';
interface PassportScreenProps {
  profile: Profile;
  countries: Country[];
  onRemoveCountry: (countryId: string) => void;
  onUpdateCountry: (country: any) => void;
  onOpenAddModal: () => void;
  onOpenShareModal: () => void;
  onUpdateProfile: (profile: any) => void;
  onLogout: () => void;
  onDeleteAccount: () => void;
  onCreateAccount?: () => void;
  onOpenJourney: () => void;
  onOpenPlanner: () => void;
  onSelectCountry: (countryId: string) => void;
  t: Record<string, any>;
  currentLang: 'tr' | 'en';
  onToggleLang: () => void;
  isAccountModalOpen?: boolean;
  onCloseAccountModal?: () => void;
  [key: string]: any;
}

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

  return (
    <>
      <View style={styles.outerWrapper}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* TRAVEL PASSPORT CARD (Theme-adaptive luxury card) */}
          <LinearGradient
            colors={currentTheme.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.passportCard, { borderColor: currentTheme.borderColor }]}
          >
        {/* Top Card Row */}
        <View style={styles.cardTopRow}>
          <View style={[styles.verifiedBadge, { backgroundColor: colors.glass.hairline, borderColor: colors.glass.borderStrong }]}>
            <ShieldCheck size={16} color={currentTheme.accentColor} />
            <Text style={[styles.verifiedText, { color: currentTheme.textColor }]}>{t.officialPassport}</Text>
          </View>

          <View style={styles.cardTopRight}>
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setIsEditProfileOpen(true);
              }}
              activeOpacity={0.7}
              style={[styles.cardEditBtn, { backgroundColor: colors.glass.hairline }]}
            >
              <Edit3 size={11} color={currentTheme.accentColor} />
              <Text style={[styles.cardEditBtnText, { color: currentTheme.textColor }]}>{t.edit || (currentLang === 'tr' ? 'Düzenle' : 'Edit')}</Text>
            </TouchableOpacity>

            {/* Chip Graphic */}
            <View style={[styles.chipContainer, { borderColor: currentTheme.chipColor }]}>
              <View style={[styles.chipInner, { backgroundColor: currentTheme.chipColor }]}>
                <View style={styles.chipLine} />
              </View>
            </View>
          </View>
        </View>

        {/* Profile Info Row */}
        <View style={styles.profileRow}>
          {/* Avatar Monogram */}
          <View style={styles.avatarContainer}>
            <View style={[styles.avatarBox, { backgroundColor: colors.glass.fillActive, borderColor: colors.glass.borderStrong }]}>
              <Text style={[styles.avatarText, { color: currentTheme.textColor }]}>{profile.avatarInitials}</Text>
            </View>
            <View style={styles.verifiedDot}>
              <Check size={10} color={colors.text.primary} strokeWidth={3} />
            </View>
          </View>

          {/* Name & Handle */}
          <View style={styles.profileDetails}>
            <Text
              style={[styles.profileName, { color: currentTheme.textColor }]}
              numberOfLines={1}
              adjustsFontSizeToFit={true}
              minimumFontScale={0.75}
            >
              {profile.name}
            </Text>
            <Text style={[styles.profileHandle, { color: currentTheme.subtextColor }]} numberOfLines={1}>
              {profile.handle}
            </Text>
            <View style={styles.locationRow}>
              {locationInfo.flag ? (
                <Text style={styles.locationFlag}>{locationInfo.flag}</Text>
              ) : (
                <MapPin size={13} color={currentTheme.accentColor} />
              )}
              <Text
                style={[styles.locationText, { color: currentTheme.textColor }]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {locationInfo.text}
              </Text>
            </View>
          </View>
        </View>

        {/* Metadata Strip */}
        <View style={[styles.metadataStrip, { backgroundColor: colors.glass.fillStrong, borderColor: colors.glass.hairline }]}>
          <View style={styles.metaCol}>
            <Text style={[styles.metaLabel, { color: currentTheme.subtextColor }]}>{t.docNo}</Text>
            <Text
              style={[styles.metaValue, { color: currentTheme.textColor }]}
              numberOfLines={1}
              adjustsFontSizeToFit={true}
              minimumFontScale={0.8}
            >
              {profile.passportNo}
            </Text>
          </View>
          <View style={styles.metaColMiddle}>
            <Text style={[styles.metaLabel, { color: currentTheme.subtextColor }]}>{t.borders}</Text>
            <Text
              style={[styles.metaValue, { color: currentTheme.accentColor }]}
              numberOfLines={1}
              adjustsFontSizeToFit={true}
              minimumFontScale={0.8}
            >
              {t.recorded ? t.recorded.replace('{count}', countries.length) : `${countries.length} Recorded`}
            </Text>
          </View>
          <View style={styles.metaColEnd}>
            <Text style={[styles.metaLabel, { color: currentTheme.subtextColor }]}>{t.status}</Text>
            <Text
              style={[styles.metaValue, { color: colors.status.lived.color }]}
              numberOfLines={1}
              adjustsFontSizeToFit={true}
              minimumFontScale={0.8}
            >
              {t.active}
            </Text>
          </View>
        </View>

        {/* Security / MRZ Strip */}
        <View style={styles.mrzRow}>
          <Text
            style={[styles.mrzCode, { color: currentTheme.subtextColor }]}
            numberOfLines={1}
            adjustsFontSizeToFit={true}
            minimumFontScale={0.7}
          >
            {mrzCodeString}
          </Text>
          <QrCode size={22} color={currentTheme.textColor} />
        </View>
      </LinearGradient>

      {/* STATS TILES (Interactive Filter) */}
      <View style={styles.statsRow}>
        {/* Visited */}
        <TouchableOpacity accessibilityState={{ selected: activeTab === 'visited' }}
          onPress={() => handleTabPress('visited')}
          activeOpacity={0.7}
          style={[
            styles.statTile,
            activeTab === 'visited' && styles.statTileActiveVisited,
          ]}
        >
          <AnimatedCounter
            value={visitedCountries.length}
            formatter={(v) => {
              const rounded = Math.round(v);
              return rounded < 10 ? `0${rounded}` : `${rounded}`;
            }}
            style={styles.statNumber}
          />
          <View style={styles.statLabelRow}>
            <View
              style={[
                styles.statDot,
                { backgroundColor: colors.status.visited.color },
              ]}
            />
            <Text
              style={[
                styles.statLabel,
                activeTab === 'visited' && styles.statLabelActive,
              ]}
              numberOfLines={1}
              adjustsFontSizeToFit={true}
              minimumFontScale={0.8}
            >
              {t.visited}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Lived In */}
        <TouchableOpacity accessibilityState={{ selected: activeTab === 'lived' }}
          onPress={() => handleTabPress('lived')}
          activeOpacity={0.7}
          style={[
            styles.statTile,
            activeTab === 'lived' && styles.statTileActiveLived,
          ]}
        >
          <AnimatedCounter
            value={livedCountries.length}
            formatter={(v) => {
              const rounded = Math.round(v);
              return rounded < 10 ? `0${rounded}` : `${rounded}`;
            }}
            style={styles.statNumber}
          />
          <View style={styles.statLabelRow}>
            <View
              style={[
                styles.statDot,
                { backgroundColor: colors.status.lived.color },
              ]}
            />
            <Text
              style={[
                styles.statLabel,
                activeTab === 'lived' && styles.statLabelActive,
              ]}
              numberOfLines={1}
              adjustsFontSizeToFit={true}
              minimumFontScale={0.8}
            >
              {t.livedIn}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Wishlist */}
        <TouchableOpacity accessibilityState={{ selected: activeTab === 'want' }}
          onPress={() => handleTabPress('want')}
          activeOpacity={0.7}
          style={[
            styles.statTile,
            activeTab === 'want' && styles.statTileActiveWant,
          ]}
        >
          <AnimatedCounter
            value={wantCountries.length}
            formatter={(v) => {
              const rounded = Math.round(v);
              return rounded < 10 ? `0${rounded}` : `${rounded}`;
            }}
            style={styles.statNumber}
          />
          <View style={styles.statLabelRow}>
            <View
              style={[
                styles.statDot,
                { backgroundColor: colors.status.want.color },
              ]}
            />
            <Text
              style={[
                styles.statLabel,
                activeTab === 'want' && styles.statLabelActive,
              ]}
              numberOfLines={1}
              adjustsFontSizeToFit={true}
              minimumFontScale={0.8}
            >
              {t.wishlist}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* FILTERED COUNTRY LIST */}
      <View style={styles.countryListCard}>
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>
            {activeTab === 'all' && (t.allCountries ? t.allCountries.replace('{count}', countries.length) : `TÜM ÜLKELER (${countries.length})`)}
            {activeTab === 'visited' && t.visitedCountries.replace('{count}', visitedCountries.length)}
            {activeTab === 'lived' && t.livedCountries.replace('{count}', livedCountries.length)}
            {activeTab === 'want' && t.dreamDestinations.replace('{count}', wantCountries.length)}
          </Text>
          <View style={styles.listActionGroup}>
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setIsEditing((prev) => !prev);
              }}
              style={[styles.editPillButton, isEditing && styles.editPillButtonActive]}
              activeOpacity={0.7}
            >
              <Edit3 size={11} color={isEditing ? colors.gold.base : colors.text.muted} strokeWidth={2.2} />
              <Text style={[styles.editPillText, isEditing && styles.editPillTextActive]}>
                {isEditing ? (t.done || 'Bitti') : (t.edit || 'Düzenle')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onOpenAddModal();
              }}
              style={styles.addPillButton}
              activeOpacity={0.7}
            >
              <Plus size={11} color={colors.gold.base} strokeWidth={2.5} />
              <Text style={styles.addPillText}>{t.add || '+ Ekle'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {getFilteredList().length === 0 ? (
          <EmptyState
            type={activeTab === 'want' ? 'wishlist' : 'passport'}
            title={t.emptyPassportTitle}
            description={t.emptyPassportDesc}
            actionLabel={t.emptyPassportBtn}
            onAction={onOpenAddModal}
          />
        ) : (
          getFilteredList().map((c) => {
            const countryName = getLocalizedCountryName(c, currentLang);
            const countryDate = c.status === 'want' ? '' : (formatCountryDate(c, currentLang) || c.year || '');
            const countryNotes = currentLang === 'tr' ? (c.notesTr || c.notes) : c.notes;

            return (
              <TouchableOpacity
                key={c.id}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  if (onSelectCountry) {
                    onSelectCountry(c.id);
                  } else {
                    setSelectedCountryToEdit(c);
                  }
                }}
                activeOpacity={0.7}
                style={styles.countryRow}
              >
                <View style={styles.countryLeft}>
                  <Text style={styles.countryFlag}>{c.flag}</Text>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <View style={styles.countryNameRow}>
                      <Text
                        style={styles.countryName}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {countryName}
                      </Text>
                      {Boolean(countryDate) && (
                        <View style={styles.yearBadge}>
                          <Text style={styles.countryYear}>{countryDate}</Text>
                        </View>
                      )}
                      {activeTab === 'all' && (
                        <View
                          style={[
                            styles.statusTagPill,
                            c.status === 'lived' && styles.statusTagPillLived,
                            c.status === 'want' && styles.statusTagPillWant,
                            c.status === 'visited' && styles.statusTagPillVisited,
                          ]}
                        >
                          <Text
                            style={[
                              styles.statusTagText,
                              c.status === 'lived' && styles.statusTagTextLived,
                              c.status === 'want' && styles.statusTagTextWant,
                              c.status === 'visited' && styles.statusTagTextVisited,
                            ]}
                          >
                            {c.status === 'lived'
                              ? (t.livedIn || 'Yaşanan')
                              : c.status === 'want'
                                ? (t.wishlist || 'Hedef')
                                : (t.visited || 'Gezilen')}
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.countryNotes} numberOfLines={1}>
                      {countryNotes || (c.status === 'want' ? (currentLang === 'tr' ? 'Hedeflerinde bekliyor...' : 'In your wishlist...') : '')}
                    </Text>
                  </View>
                </View>

                <View style={styles.countryRightActions}>
                  {c.status === 'want' && !isEditing && (
                    <TouchableOpacity
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setSelectedCountryToEdit(c);
                      }}
                      activeOpacity={0.7}
                      style={styles.stampNowBtn}
                    >
                      <Sparkles size={11} color={colors.gold.base} />
                      <Text style={styles.stampNowText}>
                        {t.stampNow || (currentLang === 'tr' ? 'Gittim!' : 'Visited!')}
                      </Text>
                    </TouchableOpacity>
                  )}

                  {isEditing && (
                    <TouchableOpacity accessibilityRole="button" accessibilityLabel={currentLang === 'tr' ? 'Ülkeyi sil' : 'Remove country'}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        Alert.alert(
                          t.removeConfirmTitle,
                          t.removeConfirmMsg.replace('{country}', countryName),
                          [
                            { text: t.cancel, style: 'cancel' },
                            {
                              text: t.remove,
                              style: 'destructive',
                              onPress: () => onRemoveCountry(c.id),
                            },
                          ]
                        );
                      }}
                      style={styles.deleteButton}
                    >
                      <Trash2 size={15} color={colors.danger} />
                    </TouchableOpacity>
                  )}
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </View>

      {/* PRIMARY CTA: SHARE YOUR PASSPORT (4:3 Photo Card) */}
      {onOpenPlanner && (
        <Button
          onPress={onOpenPlanner}
          variant="secondary"
          label={currentLang === 'tr' ? 'Seyahat Planlayıcı' : 'Trip Planner'}
          icon={(color) => <CalendarClock size={16} color={color} />}
          style={styles.shareButton}
        />
      )}

      {onOpenJourney && (
        <Button
          onPress={onOpenJourney}
          variant="secondary"
          label={currentLang === 'tr' ? 'Seyahat Günlüğü' : 'Travel Journal'}
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
    <Sheet
      visible={isAccountModalOpen}
      onClose={() => setIsAccountModalOpen(false)}
      maxHeight="92%"
    >

          {/* Modal Header */}
          <View style={styles.accountSheetHeader}>
            <View>
              <Text style={styles.accountSheetTitle}>
                {t.accountManagement || (currentLang === 'tr' ? 'Hesap Yönetimi' : 'Account Management')}
              </Text>
              <Text style={styles.accountSheetSubtitle}>
                {currentLang === 'tr' ? 'Profil ve oturum ayarlarınız' : 'Your profile and session settings'}
              </Text>
            </View>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel={currentLang === 'tr' ? 'Kapat' : 'Close'}
              onPress={() => setIsAccountModalOpen(false)}
              style={styles.sheetCloseBtn}
              activeOpacity={0.7}
            >
              <X size={18} color={colors.text.muted} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
          {/* User Profile Summary Card */}
          <View style={styles.accountModalCard}>
            <View style={styles.accountAvatar}>
              <Text style={styles.accountAvatarText}>{profile.avatarInitials || 'AT'}</Text>
            </View>
            <View style={styles.accountInfoText}>
              <Text style={styles.accountNameText} numberOfLines={1}>{profile.name}</Text>
              <Text style={styles.accountHandleText} numberOfLines={1}>
                {profile.email || profile.handle || (currentLang === 'tr' ? 'Biyometrik Pasaport Hesabı' : 'Biometric Passport Account')}
              </Text>
              {Boolean(profile.passportNo) && (
                <View style={styles.accountDocBadge}>
                  <Text style={styles.accountDocText}>NO: {profile.passportNo}</Text>
                </View>
              )}
            </View>
          </View>

          {/* APPEARANCE (system / light / dark) */}
          <View style={styles.themePickerSection}>
            <View style={styles.themePickerHeader}>
              <Sun size={14} color={colors.gold.base} />
              <Text style={styles.themePickerTitle}>
                {currentLang === 'tr' ? 'GÖRÜNÜM' : 'APPEARANCE'}
              </Text>
            </View>
            <View style={styles.appearanceRow}>
              {[
                { key: 'system', Icon: Smartphone, label: currentLang === 'tr' ? 'Sistem' : 'System' },
                { key: 'light', Icon: Sun, label: currentLang === 'tr' ? 'Açık' : 'Light' },
                { key: 'dark', Icon: Moon, label: currentLang === 'tr' ? 'Koyu' : 'Dark' },
              ].map(({ key, Icon, label }) => {
                const isSelected = themePreference === key;
                return (
                  <TouchableOpacity
                    key={key}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setThemePreference(key as ThemePreference);
                    }}
                    activeOpacity={0.8}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    accessibilityLabel={label}
                    style={[styles.appearanceChip, isSelected && styles.appearanceChipActive]}
                  >
                    <Icon size={15} color={isSelected ? colors.gold.base : colors.text.secondary} />
                    <Text style={[styles.appearanceChipText, isSelected && styles.appearanceChipTextActive]}>
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Account Actions */}
          <View style={styles.accountActionsList}>
            {/* Edit Profile */}
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setIsAccountModalOpen(false);
                setTimeout(() => {
                  setIsEditProfileOpen(true);
                }, 250);
              }}
              activeOpacity={0.7}
              style={styles.accountListItem}
            >
              <View style={styles.accountListItemLeft}>
                <View style={[styles.accountActionIconBox, { backgroundColor: colors.glass.fillStrong }]}>
                  <Edit3 size={17} color={colors.gold.base} />
                </View>
                <Text style={styles.accountListItemLabel}>
                  {t.editProfile || (currentLang === 'tr' ? 'Profili Düzenle' : 'Edit Profile')}
                </Text>
              </View>
              <ChevronRight size={17} color={colors.text.secondary} />
            </TouchableOpacity>

            {/* Guest: move local data into a real account */}
            {profile?.isGuest && onCreateAccount && (
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  setIsAccountModalOpen(false);
                  onCreateAccount();
                }}
                activeOpacity={0.7}
                style={styles.accountListItem}
              >
                <View style={styles.accountListItemLeft}>
                  <View style={[styles.accountActionIconBox, { backgroundColor: colors.gold.tint }]}>
                    <Cloud size={17} color={colors.gold.base} />
                  </View>
                  <Text style={styles.accountListItemLabel}>
                    {currentLang === 'tr' ? 'Hesap Oluştur ve Buluta Taşı' : 'Create Account & Sync'}
                  </Text>
                </View>
              </TouchableOpacity>
            )}

            {/* Data portability: JSON or CSV copy of everything the user entered */}
            <TouchableOpacity onPress={handleExport} activeOpacity={0.7} style={styles.accountListItem}>
              <View style={styles.accountListItemLeft}>
                <View style={[styles.accountActionIconBox, { backgroundColor: colors.glass.fillStrong }]}>
                  <Download size={17} color={colors.gold.base} />
                </View>
                <Text style={styles.accountListItemLabel}>{jt('exportData', currentLang)}</Text>
              </View>
              <ChevronRight size={17} color={colors.text.secondary} />
            </TouchableOpacity>

            {/* Restore: merges an earlier JSON export, adding only what is missing */}
            <TouchableOpacity onPress={handleImport} activeOpacity={0.7} style={styles.accountListItem}>
              <View style={styles.accountListItemLeft}>
                <View style={[styles.accountActionIconBox, { backgroundColor: colors.glass.fillStrong }]}>
                  <Upload size={17} color={colors.gold.base} />
                </View>
                <Text style={styles.accountListItemLabel}>{jt('importData', currentLang)}</Text>
              </View>
              <ChevronRight size={17} color={colors.text.secondary} />
            </TouchableOpacity>

            {/* Privacy policy: required to be reachable from inside the app */}
            <TouchableOpacity
              onPress={() => WebBrowser.openBrowserAsync(PRIVACY_URL).catch(() => {})}
              activeOpacity={0.7}
              style={styles.accountListItem}
              accessibilityRole="link"
            >
              <View style={styles.accountListItemLeft}>
                <View style={[styles.accountActionIconBox, { backgroundColor: colors.glass.fillStrong }]}>
                  <FileText size={17} color={colors.gold.base} />
                </View>
                <Text style={styles.accountListItemLabel}>
                  {currentLang === 'tr' ? 'Gizlilik Politikası' : 'Privacy Policy'}
                </Text>
              </View>
              <ChevronRight size={17} color={colors.text.secondary} />
            </TouchableOpacity>

            {/* Log Out */}
            {onLogout && (
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  Alert.alert(
                    t.logOut || (currentLang === 'tr' ? 'Çıkış Yap' : 'Log Out'),
                    profile?.isGuest
                      ? (currentLang === 'tr'
                          ? 'Hesabın yok, bu yüzden çıkış yaparsan bu cihazdaki tüm kayıtların silinir. Önce hesap oluşturmanı öneririz.'
                          : 'You have no account, so logging out deletes everything stored on this device. We recommend creating an account first.')
                      : (currentLang === 'tr'
                          ? 'Hesabınızdan çıkış yapmak istediğinize emin misiniz?'
                          : 'Are you sure you want to log out of your account?'),
                    [
                      { text: t.cancel || (currentLang === 'tr' ? 'Vazgeç' : 'Cancel'), style: 'cancel' },
                      {
                        text: t.logOut || (currentLang === 'tr' ? 'Çıkış Yap' : 'Log Out'),
                        style: 'destructive',
                        onPress: () => {
                          setIsAccountModalOpen(false);
                          onLogout();
                        },
                      },
                    ]
                  );
                }}
                activeOpacity={0.7}
                style={styles.accountListItem}
              >
                <View style={styles.accountListItemLeft}>
                  <View style={[styles.accountActionIconBox, { backgroundColor: colors.glass.fillStrong }]}>
                    <LogOut size={17} color={colors.text.secondary} />
                  </View>
                  <Text style={styles.accountListItemLabel}>
                    {t.logOut || (currentLang === 'tr' ? 'Çıkış Yap' : 'Log Out')}
                  </Text>
                </View>
                <ChevronRight size={17} color={colors.text.secondary} />
              </TouchableOpacity>
            )}
          </View>

          {/* Danger Zone: Delete Account */}
          {onDeleteAccount && (
            <View style={styles.dangerZoneBox}>
              <View style={styles.dangerZoneHeader}>
                <ShieldAlert size={14} color={colors.danger} />
                <Text style={styles.dangerZoneTitle}>
                  {t.dangerZone || (currentLang === 'tr' ? 'Tehlikeli Bölge' : 'Danger Zone')}
                </Text>
              </View>
              <Text style={styles.dangerZoneDesc}>
                {currentLang === 'tr'
                  ? 'Hesabınızı ve kaydedilmiş tüm seyahat verilerinizi kalıcı olarak silin.'
                  : 'Permanently delete your account and all associated travel records.'}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                  Alert.alert(
                    t.deleteAccountConfirmTitle || (currentLang === 'tr' ? 'Hesabı Kalıcı Olarak Sil' : 'Permanently Delete Account'),
                    t.deleteAccountConfirmMsg ||
                      (currentLang === 'tr'
                        ? 'Hesabınızı silmek istediğinize emin misiniz? Tüm seyahatleriniz, pasaportunuz ve profil verileriniz kalıcı olarak silinecektir. Bu işlem geri alınamaz.'
                        : 'Are you sure you want to delete your account? All your travels, passport, and profile data will be permanently wiped. This action cannot be undone.'),
                    [
                      { text: t.cancel || (currentLang === 'tr' ? 'Vazgeç' : 'Cancel'), style: 'cancel' },
                      {
                        text: t.deleteAccount || (currentLang === 'tr' ? 'Hesabı Sil' : 'Delete Account'),
                        style: 'destructive',
                        onPress: () => {
                          setIsAccountModalOpen(false);
                          onDeleteAccount();
                        },
                      },
                    ]
                  );
                }}
                activeOpacity={0.7}
                style={styles.modalDeleteBtn}
              >
                <Trash2 size={16} color={colors.dangerDeep} />
                <Text style={styles.modalDeleteBtnText}>
                  {t.deleteAccount || (currentLang === 'tr' ? 'Hesabı Sil' : 'Delete Account')}
                </Text>
              </TouchableOpacity>
            </View>
          )}
          </ScrollView>
    </Sheet>

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
