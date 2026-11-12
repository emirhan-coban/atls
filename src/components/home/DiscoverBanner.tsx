import { View, Text, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ChevronRight, Utensils } from 'lucide-react-native';
import { tHomeScreen } from '../../localization/screens/HomeScreen';
import type { HomeCtx } from './useHomeScreen';

export function DiscoverBanner({ ctx }: { ctx: HomeCtx }) {
  const { colors, currentLang, onNavigateToExplore, styles } = ctx;
  return (
    <TouchableOpacity
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          if (onNavigateToExplore) onNavigateToExplore();
        }}
        activeOpacity={0.85}
        style={styles.milestoneCard}
      >
        <View style={styles.milestoneLeft}>
          <View style={styles.milestoneIconBox}>
            <Utensils size={20} color={colors.gold.base} />
          </View>
          <View style={styles.milestoneTextContainer}>
            <View style={styles.milestoneTitleRow}>
              <Text style={styles.milestoneBadgeLabel}>
                {tHomeScreen('travel_guide', currentLang)}
              </Text>
            </View>
            <Text style={styles.milestoneTitle}>
              {tHomeScreen('what_to_eat_what_to_explore', currentLang)}
            </Text>
            <Text style={styles.milestoneSubtitle}>
              {tHomeScreen('iconic_street_bites_secret_travel', currentLang)}
            </Text>
          </View>
        </View>
        <ChevronRight size={18} color={colors.text.secondary} />
      </TouchableOpacity>
  );
}
