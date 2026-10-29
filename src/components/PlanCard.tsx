import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { CalendarClock, ChevronRight } from 'lucide-react-native';
import { makeStyles, useTheme } from '../theme/ThemeContext';
import { fonts } from '../theme/typography';
import { availableCatalog, getLocalizedCountryName } from '../data/travelData';
import { lt } from '../localization/planner';
import { daysUntil, nextPlan, planPhase } from '../utils/planning';
import { usePlanStore } from '../stores/usePlanStore';

interface PlanCardProps {
  currentLang: 'tr' | 'en';
  onPress: () => void;
}

/** Home entry to the planner: countdown to the next trip, or an invitation to plan one. */
export default function PlanCard({ currentLang, onPress }: PlanCardProps) {
  const { colors } = useTheme();
  const styles = useStyles();
  const plans = usePlanStore((s) => s.plans);
  const next = nextPlan(plans);
  const country = next ? availableCatalog.find((c: any) => c.id.toUpperCase() === next.countryId.toUpperCase()) : null;

  let headline = lt('planCardCta', currentLang);
  let eyebrow = lt('planCardTitle', currentLang).toUpperCase();
  if (next && country) {
    const phase = planPhase(next);
    const days = daysUntil(next.startDate) ?? 0;
    eyebrow = `${country.flag} ${getLocalizedCountryName(country, currentLang)}`.toUpperCase();
    headline =
      phase === 'ongoing'
        ? lt('ongoing', currentLang)
        : days === 0
          ? lt('today', currentLang)
          : days === 1
            ? lt('oneDayLeft', currentLang)
            : lt('daysLeft', currentLang, { n: days });
  }

  return (
    <TouchableOpacity
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      activeOpacity={0.85}
      style={styles.card}
      accessibilityRole="button"
      accessibilityLabel={lt('title', currentLang)}
    >
      <View style={styles.iconBox}>
        <CalendarClock size={22} color={colors.gold.base} />
      </View>
      <View style={styles.body}>
        <Text style={styles.eyebrow}>{eyebrow}</Text>
        <Text style={next ? styles.countdown : styles.cta}>{headline}</Text>
      </View>
      <ChevronRight size={18} color={colors.text.muted} />
    </TouchableOpacity>
  );
}

const useStyles = makeStyles((colors) =>
  StyleSheet.create({
    card: {
      flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, borderRadius: 24,
      backgroundColor: colors.panel.base, borderWidth: 1, borderColor: colors.glass.hairline,
    },
    iconBox: {
      width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center',
      backgroundColor: colors.gold.tint, borderWidth: 1, borderColor: colors.gold.border,
    },
    body: { flex: 1, gap: 4 },
    eyebrow: { fontSize: 10, fontWeight: '800', letterSpacing: 1, color: colors.gold.base },
    countdown: { fontSize: 22, color: colors.text.primary, fontFamily: fonts.display },
    cta: { fontSize: 14, fontWeight: '700', color: colors.text.primary },
  })
);
