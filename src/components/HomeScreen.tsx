import Button from './ui/Button';
import JourneyCard from './JourneyCard';
import PlanCard from './PlanCard';
import { fonts } from '../theme/typography';
import { makeStyles, useTheme } from '../theme/ThemeContext';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import {  
  Search, 
  Plus, 
  ChevronRight, 
  ChevronLeft, 
  Plane,
  ArrowUpRight,
  Compass,
  Calendar,
  Sparkles,
  Utensils,
  Maximize2,
} from 'lucide-react-native';
import WorldMap from './WorldMap';
import InteractiveMapModal from './InteractiveMapModal';
import AnimatedCounter from './AnimatedCounter';
import { getLocalizedCountryName, formatCountryDate } from '../data/travelData';
import { getCountryTrivia } from '../data/countryTrivia';
import { Country, Profile } from '../stores/types';

type StatusFilter = Country['status'] | 'all';

interface HomeScreenProps {
  countries: Country[];
  profile: Profile;
  onOpenAddModal: () => void;
  onSelectCountry: (countryId: string) => void;
  onNavigateToPassport: () => void;
  onNavigateToExplore: () => void;
  t: Record<string, any>;
  currentLang: 'tr' | 'en';
  onToggleLang: () => void;
  onOpenAuth?: () => void;
  tripCount?: number;
  onOpenJourney: () => void;
  onOpenPlanner: () => void;
  [key: string]: any;
}

