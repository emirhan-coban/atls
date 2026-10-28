import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Compass, Trophy, Globe, Sparkles, Languages } from 'lucide-react-native';
import SwipeDiscoveryCard from './SwipeDiscoveryCard';
import ContinentalProgress from './ContinentalProgress';
import AchievementBadge from './AchievementBadge';
import GlowSphere from './GlowSphere';
import { ACHIEVEMENTS, Achievement } from '../data/achievements';
import { Country, Profile } from '../stores/types';
import { theme } from '../theme';

interface ExploreScreenProps {
  countries: Country[];
  profile: Profile;
  onAddToWishlist: (country: any) => void;
  t: any;
  currentLang: 'tr' | 'en';
  onToggleLang?: () => void;
}

export default function ExploreScreen({
  countries,
  profile,
  onAddToWishlist,
  t,
  currentLang,
  onToggleLang,
}: ExploreScreenProps) {
  const [achievementFilter, setAchievementFilter] = useState<'all' | 'unlocked' | 'locked'>('all');

  const unlockedCount = ACHIEVEMENTS.filter((a) => a.isUnlocked(countries, profile)).length;

  const filteredAchievements = ACHIEVEMENTS.filter((a) => {
    const isUnlocked = a.isUnlocked(countries, profile);
    if (achievementFilter === 'unlocked') return isUnlocked;
    if (achievementFilter === 'locked') return !isUnlocked;
    return true;
  });

  const handleFilterPress = (filter: 'all' | 'unlocked' | 'locked') => {
    Haptics.selectionAsync();
    setAchievementFilter(filter);
  };

  return (
    <View style={styles.outerWrapper}>
      {/* Background Celestial Glowing Spheres */}
      <GlowSphere
        size={360}
        colors={['#2E5CFF', '#FF6B35']}
        opacity={0.22}
        style={{ position: 'absolute', top: -90, right: -100 }}
      />
      <GlowSphere
        size={280}
        colors={['#7C3AED', '#2E5CFF']}
        opacity={0.16}
        style={{ position: 'absolute', top: 350, left: -90 }}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.titleRow}>
              <Compass size={22} color="#3B82F6" />
              <Text style={styles.title}>
                {t?.exploreTitle || (currentLang === 'tr' ? 'Dünyayı Keşfet' : 'Explore the World')}
              </Text>
            </View>
            <Text style={styles.subtitle}>
              {t?.exploreSubtitle ||
                (currentLang === 'tr'
                  ? 'Yeni rotalar keşfet, rozetler kazan ve ilerlemeni gör'
                  : 'Discover destinations, earn badges & track progress')}
            </Text>
          </View>

          {onToggleLang && (
            <TouchableOpacity
              onPress={() => {
                Haptics.selectionAsync();
                onToggleLang();
              }}
              activeOpacity={0.7}
              style={styles.langPill}
            >
              <Languages size={13} color="#E2F952" />
              <Text style={styles.langPillText}>
                {t?.langSwitch || (currentLang === 'tr' ? 'EN' : 'TR')}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* SECTION 1: Wanderlust Swipe Deck */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Sparkles size={16} color="#FF6B35" />
              <Text style={styles.sectionTitle}>
                {t?.swipeCardTitle || (currentLang === 'tr' ? 'Keşif Kartı' : 'Wanderlust Deck')}
              </Text>
            </View>
          </View>

          <SwipeDiscoveryCard
            existingCountries={countries}
            currentLang={currentLang}
            onAddToWishlist={onAddToWishlist}
            t={t}
          />
        </View>

        {/* SECTION 2: Continental Progress */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Globe size={16} color="#3B82F6" />
              <Text style={styles.sectionTitle}>
                {t?.continentProgressTitle ||
                  (currentLang === 'tr' ? 'Kıta Bazlı İlerleme' : 'Continental Progress')}
              </Text>
            </View>
          </View>

          <ContinentalProgress countries={countries} currentLang={currentLang} />
        </View>

        {/* SECTION 3: Achievements & Badges */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Trophy size={16} color="#F59E0B" />
              <Text style={styles.sectionTitle}>
                {t?.achievementsTitle ||
                  (currentLang === 'tr' ? 'Başarımlar & Rozetler' : 'Achievements & Badges')}
              </Text>
            </View>

            <View style={styles.badgeCountPill}>
              <Text style={styles.badgeCountText}>
                {`${unlockedCount}/${ACHIEVEMENTS.length} `}
                {currentLang === 'tr' ? 'Açıldı' : 'Unlocked'}
              </Text>
            </View>
          </View>

          {/* Filter Chips */}
          <View style={styles.filterRow}>
            <TouchableOpacity
              style={[styles.filterChip, achievementFilter === 'all' && styles.filterChipActive]}
              onPress={() => handleFilterPress('all')}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterChipText,
                  achievementFilter === 'all' && styles.filterChipTextActive,
                ]}
              >
                {currentLang === 'tr' ? 'Tümü' : 'All'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterChip, achievementFilter === 'unlocked' && styles.filterChipActive]}
              onPress={() => handleFilterPress('unlocked')}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterChipText,
                  achievementFilter === 'unlocked' && styles.filterChipTextActive,
                ]}
              >
                {currentLang === 'tr' ? 'Kazanılanlar 🏆' : 'Unlocked 🏆'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterChip, achievementFilter === 'locked' && styles.filterChipActive]}
              onPress={() => handleFilterPress('locked')}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterChipText,
                  achievementFilter === 'locked' && styles.filterChipTextActive,
                ]}
              >
                {currentLang === 'tr' ? 'Kilitliler 🔒' : 'Locked 🔒'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Badges List */}
          <View style={styles.badgesList}>
            {filteredAchievements.map((item) => (
              <AchievementBadge
                key={item.id}
                achievement={item}
                countries={countries}
                profile={profile}
                lang={currentLang}
              />
            ))}
          </View>
        </View>
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
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: 120, // space for bottom dock
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.xl,
  },
  headerLeft: {
    flex: 1,
    paddingRight: theme.spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  title: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.black,
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.xs,
    color: '#94A3B8',
    lineHeight: 18,
  },
  langPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  langPillText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
    color: '#E2F952',
  },
  section: {
    marginBottom: theme.spacing['2xl'],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.black,
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  badgeCountPill: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  badgeCountText: {
    fontSize: theme.typography.fontSize.xxs,
    fontWeight: theme.typography.fontWeight.extrabold,
    color: '#F59E0B',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: theme.spacing.md,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
  },
  filterChipActive: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  filterChipText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
    color: '#94A3B8',
  },
  filterChipTextActive: {
    color: '#07090E',
    fontWeight: '800',
  },
  badgesList: {
    gap: 2,
  },
});
