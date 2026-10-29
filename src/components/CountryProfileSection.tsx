import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { makeStyles, useTheme } from '../theme/ThemeContext';
import {
  FACTS_META,
  formatArea,
  formatStay,
  getCountryFacts,
  listLanguages,
  visaGroup,
  visaLabel,
} from '../data/countryProfile';
import { pt } from '../localization/profile';

interface CountryProfileSectionProps {
  countryId: string;
  currentLang: 'tr' | 'en';
  /** Hide the entry requirements for the user's own country. */
  isHomeCountry?: boolean;
}

/** Facts grid and entry requirements (for a Turkish passport) shown in the country detail sheet. */
export default function CountryProfileSection({ countryId, currentLang, isHomeCountry }: CountryProfileSectionProps) {
  const { colors } = useTheme();
  const styles = useStyles();
  const facts = getCountryFacts(countryId);
  if (!facts) return null;

  const group = visaGroup(facts.visa.status);
  const visaColor =
    group === 'free' ? colors.status.lived.color : group === 'easy' ? colors.gold.base : group === 'required' ? colors.danger : colors.text.muted;
  const stay = formatStay(facts.visa.stay, currentLang);
  const showEntry = !isHomeCountry && facts.visa.status !== 'unknown';

  const rows: { label: string; value: string }[] = [
    { label: pt('capital', currentLang), value: facts.capital[currentLang] },
    { label: pt('language', currentLang), value: listLanguages(facts, currentLang) },
    {
      label: pt('currency', currentLang),
      value: facts.currency ? `${facts.currency[currentLang === 'tr' ? 'nameTr' : 'nameEn']} (${facts.currency.symbol})` : '—',
    },
    { label: pt('callingCode', currentLang), value: facts.callingCode ?? '—' },
    { label: pt('driving', currentLang), value: facts.drivesOn === 'left' ? pt('drivesLeft', currentLang) : pt('drivesRight', currentLang) },
    { label: pt('area', currentLang), value: formatArea(facts.areaKm2, currentLang) },
  ];

  return (
    <View style={styles.wrap}>
      {showEntry && (
        <View style={styles.card}>
          <Text style={styles.label}>{pt('entry', currentLang)}</Text>
          <Text style={styles.sub}>{pt('forPassport', currentLang)}</Text>
          <View style={[styles.visaPill, { borderColor: visaColor }]}>
            <View style={[styles.dot, { backgroundColor: visaColor }]} />
            <Text style={[styles.visaText, { color: visaColor }]}>{visaLabel(facts.visa.status, currentLang)}</Text>
          </View>
          {stay && (
            <Text style={styles.line}>
              {pt('stay', currentLang)}: <Text style={styles.strong}>{stay}</Text>
            </Text>
          )}
          {(facts.schengen || facts.eu) && (
            <Text style={styles.line}>
              {[facts.schengen ? pt('schengen', currentLang) : null, facts.eu ? pt('eu', currentLang) : null].filter(Boolean).join(' · ')}
            </Text>
          )}
          {facts.schengen && <Text style={styles.note}>{pt('schengenNote', currentLang)}</Text>}
          <Text style={styles.note}>
            {pt('disclaimer', currentLang, { date: FACTS_META.generatedAt, source: pt('source', currentLang) })}
          </Text>
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.label}>{pt('facts', currentLang)}</Text>
        {rows.map((row) => (
          <View key={row.label} style={styles.row}>
            <Text style={styles.rowLabel}>{row.label}</Text>
            <Text style={styles.rowValue}>{row.value}</Text>
          </View>
        ))}
        {facts.landlocked && <Text style={styles.note}>{pt('landlocked', currentLang)}</Text>}
      </View>
    </View>
  );
}

const useStyles = makeStyles((colors) =>
  StyleSheet.create({
    wrap: { gap: 12, marginBottom: 16 },
    card: {
      padding: 16,
      borderRadius: 20,
      gap: 8,
      backgroundColor: colors.glass.fill,
      borderWidth: 1,
      borderColor: colors.glass.hairline,
    },
    label: { fontSize: 11, fontWeight: '800', letterSpacing: 1, color: colors.text.secondary },
    sub: { fontSize: 13, fontWeight: '600', color: colors.text.secondary },
    visaPill: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      gap: 8,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 16,
      borderWidth: 1.5,
    },
    dot: { width: 8, height: 8, borderRadius: 4 },
    visaText: { fontSize: 15, fontWeight: '800' },
    line: { fontSize: 14, fontWeight: '500', color: colors.text.soft },
    strong: { fontWeight: '800', color: colors.text.primary },
    note: { fontSize: 11, lineHeight: 16, color: colors.text.muted },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: 16,
      paddingVertical: 4,
    },
    rowLabel: { fontSize: 13, fontWeight: '600', color: colors.text.secondary },
    rowValue: { flex: 1, textAlign: 'right', fontSize: 14, fontWeight: '700', color: colors.text.primary },
  })
);
