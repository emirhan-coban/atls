import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Minus, Plus } from 'lucide-react-native';
import Chip from './Chip';
import { makeStyles, useTheme } from '../../theme/ThemeContext';
import { MONTHS } from '../../data/months';
import { daysInMonth, formatDateKey, parseDate } from '../../utils/planning';
import { lt } from '../../localization/planner';

interface DateFieldProps {
  /** 'YYYY-MM-DD' */
  value: string;
  onChange: (value: string) => void;
  lang: 'tr' | 'en';
  minYear?: number;
  maxYear?: number;
}

/** Date input without a native picker: year and day steppers plus month chips. Day is clamped to the month's length. */
export default function DateField({ value, onChange, lang, minYear = 2000, maxYear = new Date().getFullYear() + 10 }: DateFieldProps) {
  const { colors } = useTheme();
  const styles = useStyles();
  const parts = parseDate(value) ?? { y: new Date().getFullYear(), m: new Date().getMonth() + 1, d: new Date().getDate() };

  const set = (y: number, m: number, d: number) => {
    const year = Math.min(maxYear, Math.max(minYear, y));
    const day = Math.min(d, daysInMonth(year, m));
    onChange(formatDateKey(year, m, day));
  };

  const stepper = (label: string, text: string, onMinus: () => void, onPlus: () => void) => (
    <View style={styles.stepper}>
      <Text style={styles.stepLabel}>{label}</Text>
      <View style={styles.stepRow}>
        <TouchableOpacity onPress={() => { Haptics.selectionAsync(); onMinus(); }} style={styles.stepBtn} accessibilityRole="button" accessibilityLabel={`${label} -`}>
          <Minus size={15} color={colors.text.secondary} />
        </TouchableOpacity>
        <Text style={styles.stepValue}>{text}</Text>
        <TouchableOpacity onPress={() => { Haptics.selectionAsync(); onPlus(); }} style={styles.stepBtn} accessibilityRole="button" accessibilityLabel={`${label} +`}>
          <Plus size={15} color={colors.text.secondary} />
        </TouchableOpacity>
      </View>
    </View>
  );

  // wrap around at month ends so the user can step through a whole month with one control
  const stepDay = (delta: number) => {
    const max = daysInMonth(parts.y, parts.m);
    const next = parts.d + delta;
    set(parts.y, parts.m, next < 1 ? max : next > max ? 1 : next);
  };

  return (
    <View>
      <View style={styles.row}>
        {stepper(lt('year', lang), String(parts.y), () => set(parts.y - 1, parts.m, parts.d), () => set(parts.y + 1, parts.m, parts.d))}
        {stepper(lt('day', lang), String(parts.d), () => stepDay(-1), () => stepDay(1))}
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.months}>
        {MONTHS.map((m, index) => (
          <Chip
            key={m.id}
            label={lang === 'tr' ? m.shortTr : m.shortEn}
            selected={parts.m === index + 1}
            onPress={() => set(parts.y, index + 1, parts.d)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const useStyles = makeStyles((colors) =>
  StyleSheet.create({
    row: { flexDirection: 'row', gap: 16, marginBottom: 10 },
    stepper: { flex: 1 },
    stepLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 1, color: colors.text.muted, marginBottom: 6 },
    stepRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    stepBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.glass.fillStrong },
    stepValue: { fontSize: 20, fontWeight: '800', color: colors.text.primary, minWidth: 54, textAlign: 'center' },
    months: { gap: 8 },
  })
);
