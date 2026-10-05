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
} from 'react-native';
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
} from 'lucide-react-native';
import { getPassportStamps, getLocalizedCountryName, availableCatalog } from '../data/travelData';
import EditProfileModal from './EditProfileModal';
import CountryStatusModal from './CountryStatusModal';

export default function PassportScreen({
  profile,
  countries,
  onRemoveCountry,
  onUpdateCountry,
  onOpenAddModal,
  onOpenShareModal,
  onUpdateProfile,
  onLogout,
  t,
  currentLang,
  onToggleLang,
}) {
  const [activeTab, setActiveTab] = useState('all');
  const [isEditing, setIsEditing] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [selectedCountryToEdit, setSelectedCountryToEdit] = useState(null);

  const visitedCountries = countries.filter((c) => c.status === 'visited');
  const livedCountries = countries.filter((c) => c.status === 'lived');
  const wantCountries = countries.filter((c) => c.status === 'want');

  // Dynamic stamps generated from user's actual visited countries
  const passportStampsList = visitedCountries.slice(0, 8).map((c, idx) => ({
    id: `stamp-${c.id}`,
    code: c.id,
    city: currentLang === 'tr' ? (c.nameTr || c.name) : c.name,
    country: currentLang === 'tr' ? (c.nameTr || c.name) : c.name,
    date: c.year || new Date().getFullYear().toString(),
    type: c.status === 'lived' ? (currentLang === 'tr' ? 'İKAMET' : 'RESIDENCE') : (currentLang === 'tr' ? 'GİRİŞ' : 'ENTRY'),
    accentColor: idx % 3 === 0 ? '#4F46E5' : idx % 3 === 1 ? '#059669' : '#2563EB',
    bg: idx % 3 === 0 ? '#EEF2FF' : idx % 3 === 1 ? '#ECFDF5' : '#EFF6FF',
  }));

  // Dynamic MRZ Code based on profile
  const cleanNameForMrz = (profile.name || 'TRAVELER')
    .toUpperCase()
    .replace(/[^A-Z]/g, '<');
  const cleanDocNo = (profile.passportNo || 'AT000000')
    .replace(/[^A-Z0-9]/g, '');
  const mrzCodeString = `P<WLD${cleanNameForMrz}<<<<<<<<<<<<<<<<<<<<<<${cleanDocNo}`.slice(0, 36);

  const getDynamicLocation = () => {
    // 1. Explicit country selection
    if (profile?.homeCountryId) {
      const country = availableCatalog.find(
        (c) => c.id.toUpperCase() === profile.homeCountryId.toUpperCase()
      );
      if (country) {
        const cName = currentLang === 'tr' ? (country.nameTr || country.name) : country.name;
        const text = profile.homeCity && profile.homeCity.trim()
          ? `${profile.homeCity.trim()}, ${cName}`
          : cName;
        return {
          flag: country.flag || '📍',
          text,
        };
      }
    }

    // 2. Custom location string (if set directly)
    if (profile?.customLocation && profile.customLocation.trim()) {
      const trimmed = profile.customLocation.trim();
      const match = trimmed.match(/^([\uD83C-\uDBFF\uDC00-\uDFFF\u2600-\u27BF\uFE0F\u200D]+)\s*(.*)$/);
      if (match) {
        return {
          flag: match[1],
          text: match[2],
        };
      }
      const lower = trimmed.toLowerCase();
      const matchedCountry = availableCatalog.find(
        (c) => lower.includes(c.name.toLowerCase()) || (c.nameTr && lower.includes(c.nameTr.toLowerCase()))
      );
      if (matchedCountry) {
        return {
          flag: matchedCountry.flag,
          text: trimmed,
        };
      }
      return {
        flag: null,
        text: trimmed,
      };
    }

    // 3. Dynamic: Lived-in country
    const lived = countries.find((c) => c.status === 'lived');
    if (lived) {
      const locName = getLocalizedCountryName(lived, currentLang);
      return {
        flag: lived.flag || '📍',
        text: `${locName} (${currentLang === 'tr' ? 'İkamet' : 'Home'})`,
      };
    }

    // 4. Dynamic: Latest visited country
    const visited = countries.find((c) => c.status === 'visited');
    if (visited) {
      const locName = getLocalizedCountryName(visited, currentLang);
      return {
        flag: visited.flag || '📍',
        text: `${locName} (${currentLang === 'tr' ? 'Son Durak' : 'Latest'})`,
      };
    }

    return {
      flag: '🌍',
      text: currentLang === 'tr' ? 'Dünya Vatandaşı' : 'Global Citizen',
    };
  };

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

  const locationInfo = getDynamicLocation();

  return (
    <>
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
              <Languages size={13} color="#2563EB" />
              <Text style={styles.langPillText}>
                {t.langSwitch || (currentLang === 'tr' ? 'EN' : 'TR')}
              </Text>
            </TouchableOpacity>
          )}

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
                      onPress: onLogout,
                    },
                  ]
                );
              }}
              activeOpacity={0.7}
              style={styles.headerLogoutBtn}
            >
              <LogOut size={16} color="#64748B" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* TRAVEL PASSPORT CARD (Fremd-inspired luxury card) */}
      <View style={styles.passportCard}>
        {/* Top Card Row */}
        <View style={styles.cardTopRow}>
          <View style={styles.verifiedBadge}>
            <ShieldCheck size={16} color="#2563EB" />
            <Text style={styles.verifiedText}>{t.officialPassport}</Text>
          </View>

          <View style={styles.cardTopRight}>
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setIsEditProfileOpen(true);
              }}
              activeOpacity={0.7}
              style={styles.cardEditBtn}
            >
              <Edit3 size={11} color="#2563EB" />
              <Text style={styles.cardEditBtnText}>{t.edit || (currentLang === 'tr' ? 'Düzenle' : 'Edit')}</Text>
            </TouchableOpacity>

            {/* Golden Chip Graphic */}
            <View style={styles.chipContainer}>
              <View style={styles.chipInner}>
                <View style={styles.chipLine} />
              </View>
            </View>
          </View>
        </View>

        {/* Profile Info Row */}
        <View style={styles.profileRow}>
          {/* Avatar Monogram */}
          <View style={styles.avatarContainer}>
            <View style={styles.avatarBox}>
              <Text style={styles.avatarText}>{profile.avatarInitials}</Text>
            </View>
            <View style={styles.verifiedDot}>
              <Check size={10} color="#FFFFFF" strokeWidth={3} />
            </View>
          </View>

          {/* Name & Handle */}
          <View style={styles.profileDetails}>
            <Text style={styles.profileName}>{profile.name}</Text>
            <Text style={styles.profileHandle}>{profile.handle}</Text>
            <View style={styles.locationRow}>
              {locationInfo.flag ? (
                <Text style={styles.locationFlag}>{locationInfo.flag}</Text>
              ) : (
                <MapPin size={13} color="#2563EB" />
              )}
              <Text style={styles.locationText}>
                {locationInfo.text}
              </Text>
            </View>
          </View>
        </View>

        {/* Metadata Strip */}
        <View style={styles.metadataStrip}>
          <View style={styles.metaCol}>
            <Text style={styles.metaLabel}>{t.docNo}</Text>
            <Text style={styles.metaValue} numberOfLines={1}>
              {profile.passportNo}
            </Text>
          </View>
          <View style={styles.metaColMiddle}>
            <Text style={styles.metaLabel}>{t.borders}</Text>
            <Text style={[styles.metaValue, { color: '#2563EB' }]} numberOfLines={1}>
              {t.recorded ? t.recorded.replace('{count}', countries.length) : `${countries.length} Recorded`}
            </Text>
          </View>
          <View style={styles.metaColEnd}>
            <Text style={styles.metaLabel}>{t.status}</Text>
            <Text style={[styles.metaValue, { color: '#10B981' }]} numberOfLines={1}>
              {t.active}
            </Text>
          </View>
        </View>

        {/* Security / MRZ Strip */}
        <View style={styles.mrzRow}>
          <Text style={styles.mrzCode} numberOfLines={1}>
            {mrzCodeString}
          </Text>
          <QrCode size={22} color="#334155" />
        </View>
      </View>

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
          <Text style={styles.statNumber}>
            {visitedCountries.length < 10
              ? `0${visitedCountries.length}`
              : visitedCountries.length}
          </Text>
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
          <Text style={styles.statNumber}>
            {livedCountries.length < 10
              ? `0${livedCountries.length}`
              : livedCountries.length}
          </Text>
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
          <Text style={styles.statNumber}>
            {wantCountries.length < 10
              ? `0${wantCountries.length}`
              : wantCountries.length}
          </Text>
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
            const countryYear = currentLang === 'tr' ? (c.yearTr || c.year) : c.year;
            const countryNotes = currentLang === 'tr' ? (c.notesTr || c.notes) : c.notes;

            return (
              <TouchableOpacity
                key={c.id}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedCountryToEdit(c);
                }}
                activeOpacity={0.7}
                style={styles.countryRow}
              >
                <View style={styles.countryLeft}>
                  <Text style={styles.countryFlag}>{c.flag}</Text>
                  <View style={{ flex: 1 }}>
                    <View style={styles.countryNameRow}>
                      <Text style={styles.countryName}>{countryName}</Text>
                      <View style={styles.yearBadge}>
                        <Text style={styles.countryYear}>{countryYear}</Text>
                      </View>
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
                  <Text style={styles.visaCode}>{stamp.code}</Text>
                  <View style={[styles.visaBadge, { backgroundColor: stamp.bg }]}>
                    <Text style={[styles.visaBadgeText, { color: stamp.accentColor }]}>
                      {stamp.type}
                    </Text>
                  </View>
                </View>
                <Text style={styles.visaCity}>{stamp.city}</Text>
                <Text style={styles.visaCountry}>{stamp.country}</Text>
                <Text style={styles.visaDate}>{stamp.date}</Text>
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
        <Sparkles size={18} color="#FFFFFF" />
        <Text style={styles.shareText}>{t.sharePassport}</Text>
        <Share2 size={16} color="rgba(255, 255, 255, 0.7)" />
      </TouchableOpacity>
    </ScrollView>

    <EditProfileModal
      isOpen={isEditProfileOpen}
      onClose={() => setIsEditProfileOpen(false)}
      profile={profile}
      onSaveProfile={onUpdateProfile}
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
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
    color: '#090B10',
    letterSpacing: -0.8,
  },
  logoDot: {
    fontSize: 30,
    fontWeight: '900',
    color: '#2563EB',
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
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    height: 38,
    borderRadius: 19,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  langPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2563EB',
  },
  headerLogoutBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  passportCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    paddingVertical: 20,
    paddingHorizontal: 22,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 4,
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
  },
  verifiedText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#334155',
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
    backgroundColor: '#F1F5F9',
    paddingVertical: 5,
    paddingHorizontal: 9,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardEditBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },
  chipContainer: {
    width: 34,
    height: 25,
    borderRadius: 6,
    backgroundColor: '#F5ECCD',
    borderWidth: 1,
    borderColor: '#D4B86A',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#D4B86A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 1,
  },
  chipInner: {
    width: 22,
    height: 15,
    borderWidth: 1,
    borderColor: 'rgba(180, 140, 50, 0.45)',
    borderRadius: 3,
    justifyContent: 'center',
  },
  chipLine: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(180, 140, 50, 0.45)',
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
    backgroundColor: '#EBF7EE',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1EBD6',
  },
  avatarText: {
    fontSize: 26,
    fontWeight: '900',
    color: '#1D5E2D',
  },
  verifiedDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#2563EB',
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
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
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  profileHandle: {
    fontSize: 12,
    color: '#64748B',
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
    color: '#334155',
  },
  metadataStrip: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
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
    color: '#0F172A',
    marginTop: 2,
  },
  mrzRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
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
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  statTileActiveVisited: {
    backgroundColor: 'rgba(37, 99, 235, 0.08)',
    borderColor: '#2563EB',
    borderWidth: 1.5,
  },
  statTileActiveLived: {
    backgroundColor: 'rgba(29, 78, 216, 0.08)',
    borderColor: '#1D4ED8',
    borderWidth: 1.5,
  },
  statTileActiveWant: {
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    borderColor: '#38BDF8',
    borderWidth: 1.5,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
  },
  statNumberActive: {
    color: '#0F172A',
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
    color: '#64748B',
  },
  statLabelActive: {
    color: '#0F172A',
    fontWeight: '800',
  },
  countryListCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
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
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  editPillButtonActive: {
    backgroundColor: 'rgba(37, 99, 235, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.25)',
  },
  editPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  editPillTextActive: {
    color: '#2563EB',
    fontWeight: '800',
  },
  addPillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(37, 99, 235, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  addPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2563EB',
  },
  countryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  countryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    marginRight: 10,
  },
  countryFlag: {
    fontSize: 24,
  },
  countryNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  countryName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  yearBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
    marginLeft: 2,
  },
  countryYear: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '700',
  },
  statusTagPill: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
    marginLeft: 4,
    backgroundColor: '#EFF6FF',
  },
  statusTagPillVisited: {
    backgroundColor: '#EFF6FF',
  },
  statusTagPillLived: {
    backgroundColor: '#EEF2FF',
  },
  statusTagPillWant: {
    backgroundColor: '#F0F9FF',
  },
  statusTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#2563EB',
    letterSpacing: 0.2,
  },
  statusTagTextVisited: {
    color: '#2563EB',
  },
  statusTagTextLived: {
    color: '#1D4ED8',
  },
  statusTagTextWant: {
    color: '#0284C7',
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
  },
  stampNowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#EFF6FF',
    paddingVertical: 5,
    paddingHorizontal: 9,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  stampNowText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2563EB',
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
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
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
    color: '#0F172A',
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
    color: '#0F172A',
  },
  visaCountry: {
    fontSize: 10,
    color: '#64748B',
  },
  visaDate: {
    fontSize: 9,
    color: '#94A3B8',
    marginTop: 6,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#2563EB',
    borderRadius: 24,
    paddingVertical: 18,
    marginTop: 20,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 4,
  },
  shareText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  emptyContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 32,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    marginVertical: 4,
  },
  emptyIconBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(37, 99, 235, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
    textAlign: 'center',
  },
  emptyDesc: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 18,
    paddingHorizontal: 12,
  },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
    gap: 6,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  emptyBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  emptyStampsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  emptyStampsText: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '600',
  },
});
