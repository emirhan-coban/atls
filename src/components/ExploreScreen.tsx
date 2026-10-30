import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Compass } from 'lucide-react-native';
import Chip from './ui/Chip';
import Heading from './ui/Heading';
import CountryBrowser from './CountryBrowser';
import RoutesExplorer from './RoutesExplorer';
import { makeStyles, useTheme } from '../theme/ThemeContext';
import { fonts } from '../theme/typography';
import { pt } from '../localization/profile';
import { rt } from '../localization/routes';
import { Country, Profile } from '../stores/types';
import { layout } from '../theme/spacing';

interface ExploreScreenProps {
  countries: Country[];
  profile?: Profile;
  onAddToWishlist: (country: any) => void;
  onMarkVisited?: (country: any) => void;
  t?: any;
  currentLang: 'tr' | 'en';
  onToggleLang?: () => void;
  onSelectCountry?: (countryId: string) => void;
}

/** Discover tab: routes (where to go this month, editorial guides) and the full country list with entry filters. */
function ExploreScreen({ countries, onAddToWishlist, currentLang, onSelectCountry }: ExploreScreenProps) {
  const { colors } = useTheme();
  const styles = useStyles();
  const [mode, setMode] = useState<'routes' | 'countries'>('routes');

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View style={styles.eyebrowRow}>
            <Compass size={14} color={colors.gold.base} />
            <Text style={styles.eyebrow}>{rt('eyebrow', currentLang)}</Text>
          </View>
          <Heading style={styles.title}>{rt('title', currentLang)}</Heading>
          <Text style={styles.subtitle}>{rt('subtitle', currentLang)}</Text>
        </View>

        <View style={styles.modeRow}>
          <Chip label={pt('exploreRoutes', currentLang)} selected={mode === 'routes'} onPress={() => setMode('routes')} />
          <Chip label={pt('exploreCountries', currentLang)} selected={mode === 'countries'} onPress={() => setMode('countries')} />
        </View>

        {mode === 'countries' && onSelectCountry ? (
          <CountryBrowser countries={countries} currentLang={currentLang} onSelectCountry={onSelectCountry} />
        ) : (
          <RoutesExplorer countries={countries} currentLang={currentLang} onAddToWishlist={onAddToWishlist} onSelectCountry={onSelectCountry} />
        )}
      </ScrollView>
    </View>
  );
}

const useStyles = makeStyles((colors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.canvas.base },
    scrollView: { flex: 1 },
    contentContainer: { paddingHorizontal: layout.screen, paddingTop: 8, paddingBottom: layout.tabBarClearance },
    header: { marginBottom: 14, gap: 4 },
    eyebrowRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    eyebrow: { fontSize: 11, fontWeight: '800', color: colors.gold.base, letterSpacing: 1.2 },
    title: { fontSize: 46, lineHeight: 50, color: colors.text.primary, fontFamily: fonts.display },
    subtitle: { fontSize: 14, lineHeight: 20, color: colors.text.secondary },
    modeRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  })
);

export default React.memo(ExploreScreen);
