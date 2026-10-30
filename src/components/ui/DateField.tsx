import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { CalendarDays, ChevronDown, ChevronUp } from 'lucide-react-native';
import CalendarPicker from './CalendarPicker';
import { makeStyles, useTheme } from '../../theme/ThemeContext';
import { spacing } from '../../theme/spacing';
import { MONTHS } from '../../data/months';
import { parseDate } from '../../utils/planning';

interface DateFieldProps {
  /** 'YYYY-MM-DD' */
  value: string;
  onChange: (value: string) => void;
  lang: 'tr' | 'en';
  /** Earliest selectable day, 'YYYY-MM-DD'. */
  min?: string;
  minYear?: number;
  maxYear?: number;
}

export const formatLongDate = (value: string, lang: 'tr' | 'en') => {
  const p = parseDate(value);
  if (!p) return '';
  const month = MONTHS[p.m - 1];
  return `${p.d} ${lang === 'tr' ? month.longTr : month.longEn} ${p.y}`;
};

/** One row with the chosen date; tapping it opens a calendar below, choosing a day closes it again. */
export default function DateField({ value, onChange, lang, min, minYear, maxYear }: DateFieldProps) {
  const { colors } = useTheme();
  const styles = useStyles();
  const [open, setOpen] = useState(false);
  const Chevron = open ? ChevronUp : ChevronDown;

  return (
    <View style={styles.wrap}>
      <TouchableOpacity
        onPress={() => {
          Haptics.selectionAsync();
          setOpen((v) => !v);
        }}
        style={[styles.row, open && styles.rowOpen]}
        accessibilityRole="button"
        accessibilityLabel={formatLongDate(value, lang)}
        accessibilityState={{ expanded: open }}
      >
        <CalendarDays size={18} color={colors.gold.base} />
        <Text style={styles.value}>{formatLongDate(value, lang)}</Text>
        <Chevron size={18} color={colors.text.muted} />
      </TouchableOpacity>
      {open && (
        <View style={styles.panel}>
          <CalendarPicker
            value={value}
            lang={lang}
            min={min}
            minYear={minYear}
            maxYear={maxYear}
            onChange={(next) => {
              onChange(next);
              setOpen(false);
            }}
          />
        </View>
      )}
    </View>
  );
}

const useStyles = makeStyles((colors) =>
  StyleSheet.create({
    wrap: { gap: spacing.sm },
    row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, minHeight: 50, paddingHorizontal: spacing.lg, borderRadius: 16, backgroundColor: colors.glass.fill, borderWidth: 1, borderColor: colors.glass.hairline },
    rowOpen: { borderColor: colors.gold.border },
    value: { flex: 1, fontSize: 16, fontWeight: '700', color: colors.text.primary },
    panel: { padding: spacing.md, borderRadius: 18, backgroundColor: colors.panel.base, borderWidth: 1, borderColor: colors.glass.hairline },
  })
);
