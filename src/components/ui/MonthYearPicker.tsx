import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { makeStyles, useTheme } from '../../theme/ThemeContext';
import { spacing } from '../../theme/spacing';
import { MONTHS } from '../../data/months';

interface MonthYearPickerProps {
  year: number;
  /** 'MM', or null when no month is chosen. */
  month: string | null;
  onChange: (next: { year: number; month: string | null }) => void;
  lang: 'tr' | 'en';
  minYear?: number;
  maxYear?: number;
  /** Months after the current one cannot be chosen in the current year (for trips that already happened). */
  noFuture?: boolean;
  /** Tapping the chosen month clears it (the month is optional). */
  optionalMonth?: boolean;
}

/** Year with arrows above a 4 x 3 grid of months. Every month is one tap, nothing to scroll. */
export default function MonthYearPicker({
  year,
  month,
  onChange,
  lang,
  minYear = 1950,
  maxYear = new Date().getFullYear(),
  noFuture = false,
  optionalMonth = false,
}: MonthYearPickerProps) {
  const { colors } = useTheme();
  const styles = useStyles();
  const now = new Date();
  const futureFrom = noFuture && year === now.getFullYear() ? now.getMonth() + 2 : 13;

  const setYear = (y: number) => {
    Haptics.selectionAsync();
    const clamped = Math.min(maxYear, Math.max(minYear, y));
    const monthStillValid = noFuture && clamped === now.getFullYear() && month && Number(month) > now.getMonth() + 1;
    onChange({ year: clamped, month: monthStillValid ? null : month });
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.yearRow}>
        <TouchableOpacity onPress={() => setYear(year - 1)} disabled={year <= minYear} style={[styles.arrow, year <= minYear && styles.disabled]} accessibilityRole="button" accessibilityLabel="Previous year">
          <ChevronLeft size={20} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.year}>{year}</Text>
        <TouchableOpacity onPress={() => setYear(year + 1)} disabled={year >= maxYear} style={[styles.arrow, year >= maxYear && styles.disabled]} accessibilityRole="button" accessibilityLabel="Next year">
          <ChevronRight size={20} color={colors.text.primary} />
        </TouchableOpacity>
      </View>
      <View style={styles.grid}>
        {MONTHS.map((m, index) => {
          const selected = month === m.id;
          const blocked = index + 1 >= futureFrom;
          return (
            <View key={m.id} style={styles.cell}>
              <TouchableOpacity
                disabled={blocked}
                onPress={() => {
                  Haptics.selectionAsync();
                  onChange({ year, month: selected && optionalMonth ? null : m.id });
                }}
                style={[styles.month, selected && styles.monthSelected, blocked && styles.disabled]}
                accessibilityRole="button"
                accessibilityState={{ selected, disabled: blocked }}
                accessibilityLabel={lang === 'tr' ? m.longTr : m.longEn}
              >
                <Text style={[styles.monthText, selected && styles.monthTextSelected]}>{lang === 'tr' ? m.shortTr : m.shortEn}</Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const useStyles = makeStyles((colors) =>
  StyleSheet.create({
    wrap: { gap: spacing.md },
    yearRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    arrow: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.glass.fillStrong },
    year: { fontSize: 28, fontWeight: '800', color: colors.text.primary, fontVariant: ['tabular-nums'] },
    grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -spacing.xs },
    cell: { width: '25%', padding: spacing.xs },
    month: { height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.glass.fill, borderWidth: 1, borderColor: colors.glass.hairline },
    monthSelected: { backgroundColor: colors.gold.base, borderColor: colors.gold.base },
    monthText: { fontSize: 15, fontWeight: '700', color: colors.text.primary },
    monthTextSelected: { color: colors.gold.onGold },
    disabled: { opacity: 0.35 },
  })
);
