import JourneyCard from './JourneyCard';
import PlanCard from './PlanCard';
import DailyGameCard from './DailyGameCard';
import { ForceDarkTheme } from '../theme/ThemeContext';
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Search, Plus, Plane } from 'lucide-react-native';
import GlobeView from '../globe/GlobeView';
import HomeSheet from '../globe/HomeSheet';
import GlobeOverlay from '../globe/GlobeOverlay';
import CountryPanel from '../globe/CountryPanel';
import AnimatedCounter from './AnimatedCounter';
import Heading from './ui/Heading';
import { useHomeScreen } from './home/useHomeScreen';
import { HeroCard } from './home/HeroCard';
import { MapCard } from './home/MapCard';
import { RecentList } from './home/RecentList';
import { DiscoverBanner } from './home/DiscoverBanner';
import { HomeScreenProps, DOCK } from './home/shared';

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
  onOpenGame,
  isActive = true,
  isCovered = false,
  isModalOpen = false,
  onEditCountry }: HomeScreenProps) {
  const ctx = useHomeScreen({ countries, profile, onOpenAddModal, onSelectCountry, onNavigateToPassport, onNavigateToExplore, t, currentLang, onToggleLang, onOpenAuth, tripCount, onOpenJourney, onOpenPlanner, onOpenGame, isActive, isCovered, isModalOpen, onEditCountry });
  const { area, closeCountry, colors, earthPercentage, extraLift, gestureEpoch, globeRef, handleSnapChange, hasCountries, homeTarget, introDone, peekH, peekSummary, reduceMotion, running, selectCountry, selectedIso, setArea, setIntroDone, sheetName, sheetRef, sheetVisible, styles, totalMarked } = ctx;

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
            autoSpin={!reduceMotion && !selectedIso && sheetName === 'peek'}
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
        <HeroCard ctx={ctx} />

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
      <MapCard ctx={ctx} />

      {/* Daily secret-country game */}
      {onOpenGame && (
        <View>
          <DailyGameCard currentLang={currentLang} onPress={onOpenGame} />
        </View>
      )}

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

      <RecentList ctx={ctx} />

      {/* NEXT MILESTONE BANNER */}
      {/* GEZGİN REHBERİ: NE YENİR? NE GEZİLİR? DISCOVER BANNER */}
      <DiscoverBanner ctx={ctx} />

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

function DarkHomeScreen(props: HomeScreenProps) {
  return (
    <ForceDarkTheme>
      <HomeScreen {...props} />
    </ForceDarkTheme>
  );
}
export default React.memo(DarkHomeScreen);
