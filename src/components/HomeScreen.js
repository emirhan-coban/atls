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
  Languages
} from 'lucide-react-native';
import WorldMap from './WorldMap';
import { cultureSectors, passportStamps } from '../data/travelData';

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
  const [sectorIndex, setSectorIndex] = useState(0);
  const [activeFilter, setActiveFilter] = useState('all');

  const currentSector = cultureSectors[sectorIndex];

  const visitedCount = countries.filter((c) => c.status === 'visited').length;
  const livedCount = countries.filter((c) => c.status === 'lived').length;
  const wantCount = countries.filter((c) => c.status === 'want').length;
  const totalMarked = visitedCount + livedCount;
  const earthPercentage = ((totalMarked / 195) * 100).toFixed(1);

  const handleNextSector = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSectorIndex((prev) => (prev + 1) % cultureSectors.length);
  };

  const handlePrevSector = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSectorIndex((prev) => (prev - 1 + cultureSectors.length) % cultureSectors.length);
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
            <Languages size={13} color="#5B4DFF" />
            <Text style={styles.langPillText}>{currentLang.toUpperCase()}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleBiometricPress}
            activeOpacity={0.8}
            style={styles.biometricButton}
          >
            <Fingerprint size={22} color="#5B4DFF" strokeWidth={2} />
            <View style={styles.biometricDot} />
          </TouchableOpacity>
        </View>
      </View>

      {/* HERO CARD: "Saudade Spirit" Culture Highlight */}
      <LinearGradient
        colors={currentSector.colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroCard}
      >
        {/* Subtle Watermark Circles */}
        <View style={styles.watermarkCircle1} />
        <View style={styles.watermarkCircle2} />

        {/* Sector Tag + Flag */}
        <View style={styles.heroTopRow}>
          <View style={styles.sectorPill}>
            <Text style={styles.sectorPillText}>{currentSector.sector}</Text>
          </View>
          <Text style={styles.flagEmoji}>{currentSector.flag}</Text>
        </View>

        {/* Title & Description */}
        <View style={styles.heroTextContent}>
          <Text style={styles.heroTitle}>{currentSector.title}</Text>
          <Text style={styles.heroDesc}>{currentSector.description}</Text>
        </View>

        {/* Footer */}
        <View style={styles.heroFooter}>
          <View style={styles.heroLocation}>
            <View style={styles.whitePulseDot} />
            <Text style={styles.heroLocationText}>
              {currentSector.country} • {currentSector.visitedYear}
            </Text>
          </View>

          {/* Carousel Arrows */}
          <View style={styles.carouselControls}>
            <TouchableOpacity onPress={handlePrevSector} style={styles.arrowButton}>
              <ChevronLeft size={14} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.dotsRow}>
              {cultureSectors.map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    i === sectorIndex ? styles.dotActive : styles.dotInactive,
                  ]}
                />
              ))}
            </View>
            <TouchableOpacity onPress={handleNextSector} style={styles.arrowButton}>
              <ChevronRight size={14} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* SECTION: Planetary Reach */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t.planetaryReach}</Text>
        <View style={styles.reachBadge}>
          <Plane size={11} color="#5B4DFF" style={{ transform: [{ rotate: '45deg' }] }} />
          <Text style={styles.reachBadgeText}>{earthPercentage}{t.ofEarth}</Text>
        </View>
      </View>

      {/* Map Card */}
      <View style={styles.mapCard}>
        <WorldMap
          countries={countries}
          activeFilter={activeFilter}
          onSelectCountry={onSelectCountry}
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
              <View style={[styles.statusDot, { backgroundColor: '#3B82F6' }]} />
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
              <View style={[styles.statusDot, { backgroundColor: '#4F46E5' }]} />
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
              <View style={[styles.statusDot, { backgroundColor: '#A855F7' }]} />
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

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.stampsScroll}
      >
        {passportStamps.map((stamp) => (
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
  logoText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#090B10',
    letterSpacing: -0.8,
  },
  logoDot: {
    fontSize: 32,
    fontWeight: '900',
    color: '#5B4DFF',
  },
  subtitleText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1,
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
    gap: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  langPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#5B4DFF',
  },
  biometricButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
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
  heroCard: {
    borderRadius: 28,
    padding: 22,
    marginTop: 12,
    shadowColor: '#5B4DFF',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  watermarkCircle1: {
    position: 'absolute',
    right: -40,
    bottom: -40,
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  watermarkCircle2: {
    position: 'absolute',
    right: -10,
    bottom: -10,
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectorPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  sectorPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: 'rgba(255, 255, 255, 0.95)',
    letterSpacing: 0.8,
  },
  flagEmoji: {
    fontSize: 24,
  },
  heroTextContent: {
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  heroDesc: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.88)',
    lineHeight: 18,
    fontWeight: '400',
  },
  heroFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  heroLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  whitePulseDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#FFFFFF',
  },
  heroLocationText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  carouselControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  arrowButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
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
    backgroundColor: '#FFFFFF',
  },
  dotInactive: {
    width: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
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
    backgroundColor: 'rgba(91, 77, 255, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  reachBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#5B4DFF',
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
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  statBoxActiveLived: {
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#4F46E5',
  },
  statBoxActiveWant: {
    backgroundColor: '#FAF5FF',
    borderWidth: 1,
    borderColor: '#A855F7',
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
    backgroundColor: '#5B4DFF',
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
    color: '#5B4DFF',
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
});
