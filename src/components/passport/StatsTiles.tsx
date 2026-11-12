import { View, Text, TouchableOpacity } from 'react-native';
import AnimatedCounter from '../AnimatedCounter';
import type { PassportCtx } from './usePassportScreen';

export function StatsTiles({ ctx }: { ctx: PassportCtx }) {
  const { activeTab, colors, handleTabPress, livedCountries, styles, t, visitedCountries, wantCountries } = ctx;
  return (
    <View style={styles.statsRow}>
        {/* Visited */}
        <TouchableOpacity accessibilityState={{ selected: activeTab === 'visited' }}
          onPress={() => handleTabPress('visited')}
          activeOpacity={0.7}
          style={[
            styles.statTile,
            activeTab === 'visited' && styles.statTileActiveVisited,
          ]}
        >
          <AnimatedCounter
            value={visitedCountries.length}
            formatter={(v) => {
              const rounded = Math.round(v);
              return rounded < 10 ? `0${rounded}` : `${rounded}`;
            }}
            style={styles.statNumber}
          />
          <View style={styles.statLabelRow}>
            <View
              style={[
                styles.statDot,
                { backgroundColor: colors.status.visited.color },
              ]}
            />
            <Text
              style={[
                styles.statLabel,
                activeTab === 'visited' && styles.statLabelActive,
              ]}
              numberOfLines={1}
              adjustsFontSizeToFit={true}
              minimumFontScale={0.8}
            >
              {t.visited}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Lived In */}
        <TouchableOpacity accessibilityState={{ selected: activeTab === 'lived' }}
          onPress={() => handleTabPress('lived')}
          activeOpacity={0.7}
          style={[
            styles.statTile,
            activeTab === 'lived' && styles.statTileActiveLived,
          ]}
        >
          <AnimatedCounter
            value={livedCountries.length}
            formatter={(v) => {
              const rounded = Math.round(v);
              return rounded < 10 ? `0${rounded}` : `${rounded}`;
            }}
            style={styles.statNumber}
          />
          <View style={styles.statLabelRow}>
            <View
              style={[
                styles.statDot,
                { backgroundColor: colors.status.lived.color },
              ]}
            />
            <Text
              style={[
                styles.statLabel,
                activeTab === 'lived' && styles.statLabelActive,
              ]}
              numberOfLines={1}
              adjustsFontSizeToFit={true}
              minimumFontScale={0.8}
            >
              {t.livedIn}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Wishlist */}
        <TouchableOpacity accessibilityState={{ selected: activeTab === 'want' }}
          onPress={() => handleTabPress('want')}
          activeOpacity={0.7}
          style={[
            styles.statTile,
            activeTab === 'want' && styles.statTileActiveWant,
          ]}
        >
          <AnimatedCounter
            value={wantCountries.length}
            formatter={(v) => {
              const rounded = Math.round(v);
              return rounded < 10 ? `0${rounded}` : `${rounded}`;
            }}
            style={styles.statNumber}
          />
          <View style={styles.statLabelRow}>
            <View
              style={[
                styles.statDot,
                { backgroundColor: colors.status.want.color },
              ]}
            />
            <Text
              style={[
                styles.statLabel,
                activeTab === 'want' && styles.statLabelActive,
              ]}
              numberOfLines={1}
              adjustsFontSizeToFit={true}
              minimumFontScale={0.8}
            >
              {t.wishlist}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
  );
}
