import { View, Text, TouchableOpacity } from 'react-native';
import AnimatedCounter from '../AnimatedCounter';
import type { HomeCtx } from './useHomeScreen';

export function MapCard({ ctx }: { ctx: HomeCtx }) {
  const { activeFilter, colors, handleFilterPress, livedCount, styles, t, visitedCount, wantCount } = ctx;
  return (
    <View style={styles.mapCard}>
        {/* Stats Row - Playful Candy Tiles */}
        <View style={styles.statsRow}>
          {/* Visited */}
          <TouchableOpacity accessibilityState={{ selected: activeFilter === 'visited' }}
            onPress={() => handleFilterPress('visited')}
            activeOpacity={0.7}
            style={[
              styles.statBox,
              styles.statBoxVisited,
              activeFilter === 'visited' && styles.statBoxActiveVisited,
            ]}
          >
            <AnimatedCounter
              value={visitedCount}
              formatter={(v) => {
                const rounded = Math.round(v);
                return rounded < 10 ? `0${rounded}` : `${rounded}`;
              }}
              style={[styles.statNumber, { color: colors.status.visited.bright }]}
            />
            <View style={styles.statLabelRow}>
              <View style={[styles.statusDot, { backgroundColor: colors.status.visited.color }]} />
              <Text style={[styles.statLabel, { color: colors.status.visited.bright }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75}>
                {t.visited}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Lived in */}
          <TouchableOpacity accessibilityState={{ selected: activeFilter === 'lived' }}
            onPress={() => handleFilterPress('lived')}
            activeOpacity={0.7}
            style={[
              styles.statBox,
              styles.statBoxLived,
              activeFilter === 'lived' && styles.statBoxActiveLived,
            ]}
          >
            <AnimatedCounter
              value={livedCount}
              formatter={(v) => {
                const rounded = Math.round(v);
                return rounded < 10 ? `0${rounded}` : `${rounded}`;
              }}
              style={[styles.statNumber, { color: colors.status.lived.bright }]}
            />
            <View style={styles.statLabelRow}>
              <View style={[styles.statusDot, { backgroundColor: colors.status.lived.color }]} />
              <Text style={[styles.statLabel, { color: colors.status.lived.bright }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75}>
                {t.livedIn}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Want to visit */}
          <TouchableOpacity accessibilityState={{ selected: activeFilter === 'want' }}
            onPress={() => handleFilterPress('want')}
            activeOpacity={0.7}
            style={[
              styles.statBox,
              styles.statBoxWant,
              activeFilter === 'want' && styles.statBoxActiveWant,
            ]}
          >
            <AnimatedCounter
              value={wantCount}
              formatter={(v) => {
                const rounded = Math.round(v);
                return rounded < 10 ? `0${rounded}` : `${rounded}`;
              }}
              style={[styles.statNumber, { color: colors.gold.light }]}
            />
            <View style={styles.statLabelRow}>
              <View style={[styles.statusDot, { backgroundColor: colors.gold.base }]} />
              <Text style={[styles.statLabel, { color: colors.gold.light }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75}>
                {t.wishlist}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
  );
}
