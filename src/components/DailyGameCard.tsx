import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ChevronRight, HelpCircle } from 'lucide-react-native';
import { makeStyles, useTheme } from '../theme/ThemeContext';
import { fonts } from '../theme/typography';
import { dayKeyOf, liveStreak, puzzleNumber } from '../game/dailyCountry';
import { useGameStore } from '../stores/useGameStore';

interface DailyGameCardProps {
  currentLang: 'tr' | 'en';
  onPress: () => void;
}

/** Home entry to the daily game: an invitation, or today's result and the streak once it is played. */
export default function DailyGameCard({ currentLang, onPress }: DailyGameCardProps) {
  const { colors } = useTheme();
  const styles = useStyles();
  const tr = currentLang === 'tr';
  const today = dayKeyOf();
  const record = useGameStore((s) => s.days[today]);
  const stats = useGameStore((s) => s.stats);
  const streak = liveStreak(stats, today);

  const headline = record?.done
    ? record.won
      ? tr ? 'Bugünkü ülkeyi buldun ✓' : "Today's country found ✓"
      : tr ? 'Bugün olmadı, yarın yeni ülke' : 'Not today, new country tomorrow'
    : tr ? 'Bugünün gizli ülkesi hangisi?' : "What's today's secret country?";
  const sub = streak > 0
    ? tr ? `🔥 ${streak} günlük seri` : `🔥 ${streak}-day streak`
    : tr ? 'Her gün yeni bir ülke, 6 ipucu' : 'A new country every day, 6 clues';

  return (
    <TouchableOpacity
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      activeOpacity={0.85}
      style={styles.card}
      accessibilityRole="button"
      accessibilityLabel={headline}
    >
      <View style={styles.iconBox}>
        <HelpCircle size={22} color={colors.gold.base} />
      </View>
      <View style={styles.body}>
        <Text style={styles.eyebrow}>{(tr ? 'GİZLİ ÜLKE' : 'SECRET COUNTRY') + ` · #${puzzleNumber(today)}`}</Text>
        <Text style={styles.headline}>{headline}</Text>
        <Text style={styles.sub}>{sub}</Text>
      </View>
      <ChevronRight size={18} color={colors.text.muted} />
    </TouchableOpacity>
  );
}

const useStyles = makeStyles((colors) =>
  StyleSheet.create({
    card: {
      flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, borderRadius: 24,
      backgroundColor: colors.panel.base, borderWidth: 1, borderColor: colors.gold.border,
    },
    iconBox: {
      width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center',
      backgroundColor: colors.gold.tint, borderWidth: 1, borderColor: colors.gold.border,
    },
    body: { flex: 1, gap: 3 },
    eyebrow: { fontSize: 10, fontWeight: '800', letterSpacing: 1, color: colors.gold.base },
    headline: { fontSize: 18, color: colors.text.primary, fontFamily: fonts.display },
    sub: { fontSize: 12, color: colors.text.secondary },
  })
);
