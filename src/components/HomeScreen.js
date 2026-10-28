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
  Trophy,
} from 'lucide-react-native';
import WorldMap from './WorldMap';
import AnimatedCounter from './AnimatedCounter';
import GlowSphere from './GlowSphere';
import OrbitalRings from './OrbitalRings';
import { getLocalizedCountryName, formatCountryDate } from '../data/travelData';
import { getCountryTrivia } from '../data/countryTrivia';
import { ACHIEVEMENTS } from '../data/achievements';

export default function HomeScreen({
  countries,
  profile,
  onOpenAddModal,
  onSelectCountry,
  onNavigateToPassport,
  onNavigateToExplore,
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

  const nextAchievement = ACHIEVEMENTS.find((a) => !a.isUnlocked(countries, profile));
  const nextProgress = nextAchievement ? nextAchievement.getProgress(countries, profile) : null;

  const stamps = markedCountries.slice(0, 6).map((c, idx) => {
    const locName = getLocalizedCountryName(c, currentLang);
    return {
      id: `stamp-${c.id}`,
      code: c.id,
      city: locName,
      country: locName,
      date: formatCountryDate(c, currentLang) || c.year || c.visitedYear || new Date().getFullYear().toString(),
      type: c.status === 'lived' ? (currentLang === 'tr' ? 'İKAMET' : 'RESIDENCE') : (currentLang === 'tr' ? 'GİRİŞ' : 'ENTRY'),
      accentColor: idx % 3 === 0 ? '#3B82F6' : idx % 3 === 1 ? '#10B981' : '#FF6B35',
      bg: idx % 3 === 0 ? 'rgba(59, 130, 246, 0.15)' : idx % 3 === 1 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 107, 53, 0.15)',
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
    <View style={styles.outerWrapper}>
      {/* Background Celestial Glowing Spheres */}
      <GlowSphere
        size={380}
        colors={['#2E5CFF', '#FF6B35']}
        opacity={0.24}
        style={{ position: 'absolute', top: -110, right: -120 }}
      />
      <GlowSphere
        size={280}
        colors={['#7C3AED', '#2E5CFF']}
        opacity={0.16}
        style={{ position: 'absolute', top: 380, left: -100 }}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Bar */}
        <View style={styles.header}>
          <View style={styles.logoRow}>
            <Text style={styles.logoText}>atls</Text>
            <Text style={styles.logoDot}>.</Text>
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
              <Languages size={13} color="#E2F952" />
              <Text style={styles.langPillText}>{t.langSwitch || (currentLang === 'tr' ? 'EN' : 'TR')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleBiometricPress}
              activeOpacity={0.8}
              style={styles.biometricButton}
            >
              <Fingerprint size={20} color="#3B82F6" strokeWidth={2} />
              <View style={styles.biometricDot} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Cosmic Explorer Greeting */}
        <View style={styles.explorerGreetingRow}>
          <Text style={styles.explorerGreetingText}>
            {currentLang === 'tr' ? 'Merhaba, Gezgin! 🪐' : 'Hey Explorer! 🪐'}
          </Text>
          <Text style={styles.explorerGreetingSub}>
            {currentLang === 'tr' ? 'Galaktik rota seni nereye çağırıyor?' : 'Where does your orbit lead today?'}
          </Text>
        </View>

        {/* HERO CARD: Empty State OR Visited Country Highlight */}
        {!hasCountries ? (
          /* EMPTY STATE: Call to action when no country has been added yet */
          <View style={styles.emptyHeroCard}>
            <OrbitalRings size={180} style={{ position: 'absolute', right: -25, top: -15, opacity: 0.22 }} />
            <View style={styles.emptyBadgeRow}>
              <View style={styles.emptyIconBadge}>
                <Compass size={22} color="#3B82F6" />
              </View>
              <View style={styles.emptyPill}>
                <Sparkles size={11} color="#E2F952" />
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
              <Plus size={16} color="#07090E" strokeWidth={2.5} />
              <Text style={styles.emptyCtaButtonText}>
                {currentLang === 'tr' ? '+ Ülke Ekle' : '+ Add Country'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* POPULATED STATE: User's stamped countries with curated trivia */
          <View style={styles.countryHeroCard}>
            <OrbitalRings size={200} style={{ position: 'absolute', right: -30, top: -20, opacity: 0.3 }} />
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
                  <Calendar size={11} color="#FF6B35" />
                  <Text style={styles.countryYearPillText}>
                    {formatCountryDate(currentMarkedCountry, currentLang) || currentMarkedCountry.year || currentMarkedCountry.visitedYear || new Date().getFullYear()}
                  </Text>
                </View>
              </View>

              <Text style={styles.countryHeroFlag}>{currentMarkedCountry.flag || '🌍'}</Text>
            </View>

            {/* Country Name & Trivia */}
            <TouchableOpacity
              style={styles.countryHeroTextContent}
              activeOpacity={0.85}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                if (onSelectCountry && currentMarkedCountry) {
                  onSelectCountry(currentMarkedCountry.id);
                }
              }}
            >
              <Text
                style={styles.countryHeroTitle}
                numberOfLines={2}
                adjustsFontSizeToFit={true}
                minimumFontScale={0.75}
              >
                {getLocalizedCountryName(currentMarkedCountry, currentLang)}
              </Text>
              <Text style={styles.countryHeroDesc} numberOfLines={3}>
                {getCountryTrivia(
                  currentMarkedCountry.id,
                  getLocalizedCountryName(currentMarkedCountry, currentLang),
                  currentLang
                )}
              </Text>
            </TouchableOpacity>

            {/* Footer: Counter & Carousel Navigation */}
            <View style={styles.countryHeroFooter}>
              <Text style={styles.countryCounterText}>
                {`${(countryCardIndex % markedCountries.length) + 1} / ${markedCountries.length} ${currentLang === 'tr' ? 'Ülke' : 'Countries'}`}
              </Text>

              {markedCountries.length > 1 && (
                <View style={styles.carouselControls}>
                  <TouchableOpacity onPress={handlePrevCountry} style={styles.arrowButton}>
                    <ChevronLeft size={15} color="#FFFFFF" />
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
                    <ChevronRight size={15} color="#FFFFFF" />
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
            <Plane size={11} color="#60A5FA" style={{ transform: [{ rotate: '45deg' }] }} />
          <AnimatedCounter
            value={Number(earthPercentage) || 0}
            formatter={(v) => {
              const valStr = v.toFixed(1);
              return t.reachBadgeText ? t.reachBadgeText.replace('{percent}', valStr) : `${valStr}%`;
            }}
            style={styles.reachBadgeText}
          />
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

        {/* Stats Row - Playful Candy Tiles */}
        <View style={styles.statsRow}>
          {/* Visited */}
          <TouchableOpacity
            onPress={() => handleFilterPress('visited')}
            activeOpacity={0.7}
            style={[
              styles.statBox,
              styles.statBoxVisited,
              activeFilter === 'visited' && styles.statBoxActiveVisited,
            ]}
          >
            <AnimatedCounter
              value={visitedCount}
              formatter={(v) => {
                const rounded = Math.round(v);
                return rounded < 10 ? `0${rounded}` : `${rounded}`;
              }}
              style={[styles.statNumber, { color: '#60A5FA' }]}
            />
            <View style={styles.statLabelRow}>
              <View style={[styles.statusDot, { backgroundColor: '#3B82F6' }]} />
              <Text style={[styles.statLabel, { color: '#93C5FD' }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75}>
                {t.visited}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Lived in */}
          <TouchableOpacity
            onPress={() => handleFilterPress('lived')}
            activeOpacity={0.7}
            style={[
              styles.statBox,
              styles.statBoxLived,
              activeFilter === 'lived' && styles.statBoxActiveLived,
            ]}
          >
            <AnimatedCounter
              value={livedCount}
              formatter={(v) => {
                const rounded = Math.round(v);
                return rounded < 10 ? `0${rounded}` : `${rounded}`;
              }}
              style={[styles.statNumber, { color: '#34D399' }]}
            />
            <View style={styles.statLabelRow}>
              <View style={[styles.statusDot, { backgroundColor: '#10B981' }]} />
              <Text style={[styles.statLabel, { color: '#6EE7B7' }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75}>
                {t.livedIn}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Want to visit */}
          <TouchableOpacity
            onPress={() => handleFilterPress('want')}
            activeOpacity={0.7}
            style={[
              styles.statBox,
              styles.statBoxWant,
              activeFilter === 'want' && styles.statBoxActiveWant,
            ]}
          >
            <AnimatedCounter
              value={wantCount}
              formatter={(v) => {
                const rounded = Math.round(v);
                return rounded < 10 ? `0${rounded}` : `${rounded}`;
              }}
              style={[styles.statNumber, { color: '#FF8A5B' }]}
            />
            <View style={styles.statLabelRow}>
              <View style={[styles.statusDot, { backgroundColor: '#FF6B35' }]} />
              <Text style={[styles.statLabel, { color: '#FDBA74' }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75}>
                {t.wishlist}
              </Text>
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
          <Plus size={16} color="#07090E" strokeWidth={2.5} />
        </View>
      </TouchableOpacity>

      {/* NEXT MILESTONE BANNER */}
      {nextAchievement && (
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            if (onNavigateToExplore) onNavigateToExplore();
          }}
          activeOpacity={0.85}
          style={styles.milestoneCard}
        >
          <View style={styles.milestoneLeft}>
            <View style={styles.milestoneIconBox}>
              <Text style={{ fontSize: 22 }}>{nextAchievement.badgeEmoji}</Text>
            </View>
            <View style={styles.milestoneTextContainer}>
              <View style={styles.milestoneTitleRow}>
                <Text style={styles.milestoneBadgeLabel}>
                  {currentLang === 'tr' ? 'SIRADAKİ HEDEF' : 'NEXT MILESTONE'}
                </Text>
                <Text style={styles.milestoneRatio}>
                  {nextProgress ? `${nextProgress.current}/${nextProgress.target}` : ''}
                </Text>
              </View>
              <Text style={styles.milestoneTitle}>
                {currentLang === 'tr' ? nextAchievement.titleTr : nextAchievement.titleEn}
              </Text>
              <View style={styles.milestoneProgressBar}>
                <View
                  style={[
                    styles.milestoneProgressFill,
                    {
                      width: `${nextProgress ? nextProgress.percent : 0}%`,
                      backgroundColor: nextAchievement.accentColor,
                    },
                  ]}
                />
              </View>
            </View>
          </View>
          <ChevronRight size={18} color="#94A3B8" />
        </TouchableOpacity>
      )}

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
              <Compass size={20} color="#FF6B35" strokeWidth={2} />
            </View>
            <Text style={styles.emptyRecentText}>{t.emptyMapHint}</Text>
          </View>
          <View style={styles.emptyRecentAddBtn}>
            <Plus size={15} color="#07090E" strokeWidth={2.5} />
          </View>
        </TouchableOpacity>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.stampsScroll}
        >
          {stamps.map((stamp, idx) => (
            <TouchableOpacity
              key={stamp.id}
              style={[
                styles.stampCard,
                {
                  borderColor: stamp.accentColor,
                  transform: [{ rotate: idx % 2 === 0 ? '-1.5deg' : '1.5deg' }],
                },
              ]}
              activeOpacity={0.8}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                if (onSelectCountry) onSelectCountry(stamp.code);
              }}
            >
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
                <Text style={styles.cityText} numberOfLines={1} ellipsizeMode="tail">
                  {stamp.city}
                </Text>
                <Text style={styles.countryText} numberOfLines={1} ellipsizeMode="tail">
                  {stamp.country}
                </Text>
              </View>
              <View style={styles.stampFooter}>
                <Text style={styles.dateText} numberOfLines={1} ellipsizeMode="tail">
                  {stamp.date}
                </Text>
                <ArrowUpRight size={12} color="#94A3B8" />
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </ScrollView>
  </View>
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
  logoText: {
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
  explorerGreetingRow: {
    marginTop: 2,
    marginBottom: 12,
  },
  explorerGreetingText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  explorerGreetingSub: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94A3B8',
    marginTop: 2,
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
  biometricButton: {
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
    backgroundColor: '#E2F952',
    borderWidth: 1.5,
    borderColor: '#07090E',
  },
  // Empty State Card
  emptyHeroCard: {
    backgroundColor: 'rgba(15, 20, 32, 0.85)',
    borderRadius: 26,
    padding: 22,
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 4,
    overflow: 'hidden',
    position: 'relative',
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
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  emptyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(226, 249, 82, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(226, 249, 82, 0.3)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  emptyPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#E2F952',
    letterSpacing: 0.6,
  },
  emptyTextContent: {
    marginBottom: 18,
  },
  emptyHeroTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  emptyHeroDesc: {
    fontSize: 13,
    color: '#94A3B8',
    lineHeight: 20,
    fontWeight: '400',
  },
  emptyCtaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FF6B35',
    borderRadius: 18,
    paddingVertical: 14,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 4,
  },
  emptyCtaButtonText: {
    color: '#07090E',
    fontSize: 14,
    fontWeight: '900',
  },

  // Populated Country Highlight Card
  countryHeroCard: {
    backgroundColor: 'rgba(15, 20, 32, 0.85)',
    borderRadius: 26,
    padding: 22,
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  countryHeroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
    gap: 10,
  },
  countryHeroBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    flex: 1,
  },
  countryStatusPill: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.35)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    flexShrink: 0,
  },
  countryStatusPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#60A5FA',
    letterSpacing: 0.5,
  },
  countryYearPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 14,
    flexShrink: 0,
  },
  countryYearPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#E2E8F0',
  },
  countryHeroFlag: {
    fontSize: 28,
    flexShrink: 0,
    marginTop: -2,
  },
  countryHeroTextContent: {
    marginBottom: 16,
  },
  countryHeroTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.6,
    marginBottom: 6,
    flexShrink: 1,
  },
  countryHeroDesc: {
    fontSize: 12.5,
    color: '#94A3B8',
    lineHeight: 19,
    fontWeight: '400',
  },
  countryHeroFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
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
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
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
    backgroundColor: '#FF6B35',
  },
  dotInactive: {
    width: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
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
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  reachBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  reachBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#60A5FA',
    letterSpacing: 0.5,
  },
  mapCard: {
    backgroundColor: 'rgba(11, 15, 25, 0.88)',
    borderRadius: 28,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 3,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    gap: 8,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 18,
    borderWidth: 1,
  },
  statBoxVisited: {
    backgroundColor: 'rgba(59, 130, 246, 0.10)',
    borderColor: 'rgba(59, 130, 246, 0.25)',
  },
  statBoxLived: {
    backgroundColor: 'rgba(16, 185, 129, 0.10)',
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  statBoxWant: {
    backgroundColor: 'rgba(255, 107, 53, 0.10)',
    borderColor: 'rgba(255, 107, 53, 0.25)',
  },
  statBoxActiveVisited: {
    borderWidth: 1.5,
    borderColor: '#3B82F6',
  },
  statBoxActiveLived: {
    borderWidth: 1.5,
    borderColor: '#10B981',
  },
  statBoxActiveWant: {
    borderWidth: 1.5,
    borderColor: '#FF6B35',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
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
    color: '#94A3B8',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(15, 20, 32, 0.85)',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 2,
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
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stampsTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
  },
  viewAllText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#E2F952',
  },
  stampsScroll: {
    gap: 12,
    paddingVertical: 6,
  },
  stampCard: {
    width: 152,
    backgroundColor: 'rgba(15, 20, 32, 0.85)',
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'rgba(255, 255, 255, 0.12)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 2,
  },
  stampHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  codeBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  codeText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFFFFF',
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
    color: '#FFFFFF',
  },
  countryText: {
    fontSize: 10,
    color: '#94A3B8',
  },
  stampFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: 6,
  },
  dateText: {
    fontSize: 9,
    color: '#64748B',
    fontWeight: '600',
  },
  emptyRecentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(15, 20, 32, 0.65)',
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
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
    backgroundColor: 'rgba(255, 107, 53, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 53, 0.25)',
  },
  emptyRecentText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#94A3B8',
    flex: 1,
  },
  emptyRecentAddBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
  },
  milestoneCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(124, 58, 237, 0.12)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.28)',
    marginTop: 12,
    marginBottom: 4,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 3,
  },
  milestoneLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
    marginRight: 8,
  },
  milestoneIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  milestoneTextContainer: {
    flex: 1,
  },
  milestoneTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  milestoneBadgeLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#C084FC',
    letterSpacing: 0.8,
  },
  milestoneRatio: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
  },
  milestoneTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  milestoneProgressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  milestoneProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
});
