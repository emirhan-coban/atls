import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { 
  Fingerprint, 
  Search, 
  Plus, 
  ChevronRight, 
  ChevronLeft, 
  Plane,
  ArrowUpRight,
  Languages,
  Compass,
  Calendar,
  Sparkles,
} from 'lucide-react-native';
import WorldMap from './WorldMap';
import { getLocalizedCountryName } from '../data/travelData';
import { getCountryTrivia } from '../data/countryTrivia';

export default function HomeScreen({
  countries,
  profile,
  onOpenAddModal,
  onSelectCountry,
  onNavigateToPassport,
  t,
  currentLang,
  onToggleLang,
  onOpenAuth,
}) {
  const [countryCardIndex, setCountryCardIndex] = useState(0);
  const [activeFilter, setActiveFilter] = useState('all');

  const markedCountries = countries.filter((c) => c.status === 'visited' || c.status === 'lived');
  const hasCountries = markedCountries.length > 0;
  const currentMarkedCountry = hasCountries
    ? markedCountries[countryCardIndex % markedCountries.length]
    : null;

  const stamps = markedCountries.slice(0, 6).map((c, idx) => {
    const locName = getLocalizedCountryName(c, currentLang);
    return {
      id: `stamp-${c.id}`,
      code: c.id,
      city: locName,
      country: locName,
      date: c.year || c.visitedYear || new Date().getFullYear().toString(),
      type: c.status === 'lived' ? (currentLang === 'tr' ? 'İKAMET' : 'RESIDENCE') : (currentLang === 'tr' ? 'GİRİŞ' : 'ENTRY'),
      accentColor: idx % 3 === 0 ? '#4F46E5' : idx % 3 === 1 ? '#059669' : '#2563EB',
      bg: idx % 3 === 0 ? '#EEF2FF' : idx % 3 === 1 ? '#ECFDF5' : '#EFF6FF',
    };
  });

  const visitedCount = countries.filter((c) => c.status === 'visited').length;
  const livedCount = countries.filter((c) => c.status === 'lived').length;
  const wantCount = countries.filter((c) => c.status === 'want').length;
  const totalMarked = visitedCount + livedCount;
  const earthPercentage = ((totalMarked / 195) * 100).toFixed(1);

  const handleNextCountry = () => {
    if (markedCountries.length <= 1) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCountryCardIndex((prev) => (prev + 1) % markedCountries.length);
  };

  const handlePrevCountry = () => {
    if (markedCountries.length <= 1) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCountryCardIndex((prev) => (prev - 1 + markedCountries.length) % markedCountries.length);
  };

  const handleFilterPress = (filter) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Selection);
    setActiveFilter((prev) => (prev === filter ? 'all' : filter));
  };

  const handleBiometricPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onOpenAuth ? onOpenAuth() : onNavigateToPassport();
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
            <Text style={styles.logoText}>atls</Text>
            <Text style={styles.logoDot}>.</Text>
          </View>
          <Text style={styles.subtitleText}>
            {t.appSubtitle.replace('{count}', totalMarked)}
          </Text>
        </View>

        {/* Right Actions: Language Switcher & Biometric Auth Button */}
        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={() => {
              Haptics.selectionAsync();
              onToggleLang();
            }}
            activeOpacity={0.7}
            style={styles.langPill}
          >
            <Languages size={13} color="#2563EB" />
            <Text style={styles.langPillText}>{t.langSwitch || (currentLang === 'tr' ? 'EN' : 'TR')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleBiometricPress}
            activeOpacity={0.8}
            style={styles.biometricButton}
          >
            <Fingerprint size={22} color="#2563EB" strokeWidth={2} />
            <View style={styles.biometricDot} />
          </TouchableOpacity>
        </View>
      </View>

      {/* HERO CARD: Empty State OR Visited Country Highlight */}
      {!hasCountries ? (
        /* EMPTY STATE: Call to action when no country has been added yet */
        <View style={styles.emptyHeroCard}>
          <View style={styles.emptyBadgeRow}>
            <View style={styles.emptyIconBadge}>
              <Compass size={22} color="#2563EB" />
            </View>
            <View style={styles.emptyPill}>
              <Sparkles size={11} color="#2563EB" />
              <Text style={styles.emptyPillText}>
                {currentLang === 'tr' ? 'KİŞİSEL KARTIN' : 'PERSONAL CARD'}
              </Text>
            </View>
          </View>

          <View style={styles.emptyTextContent}>
            <Text style={styles.emptyHeroTitle}>
              {currentLang === 'tr' ? 'İlk Ülkeni Keşfe Başla' : 'Discover Your First Country'}
            </Text>
            <Text style={styles.emptyHeroDesc}>
              {currentLang === 'tr'
                ? 'Bir ülke ekle ve sana özel seyahat kartın burada canlansın. Dünya pasaportunu mühürlemeye şimdi başla!'
                : 'Add a country and your personalized travel card will come alive here. Start stamping your world passport!'}
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              onOpenAddModal();
            }}
            activeOpacity={0.85}
            style={styles.emptyCtaButton}
          >
            <Plus size={16} color="#FFFFFF" strokeWidth={2.5} />
            <Text style={styles.emptyCtaButtonText}>
              {currentLang === 'tr' ? '+ Ülke Ekle' : '+ Add Country'}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        /* POPULATED STATE: User's stamped countries with curated trivia */
        <View style={styles.countryHeroCard}>
          {/* Top Row: Tag, Flag & Year */}
          <View style={styles.countryHeroTopRow}>
            <View style={styles.countryHeroBadges}>
              <View style={styles.countryStatusPill}>
                <Text style={styles.countryStatusPillText}>
                  {currentMarkedCountry.status === 'lived'
                    ? (currentLang === 'tr' ? 'YAŞANDI' : 'LIVED')
                    : (currentLang === 'tr' ? 'ZİYARET EDİLDİ' : 'VISITED')}
                </Text>
              </View>

              <View style={styles.countryYearPill}>
                <Calendar size={11} color="#2563EB" />
                <Text style={styles.countryYearPillText}>
                  {currentMarkedCountry.year || currentMarkedCountry.visitedYear || new Date().getFullYear()}
                </Text>
              </View>
            </View>

            <Text style={styles.countryHeroFlag}>{currentMarkedCountry.flag || '🌍'}</Text>
          </View>

          {/* Country Name & Trivia */}
          <View style={styles.countryHeroTextContent}>
            <Text style={styles.countryHeroTitle}>
              {getLocalizedCountryName(currentMarkedCountry, currentLang)}
            </Text>
            <Text style={styles.countryHeroDesc}>
              {getCountryTrivia(
                currentMarkedCountry.id,
                getLocalizedCountryName(currentMarkedCountry, currentLang),
                currentLang
              )}
            </Text>
          </View>

          {/* Footer: Counter & Carousel Navigation */}
          <View style={styles.countryHeroFooter}>
            <Text style={styles.countryCounterText}>
              {`${(countryCardIndex % markedCountries.length) + 1} / ${markedCountries.length} ${currentLang === 'tr' ? 'Ülke' : 'Countries'}`}
            </Text>

            {markedCountries.length > 1 && (
              <View style={styles.carouselControls}>
                <TouchableOpacity onPress={handlePrevCountry} style={styles.arrowButton}>
                  <ChevronLeft size={15} color="#0F172A" />
                </TouchableOpacity>
                <View style={styles.dotsRow}>
                  {markedCountries.slice(0, 6).map((_, i) => (
                    <View
                      key={i}
                      style={[
                        styles.dot,
                        i === (countryCardIndex % markedCountries.length)
                          ? styles.dotActive
                          : styles.dotInactive,
                      ]}
                    />
                  ))}
                </View>
                <TouchableOpacity onPress={handleNextCountry} style={styles.arrowButton}>
                  <ChevronRight size={15} color="#0F172A" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      )}

      {/* SECTION: Planetary Reach */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t.planetaryReach}</Text>
        <View style={styles.reachBadge}>
          <Plane size={11} color="#2563EB" style={{ transform: [{ rotate: '45deg' }] }} />
          <Text style={styles.reachBadgeText}>
            {t.reachBadgeText ? t.reachBadgeText.replace('{percent}', earthPercentage) : `${earthPercentage}%`}
          </Text>
        </View>
      </View>

      {/* Map Card */}
      <View style={styles.mapCard}>
        <WorldMap
          countries={countries}
          activeFilter={activeFilter}
          onSelectCountry={onSelectCountry}
          t={t}
          currentLang={currentLang}
        />

        {/* Stats Row */}
        <View style={styles.statsRow}>
          {/* Visited */}
          <TouchableOpacity
            onPress={() => handleFilterPress('visited')}
            activeOpacity={0.7}
            style={[
              styles.statBox,
              activeFilter === 'visited' && styles.statBoxActiveVisited,
            ]}
          >
            <Text style={styles.statNumber}>
              {visitedCount < 10 ? `0${visitedCount}` : visitedCount}
            </Text>
            <View style={styles.statLabelRow}>
              <View style={[styles.statusDot, { backgroundColor: '#2563EB' }]} />
              <Text style={styles.statLabel}>{t.visited}</Text>
            </View>
          </TouchableOpacity>

          {/* Lived in */}
          <TouchableOpacity
            onPress={() => handleFilterPress('lived')}
            activeOpacity={0.7}
            style={[
              styles.statBox,
              activeFilter === 'lived' && styles.statBoxActiveLived,
            ]}
          >
            <Text style={styles.statNumber}>
              {livedCount < 10 ? `0${livedCount}` : livedCount}
            </Text>
            <View style={styles.statLabelRow}>
              <View style={[styles.statusDot, { backgroundColor: '#1D4ED8' }]} />
              <Text style={styles.statLabel}>{t.livedIn}</Text>
            </View>
          </TouchableOpacity>

          {/* Want to visit */}
          <TouchableOpacity
            onPress={() => handleFilterPress('want')}
            activeOpacity={0.7}
            style={[
              styles.statBox,
              activeFilter === 'want' && styles.statBoxActiveWant,
            ]}
          >
            <Text style={styles.statNumber}>
              {wantCount < 10 ? `0${wantCount}` : wantCount}
            </Text>
            <View style={styles.statLabelRow}>
              <View style={[styles.statusDot, { backgroundColor: '#38BDF8' }]} />
              <Text style={styles.statLabel}>{t.wishlist}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search & Quick Mark Bar */}
      <TouchableOpacity
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onOpenAddModal();
        }}
        activeOpacity={0.8}
        style={styles.searchBar}
      >
        <View style={styles.searchLeft}>
          <Search size={18} color="#94A3B8" />
          <Text style={styles.searchPlaceholder}>{t.findCountry}</Text>
        </View>
        <View style={styles.plusButton}>
          <Plus size={16} color="#FFFFFF" strokeWidth={2.5} />
        </View>
      </TouchableOpacity>

      {/* SECTION: Recent Arrivals & Stamps */}
      <View style={[styles.sectionHeader, { marginTop: 10 }]}>
        <Text style={styles.stampsTitle}>{t.recentArrivals}</Text>
        <TouchableOpacity onPress={onNavigateToPassport}>
          <Text style={styles.viewAllText}>{t.viewAll}</Text>
        </TouchableOpacity>
      </View>

      {stamps.length === 0 ? (
        <TouchableOpacity
          onPress={onOpenAddModal}
          activeOpacity={0.8}
          style={styles.emptyRecentCard}
        >
          <View style={styles.emptyRecentLeft}>
            <View style={styles.emptyCompassBox}>
              <Compass size={20} color="#2563EB" strokeWidth={2} />
            </View>
            <Text style={styles.emptyRecentText}>{t.emptyMapHint}</Text>
          </View>
          <View style={styles.emptyRecentAddBtn}>
            <Plus size={15} color="#FFFFFF" strokeWidth={2.5} />
          </View>
        </TouchableOpacity>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.stampsScroll}
        >
          {stamps.map((stamp) => (
            <View key={stamp.id} style={styles.stampCard}>
              <View style={styles.stampHeader}>
                <View style={styles.codeBadge}>
                  <Text style={styles.codeText}>{stamp.code}</Text>
                </View>
                <View style={[styles.typeBadge, { backgroundColor: stamp.bg }]}>
                  <Text style={[styles.typeText, { color: stamp.accentColor }]}>
                    {stamp.type}
                  </Text>
                </View>
              </View>
              <View style={styles.stampBody}>
                <Text style={styles.cityText}>{stamp.city}</Text>
                <Text style={styles.countryText}>{stamp.country}</Text>
              </View>
              <View style={styles.stampFooter}>
                <Text style={styles.dateText}>{stamp.date}</Text>
                <ArrowUpRight size={12} color="#94A3B8" />
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </ScrollView>
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
  logoText: {
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
  subtitleText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.8,
    marginTop: 2,
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
  biometricButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    position: 'relative',
  },
  biometricDot: {
    position: 'absolute',
    top: 3,
    right: 3,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  // Empty State Card
  emptyHeroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    padding: 22,
    marginTop: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  emptyBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  emptyIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(37, 99, 235, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.15)',
  },
  emptyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(37, 99, 235, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  emptyPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#2563EB',
    letterSpacing: 0.6,
  },
  emptyTextContent: {
    marginBottom: 18,
  },
  emptyHeroTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  emptyHeroDesc: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 20,
    fontWeight: '400',
  },
  emptyCtaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2563EB',
    borderRadius: 18,
    paddingVertical: 14,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 3,
  },
  emptyCtaButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },

  // Populated Country Highlight Card
  countryHeroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    padding: 22,
    marginTop: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  countryHeroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  countryHeroBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  countryStatusPill: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  countryStatusPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#2563EB',
    letterSpacing: 0.5,
  },
  countryYearPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 14,
  },
  countryYearPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0F172A',
  },
  countryHeroFlag: {
    fontSize: 28,
  },
  countryHeroTextContent: {
    marginBottom: 16,
  },
  countryHeroTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.6,
    marginBottom: 6,
  },
  countryHeroDesc: {
    fontSize: 12.5,
    color: '#475569',
    lineHeight: 19,
    fontWeight: '400',
  },
  countryHeroFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  countryCounterText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  carouselControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  arrowButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
  dot: {
    height: 4,
    borderRadius: 2,
  },
  dotActive: {
    width: 14,
    backgroundColor: '#2563EB',
  },
  dotInactive: {
    width: 4,
    backgroundColor: '#CBD5E1',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 22,
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  reachBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(37, 99, 235, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  reachBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2563EB',
    letterSpacing: 0.5,
  },
  mapCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 3,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
    gap: 6,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 16,
  },
  statBoxActiveVisited: {
    backgroundColor: 'rgba(37, 99, 235, 0.08)',
    borderWidth: 1,
    borderColor: '#2563EB',
  },
  statBoxActiveLived: {
    backgroundColor: 'rgba(29, 78, 216, 0.08)',
    borderWidth: 1,
    borderColor: '#1D4ED8',
  },
  statBoxActiveWant: {
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    borderWidth: 1,
    borderColor: '#38BDF8',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
    fontVariant: ['tabular-nums'],
  },
  statLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  searchLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchPlaceholder: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  plusButton: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stampsTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.8,
  },
  viewAllText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2563EB',
  },
  stampsScroll: {
    gap: 12,
    paddingVertical: 6,
  },
  stampCard: {
    width: 150,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  stampHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  codeBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  codeText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#0F172A',
  },
  typeBadge: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typeText: {
    fontSize: 8,
    fontWeight: '800',
  },
  stampBody: {
    marginBottom: 8,
  },
  cityText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  countryText: {
    fontSize: 10,
    color: '#64748B',
  },
  stampFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
    paddingTop: 6,
  },
  dateText: {
    fontSize: 9,
    color: '#94A3B8',
    fontWeight: '600',
  },
  emptyRecentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    marginTop: 6,
  },
  emptyRecentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    marginRight: 10,
  },
  emptyCompassBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(37, 99, 235, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyRecentText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    flex: 1,
  },
  emptyRecentAddBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
