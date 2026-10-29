import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { makeStyles } from '../theme/ThemeContext';
import { Achievement } from '../data/achievements';
import { jt } from '../localization/journey';

interface AchievementToastProps {
  achievement: Achievement | null;
  currentLang: 'tr' | 'en';
  onHide: () => void;
}

/** Slide-down banner shown when a badge is unlocked; hides itself after a few seconds. */
export default function AchievementToast({ achievement, currentLang, onHide }: AchievementToastProps) {
  const styles = useStyles();

  useEffect(() => {
    if (!achievement) return;
    const timer = setTimeout(onHide, 3800);
    return () => clearTimeout(timer);
  }, [achievement, onHide]);

  if (!achievement) return null;

  return (
    <SafeAreaView pointerEvents="none" edges={['top']} style={styles.wrap}>
      <Animated.View entering={FadeInUp.duration(350)} exiting={FadeOutUp.duration(250)} style={styles.toast}>
        <Text style={styles.emoji}>{achievement.badgeEmoji}</Text>
        <View style={styles.text}>
          <Text style={styles.eyebrow}>{jt('newBadge', currentLang)}</Text>
          <Text style={styles.title}>{currentLang === 'tr' ? achievement.titleTr : achievement.titleEn}</Text>
          <Text style={styles.desc} numberOfLines={1}>
            {currentLang === 'tr' ? achievement.descTr : achievement.descEn}
          </Text>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const useStyles = makeStyles((colors) =>
  StyleSheet.create({
    wrap: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 200, paddingHorizontal: 16 },
    toast: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      padding: 14,
      marginTop: 8,
      borderRadius: 22,
      backgroundColor: colors.canvas.elevated,
      borderWidth: 1,
      borderColor: colors.gold.border,
      shadowColor: colors.black,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 8,
    },
    emoji: { fontSize: 34 },
    text: { flex: 1 },
    eyebrow: { fontSize: 10, fontWeight: '800', letterSpacing: 1, color: colors.gold.base },
    title: { fontSize: 16, fontWeight: '800', color: colors.text.primary },
    desc: { fontSize: 12, color: colors.text.secondary },
  })
);
