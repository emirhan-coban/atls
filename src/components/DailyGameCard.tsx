import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ChevronRight, HelpCircle } from 'lucide-react-native';
import { makeStyles, useTheme } from '../theme/ThemeContext';
import { fonts } from '../theme/typography';
import { dayKeyOf, liveStreak, puzzleNumber } from '../game/dailyCountry';
import { bonusUnlocked, puzzlesDone } from '../game/modes';
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
  const flag = useGameStore((s) => s.modeDays.flag[today]);
  const shape = useGameStore((s) => s.modeDays.shape[today]);
  const streak = liveStreak(stats, today);
  // the extra puzzles are mentioned only once the player has finished a classic one
  const unlocked = bonusUnlocked(stats);
  const doneCount = puzzlesDone(record, flag, shape);
  const allDone = unlocked && doneCount === 3;

  const headline = allDone
    ? gt('card_all_done', currentLang)
    : record?.done
      ? record.won
        ? gt('card_win', currentLang)
        : gt('card_loss', currentLang)
      : gt('card_invite', currentLang);
  const base = streak > 0 ? gt('card_streak', currentLang, { n: streak }) : gt('card_pitch', currentLang);
  const waiting = unlocked && record?.done && !allDone ? gt('card_bonus_waiting', currentLang, { n: 3 - doneCount }) : '';
  const sub = waiting ? `${base} · ${waiting}` : base;
  const tally = unlocked ? gt('card_tally', currentLang, { n: doneCount }) : '';

  return (
    <TouchableOpacity
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      activeOpacity={0.85}
      style={styles.card}
      accessibilityRole="button"
      accessibilityLabel={tally ? `${headline}. ${tally}` : headline}
    >
      <View style={styles.iconBox}>
        <HelpCircle size={22} color={colors.gold.base} />
      </View>
      <View style={styles.body}>
        <Text style={styles.eyebrow}>{`${gt('eyebrow', currentLang)} · #${puzzleNumber(today)}`}</Text>
        <Text style={styles.headline}>{headline}</Text>
        <Text style={styles.sub}>{sub}</Text>
        {unlocked ? (
          <View style={styles.dots}>
            {[0, 1, 2].map((i) => (
              <View key={i} style={[styles.dot, i < doneCount && styles.dotOn]} />
            ))}
          </View>
        ) : null}
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
    dots: { flexDirection: 'row', gap: 5, marginTop: 5 },
    dot: { width: 22, height: 6, borderRadius: 3, backgroundColor: colors.glass.fillActive },
    dotOn: { backgroundColor: colors.status.visited.bright },
  })
);
