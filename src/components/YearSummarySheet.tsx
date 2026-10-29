import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as Haptics from 'expo-haptics';
import { Share2 } from 'lucide-react-native';
import Sheet from './ui/Sheet';
import Button from './ui/Button';
import Chip from './ui/Chip';
import { makeStyles } from '../theme/ThemeContext';
import { fonts } from '../theme/typography';
import { availableCatalog, getLocalizedCountryName } from '../data/travelData';
import { jt } from '../localization/journey';
import { computeYearSummary, yearsWithTrips } from '../utils/stats';
import { Trip } from '../stores/types';

interface YearSummarySheetProps {
  visible: boolean;
  onClose: () => void;
  trips: Trip[];
  currentLang: 'tr' | 'en';
}

// The share card is always dark and uses fixed colours so the picture looks the same in either app theme
const CARD = { top: '#131B2E', bottom: '#06080E', gold: '#E5A93C', goldLight: '#F3C766', text: '#FFFFFF', muted: '#94A3B8' };

const catalogEntry = (id: string) => availableCatalog.find((c: any) => c.id.toUpperCase() === id.toUpperCase());

export default function YearSummarySheet({ visible, onClose, trips, currentLang }: YearSummarySheetProps) {
  const styles = useStyles();
  const years = useMemo(() => yearsWithTrips(trips), [trips]);
  const [year, setYear] = useState<string | null>(null);
  const cardRef = useRef<View>(null);

  useEffect(() => {
    if (visible) setYear(years[0] ?? null);
  }, [visible, years]);

  const summary = useMemo(() => (year ? computeYearSummary(trips, year) : null), [trips, year]);

  const handleShare = async () => {
    try {
      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert(jt('shareFailed', currentLang));
        return;
      }
      const uri = await captureRef(cardRef, { format: 'png', quality: 1 });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: `atls. ${year}` });
    } catch (err) {
      console.warn('[YearSummary] share failed:', err);
      Alert.alert(jt('shareFailed', currentLang));
    }
  };

  const flagIds = summary ? (summary.newCountryIds.length > 0 ? summary.newCountryIds : summary.countryIds).slice(0, 12) : [];
  const top = summary?.topCountryId ? catalogEntry(summary.topCountryId) : null;

  return (
    <Sheet visible={visible} onClose={onClose} maxHeight="94%">
      <Text style={styles.title}>{jt('shareYear', currentLang)}</Text>
      <ScrollView showsVerticalScrollIndicator={false}>
        {years.length > 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.years}>
            {years.map((y) => (
              <Chip key={y} label={y} selected={y === year} onPress={() => setYear(y)} />
            ))}
          </ScrollView>
        )}

        {summary && (
          <View ref={cardRef} collapsable={false} style={styles.cardShadow}>
            <LinearGradient colors={[CARD.top, CARD.bottom]} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.logo}>
                  atls<Text style={{ color: CARD.gold }}>.</Text>
                </Text>
                <Text style={styles.cardEyebrow}>
                  {jt('yearInReview', currentLang)} {summary.year}
                </Text>
              </View>

              <View style={styles.hero}>
                <Text style={styles.heroNumber}>{summary.newCountryIds.length}</Text>
                <Text style={styles.heroLabel}>{jt('newCountries', currentLang).toUpperCase()}</Text>
              </View>

              <View style={styles.flagRow}>
                {flagIds.map((id) => (
                  <Text key={id} style={styles.flag}>
                    {catalogEntry(id)?.flag ?? '🌍'}
                  </Text>
                ))}
              </View>

              <View style={styles.trio}>
                <View style={styles.trioItem}>
                  <Text style={styles.trioValue}>{summary.countryIds.length}</Text>
                  <Text style={styles.trioLabel}>{jt('countries', currentLang).toUpperCase()}</Text>
                </View>
                <View style={styles.trioItem}>
                  <Text style={styles.trioValue}>{summary.tripCount}</Text>
                  <Text style={styles.trioLabel}>{jt('trips', currentLang).toUpperCase()}</Text>
                </View>
                <View style={styles.trioItem}>
                  <Text style={styles.trioValue}>{summary.days > 0 ? summary.days : '—'}</Text>
                  <Text style={styles.trioLabel}>{jt('daysUnit', currentLang).toUpperCase()}</Text>
                </View>
              </View>

              {top && (
                <Text style={styles.topLine}>
                  {top.flag} {getLocalizedCountryName(top, currentLang)}
                </Text>
              )}
            </LinearGradient>
          </View>
        )}

        <Button
          label={jt('shareCard', currentLang)}
          onPress={handleShare}
          disabled={!summary}
          icon={(color) => <Share2 size={17} color={color} />}
          style={styles.shareBtn}
        />
      </ScrollView>
    </Sheet>
  );
}

const useStyles = makeStyles((colors) =>
  StyleSheet.create({
    title: { fontSize: 30, color: colors.text.primary, fontFamily: fonts.display, marginBottom: 14 },
    years: { gap: 8, paddingBottom: 14 },
    cardShadow: { borderRadius: 28, alignSelf: 'center', width: '100%' },
    card: { borderRadius: 28, padding: 22, minHeight: 420, justifyContent: 'space-between', overflow: 'hidden' },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    logo: { fontSize: 32, color: CARD.text, fontFamily: fonts.displayHeavy },
    cardEyebrow: { fontSize: 11, fontWeight: '800', letterSpacing: 1.2, color: CARD.goldLight },
    hero: { alignItems: 'center', marginTop: 10 },
    heroNumber: { fontSize: 120, color: CARD.gold, fontFamily: fonts.displayHeavy, lineHeight: 130 },
    heroLabel: { fontSize: 13, fontWeight: '800', letterSpacing: 2, color: CARD.muted },
    flagRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6, marginVertical: 12 },
    flag: { fontSize: 28 },
    trio: { flexDirection: 'row', justifyContent: 'space-around', paddingTop: 14, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.14)' },
    trioItem: { alignItems: 'center' },
    trioValue: { fontSize: 35, color: CARD.text, fontFamily: fonts.display },
    trioLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 1, color: CARD.muted, marginTop: 2 },
    topLine: { textAlign: 'center', fontSize: 14, fontWeight: '700', color: CARD.goldLight, marginTop: 12 },
    shareBtn: { marginTop: 18, marginBottom: 8 },
  })
);
