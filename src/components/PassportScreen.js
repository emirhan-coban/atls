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
} from 'lucide-react-native';
import { passportStamps } from '../data/travelData';

export default function PassportScreen({
  profile,
  countries,
  onRemoveCountry,
  onOpenAddModal,
  onOpenShareModal,
  t,
}) {
  const [activeTab, setActiveTab] = useState('visited');

  const visitedCountries = countries.filter((c) => c.status === 'visited');
  const livedCountries = countries.filter((c) => c.status === 'lived');
  const wantCountries = countries.filter((c) => c.status === 'want');

  const handleShare = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (onOpenShareModal) {
      onOpenShareModal();
    }
  };

  const handleTabPress = (tab) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Selection);
    setActiveTab(tab);
  };

  const getFilteredList = () => {
    switch (activeTab) {
      case 'lived':
        return livedCountries;
      case 'want':
        return wantCountries;
      default:
        return visitedCountries;
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Header Bar */}
      <View style={styles.header}>
        <View>
          <View style={styles.logoRow}>
            <Text style={styles.headerTitle}>{t.yourPassport}</Text>
            <Text style={styles.logoDot}>.</Text>
          </View>
          <Text style={styles.subtitleText}>{t.passportSubtitle}</Text>
        </View>

        <TouchableOpacity
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          style={styles.editButton}
          activeOpacity={0.7}
        >
          <Edit3 size={13} color="#475569" />
          <Text style={styles.editText}>{t.edit}</Text>
        </TouchableOpacity>
      </View>

      {/* TRAVEL PASSPORT CARD (Fremd-inspired luxury card) */}
      <View style={styles.passportCard}>
        {/* Top Card Row */}
        <View style={styles.cardTopRow}>
          <View style={styles.verifiedBadge}>
            <ShieldCheck size={16} color="#5B4DFF" />
            <Text style={styles.verifiedText}>{t.officialPassport}</Text>
          </View>

          {/* Golden Chip Graphic */}
          <View style={styles.chipContainer}>
            <View style={styles.chipInner}>
              <View style={styles.chipLine} />
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
              <MapPin size={13} color="#5B4DFF" />
              <Text style={styles.locationText}>{profile.location}</Text>
            </View>
          </View>
        </View>

        {/* Metadata Strip */}
        <View style={styles.metadataStrip}>
          <View style={styles.metaCol}>
            <Text style={styles.metaLabel}>{t.docNo}</Text>
            <Text style={styles.metaValue}>{profile.passportNo}</Text>
          </View>
          <View style={styles.metaCol}>
            <Text style={styles.metaLabel}>{t.borders}</Text>
            <Text style={[styles.metaValue, { color: '#5B4DFF' }]}>
              {countries.length} Recorded
            </Text>
          </View>
          <View style={styles.metaCol}>
            <Text style={styles.metaLabel}>{t.status}</Text>
            <Text style={[styles.metaValue, { color: '#10B981' }]}>
              {t.active}
            </Text>
          </View>
        </View>

        {/* Security / MRZ Strip */}
        <View style={styles.mrzRow}>
          <Text style={styles.mrzCode} numberOfLines={1}>
            P&lt;PRTCHEN&lt;&lt;MAYA&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;892410
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
          <Text
            style={[
              styles.statNumber,
              activeTab === 'visited' && styles.statNumberActive,
            ]}
          >
            {visitedCountries.length < 10
              ? `0${visitedCountries.length}`
              : visitedCountries.length}
          </Text>
          <View style={styles.statLabelRow}>
            <View
              style={[
                styles.statDot,
                {
                  backgroundColor:
                    activeTab === 'visited' ? '#FFFFFF' : '#3B82F6',
                },
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
          <Text
            style={[
              styles.statNumber,
              activeTab === 'lived' && styles.statNumberActive,
            ]}
          >
            {livedCountries.length < 10
              ? `0${livedCountries.length}`
              : livedCountries.length}
          </Text>
          <View style={styles.statLabelRow}>
            <View
              style={[
                styles.statDot,
                {
                  backgroundColor:
                    activeTab === 'lived' ? '#FFFFFF' : '#4F46E5',
                },
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
          <Text
            style={[
              styles.statNumber,
              activeTab === 'want' && styles.statNumberActive,
            ]}
          >
            {wantCountries.length < 10
              ? `0${wantCountries.length}`
              : wantCountries.length}
          </Text>
          <View style={styles.statLabelRow}>
            <View
              style={[
                styles.statDot,
                {
                  backgroundColor:
                    activeTab === 'want' ? '#FFFFFF' : '#A855F7',
                },
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
            {activeTab === 'visited' && t.visitedCountries.replace('{count}', visitedCountries.length)}
            {activeTab === 'lived' && t.livedCountries.replace('{count}', livedCountries.length)}
            {activeTab === 'want' && t.dreamDestinations.replace('{count}', wantCountries.length)}
          </Text>
          <TouchableOpacity onPress={onOpenAddModal}>
            <Text style={styles.addLink}>+ Add</Text>
          </TouchableOpacity>
        </View>

        {getFilteredList().map((c) => (
          <View key={c.id} style={styles.countryRow}>
            <View style={styles.countryLeft}>
              <Text style={styles.countryFlag}>{c.flag}</Text>
              <View>
                <View style={styles.countryNameRow}>
                  <Text style={styles.countryName}>{c.name}</Text>
                  <Text style={styles.countryYear}>{c.year}</Text>
                </View>
                <Text style={styles.countryNotes} numberOfLines={1}>
                  {c.notes}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                Alert.alert(
                  t.removeConfirmTitle,
                  t.removeConfirmMsg.replace('{country}', c.name),
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
              <Trash2 size={15} color="#94A3B8" />
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* DIGITAL BORDER STAMPS */}
      <View style={styles.stampsSection}>
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>{t.officialStamps}</Text>
          <Text style={styles.stampsCount}>
            {t.stampsCount.replace('{count}', passportStamps.length)}
          </Text>
        </View>

        <View style={styles.stampsGrid}>
          {passportStamps.map((stamp) => (
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
      </View>

      {/* PRIMARY CTA: SHARE YOUR PASSPORT (Spotify Story Snapshot Card) */}
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FBFBFD',
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 110,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#090B10',
    letterSpacing: -0.8,
  },
  logoDot: {
    fontSize: 28,
    fontWeight: '900',
    color: '#5B4DFF',
  },
  subtitleText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1,
    marginTop: 2,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  editText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  passportCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    padding: 22,
    marginTop: 10,
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
    marginBottom: 18,
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
  chipContainer: {
    width: 32,
    height: 24,
    borderRadius: 5,
    backgroundColor: '#FCD34D',
    borderWidth: 1,
    borderColor: '#F59E0B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipInner: {
    width: 20,
    height: 14,
    borderWidth: 1,
    borderColor: 'rgba(180, 83, 9, 0.4)',
    borderRadius: 2,
    justifyContent: 'center',
  },
  chipLine: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(180, 83, 9, 0.4)',
    height: 4,
  },
  profileRow: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
    marginBottom: 18,
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
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#5B4DFF',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileDetails: {
    flex: 1,
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
    marginTop: 1,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 6,
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
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 16,
  },
  metaCol: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  metaValue: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  mrzRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
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
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  statTileActiveLived: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  statTileActiveWant: {
    backgroundColor: '#9333EA',
    borderColor: '#9333EA',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
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
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  statLabelActive: {
    color: '#FFFFFF',
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
  addLink: {
    fontSize: 11,
    fontWeight: '800',
    color: '#5B4DFF',
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
  countryYear: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
  },
  countryNotes: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
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
  },
  visaCard: {
    width: '48%',
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
    backgroundColor: '#1E1035',
    borderRadius: 24,
    paddingVertical: 18,
    marginTop: 20,
    shadowColor: '#5B4DFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(91, 77, 255, 0.3)',
  },
  shareText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
