import { useReduceMotion } from '../../utils/useReduceMotion';
import { useTheme } from '../../theme/ThemeContext';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useDerivedValue, useSharedValue } from 'react-native-reanimated';
import { GlobeHandle } from '../../globe/GlobeView';
import { SheetHandle, SnapName } from '../../globe/HomeSheet';
import { resolveCountry } from '../../globe/CountryPanel';
import { createCelebrationDetector, createCelebrationQueue } from '../../globe/celebration';
import { resolveHomeCountry } from '../../globe/homeCountry';
import { shortenName } from '../../globe/countryNames';
import { useCountryStore } from '../../stores/useCountryStore';
import { useCelebrationStore } from '../../stores/useCelebrationStore';
import { availableCatalog } from '../../data/travelData';
import { Country } from '../../stores/types';
import { useStyles } from '../HomeScreen.styles';
import { tHomeScreen } from '../../localization/screens/HomeScreen';
import { StatusFilter, HomeScreenProps, DOCK, useAppIsActive } from './shared';

export function useHomeScreen({
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
  onOpenGame,
  isActive = true,
  isCovered = false,
  isModalOpen = false,
  onEditCountry,
}: HomeScreenProps) {
  const { colors } = useTheme();
  const reduceMotion = useReduceMotion();
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
          <View style={styles.peekItem}><View style={[styles.statusDot, { backgroundColor: colors.status.visited.color }]} /><Text style={styles.peekText}>{`${visitedCount} ${tHomeScreen('visited', currentLang)}`}</Text></View>
          <View style={styles.peekItem}><View style={[styles.statusDot, { backgroundColor: colors.status.lived.color }]} /><Text style={styles.peekText}>{`${livedCount} ${tHomeScreen('lived', currentLang)}`}</Text></View>
          <View style={styles.peekItem}><View style={[styles.statusDot, { backgroundColor: colors.gold.base }]} /><Text style={styles.peekText}>{`${wantCount} ${tHomeScreen('wishlist', currentLang)}`}</Text></View>
        </>
      )}
    </View>
  );

  return { activeFilter, area, closeCountry, colors, countries, countryCardIndex, currentLang, currentMarkedCountry, earthPercentage, extraLift, gestureEpoch, globeRef, handleFilterPress, handleNextCountry, handlePrevCountry, handleSnapChange, hasCountries, homeTarget, introDone, livedCount, markedCountries, onEditCountry, onNavigateToExplore, onNavigateToPassport, onOpenAddModal, onOpenGame, onOpenJourney, onOpenPlanner, onSelectCountry, peekH, peekSummary, recent, reduceMotion, running, selectCountry, selectedIso, setArea, setIntroDone, sheetName, sheetRef, sheetVisible, styles, t, totalMarked, tripCount, visitedCount, wantCount };
}

export type HomeCtx = ReturnType<typeof useHomeScreen>;
