import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  Alert,
  Platform,
  Modal,
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
  Languages,
  Plus,
  Compass,
  LogOut,
  ShieldAlert,
  User,
  X,
  ChevronRight,
  Palette,
} from 'lucide-react-native';
import { getPassportStamps, getLocalizedCountryName, availableCatalog, formatCountryDate } from '../data/travelData';
import { PASSPORT_THEMES, PassportThemeKey } from '../theme/passportThemes';
import EditProfileModal from './EditProfileModal';
import CountryStatusModal from './CountryStatusModal';
import AnimatedCounter from './AnimatedCounter';
import GlowSphere from './GlowSphere';
import OrbitalRings from './OrbitalRings';
import { getDynamicLocation } from '../utils/locationHelper';

export default function PassportScreen({
  profile,
  countries,
  onRemoveCountry,
  onUpdateCountry,
  onOpenAddModal,
  onOpenShareModal,
  onUpdateProfile,
  onLogout,
  onDeleteAccount,
  onSelectCountry,
  t,
  currentLang,
  onToggleLang,
}) {
  const [activeTab, setActiveTab] = useState('all');
  const [isEditing, setIsEditing] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [selectedCountryToEdit, setSelectedCountryToEdit] = useState(null);

  const visitedCountries = countries.filter((c) => c.status === 'visited');
  const livedCountries = countries.filter((c) => c.status === 'lived');
  const wantCountries = countries.filter((c) => c.status === 'want');

  const currentThemeKey = profile?.passportTheme || 'classic_navy';
  const currentTheme = PASSPORT_THEMES[currentThemeKey] || PASSPORT_THEMES.classic_navy;

  // Dynamic stamps generated from user's actual visited countries
  const passportStampsList = visitedCountries.slice(0, 8).map((c, idx) => ({
    id: `stamp-${c.id}`,
    code: c.id,
    city: currentLang === 'tr' ? (c.nameTr || c.name) : c.name,
    country: currentLang === 'tr' ? (c.nameTr || c.name) : c.name,
    date: formatCountryDate(c, currentLang) || c.year || new Date().getFullYear().toString(),
    type: c.status === 'lived' ? (currentLang === 'tr' ? 'İKAMET' : 'RESIDENCE') : (currentLang === 'tr' ? 'GİRİŞ' : 'ENTRY'),
    accentColor: idx % 3 === 0 ? '#3B82F6' : idx % 3 === 1 ? '#10B981' : '#FF6B35',
    bg: idx % 3 === 0 ? 'rgba(59, 130, 246, 0.15)' : idx % 3 === 1 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 107, 53, 0.15)',
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

  const handleTabPress = (tab) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Selection);
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
        <GlowSphere
          size={380}
          colors={['#7C3AED', '#2E5CFF']}
          opacity={0.22}
          style={{ position: 'absolute', top: -100, left: -110 }}
        />
        <GlowSphere
          size={280}
          colors={['#FF6B35', '#E2F952']}
          opacity={0.15}
          style={{ position: 'absolute', top: 340, right: -90 }}
        />

        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Bar */}
          <View style={styles.header}>
            <View style={styles.logoRow}>
              <Text style={styles.headerTitle}>{t.yourPassport}</Text>
              <Text style={styles.logoDot}>.</Text>
            </View>

            <View style={styles.headerRight}>
              {onToggleLang && (
                <TouchableOpacity
                  onPress={() => {
                    Haptics.selectionAsync();
                    onToggleLang();
                  }}
                  activeOpacity={0.7}
                  style={styles.langPill}
                >
                  <Languages size={13} color="#E2F952" />
                  <Text style={styles.langPillText}>
                    {t.langSwitch || (currentLang === 'tr' ? 'EN' : 'TR')}
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setIsAccountModalOpen(true);
                }}
                activeOpacity={0.7}
                style={styles.headerAccountBtn}
              >
                <User size={18} color="#FFFFFF" strokeWidth={2.2} />
              </TouchableOpacity>
            </View>
          </View>

          {/* TRAVEL PASSPORT CARD (Theme-adaptive luxury card) */}
          <LinearGradient
            colors={currentTheme.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.passportCard, { borderColor: currentTheme.borderColor }]}
          >
            <OrbitalRings size={220} style={{ position: 'absolute', right: -30, top: -20, opacity: 0.28 }} />
        {/* Top Card Row */}
        <View style={styles.cardTopRow}>
          <View style={[styles.verifiedBadge, { backgroundColor: 'rgba(255, 255, 255, 0.12)', borderColor: 'rgba(255, 255, 255, 0.2)' }]}>
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
              style={[styles.cardEditBtn, { backgroundColor: 'rgba(255, 255, 255, 0.12)' }]}
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
            <View style={[styles.avatarBox, { backgroundColor: 'rgba(255, 255, 255, 0.15)', borderColor: 'rgba(255, 255, 255, 0.25)' }]}>
              <Text style={[styles.avatarText, { color: currentTheme.textColor }]}>{profile.avatarInitials}</Text>
            </View>
            <View style={styles.verifiedDot}>
              <Check size={10} color="#FFFFFF" strokeWidth={3} />
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
        <View style={[styles.metadataStrip, { backgroundColor: 'rgba(255, 255, 255, 0.08)', borderColor: 'rgba(255, 255, 255, 0.12)' }]}>
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
              style={[styles.metaValue, { color: '#10B981' }]}
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
                { backgroundColor: '#2563EB' },
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
                { backgroundColor: '#1D4ED8' },
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
                { backgroundColor: '#38BDF8' },
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
              <Edit3 size={11} color={isEditing ? "#2563EB" : "#64748B"} strokeWidth={2.2} />
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
              <Plus size={11} color="#2563EB" strokeWidth={2.5} />
              <Text style={styles.addPillText}>{t.add || '+ Ekle'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {getFilteredList().length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconBox}>
              <Compass size={28} color="#2563EB" strokeWidth={1.8} />
            </View>
            <Text style={styles.emptyTitle}>{t.emptyPassportTitle}</Text>
            <Text style={styles.emptyDesc}>{t.emptyPassportDesc}</Text>
            <TouchableOpacity
              onPress={onOpenAddModal}
              activeOpacity={0.8}
              style={styles.emptyBtn}
            >
              <Plus size={15} color="#FFFFFF" strokeWidth={2.5} />
              <Text style={styles.emptyBtnText}>{t.emptyPassportBtn}</Text>
            </TouchableOpacity>
          </View>
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
                      <Sparkles size={11} color="#2563EB" />
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
                      <Trash2 size={15} color="#EF4444" />
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
      <TouchableOpacity
        onPress={handleShare}
        activeOpacity={0.85}
        style={styles.shareButton}
      >
        <Sparkles size={18} color="#07090E" />
        <Text style={styles.shareText}>{t.sharePassport}</Text>
        <Share2 size={16} color="#07090E" />
      </TouchableOpacity>

      </ScrollView>
    </View>

    {/* ACCOUNT MANAGEMENT MODAL (App Store Guideline 5.1.1(v) Compliant) */}
    <Modal
      visible={isAccountModalOpen}
      animationType="fade"
      transparent={true}
      onRequestClose={() => setIsAccountModalOpen(false)}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setIsAccountModalOpen(false)}
        />
        <View style={styles.accountSheet}>
          <View style={styles.sheetHandle} />

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
              <X size={18} color="#64748B" />
            </TouchableOpacity>
          </View>

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

          {/* PASSPORT THEME PICKER */}
          <View style={styles.themePickerSection}>
            <View style={styles.themePickerHeader}>
              <Palette size={14} color="#6366F1" />
              <Text style={styles.themePickerTitle}>
                {currentLang === 'tr' ? 'PASAPORT TEMASI' : 'PASSPORT THEME'}
              </Text>
            </View>
            <View style={styles.themePickerRow}>
              {(Object.keys(PASSPORT_THEMES)).map((themeKey) => {
                const tObj = PASSPORT_THEMES[themeKey];
                const isSelected = (profile?.passportTheme || 'classic_navy') === themeKey;
                return (
                  <TouchableOpacity
                    key={themeKey}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      onUpdateProfile({ passportTheme: themeKey });
                    }}
                    activeOpacity={0.8}
                    style={[
                      styles.themeChip,
                      { backgroundColor: tObj.gradient[0] },
                      isSelected && styles.themeChipActive,
                    ]}
                  >
                    <Text style={[styles.themeChipText, { color: tObj.textColor }]}>
                      {currentLang === 'tr' ? tObj.nameTr : tObj.nameEn}
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
                <View style={[styles.accountActionIconBox, { backgroundColor: '#EEF2FF' }]}>
                  <Edit3 size={17} color="#2563EB" />
                </View>
                <Text style={styles.accountListItemLabel}>
                  {t.editProfile || (currentLang === 'tr' ? 'Profili Düzenle' : 'Edit Profile')}
                </Text>
              </View>
              <ChevronRight size={17} color="#94A3B8" />
            </TouchableOpacity>

            {/* Log Out */}
            {onLogout && (
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  Alert.alert(
                    t.logOut || (currentLang === 'tr' ? 'Çıkış Yap' : 'Log Out'),
                    currentLang === 'tr'
                      ? 'Hesabınızdan çıkış yapmak istediğinize emin misiniz?'
                      : 'Are you sure you want to log out of your account?',
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
                  <View style={[styles.accountActionIconBox, { backgroundColor: '#F1F5F9' }]}>
                    <LogOut size={17} color="#475569" />
                  </View>
                  <Text style={styles.accountListItemLabel}>
                    {t.logOut || (currentLang === 'tr' ? 'Çıkış Yap' : 'Log Out')}
                  </Text>
                </View>
                <ChevronRight size={17} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>

          {/* Danger Zone: Delete Account */}
          {onDeleteAccount && (
            <View style={styles.dangerZoneBox}>
              <View style={styles.dangerZoneHeader}>
                <ShieldAlert size={14} color="#EF4444" />
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
                <Trash2 size={16} color="#DC2626" />
                <Text style={styles.modalDeleteBtnText}>
                  {t.deleteAccount || (currentLang === 'tr' ? 'Hesabı Sil' : 'Delete Account')}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>

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

const styles = StyleSheet.create({
  outerWrapper: {
    flex: 1,
    backgroundColor: '#07090E',
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
    color: '#FFFFFF',
    letterSpacing: -0.8,
  },
  logoDot: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FF6B35',
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
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
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
    color: '#E2F952',
  },
  headerAccountBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  passportCard: {
    backgroundColor: 'rgba(15, 20, 32, 0.85)',
    borderRadius: 30,
    paddingVertical: 20,
    paddingHorizontal: 22,
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
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
    color: '#FFFFFF',
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
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  cardEditBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  chipContainer: {
    width: 34,
    height: 25,
    borderRadius: 6,
    backgroundColor: 'rgba(245, 236, 205, 0.2)',
    borderWidth: 1,
    borderColor: '#F59E0B',
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
    color: '#FFFFFF',
  },
  verifiedDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#10B981',
    borderWidth: 2.5,
    borderColor: '#07090E',
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
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  profileHandle: {
    fontSize: 12,
    color: '#94A3B8',
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
    color: '#E2E8F0',
  },
  metadataStrip: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    borderRadius: 16,
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
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
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  metaValue: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 2,
  },
  mrzRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 12,
  },
  mrzCode: {
    fontSize: 9,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: '#94A3B8',
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
    backgroundColor: 'rgba(15, 20, 32, 0.85)',
    borderRadius: 20,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 2,
  },
  statTileActiveVisited: {
    backgroundColor: 'rgba(59, 130, 246, 0.14)',
    borderColor: '#3B82F6',
    borderWidth: 1.5,
  },
  statTileActiveLived: {
    backgroundColor: 'rgba(16, 185, 129, 0.14)',
    borderColor: '#10B981',
    borderWidth: 1.5,
  },
  statTileActiveWant: {
    backgroundColor: 'rgba(255, 107, 53, 0.14)',
    borderColor: '#FF6B35',
    borderWidth: 1.5,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  statNumberActive: {
    color: '#FFFFFF',
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
    color: '#94A3B8',
  },
  statLabelActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  countryListCard: {
    backgroundColor: 'rgba(15, 20, 32, 0.85)',
    borderRadius: 24,
    padding: 18,
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
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
    color: '#94A3B8',
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
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
  },
  editPillButtonActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.16)',
    borderColor: '#3B82F6',
  },
  editPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
  },
  editPillTextActive: {
    color: '#60A5FA',
    fontWeight: '800',
  },
  addPillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 107, 53, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 53, 0.3)',
  },
  addPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FF6B35',
  },
  countryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
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
    color: '#FFFFFF',
    flexShrink: 1,
  },
  yearBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
    flexShrink: 0,
  },
  countryYear: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '700',
  },
  statusTagPill: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    flexShrink: 0,
  },
  statusTagPillVisited: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
  },
  statusTagPillLived: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  statusTagPillWant: {
    backgroundColor: 'rgba(255, 107, 53, 0.15)',
  },
  statusTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#60A5FA',
    letterSpacing: 0.2,
  },
  statusTagTextVisited: {
    color: '#60A5FA',
  },
  statusTagTextLived: {
    color: '#34D399',
  },
  statusTagTextWant: {
    color: '#FF8A5B',
  },
  countryNotes: {
    fontSize: 11,
    color: '#64748B',
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
    backgroundColor: 'rgba(226, 249, 82, 0.12)',
    paddingVertical: 5,
    paddingHorizontal: 9,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(226, 249, 82, 0.3)',
  },
  stampNowText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#E2F952',
  },
  deleteButton: {
    padding: 6,
  },
  stampsSection: {
    marginTop: 18,
  },
  stampsCount: {
    fontSize: 10,
    color: '#64748B',
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
    backgroundColor: 'rgba(15, 20, 32, 0.85)',
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
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
    color: '#FFFFFF',
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
    color: '#FFFFFF',
  },
  visaCountry: {
    fontSize: 10,
    color: '#94A3B8',
  },
  visaDate: {
    fontSize: 9,
    color: '#64748B',
    marginTop: 6,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#E2F952',
    borderRadius: 24,
    paddingVertical: 18,
    marginTop: 20,
    shadowColor: '#E2F952',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 4,
  },
  shareText: {
    color: '#07090E',
    fontSize: 14,
    fontWeight: '900',
  },
  emptyContainer: {
    backgroundColor: 'rgba(15, 20, 32, 0.65)',
    borderRadius: 24,
    paddingVertical: 32,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderStyle: 'dashed',
    marginVertical: 4,
  },
  emptyIconBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
    textAlign: 'center',
  },
  emptyDesc: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 18,
    paddingHorizontal: 12,
  },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B35',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
    gap: 6,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  emptyBtnText: {
    color: '#07090E',
    fontSize: 13,
    fontWeight: '900',
  },
  emptyStampsCard: {
    backgroundColor: 'rgba(15, 20, 32, 0.65)',
    borderRadius: 20,
    paddingVertical: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
  },
  emptyStampsText: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '600',
  },
  // Account Modal / Bottom Sheet
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  accountSheet: {
    backgroundColor: '#0D111A',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 12,
    paddingHorizontal: 22,
    paddingBottom: Platform.OS === 'ios' ? 38 : 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignSelf: 'center',
    marginBottom: 16,
  },
  accountSheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  accountSheetTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.4,
  },
  accountSheetSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
    marginTop: 2,
  },
  sheetCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  accountModalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 16,
  },
  accountAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#3B82F6',
  },
  accountAvatarText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#60A5FA',
  },
  accountInfoText: {
    flex: 1,
  },
  accountNameText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  accountHandleText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
    marginTop: 2,
  },
  accountDocBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 5,
  },
  accountDocText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  themePickerSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
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
    color: '#C084FC',
    letterSpacing: 0.8,
  },
  themePickerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  themeChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  themeChipActive: {
    borderColor: '#E2F952',
  },
  themeChipText: {
    fontSize: 11,
    fontWeight: '800',
  },
  accountActionsList: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
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
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
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
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  accountListItemLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  dangerZoneBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
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
    color: '#F87171',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  dangerZoneDesc: {
    fontSize: 12,
    color: '#FCA5A5',
    lineHeight: 17,
    fontWeight: '500',
  },
  modalDeleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.18)',
    borderWidth: 1,
    borderColor: '#EF4444',
    borderRadius: 14,
    paddingVertical: 11,
    marginTop: 2,
  },
  modalDeleteBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#EF4444',
  },
});
