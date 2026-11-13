import { ForceDarkTheme } from '../theme/ThemeContext';
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Search, Plus } from 'lucide-react-native';
import GlobeView from '../globe/GlobeView';
import HomeSheet from '../globe/HomeSheet';
import GlobeOverlay from '../globe/GlobeOverlay';
import CountryPanel from '../globe/CountryPanel';
import { useHomeScreen } from './home/useHomeScreen';
import { RecentList } from './home/RecentList';
import { TodayStrip } from './home/TodayStrip';
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
  const { area, closeCountry, colors, extraLift, gestureEpoch, globeRef, handleSnapChange, homeTarget, introDone, peekH, peekSummary, reduceMotion, running, selectCountry, selectedIso, setArea, setIntroDone, sheetName, sheetRef, sheetVisible, styles, totalMarked } = ctx;

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


        {/* TODAY: Secret Country result and countdown to the next trip */}
        <TodayStrip ctx={ctx} />

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
