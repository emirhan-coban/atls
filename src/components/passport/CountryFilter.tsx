import { View, Text, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
import { tPassportScreen } from '../../localization/screens/PassportScreen';
import { usePanelStyles } from './Panels.styles';
import type { PassportCtx } from './usePassportScreen';

/** Visited / lived / wishlist / all filter of the country list (it replaced the four stat tiles). */
export function CountryFilter({ ctx }: { ctx: PassportCtx }) {
  const { activeTab, countries, currentLang, livedCountries, setActiveTab, t, visitedCountries, wantCountries } = ctx;
  const styles = usePanelStyles();
  const chips = [
    { key: 'visited', label: `${t.visited} ${visitedCountries.length}` },
    { key: 'lived', label: `${t.livedIn || t.lived} ${livedCountries.length}` },
    { key: 'want', label: `${t.wishlist} ${wantCountries.length}` },
    { key: 'all', label: `${tPassportScreen('filter_all', currentLang)} ${countries.length}` },
  ];
  return (
    <View style={styles.filterRow}>
      {chips.map((chip) => {
        const active = activeTab === chip.key;
        return (
          <TouchableOpacity
            key={chip.key}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => {
              Haptics.selectionAsync();
              setActiveTab(chip.key);
            }}
            activeOpacity={0.7}
            style={[styles.filterChip, active && styles.filterChipActive]}
          >
            <Text style={[styles.filterChipText, active && styles.filterChipTextActive]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75}>
              {chip.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
