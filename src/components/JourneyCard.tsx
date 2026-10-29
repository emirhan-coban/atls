import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { BookOpen, ChevronRight } from 'lucide-react-native';
import { makeStyles, useTheme } from '../theme/ThemeContext';
import { fonts } from '../theme/typography';
import { getLevelProgress } from '../data/levels';
import { jt } from '../localization/journey';
import { Country } from '../stores/types';

interface JourneyCardProps {
  countries: Country[];
  tripCount: number;
  currentLang: 'tr' | 'en';
  onPress: () => void;
}

/** Home-screen entry to the travel journal: level, progress to the next level and trip count. */
export default function JourneyCard({ countries, tripCount, currentLang, onPress }: JourneyCardProps) {
  const { colors } = useTheme();
  const styles = useStyles();
  const visited = useMemo(
    () => countries.filter((c) => c.status === 'visited' || c.status === 'lived').length,
    [countries]
  );
  const level = getLevelProgress(visited);

  return (
    <TouchableOpacity
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      activeOpacity={0.85}
      style={styles.card}
      accessibilityRole="button"
      accessibilityLabel={jt('openJournal', currentLang)}
    >
      <View style={styles.iconBox}>
        <BookOpen size={22} color={colors.gold.base} />
      </View>
      <View style={styles.body}>
        <Text style={styles.eyebrow}>
          {jt('level', currentLang)} {level.current.level} · {tripCount} {jt('trips', currentLang)}
        </Text>
        <Text style={styles.title}>{currentLang === 'tr' ? level.current.nameTr : level.current.nameEn}</Text>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${Math.round(level.fraction * 100)}%` }]} />
        </View>
        <Text style={styles.hint}>
          {level.next ? jt('levelRemaining', currentLang, { n: level.remaining }) : jt('journalCardCta', currentLang)}
        </Text>
      </View>
      <ChevronRight size={18} color={colors.text.muted} />
    </TouchableOpacity>
  );
}

const useStyles = makeStyles((colors) =>
  StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      padding: 16,
      borderRadius: 24,
      backgroundColor: colors.panel.base,
      borderWidth: 1,
      borderColor: colors.glass.hairline,
    },
    iconBox: {
      width: 48,
      height: 48,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.gold.tint,
      borderWidth: 1,
      borderColor: colors.gold.border,
    },
    body: { flex: 1, gap: 4 },
    eyebrow: { fontSize: 10, fontWeight: '800', letterSpacing: 1, color: colors.gold.base },
    title: { fontSize: 20, color: colors.text.primary, fontFamily: fonts.display },
    track: { height: 6, borderRadius: 3, backgroundColor: colors.glass.fillStrong, overflow: 'hidden' },
    fill: { height: '100%', borderRadius: 3, backgroundColor: colors.gold.base },
    hint: { fontSize: 12, fontWeight: '600', color: colors.text.secondary },
  })
);
