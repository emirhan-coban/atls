import Sheet from './ui/Sheet';
import Button from './ui/Button';
import EmptyState from './EmptyState';
import { fonts } from '../theme/typography';
import { makeStyles, useTheme } from '../theme/ThemeContext';
import { useAppStore } from '../stores/useAppStore';
import { useTripStore } from '../stores/useTripStore';
import { exportAndShare } from '../utils/exportFiles';
import { jt } from '../localization/journey';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
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

  // Dynamic stamps generated from user's actual visited countries
  const passportStampsList = visitedCountries.slice(0, 8).map((c, idx) => ({
    id: `stamp-${c.id}`,
    code: c.id,
    city: currentLang === 'tr' ? (c.nameTr || c.name) : c.name,
    country: currentLang === 'tr' ? (c.nameTr || c.name) : c.name,
    date: formatCountryDate(c, currentLang) || c.year || new Date().getFullYear().toString(),
    type: c.status === 'lived' ? (currentLang === 'tr' ? 'İKAMET' : 'RESIDENCE') : (currentLang === 'tr' ? 'GİRİŞ' : 'ENTRY'),
    accentColor: idx % 3 === 0 ? colors.status.visited.color : idx % 3 === 1 ? colors.status.lived.color : colors.gold.base,
    bg: idx % 3 === 0 ? colors.status.visited.light : idx % 3 === 1 ? colors.status.lived.light : colors.gold.tint,
  }));

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
        <TouchableOpacity
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
        <TouchableOpacity
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
        <TouchableOpacity
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
                    <TouchableOpacity
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

      {/* DIGITAL BORDER STAMPS */}
      <View style={styles.stampsSection}>
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>{t.officialStamps}</Text>
          <Text style={styles.stampsCount}>
            {t.stampsCount.replace('{count}', passportStampsList.length)}
          </Text>
        </View>

        {passportStampsList.length === 0 ? (
          <View style={styles.emptyStampsCard}>
            <Text style={styles.emptyStampsText}>{t.noStampsYet}</Text>
          </View>
        ) : (
          <View style={styles.stampsGrid}>
            {passportStampsList.map((stamp) => (
              <View key={stamp.id} style={styles.visaCard}>
                <View style={styles.visaTop}>
                  <Text style={styles.visaCode} numberOfLines={1}>{stamp.code}</Text>
                  <View style={[styles.visaBadge, { backgroundColor: stamp.bg }]}>
                    <Text
                      style={[styles.visaBadgeText, { color: stamp.accentColor }]}
                      numberOfLines={1}
                    >
                      {stamp.type}
                    </Text>
                  </View>
                </View>
                <Text style={styles.visaCity} numberOfLines={1} ellipsizeMode="tail">
                  {stamp.city}
                </Text>
                <Text style={styles.visaCountry} numberOfLines={1} ellipsizeMode="tail">
                  {stamp.country}
                </Text>
                <Text style={styles.visaDate} numberOfLines={1}>
                  {stamp.date}
                </Text>
              </View>
            ))}
          </View>
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
            <TouchableOpacity
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
                        ? 'Hesabınızı silmek istediğinize emin misiniz? Tüm seyahatleriniz, pasaport mühürleriniz ve profil verileriniz kalıcı olarak silinecektir. Bu işlem geri alınamaz.'
                        : 'Are you sure you want to delete your account? All your travels, stamps, and profile data will be permanently wiped. This action cannot be undone.'),
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

const useStyles = makeStyles((colors) => StyleSheet.create({
  outerWrapper: {
    flex: 1,
    backgroundColor: colors.canvas.base,
    position: 'relative',
    overflow: 'hidden',
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  contentContainer: {
    paddingHorizontal: 22,
    paddingTop: 6,
    paddingBottom: 112,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: '900',
    color: colors.text.primary,
    letterSpacing: -0.8,
  },
  logoDot: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.text.primary,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  langPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.glass.borderSoft,
    borderWidth: 1,
    borderColor: colors.glass.hairline,
    paddingHorizontal: 12,
    height: 38,
    borderRadius: 19,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  langPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.text.primary,
  },
  headerAccountBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.glass.borderSoft,
    borderWidth: 1,
    borderColor: colors.glass.hairline,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  passportCard: {
    backgroundColor: colors.panel.base,
    borderRadius: 30,
    paddingVertical: 20,
    paddingHorizontal: 22,
    marginTop: 16,
    borderWidth: 1,
    borderColor: colors.glass.fillActive,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.5,
    shadowRadius: 28,
    elevation: 6,
    overflow: 'hidden',
    position: 'relative',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  verifiedText: {
    fontSize: 9,
    fontWeight: '900',
    color: colors.text.primary,
    letterSpacing: 1,
  },
  cardTopRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cardEditBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 5,
    paddingHorizontal: 9,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.glass.fillActive,
  },
  cardEditBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text.primary,
  },
  chipContainer: {
    width: 34,
    height: 25,
    borderRadius: 6,
    backgroundColor: 'rgba(245, 236, 205, 0.2)',
    borderWidth: 1,
    borderColor: colors.gold.base,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipInner: {
    width: 22,
    height: 15,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.6)',
    borderRadius: 3,
    justifyContent: 'center',
  },
  chipLine: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.6)',
    height: 5,
  },
  profileRow: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarBox: {
    width: 72,
    height: 72,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  avatarText: {
    fontSize: 26,
    fontWeight: '900',
    color: colors.text.primary,
  },
  verifiedDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.status.lived.color,
    borderWidth: 2.5,
    borderColor: colors.canvas.base,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileDetails: {
    flex: 1,
  },
  nameTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileName: {
    fontSize: 28,
    color: colors.text.primary,
    letterSpacing: -0.5,
    fontFamily: fonts.display,
  },
  profileHandle: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: '500',
    marginTop: 2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 5,
  },
  locationFlag: {
    fontSize: 13.5,
    lineHeight: 16,
  },
  locationText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text.soft,
  },
  metadataStrip: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    borderRadius: 16,
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.glass.fillStrong,
    marginBottom: 14,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaCol: {
    flex: 1.25,
    alignItems: 'flex-start',
  },
  metaColMiddle: {
    flex: 1,
    alignItems: 'center',
  },
  metaColEnd: {
    flex: 0.85,
    alignItems: 'flex-end',
  },
  metaLabel: {
    fontSize: 8.5,
    fontWeight: '800',
    color: colors.text.secondary,
    letterSpacing: 0.5,
  },
  metaValue: {
    fontSize: 10.5,
    fontWeight: '800',
    color: colors.text.primary,
    marginTop: 2,
  },
  mrzRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.glass.hairline,
    paddingTop: 12,
  },
  mrzCode: {
    fontSize: 9,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: colors.text.secondary,
    letterSpacing: 1.5,
    flex: 1,
    marginRight: 10,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 18,
  },
  statTile: {
    flex: 1,
    backgroundColor: colors.panel.base,
    borderRadius: 20,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.glass.hairline,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 2,
  },
  statTileActiveVisited: {
    backgroundColor: colors.status.visited.light,
    borderColor: colors.status.visited.color,
    borderWidth: 1.5,
  },
  statTileActiveLived: {
    backgroundColor: colors.status.lived.light,
    borderColor: colors.status.lived.color,
    borderWidth: 1.5,
  },
  statTileActiveWant: {
    backgroundColor: colors.gold.tint,
    borderColor: colors.gold.base,
    borderWidth: 1.5,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.text.primary,
  },
  statNumberActive: {
    color: colors.text.primary,
  },
  statLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 3,
  },
  statDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.text.secondary,
  },
  statLabelActive: {
    color: colors.text.primary,
    fontWeight: '800',
  },
  countryListCard: {
    backgroundColor: colors.panel.base,
    borderRadius: 24,
    padding: 18,
    marginTop: 16,
    borderWidth: 1,
    borderColor: colors.glass.hairline,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  listTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.text.secondary,
    letterSpacing: 0.8,
  },
  listActionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editPillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.glass.borderSoft,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.glass.hairline,
  },
  editPillButtonActive: {
    backgroundColor: colors.status.visited.light,
    borderColor: colors.status.visited.color,
  },
  editPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text.secondary,
  },
  editPillTextActive: {
    color: colors.gold.light,
    fontWeight: '800',
  },
  addPillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.gold.tint,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.gold.glow,
  },
  addPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.gold.base,
  },
  countryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.glass.borderSoft,
  },
  countryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    minWidth: 0,
    marginRight: 8,
  },
  countryFlag: {
    fontSize: 24,
  },
  countryNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    flexShrink: 1,
  },
  countryName: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.text.primary,
    flexShrink: 1,
  },
  yearBadge: {
    backgroundColor: colors.glass.fillStrong,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
    flexShrink: 0,
  },
  countryYear: {
    fontSize: 10,
    color: colors.text.secondary,
    fontWeight: '700',
  },
  statusTagPill: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
    backgroundColor: colors.status.visited.light,
    flexShrink: 0,
  },
  statusTagPillVisited: {
    backgroundColor: colors.status.visited.light,
  },
  statusTagPillLived: {
    backgroundColor: colors.status.lived.light,
  },
  statusTagPillWant: {
    backgroundColor: colors.gold.tint,
  },
  statusTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.status.visited.bright,
    letterSpacing: 0.2,
  },
  statusTagTextVisited: {
    color: colors.status.visited.bright,
  },
  statusTagTextLived: {
    color: colors.status.lived.bright,
  },
  statusTagTextWant: {
    color: colors.gold.light,
  },
  countryNotes: {
    fontSize: 11,
    color: colors.text.muted,
    marginTop: 2,
  },
  countryRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },
  stampNowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.gold.tint,
    paddingVertical: 5,
    paddingHorizontal: 9,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gold.glow,
  },
  stampNowText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.gold.base,
  },
  deleteButton: {
    padding: 6,
  },
  stampsSection: {
    marginTop: 18,
  },
  stampsCount: {
    fontSize: 10,
    color: colors.text.muted,
    fontWeight: '600',
  },
  stampsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  visaCard: {
    width: '48.5%',
    backgroundColor: colors.panel.base,
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.glass.hairline,
  },
  visaTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  visaCode: {
    fontSize: 13,
    fontWeight: '900',
    color: colors.text.primary,
  },
  visaBadge: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  visaBadgeText: {
    fontSize: 8,
    fontWeight: '800',
  },
  visaCity: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.text.primary,
  },
  visaCountry: {
    fontSize: 10,
    color: colors.text.secondary,
  },
  visaDate: {
    fontSize: 9,
    color: colors.text.muted,
    marginTop: 6,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: colors.glass.borderSoft,
  },
  shareButton: {
    marginTop: 20,
  },
  emptyStampsCard: {
    backgroundColor: colors.panel.base,
    borderRadius: 20,
    paddingVertical: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.glass.hairline,
  },
  emptyStampsText: {
    fontSize: 13,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  // Account Modal / Bottom Sheet
  accountSheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  accountSheetTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text.primary,
    letterSpacing: -0.4,
  },
  accountSheetSubtitle: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: '500',
    marginTop: 2,
  },
  sheetCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.glass.fillStrong,
    justifyContent: 'center',
    alignItems: 'center',
  },
  accountModalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.glass.fill,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.glass.fillStrong,
    marginBottom: 16,
  },
  accountAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.status.visited.light,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.status.visited.color,
  },
  accountAvatarText: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.gold.light,
  },
  accountInfoText: {
    flex: 1,
  },
  accountNameText: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text.primary,
  },
  accountHandleText: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: '500',
    marginTop: 2,
  },
  accountDocBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.glass.fillStrong,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 5,
  },
  accountDocText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.text.secondary,
    letterSpacing: 0.5,
  },
  themePickerSection: {
    backgroundColor: colors.glass.fill,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.glass.fillStrong,
    marginBottom: 16,
  },
  themePickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  themePickerTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: colors.gold.light,
    letterSpacing: 0.8,
  },
  themePickerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  appearanceRow: {
    flexDirection: 'row',
    gap: 8,
  },
  appearanceChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    borderRadius: 14,
    backgroundColor: colors.glass.fill,
    borderWidth: 1,
    borderColor: colors.glass.hairline,
  },
  appearanceChipActive: {
    backgroundColor: colors.gold.tint,
    borderColor: colors.gold.border,
  },
  appearanceChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text.secondary,
  },
  appearanceChipTextActive: {
    color: colors.gold.base,
  },
  themeChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  themeChipActive: {
    borderColor: colors.gold.base,
  },
  themeChipText: {
    fontSize: 11,
    fontWeight: '800',
  },
  accountActionsList: {
    backgroundColor: colors.glass.fill,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.glass.fillStrong,
    overflow: 'hidden',
    marginBottom: 16,
  },
  accountListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.glass.borderSoft,
  },
  accountListItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  accountActionIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.glass.fillStrong,
  },
  accountListItemLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
  dangerZoneBox: {
    backgroundColor: colors.dangerTint,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.dangerBorder,
    gap: 10,
  },
  dangerZoneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dangerZoneTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.danger,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  dangerZoneDesc: {
    fontSize: 12,
    color: colors.danger,
    lineHeight: 17,
    fontWeight: '500',
  },
  modalDeleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.dangerTint,
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: 14,
    paddingVertical: 11,
    marginTop: 2,
  },
  modalDeleteBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.danger,
  },
}));

export default React.memo(PassportScreen);
