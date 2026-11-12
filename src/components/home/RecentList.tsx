import { View, Text, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Plus, ChevronRight, Compass } from 'lucide-react-native';
import { getLocalizedCountryName, formatCountryDate } from '../../data/travelData';
import { tHomeScreen } from '../../localization/screens/HomeScreen';
import type { HomeCtx } from './useHomeScreen';

export function RecentList({ ctx }: { ctx: HomeCtx }) {
  const { colors, currentLang, onOpenAddModal, onSelectCountry, recent, styles, t } = ctx;
  return (
    <>{recent.length === 0 ? (
        <TouchableOpacity
          onPress={onOpenAddModal}
          activeOpacity={0.8}
          style={styles.emptyRecentCard}
        >
          <View style={styles.emptyRecentLeft}>
            <View style={styles.emptyCompassBox}>
              <Compass size={20} color={colors.gold.base} strokeWidth={2} />
            </View>
            <Text style={styles.emptyRecentText}>{t.emptyMapHint}</Text>
          </View>
          <View style={styles.emptyRecentAddBtn}>
            <Plus size={15} color={colors.canvas.raised} strokeWidth={2.5} />
          </View>
        </TouchableOpacity>
      ) : (
        <View style={styles.recentList}>
          {recent.map((c) => {
            const when = formatCountryDate(c, currentLang) || c.year || c.visitedYear || '';
            const dot = c.status === 'lived' ? colors.status.lived.color : colors.status.visited.color;
            return (
              <TouchableOpacity
                key={c.id}
                style={styles.recentRow}
                activeOpacity={0.7}
                onPress={() => {
                  Haptics.selectionAsync();
                  if (onSelectCountry) onSelectCountry(c.id);
                }}
                accessibilityRole="button"
                accessibilityLabel={getLocalizedCountryName(c, currentLang)}
              >
                <Text style={styles.recentFlag}>{c.flag}</Text>
                <View style={styles.recentBody}>
                  <Text style={styles.recentName} numberOfLines={1}>{getLocalizedCountryName(c, currentLang)}</Text>
                  <View style={styles.recentMeta}>
                    <View style={[styles.recentDot, { backgroundColor: dot }]} />
                    <Text style={styles.recentDate} numberOfLines={1}>
                      {[c.status === 'lived' ? (tHomeScreen('lived_3', currentLang)) : (tHomeScreen('visited_3', currentLang)), when].filter(Boolean).join(' · ')}
                    </Text>
                  </View>
                </View>
                <ChevronRight size={16} color={colors.text.muted} />
              </TouchableOpacity>
            );
          })}
        </View>
      )}</>
  );
}
