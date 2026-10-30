import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import MonthYearPicker from './MonthYearPicker';
import { makeStyles, useTheme } from '../../theme/ThemeContext';
import { spacing } from '../../theme/spacing';
import { MONTHS } from '../../data/months';
import { daysInMonth, firstWeekdayOffset, formatDateKey, parseDate, toDateKey } from '../../utils/planning';

interface CalendarPickerProps {
  /** 'YYYY-MM-DD' */
  value: string;
  onChange: (value: string) => void;
  lang: 'tr' | 'en';
  /** Earliest selectable day, 'YYYY-MM-DD'. */
  min?: string;
  minYear?: number;
  maxYear?: number;
}

const WEEKDAYS = { tr: ['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz'], en: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'] };

/** Month grid of days, Monday first. The title opens a month/year chooser for long jumps. */
export default function CalendarPicker({ value, onChange, lang, min, minYear = 2000, maxYear = new Date().getFullYear() + 10 }: CalendarPickerProps) {
  const { colors } = useTheme();
  const styles = useStyles();
  const today = toDateKey(new Date());
  const selected = parseDate(value) ?? parseDate(today)!;
  const [view, setView] = useState({ y: selected.y, m: selected.m });
  const [jumping, setJumping] = useState(false);

  const shift = (delta: number) => {
    Haptics.selectionAsync();
    const index = view.y * 12 + (view.m - 1) + delta;
    const y = Math.floor(index / 12);
    if (y < minYear || y > maxYear) return;
    setView({ y, m: (index % 12) + 1 });
  };

  const monthName = (lang === 'tr' ? MONTHS[view.m - 1].longTr : MONTHS[view.m - 1].longEn);
  const offset = firstWeekdayOffset(view.y, view.m);
  const total = daysInMonth(view.y, view.m);
  const cells: (number | null)[] = [...Array(offset).fill(null), ...Array.from({ length: total }, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        {jumping ? (
          <View style={styles.spacer} />
        ) : (
          <TouchableOpacity onPress={() => shift(-1)} style={styles.arrow} accessibilityRole="button" accessibilityLabel="Previous month">
            <ChevronLeft size={20} color={colors.text.primary} />
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={() => setJumping((v) => !v)} style={styles.titleBtn} accessibilityRole="button" accessibilityLabel={`${monthName} ${view.y}`}>
          <Text style={styles.title}>{monthName} {view.y}</Text>
        </TouchableOpacity>
        {jumping ? (
          <View style={styles.spacer} />
        ) : (
          <TouchableOpacity onPress={() => shift(1)} style={styles.arrow} accessibilityRole="button" accessibilityLabel="Next month">
            <ChevronRight size={20} color={colors.text.primary} />
          </TouchableOpacity>
        )}
      </View>

      {jumping ? (
        <MonthYearPicker
          year={view.y}
          month={String(view.m).padStart(2, '0')}
          lang={lang}
          minYear={minYear}
          maxYear={maxYear}
          onChange={({ year, month }) => {
            setView({ y: year, m: Number(month ?? view.m) });
            // A year arrow changes the year, a month tap does not: only a month tap closes the chooser,
            // so the year can be stepped several times in a row.
            if (month && year === view.y) setJumping(false);
          }}
        />
      ) : (
        <>
          <View style={styles.row}>
            {WEEKDAYS[lang].map((d) => (
              <View key={d} style={styles.cell}>
                <Text style={styles.weekday}>{d}</Text>
              </View>
            ))}
          </View>
          <View style={styles.row}>
            {cells.map((day, i) => {
              if (day === null) return <View key={`e${i}`} style={styles.cell} />;
              const key = formatDateKey(view.y, view.m, day);
              const disabled = Boolean(min && key < min);
              const isSelected = key === value;
              const isToday = key === today;
              return (
                <View key={key} style={styles.cell}>
                  <TouchableOpacity
                    disabled={disabled}
                    onPress={() => {
                      Haptics.selectionAsync();
                      onChange(key);
                    }}
                    style={[styles.day, isSelected && styles.daySelected, isToday && !isSelected && styles.dayToday, disabled && styles.disabled]}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected, disabled }}
                    accessibilityLabel={`${day} ${monthName} ${view.y}`}
                  >
                    <Text style={[styles.dayText, isSelected && styles.dayTextSelected]}>{day}</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        </>
      )}
    </View>
  );
}

const useStyles = makeStyles((colors) =>
  StyleSheet.create({
    wrap: { gap: spacing.md },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    arrow: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.glass.fillStrong },
    spacer: { width: 44, height: 44 },
    titleBtn: { flex: 1, alignItems: 'center', paddingVertical: spacing.sm },
    title: { fontSize: 19, fontWeight: '800', color: colors.text.primary },
    row: { flexDirection: 'row', flexWrap: 'wrap' },
    cell: { width: `${100 / 7}%`, alignItems: 'center', paddingVertical: 2 },
    weekday: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5, color: colors.text.muted, paddingVertical: spacing.xs },
    day: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', maxWidth: '100%' },
    daySelected: { backgroundColor: colors.gold.base },
    dayToday: { borderWidth: 1.5, borderColor: colors.gold.base },
    dayText: { fontSize: 16, fontWeight: '600', color: colors.text.primary, fontVariant: ['tabular-nums'] },
    dayTextSelected: { color: colors.gold.onGold, fontWeight: '800' },
    disabled: { opacity: 0.3 },
  })
);
