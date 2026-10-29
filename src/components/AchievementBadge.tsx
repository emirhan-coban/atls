import { makeStyles, useTheme } from '../theme/ThemeContext';
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Lock } from 'lucide-react-native';
import { Achievement } from '../data/achievements';
import { Country, Profile, Trip } from '../stores/types';
import { theme } from '../theme';

interface AchievementBadgeProps {
  achievement: Achievement;
  countries: Country[];
  profile?: Profile;
  trips?: Trip[];
  lang: 'tr' | 'en';
  onPress?: (achievement: Achievement, unlocked: boolean) => void;
}

export default function AchievementBadge({
  achievement,
  countries,
  profile,
  trips,
  lang,
  onPress,
}: AchievementBadgeProps) {
  const { colors } = useTheme();
  const styles = useStyles();
  const isUnlocked = achievement.isUnlocked(countries, profile, trips);
  const progress = achievement.getProgress(countries, profile, trips);

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
        </LinearGradient>
      ) : (
        <View style={styles.iconCircleLocked}>
          <Text style={[styles.badgeEmoji, styles.emojiFaded]}>{achievement.badgeEmoji}</Text>
          <View style={styles.lockPill}>
            <Lock size={10} color={colors.text.secondary} strokeWidth={2.5} />
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
                backgroundColor: isUnlocked ? achievement.accentColor : colors.text.muted,
              },
            ]}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const useStyles = makeStyles((colors) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.panel.base,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: colors.glass.hairline,
    marginBottom: theme.spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 2,
  },
  containerUnlocked: {
    borderColor: colors.gold.border,
    backgroundColor: colors.gold.tint,
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
    shadowColor: colors.gold.base,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  iconCircleLocked: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.glass.borderSoft,
    borderWidth: 1,
    borderColor: colors.glass.hairline,
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
  lockPill: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: colors.canvas.elevated,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.canvas.raised,
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
    color: colors.text.soft,
    flex: 1,
    marginRight: theme.spacing.xs,
  },
  titleUnlocked: {
    color: colors.text.primary,
    fontWeight: theme.typography.fontWeight.extrabold,
  },
  progressRatio: {
    fontSize: theme.typography.fontSize.xxs,
    fontWeight: theme.typography.fontWeight.bold,
    color: colors.text.secondary,
  },
  progressRatioUnlocked: {
    color: colors.gold.light,
  },
  description: {
    fontSize: theme.typography.fontSize.xs,
    color: colors.text.secondary,
    lineHeight: 16,
    marginBottom: 6,
  },
  progressBarTrack: {
    height: 4,
    backgroundColor: colors.glass.fillStrong,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
}));
