import Button from './ui/Button';
import JourneyCard from './JourneyCard';
import PlanCard from './PlanCard';
import { fonts } from '../theme/typography';
import { ForceDarkTheme, makeStyles, useTheme } from '../theme/ThemeContext';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  AppState,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import {  
  Search, 
  Plus, 
  ChevronRight, 
  ChevronLeft, 
  Plane,
  Compass,
  Calendar,
  Sparkles,
  Utensils,
} from 'lucide-react-native';
import { useDerivedValue, useSharedValue } from 'react-native-reanimated';
import GlobeView, { GlobeHandle } from '../globe/GlobeView';
import HomeSheet, { SheetHandle, SnapName } from '../globe/HomeSheet';
import GlobeOverlay from '../globe/GlobeOverlay';
import CountryPanel, { resolveCountry } from '../globe/CountryPanel';
import { createCelebrationDetector, createCelebrationQueue } from '../globe/celebration';
import { resolveHomeCountry } from '../globe/homeCountry';
import { shortenName } from '../globe/countryNames';
import { useCountryStore } from '../stores/useCountryStore';
import { useCelebrationStore } from '../stores/useCelebrationStore';
import AnimatedCounter from './AnimatedCounter';
import { availableCatalog, getLocalizedCountryName, formatCountryDate } from '../data/travelData';
import { getCountryTrivia } from '../data/countryTrivia';
import { Country, Profile } from '../stores/types';
import Heading from './ui/Heading';

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
  /** Home is the visible tab. */
  isActive?: boolean;
  /** A full-screen modal hides the globe completely: stop drawing. */
  isCovered?: boolean;
  /** Any modal is open over Home: hold celebrations until it closes. */
  isModalOpen?: boolean;
  onEditCountry?: (country: Country) => void;
  [key: string]: any;
}

/** Height of the floating tab bar region the sheet stays above. */
const DOCK = 92;

