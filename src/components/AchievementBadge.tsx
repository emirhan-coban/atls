import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Lock, Check } from 'lucide-react-native';
import { Achievement } from '../data/achievements';
import { Country, Profile } from '../stores/types';
import { theme } from '../theme';

interface AchievementBadgeProps {
  achievement: Achievement;
  countries: Country[];
  profile?: Profile;
  lang: 'tr' | 'en';
  onPress?: (achievement: Achievement, unlocked: boolean) => void;
}

export default function AchievementBadge({
  achievement,
  countries,
  profile,
  lang,
  onPress,
}: AchievementBadgeProps) {
  const isUnlocked = achievement.isUnlocked(countries, profile);
  const progress = achievement.getProgress(countries, profile);

  const title = lang === 'tr' ? achievement.titleTr : achievement.titleEn;
  const desc = lang === 'tr' ? achievement.descTr : achievement.descEn;

  const handlePress = () => {
    Haptics.impactAsync(
      isUnlocked ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light
    );
    if (onPress) {
      onPress(achievement, isUnlocked);
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={handlePress}
      style={[styles.container, isUnlocked && styles.containerUnlocked]}
    >
      {isUnlocked ? (
        <LinearGradient
          colors={achievement.gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.iconCircleUnlocked}
        >
          <Text style={styles.badgeEmoji}>{achievement.badgeEmoji}</Text>
          <View style={styles.checkPill}>
            <Check size={10} color="#FFFFFF" strokeWidth={3} />
          </View>
        </LinearGradient>
      ) : (
        <View style={styles.iconCircleLocked}>
          <Text style={[styles.badgeEmoji, styles.emojiFaded]}>{achievement.badgeEmoji}</Text>
          <View style={styles.lockPill}>
            <Lock size={10} color="#94A3B8" strokeWidth={2.5} />
          </View>
        </View>
      )}

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text
            style={[styles.title, isUnlocked && styles.titleUnlocked]}
            numberOfLines={1}
          >
            {title}
          </Text>
          <Text style={[styles.progressRatio, isUnlocked && styles.progressRatioUnlocked]}>
            {isUnlocked ? (lang === 'tr' ? 'Açıldı' : 'Done') : `${progress.current}/${progress.target}`}
          </Text>
        </View>

        <Text style={styles.description} numberOfLines={2}>
          {desc}
        </Text>

        {/* Progress Bar */}
        <View style={styles.progressBarTrack}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${progress.percent}%`,
                backgroundColor: isUnlocked ? achievement.accentColor : '#64748B',
              },
            ]}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 20, 32, 0.85)',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    marginBottom: theme.spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 2,
  },
  containerUnlocked: {
    borderColor: 'rgba(124, 58, 237, 0.35)',
    backgroundColor: 'rgba(124, 58, 237, 0.12)',
    shadowOpacity: 0.35,
  },
  iconCircleUnlocked: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginRight: theme.spacing.md,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  iconCircleLocked: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginRight: theme.spacing.md,
  },
  badgeEmoji: {
    fontSize: 24,
  },
  emojiFaded: {
    opacity: 0.35,
  },
  checkPill: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#10B981',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#07090E',
  },
  lockPill: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#1E293B',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#07090E',
  },
  content: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  title: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
    color: '#E2E8F0',
    flex: 1,
    marginRight: theme.spacing.xs,
  },
  titleUnlocked: {
    color: '#FFFFFF',
    fontWeight: theme.typography.fontWeight.extrabold,
  },
  progressRatio: {
    fontSize: theme.typography.fontSize.xxs,
    fontWeight: theme.typography.fontWeight.bold,
    color: '#94A3B8',
  },
  progressRatioUnlocked: {
    color: '#C084FC',
  },
  description: {
    fontSize: theme.typography.fontSize.xs,
    color: '#94A3B8',
    lineHeight: 16,
    marginBottom: 6,
  },
  progressBarTrack: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
});
