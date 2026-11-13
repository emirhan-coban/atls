import { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { makeStyles } from '../../theme/ThemeContext';
import { fonts } from '../../theme/typography';
import { availableCatalog, getLocalizedCountryName } from '../../data/travelData';
import { useGameStore } from '../../stores/useGameStore';
import { usePlanStore } from '../../stores/usePlanStore';
import { gameProps, tripProps } from '../../widgets/widgetData';
import type { HomeCtx } from './useHomeScreen';

const useStyles = makeStyles((colors) => StyleSheet.create({
  row: { flexDirection: 'row', gap: 10, marginTop: 16 },
  tile: {
    flex: 1,
    minHeight: 96,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.glass.hairline,
    backgroundColor: colors.glass.fill,
  },
  tileGold: { backgroundColor: colors.gold.tint, borderColor: colors.gold.border },
  eyebrow: { fontSize: 10, fontWeight: '700', letterSpacing: 1.2, color: colors.text.secondary },
  eyebrowGold: { color: colors.gold.base },
  big: { fontFamily: fonts.display, fontSize: 28, lineHeight: 32, color: colors.text.primary, marginTop: 6 },
  bigUnit: { fontSize: 14, fontFamily: undefined, fontWeight: '600', color: colors.text.secondary },
  headline: { fontFamily: fonts.display, fontSize: 18, lineHeight: 22, color: colors.text.primary, marginTop: 6 },
  sub: { fontSize: 11, color: colors.text.secondary, marginTop: 3 },
}));

/**
 * "Today" strip of the home sheet: the Secret Country result and the countdown to the next trip.
 * The texts come from the same pure functions as the widgets, so app and widgets always agree.
 */
export function TodayStrip({ ctx }: { ctx: HomeCtx }) {
  const { currentLang, countries, onOpenGame, onOpenPlanner, visitedCount } = ctx;
  const styles = useStyles();
  const days = useGameStore((s) => s.days);
  const stats = useGameStore((s) => s.stats);
  const plans = usePlanStore((s) => s.plans);

  const { game, trip } = useMemo(() => {
    const now = new Date();
    return {
      game: gameProps({ days, stats, lang: currentLang, visitedCount }, now),
      trip: tripProps(
        {
          plans,
          lang: currentLang,
          place: (id) => ({
            name: getLocalizedCountryName(id, currentLang),
            flag: availableCatalog.find((c: any) => c.id.toUpperCase() === id.toUpperCase())?.flag ?? '',
          }),
          wishlist: countries.filter((c) => c.status === 'want').map((c) => c.id),
        },
        now
      ),
    };
  }, [days, stats, plans, currentLang, visitedCount, countries]);

  const press = (fn?: () => void) => () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    fn?.();
  };

  return (
    <View style={styles.row}>
      {onOpenGame && (
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={`${game.eyebrow}. ${game.headline}`}
          onPress={press(onOpenGame)}
          activeOpacity={0.85}
          style={[styles.tile, game.state === 'risk' && styles.tileGold]}
        >
          <Text style={[styles.eyebrow, game.state === 'risk' && styles.eyebrowGold]} numberOfLines={1}>{game.eyebrow}</Text>
          {game.score ? (
            <Text style={styles.big}>{game.score}</Text>
          ) : (
            <Text style={styles.headline} numberOfLines={2}>{game.headline}</Text>
          )}
          <Text style={styles.sub} numberOfLines={2}>{game.score ? `${game.headline} · ${game.sub}` : game.sub}</Text>
        </TouchableOpacity>
      )}
      {onOpenPlanner && (
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={`${trip.eyebrow}. ${trip.headline}`}
          onPress={press(onOpenPlanner)}
          activeOpacity={0.85}
          style={[styles.tile, trip.kind !== 'empty' && styles.tileGold]}
        >
          <Text style={[styles.eyebrow, trip.kind !== 'empty' && styles.eyebrowGold]} numberOfLines={1}>{trip.eyebrow}</Text>
          {trip.kind === 'upcoming' || trip.kind === 'ongoing' ? (
            <Text style={styles.big}>
              {trip.days} <Text style={styles.bigUnit}>{trip.unit}</Text>
            </Text>
          ) : (
            <Text style={styles.headline} numberOfLines={2}>{trip.headline}</Text>
          )}
          <Text style={styles.sub} numberOfLines={2}>
            {trip.kind === 'empty' ? trip.suggestionLine || trip.cta : `${trip.flag} ${trip.kind === 'upcoming' ? trip.headline : trip.country}`.trim()}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
