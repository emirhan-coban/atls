import { View, Text, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
import { tPassportScreen } from '../../localization/screens/PassportScreen';
import { usePanelStyles } from './Panels.styles';
import type { PassportCtx } from './usePassportScreen';
import type { PassportSegment } from './shared';

const SEGMENTS: { key: PassportSegment; label: 'tab_stats' | 'tab_countries' | 'tab_trips' }[] = [
  { key: 'stats', label: 'tab_stats' },
  { key: 'countries', label: 'tab_countries' },
  { key: 'trips', label: 'tab_trips' },
];

/** Stats / Countries / Trips switch under the header. */
export function SegmentTabs({ ctx }: { ctx: PassportCtx }) {
  const { currentLang, segment, setSegment } = ctx;
  const styles = usePanelStyles();
  return (
    <View style={styles.segmentBar} accessibilityRole="tablist">
      {SEGMENTS.map((s) => {
        const active = segment === s.key;
        return (
          <TouchableOpacity
            key={s.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => {
              Haptics.selectionAsync();
              setSegment(s.key);
            }}
            activeOpacity={0.7}
            style={[styles.segment, active && styles.segmentActive]}
          >
            <Text style={[styles.segmentText, active && styles.segmentTextActive]} numberOfLines={1}>
              {tPassportScreen(s.label, currentLang)}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