function useAppIsActive() {
  const [active, setActive] = useState(AppState.currentState === 'active');
  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => setActive(s === 'active'));
    return () => sub.remove();
  }, []);
  return active;
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
  isActive = true,
  isCovered = false,
  isModalOpen = false,
  onEditCountry,
}: HomeScreenProps) {
  const { colors } = useTheme();
  const styles = useStyles();
  const [countryCardIndex, setCountryCardIndex] = useState(0);
  const [activeFilter, setActiveFilter] = useState<StatusFilter>('all');

  const markedCountries = countries.filter((c) => c.status === 'visited' || c.status === 'lived');
  const hasCountries = markedCountries.length > 0;
  const currentMarkedCountry = hasCountries
    ? markedCountries[countryCardIndex % markedCountries.length]
    : null;

  // Newest trips first: by year, then month. Countries without a year go last.
  const dateKey = (c: Country) => Number(c.visitedYear || c.year || 0) * 100 + Number(c.visitedMonth || c.month || 0);
  const recent = [...markedCountries].sort((x, y) => dateKey(y) - dateKey(x)).slice(0, 4);

  const visitedCount = countries.filter((c) => c.status === 'visited').length;
  const livedCount = countries.filter((c) => c.status === 'lived').length;
  const wantCount = countries.filter((c) => c.status === 'want').length;
  const totalMarked = visitedCount + livedCount;
  const earthPercentage = ((totalMarked / availableCatalog.length) * 100).toFixed(1);

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

  // ---- Globe + bottom sheet ----
  const [area, setArea] = useState({ w: 0, h: 0 });
  const [selectedIso, setSelectedIso] = useState<string | null>(null);
  const [sheetName, setSheetName] = useState<SnapName>('peek');
  const [introDone, setIntroDone] = useState(false);
  const globeRef = useRef<GlobeHandle>(null);
  const sheetRef = useRef<SheetHandle>(null);
  const returnSnap = useRef<SnapName>('peek');
  const sheetVisible = useSharedValue(0);
  // the tab is hidden with display: none, which drops the native views; re-attach the sheet's gestures on return
  const [gestureEpoch, setGestureEpoch] = useState(0);
  const wasActive = useRef(isActive);
  useEffect(() => {
    if (isActive && !wasActive.current) setGestureEpoch((n) => n + 1);
    wasActive.current = isActive;
  }, [isActive]);
  const appActive = useAppIsActive();

  const sheetArea = Math.max(area.h - DOCK, 0);
  const peekH = Math.max(112, Math.round(sheetArea * 0.16));
  const halfH = Math.round(sheetArea * 0.55);
  // The globe rides up with the sheet (up to half) so it stays in the clear part of the screen
  const extraLift = useDerivedValue(() => Math.min(Math.max((sheetVisible.value - DOCK - peekH) * 0.5, 0), (halfH - peekH) * 0.5));

  const homeTarget = useMemo(() => resolveHomeCountry(profile, availableCatalog), [profile]);
  const running = isActive && appActive && !isCovered;
  const celebrationsVisible = running && !isModalOpen && introDone;

  const selectCountry = useCallback((iso: string) => {
    if (!selectedIso) returnSnap.current = sheetRef.current?.current() ?? 'peek';
    setSelectedIso(iso);
    sheetRef.current?.snapTo('half');
    globeRef.current?.flyTo(iso);
  }, [selectedIso]);

  const closeCountry = useCallback(() => {
    setSelectedIso(null);
    sheetRef.current?.snapTo(returnSnap.current);
    globeRef.current?.glideHome();
  }, []);

  const handleSnapChange = useCallback((name: SnapName) => {
    setSheetName(name);
    if (name === 'peek' && selectedIso) {
      setSelectedIso(null);
      globeRef.current?.glideHome();
    }
  }, [selectedIso]);

  // Celebrations: diff the store, ignore hydration and bulk loads, queue while Home is hidden
  const [queue] = useState(createCelebrationQueue);
  const playing = useRef(false);
  const visibleRef = useRef(celebrationsVisible);
  const lastConfetti = useRef(0);
  const flushRef = useRef<() => void>(() => {});
  const flush = useCallback(() => {
    if (playing.current) return;
    const next = queue.next(visibleRef.current);
    if (!next) return;
    playing.current = true;
    globeRef.current?.celebrate(next.id, next.status, () => {
      // the add flow already bursts confetti itself; only add one when nothing just did
      if (next.status !== 'want' && Date.now() - lastConfetti.current > 3000) {
        useCelebrationStore.getState().burstConfetti();
      }
      playing.current = false;
      flushRef.current();
    });
  }, [queue]);
  useEffect(() => {
    flushRef.current = flush;
  }, [flush]);
  useEffect(() => {
    visibleRef.current = celebrationsVisible;
    if (celebrationsVisible) flush();
  }, [celebrationsVisible, flush]);
  useEffect(() => {
    const mountedAt = Date.now();
    const diff = createCelebrationDetector(() => Date.now() - mountedAt > 1500);
    diff(useCountryStore.getState().countries);
    const unsubCountries = useCountryStore.subscribe((state) => {
      const events = diff(state.countries);
      if (events.length) {
        queue.push(events);
        flush();
      }
    });
    const unsubConfetti = useCelebrationStore.subscribe(() => {
      lastConfetti.current = Date.now();
    });
    return () => {
      unsubCountries();
      unsubConfetti();
    };
  }, [queue, flush]);

  const selectedInfo = selectedIso ? resolveCountry(selectedIso) : null;
  const peekSummary = (
    <View style={styles.peekRow}>
      {selectedInfo ? (
        <Text style={styles.peekText} numberOfLines={1}>
          {`${selectedInfo.flag} ${shortenName(currentLang === 'tr' ? selectedInfo.nameTr : selectedInfo.name)}`}
        </Text>
      ) : (
        <>
          <View style={styles.peekItem}><View style={[styles.statusDot, { backgroundColor: colors.status.visited.color }]} /><Text style={styles.peekText}>{`${visitedCount} ${currentLang === 'tr' ? 'gidildi' : 'visited'}`}</Text></View>
          <View style={styles.peekItem}><View style={[styles.statusDot, { backgroundColor: colors.status.lived.color }]} /><Text style={styles.peekText}>{`${livedCount} ${currentLang === 'tr' ? 'yaşandı' : 'lived'}`}</Text></View>
          <View style={styles.peekItem}><View style={[styles.statusDot, { backgroundColor: colors.gold.base }]} /><Text style={styles.peekText}>{`${wantCount} ${currentLang === 'tr' ? 'istek' : 'wishlist'}`}</Text></View>
        </>
      )}
    </View>
  );

  return (
    <View
      style={styles.outerWrapper}
      onLayout={(e) => {
        const { width, height } = e.nativeEvent.layout;
        // a hidden tab (display: none) reports 0x0; keep the last real size so the globe and sheet stay mounted
        if (width > 0 && height > 0) setArea((prev) => (prev.w === width && prev.h === height ? prev : { w: width, h: height }));
      }}
    >
      {area.h > 0 ? (
        <>
          <GlobeView
            ref={globeRef}
            countries={countries}
            selectedIso={selectedIso}
            lang={currentLang}
            running={running}
            autoSpin={!selectedIso && sheetName === 'peek'}
            bottomInset={peekH + DOCK}
            extraLift={extraLift}
            home={homeTarget}
            onPickCountry={selectCountry}
            onIntroDone={() => setIntroDone(true)}
          />
          <ForceDarkTheme>
            <GlobeOverlay markedCount={totalMarked} lang={currentLang} show={introDone} hideStat={Boolean(selectedIso)} onPickCountry={selectCountry} />
            <View style={[styles.sheetArea, { bottom: 0 }]} pointerEvents="box-none">
              <HomeSheet ref={sheetRef} areaHeight={area.h} dock={DOCK} epoch={gestureEpoch} peek={peekSummary} visible={sheetVisible} onSnapChange={handleSnapChange}>
                {selectedIso ? (
                  <CountryPanel
                    iso={selectedIso}
                    countries={countries}
                    lang={currentLang}
                    onClose={closeCountry}
                    onEditStatus={(c) => onEditCountry?.(c)}
                    onMoreDetails={(iso) => onSelectCountry(iso)}
                  />
                ) : (
                  <>
        {/* PRIMARY ACTION: add a country (the most used action sits first) */}
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
                {currentLang === 'tr' ? 'İlk Ülkeni Ekle' : 'Add Your First Country'}
              </Text>
              <Text style={styles.emptyHeroDesc}>
                {currentLang === 'tr'
                  ? 'Gittiğin veya yaşamak istediğin ülkeleri seç, sana özel seyahat haritan ve vizelerin canlansın.'
                  : 'Select countries you have visited or dream of visiting to bring your personal world map to life.'}
              </Text>
            </View>

            <Button
              onPress={onOpenAddModal}
              label={currentLang === 'tr' ? 'Ülke Ekle' : 'Add Country'}
              icon={(color) => <Plus size={16} color={color} strokeWidth={2.5} />}
            />
          </View>
        ) : (
          /* POPULATED STATE: the user's countries with curated trivia */
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
          <Heading style={styles.sectionTitle}>{t.planetaryReach}</Heading>
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
        <View>
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
        <View>
          <PlanCard currentLang={currentLang} onPress={onOpenPlanner} />
        </View>
      )}

      {/* SECTION: Recent trips */}
      <View style={styles.sectionHeader}>
        <Text style={styles.stampsTitle}>{t.recentArrivals}</Text>
        <TouchableOpacity onPress={onOpenJourney ?? onNavigateToPassport}>
          <Text style={styles.viewAllText}>{t.viewAll}</Text>
        </TouchableOpacity>
      </View>

      {recent.length === 0 ? (
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
        <View style={styles.recentList}>
          {recent.map((c) => {
            const when = formatCountryDate(c, currentLang) || c.year || c.visitedYear || '';
            const dot = c.status === 'lived' ? colors.status.lived.color : colors.status.visited.color;
            return (
              <TouchableOpacity
                key={c.id}
                style={styles.recentRow}
                activeOpacity={0.7}
                onPress={() => {
                  Haptics.selectionAsync();
                  if (onSelectCountry) onSelectCountry(c.id);
                }}
                accessibilityRole="button"
                accessibilityLabel={getLocalizedCountryName(c, currentLang)}
              >
                <Text style={styles.recentFlag}>{c.flag}</Text>
                <View style={styles.recentBody}>
                  <Text style={styles.recentName} numberOfLines={1}>{getLocalizedCountryName(c, currentLang)}</Text>
                  <View style={styles.recentMeta}>
                    <View style={[styles.recentDot, { backgroundColor: dot }]} />
                    <Text style={styles.recentDate} numberOfLines={1}>
                      {[c.status === 'lived' ? (currentLang === 'tr' ? 'Yaşadın' : 'Lived') : (currentLang === 'tr' ? 'Gittin' : 'Visited'), when].filter(Boolean).join(' · ')}
                    </Text>
                  </View>
                </View>
                <ChevronRight size={16} color={colors.text.muted} />
              </TouchableOpacity>
            );
          })}
        </View>
      )}

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

                  </>
                )}
              </HomeSheet>
            </View>
          </ForceDarkTheme>
        </>
      ) : null}
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
  sheetArea: { position: 'absolute', left: 0, right: 0, top: 0, overflow: 'hidden' },
  peekRow: { flexDirection: 'row', alignItems: 'center', gap: 18 },
  peekItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  peekText: { color: colors.text.soft, fontSize: 14, fontWeight: '600' },
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
  },
  explorerGreetingText: {
    fontSize: 36,
    lineHeight: 40,
    color: colors.text.primary,
    fontFamily: fonts.display,
  },
  explorerGreetingSub: {
    fontSize: 19,
    lineHeight: 24,
    color: colors.text.secondary,
    marginTop: 2,
    fontFamily: fonts.displayItalic,
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
    fontSize: 28,
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
    fontSize: 30,
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
    paddingHorizontal: 2,
  },
  sectionTitle: {
    fontSize: 21,
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
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  recentList: {
    gap: 0,
    borderRadius: 20,
    backgroundColor: colors.panel.base,
    borderWidth: 1,
    borderColor: colors.glass.hairline,
    overflow: 'hidden',
  },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.glass.border,
  },
  recentFlag: { fontSize: 30 },
  recentBody: { flex: 1, gap: 1 },
  recentName: { fontSize: 24, lineHeight: 28, color: colors.text.primary, fontFamily: fonts.display },
  recentMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  recentDot: { width: 7, height: 7, borderRadius: 4 },
  recentDate: { fontSize: 13, fontWeight: '600', color: colors.text.secondary },
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

// Home is drawn on an always-dark stage, so its own styles must resolve against the dark palette
function DarkHomeScreen(props: HomeScreenProps) {
  return (
    <ForceDarkTheme>
      <HomeScreen {...props} />
    </ForceDarkTheme>
  );
}

export default React.memo(DarkHomeScreen);