function HomeScreen({
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
  tripCount = 0,
  onOpenJourney,
  onOpenPlanner,
}: HomeScreenProps) {
  const { colors } = useTheme();
  const styles = useStyles();
  const [countryCardIndex, setCountryCardIndex] = useState(0);
  const [activeFilter, setActiveFilter] = useState<StatusFilter>('all');
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);

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
      date: formatCountryDate(c, currentLang) || c.year || c.visitedYear || new Date().getFullYear().toString(),
      type: c.status === 'lived' ? (currentLang === 'tr' ? 'İKAMET' : 'RESIDENCE') : (currentLang === 'tr' ? 'GİRİŞ' : 'ENTRY'),
      accentColor: idx % 3 === 0 ? colors.status.visited.color : idx % 3 === 1 ? colors.status.lived.color : colors.gold.base,
      bg: idx % 3 === 0 ? colors.status.visited.light : idx % 3 === 1 ? colors.status.lived.light : colors.gold.tint,
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

  const handleFilterPress = (filter: StatusFilter) => {
    Haptics.selectionAsync();
    setActiveFilter((prev) => (prev === filter ? 'all' : filter));
  };


  return (
    <View style={styles.outerWrapper}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Clean Travel Passport Greeting */}
        <View style={styles.explorerGreetingRow}>
          <Text style={styles.explorerGreetingText}>
            {currentLang === 'tr' ? 'Dünya Pasaportun' : 'World Passport'}
          </Text>
          <Text style={styles.explorerGreetingSub}>
            {currentLang === 'tr'
              ? 'Rotaların, vizelerin ve seyahat haritan.'
              : 'Your journeys, stamps & personal travel map.'}
          </Text>
        </View>

        {/* HERO CARD: Empty State OR Visited Country Highlight */}
        {!currentMarkedCountry ? (
          /* EMPTY STATE: Call to action when no country has been added yet */
          <View style={styles.emptyHeroCard}>
            <View style={styles.emptyBadgeRow}>
              <View style={styles.emptyIconBadge}>
                <Compass size={22} color={colors.gold.base} />
              </View>
              <View style={styles.emptyPill}>
                <Sparkles size={11} color={colors.gold.base} />
                <Text style={styles.emptyPillText}>
                  {currentLang === 'tr' ? 'PASAPORTUNU BAŞLAT' : 'START PASSPORT'}
                </Text>
              </View>
            </View>

            <View style={styles.emptyTextContent}>
              <Text style={styles.emptyHeroTitle}>
                {currentLang === 'tr' ? 'İlk Ülkeni Damgala' : 'Stamp Your First Country'}
              </Text>
              <Text style={styles.emptyHeroDesc}>
                {currentLang === 'tr'
                  ? 'Gittiğin veya yaşamak istediğin ülkeleri seç, sana özel seyahat haritan ve vizelerin canlansın.'
                  : 'Select countries you have visited or dream of visiting to bring your personal world map and stamps to life.'}
              </Text>
            </View>

            <Button
              onPress={onOpenAddModal}
              label={currentLang === 'tr' ? 'Ülke Ekle' : 'Add Country'}
              icon={(color) => <Plus size={16} color={color} strokeWidth={2.5} />}
            />
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
                  <Calendar size={11} color={colors.gold.base} />
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
                    <ChevronLeft size={15} color={colors.text.primary} />
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
                    <ChevronRight size={15} color={colors.text.primary} />
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
            <Plane size={11} color={colors.status.visited.bright} style={{ transform: [{ rotate: '45deg' }] }} />
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
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setIsMapModalOpen(true);
          }}
          style={styles.mapTouchContainer}
        >
          <WorldMap
            countries={countries}
            activeFilter={activeFilter}
            onSelectCountry={() => {
              // Tapping preview opens the full interactive map modal
              setIsMapModalOpen(true);
            }}
            t={t}
            currentLang={currentLang}
            interactive={false}
          />

          {/* Expand Badge Overlay */}
          <View style={styles.mapExpandOverlay}>
            <View style={styles.mapExpandPill}>
              <Maximize2 size={11} color={colors.gold.base} strokeWidth={2.5} />
              <Text style={styles.mapExpandText}>
                {currentLang === 'tr' ? 'Haritayı Büyüt' : 'Expand Map'}
              </Text>
            </View>
          </View>

          {/* Subtle bottom prompt */}
          <View style={styles.mapTapPromptWrap}>
            <Text style={styles.mapTapPromptText}>
              {currentLang === 'tr' ? 'Tam ekran incelemek için dokunun' : 'Tap to explore interactive map'}
            </Text>
          </View>
        </TouchableOpacity>

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
              style={[styles.statNumber, { color: colors.status.visited.bright }]}
            />
            <View style={styles.statLabelRow}>
              <View style={[styles.statusDot, { backgroundColor: colors.status.visited.color }]} />
              <Text style={[styles.statLabel, { color: colors.status.visited.bright }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75}>
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
              style={[styles.statNumber, { color: colors.status.lived.bright }]}
            />
            <View style={styles.statLabelRow}>
              <View style={[styles.statusDot, { backgroundColor: colors.status.lived.color }]} />
              <Text style={[styles.statLabel, { color: colors.status.lived.bright }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75}>
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
              style={[styles.statNumber, { color: colors.gold.light }]}
            />
            <View style={styles.statLabelRow}>
              <View style={[styles.statusDot, { backgroundColor: colors.gold.base }]} />
              <Text style={[styles.statLabel, { color: colors.gold.light }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75}>
                {t.wishlist}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Travel journal: level, trips and badges */}
      {onOpenJourney && hasCountries && (
        <View style={{ marginTop: 14, marginBottom: 14 }}>
          <JourneyCard
            countries={countries}
            tripCount={tripCount}
            currentLang={currentLang}
            onPress={onOpenJourney}
          />
        </View>
      )}

      {/* Trip planner: countdown to the next trip */}
      {onOpenPlanner && (
        <View style={{ marginBottom: 14 }}>
          <PlanCard currentLang={currentLang} onPress={onOpenPlanner} />
        </View>
      )}

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
          <Search size={18} color={colors.text.secondary} />
          <Text style={styles.searchPlaceholder}>{t.findCountry}</Text>
        </View>
        <View style={styles.plusButton}>
          <Plus size={16} color={colors.canvas.raised} strokeWidth={2.5} />
        </View>
      </TouchableOpacity>

      {/* NEXT MILESTONE BANNER */}
      {/* GEZGİN REHBERİ: NE YENİR? NE GEZİLİR? DISCOVER BANNER */}
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
            <Utensils size={20} color={colors.gold.base} />
          </View>
          <View style={styles.milestoneTextContainer}>
            <View style={styles.milestoneTitleRow}>
              <Text style={styles.milestoneBadgeLabel}>
                {currentLang === 'tr' ? 'GEZGİN REHBERİ' : 'TRAVEL GUIDE'}
              </Text>
            </View>
            <Text style={styles.milestoneTitle}>
              {currentLang === 'tr' ? 'Hangi ülkede ne yenir, ne gezilir?' : 'What to eat, what to explore?'}
            </Text>
            <Text style={styles.milestoneSubtitle}>
              {currentLang === 'tr'
                ? 'İkonik lezzetler ve gizli seyahat tüyoları'
                : 'Iconic street bites & secret travel hacks'}
            </Text>
          </View>
        </View>
        <ChevronRight size={18} color={colors.text.secondary} />
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
              <Compass size={20} color={colors.gold.base} strokeWidth={2} />
            </View>
            <Text style={styles.emptyRecentText}>{t.emptyMapHint}</Text>
          </View>
          <View style={styles.emptyRecentAddBtn}>
            <Plus size={15} color={colors.canvas.raised} strokeWidth={2.5} />
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
                <ArrowUpRight size={12} color={colors.text.secondary} />
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </ScrollView>

    {/* Full Screen Interactive Map Modal */}
    <InteractiveMapModal
      visible={isMapModalOpen}
      onClose={() => setIsMapModalOpen(false)}
      countries={countries}
      onSelectCountry={onSelectCountry}
      currentLang={currentLang}
      t={t}
      initialFilter={activeFilter}
    />
  </View>
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
  logoText: {
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
  explorerGreetingRow: {
    marginTop: 2,
    marginBottom: 12,
  },
  explorerGreetingText: {
    fontSize: 22,
    color: colors.text.primary,
    letterSpacing: -0.5,
    fontFamily: fonts.display,
  },
  explorerGreetingSub: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.secondary,
    marginTop: 2,
  },
  subtitleText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.text.secondary,
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
  biometricButton: {
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
    backgroundColor: colors.gold.base,
    borderWidth: 1.5,
    borderColor: colors.canvas.base,
  },
  // Empty State Card
  emptyHeroCard: {
    backgroundColor: colors.glass.fill,
    borderRadius: 24,
    padding: 22,
    marginTop: 12,
    borderWidth: 1,
    borderColor: colors.glass.fillStrong,
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
    backgroundColor: colors.status.visited.light,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.status.visited.border,
  },
  emptyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.gold.tint,
    borderWidth: 1,
    borderColor: colors.gold.glow,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  emptyPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.gold.base,
    letterSpacing: 0.6,
  },
  emptyTextContent: {
    marginBottom: 18,
  },
  emptyHeroTitle: {
    fontSize: 22,
    color: colors.text.primary,
    letterSpacing: -0.5,
    marginBottom: 6,
    fontFamily: fonts.display,
  },
  emptyHeroDesc: {
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 20,
    fontWeight: '400',
  },

  // Populated Country Highlight Card
  countryHeroCard: {
    backgroundColor: colors.glass.fill,
    borderRadius: 24,
    padding: 22,
    marginTop: 12,
    borderWidth: 1,
    borderColor: colors.glass.fillStrong,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
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
    backgroundColor: colors.status.visited.light,
    borderWidth: 1,
    borderColor: colors.status.visited.border,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    flexShrink: 0,
  },
  countryStatusPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.status.visited.bright,
    letterSpacing: 0.5,
  },
  countryYearPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.glass.borderSoft,
    borderWidth: 1,
    borderColor: colors.glass.hairline,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 14,
    flexShrink: 0,
  },
  countryYearPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.text.soft,
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
    color: colors.text.primary,
    letterSpacing: -0.6,
    marginBottom: 6,
    flexShrink: 1,
    fontFamily: fonts.display,
  },
  countryHeroDesc: {
    fontSize: 12.5,
    color: colors.text.secondary,
    lineHeight: 19,
    fontWeight: '400',
  },
  countryHeroFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.glass.fillStrong,
  },
  countryCounterText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text.muted,
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
    backgroundColor: colors.glass.fillStrong,
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
    backgroundColor: colors.gold.base,
  },
  dotInactive: {
    width: 4,
    backgroundColor: colors.glass.borderStrong,
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
    color: colors.text.primary,
    letterSpacing: -0.3,
    fontFamily: fonts.display,
  },
  reachBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.status.visited.light,
    borderWidth: 1,
    borderColor: colors.status.visited.border,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  reachBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.status.visited.bright,
    letterSpacing: 0.5,
  },
  mapCard: {
    backgroundColor: colors.panel.base,
    borderRadius: 28,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.glass.hairline,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 3,
  },
  mapTouchContainer: {
    position: 'relative',
    borderRadius: 22,
    overflow: 'hidden',
  },
  mapExpandOverlay: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 5,
  },
  mapExpandPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.panel.raised,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.glass.borderStrong,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 3,
  },
  mapExpandText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.text.primary,
    letterSpacing: 0.3,
  },
  mapTapPromptWrap: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  mapTapPromptText: {
    fontSize: 9.5,
    fontWeight: '600',
    color: colors.glass.borderStrong,
    letterSpacing: 0.2,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.glass.fillStrong,
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
    backgroundColor: colors.status.visited.light,
    borderColor: colors.status.visited.border,
  },
  statBoxLived: {
    backgroundColor: colors.status.lived.light,
    borderColor: colors.status.lived.border,
  },
  statBoxWant: {
    backgroundColor: colors.gold.tint,
    borderColor: colors.gold.glow,
  },
  statBoxActiveVisited: {
    borderWidth: 1.5,
    borderColor: colors.status.visited.color,
  },
  statBoxActiveLived: {
    borderWidth: 1.5,
    borderColor: colors.status.lived.color,
  },
  statBoxActiveWant: {
    borderWidth: 1.5,
    borderColor: colors.gold.base,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.text.primary,
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
    color: colors.text.secondary,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.panel.base,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 14,
    borderWidth: 1,
    borderColor: colors.glass.hairline,
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
    color: colors.text.muted,
  },
  plusButton: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: colors.gold.base,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stampsTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.text.muted,
    letterSpacing: 0.8,
  },
  viewAllText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.gold.base,
  },
  stampsScroll: {
    gap: 12,
    paddingVertical: 6,
  },
  stampCard: {
    width: 152,
    backgroundColor: colors.panel.base,
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.glass.hairline,
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
    backgroundColor: colors.glass.fillStrong,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  codeText: {
    fontSize: 11,
    fontWeight: '900',
    color: colors.text.primary,
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
    color: colors.text.primary,
  },
  countryText: {
    fontSize: 10,
    color: colors.text.secondary,
  },
  stampFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.glass.fillStrong,
    paddingTop: 6,
  },
  dateText: {
    fontSize: 9,
    color: colors.text.muted,
    fontWeight: '600',
  },
  emptyRecentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.panel.base,
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: colors.glass.hairline,
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
    backgroundColor: colors.gold.tint,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gold.glow,
  },
  emptyRecentText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text.secondary,
    flex: 1,
  },
  emptyRecentAddBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.gold.base,
    justifyContent: 'center',
    alignItems: 'center',
  },
  milestoneCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.glass.fill,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.glass.fillStrong,
    marginTop: 12,
    marginBottom: 4,
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
    borderRadius: 14,
    backgroundColor: colors.gold.tint,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gold.glow,
  },
  milestoneTextContainer: {
    flex: 1,
  },
  milestoneTitleRow: {
    marginBottom: 2,
  },
  milestoneBadgeLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.gold.base,
    letterSpacing: 0.8,
  },
  milestoneTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text.primary,
    marginTop: 2,
    marginBottom: 2,
  },
  milestoneSubtitle: {
    fontSize: 12,
    color: colors.text.secondary,
  },
}));

export default React.memo(HomeScreen);
