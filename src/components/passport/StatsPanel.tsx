import { View, Text } from 'react-native';
import { CalendarClock, BookOpen } from 'lucide-react-native';
import Button from '../ui/Button';
import { tPassportScreen } from '../../localization/screens/PassportScreen';
import { PassportMiniMap } from './PassportMiniMap';
import { TripRows } from './TripsPanel';
import { usePanelStyles } from './Panels.styles';
import type { PassportCtx } from './usePassportScreen';

/** Stats tab: world map, six numbers and the latest trips. */
export function StatsPanel({ ctx }: { ctx: PassportCtx }) {
  const { countries, currentLang, onOpenJourney, onOpenPlanner, setSegment, stats, trips } = ctx;
  const styles = usePanelStyles();
  const lang = currentLang === 'tr' ? 'tr-TR' : 'en-US';
  const tiles: { value: string; label: string; gold?: boolean }[] = [
    { value: String(stats.countries), label: tPassportScreen('stat_countries', currentLang) },
    { value: String(stats.continents), label: tPassportScreen('stat_continents', currentLang) },
    { value: String(stats.trips), label: tPassportScreen('stat_trips', currentLang) },
  ];
  if (stats.days > 0) tiles.push({ value: stats.days.toLocaleString(lang), label: tPassportScreen('stat_days', currentLang) });
  if (stats.farthestKm !== null) tiles.push({ value: stats.farthestKm.toLocaleString(lang), label: tPassportScreen('stat_farthest', currentLang) });
  tiles.push({ value: `%${stats.percent.toLocaleString(lang)}`, label: tPassportScreen('stat_world', currentLang), gold: true });

  return (
    <View>
      <View style={styles.mapCard}>
        <PassportMiniMap countries={countries} />
        <View style={styles.mapFooter}>
          <Text style={styles.mapCaption}>{tPassportScreen('world_reach', currentLang, { percent: stats.percent.toLocaleString(lang) })}</Text>
        </View>
      </View>

      <View style={styles.tileGrid}>
        {tiles.map((tile) => (
          <View key={tile.label} style={styles.tile}>
            <Text style={[styles.tileNumber, tile.gold && styles.tileNumberGold]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>
              {tile.value}
            </Text>
            <Text style={styles.tileLabel} numberOfLines={1}>{tile.label}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.sectionLabel}>{tPassportScreen('recent_trips', currentLang)}</Text>
      <TripRows ctx={ctx} trips={trips.slice(0, 3)} />
      {trips.length > 3 && (
        <Button variant="secondary" label={tPassportScreen('see_all_trips', currentLang)} onPress={() => setSegment('trips')} style={styles.buttonTop} />
      )}

      <View style={styles.actionRow}>
        {onOpenPlanner && (
          <Button
            onPress={onOpenPlanner}
            variant="secondary"
            label={tPassportScreen('trip_planner', currentLang)}
            icon={(color) => <CalendarClock size={16} color={color} />}
            style={{ flex: 1 }}
          />
        )}
        {onOpenJourney && (
          <Button
            onPress={onOpenJourney}
            variant="secondary"
            label={tPassportScreen('travel_journal', currentLang)}
            icon={(color) => <BookOpen size={16} color={color} />}
            style={{ flex: 1 }}
          />
        )}
      </View>
    </View>
  );
}
