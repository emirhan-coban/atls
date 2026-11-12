import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ChevronRight, HelpCircle } from 'lucide-react-native';
import { makeStyles, useTheme } from '../theme/ThemeContext';
import { fonts } from '../theme/typography';
import { dayKeyOf, liveStreak, puzzleNumber } from '../game/dailyCountry';
import { useGameStore } from '../stores/useGameStore';

import { gt } from '../localization/game';
interface DailyGameCardProps {
  currentLang: 'tr' | 'en';
  onPress: () => void;
}

/** Home entry to the daily game: an invitation, or today's result and the streak once it is played. */
export default function DailyGameCard({ currentLang, onPress }: DailyGameCardProps) {
  const { colors } = useTheme();
  const styles = useStyles();
  const today = dayKeyOf();
  const record = useGameStore((s) => s.days[today]);
  const stats = useGameStore((s) => s.stats);
  const streak = liveStreak(stats, today);

  const headline = record?.done
    ? record.won
      ? gt('card_win', currentLang)
      : gt('card_loss', currentLang)
    : gt('card_invite', currentLang);
  const sub = streak > 0 ? gt('card_streak', currentLang, { n: streak }) : gt('card_pitch', currentLang);

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
        <Text style={styles.eyebrow}>{`${gt('eyebrow', currentLang)} · #${puzzleNumber(today)}`}</Text>
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
