import { View, Text, TouchableOpacity } from 'react-native';
import { BookOpen } from 'lucide-react-native';
import Button from '../ui/Button';
import { getLocalizedCountryName } from '../../data/travelData';
import { Trip } from '../../stores/types';
import { tPassportScreen } from '../../localization/screens/PassportScreen';
import { usePanelStyles } from './Panels.styles';
import type { PassportCtx } from './usePassportScreen';

function tripDate(trip: Trip, lang: 'tr' | 'en'): string {
  const year = Number(trip.year);
  const month = Number(trip.month);
  if (!year) return '';
  if (!month) return String(year);
  return new Date(year, month - 1, 1).toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-US', { month: 'short', year: 'numeric' });
}

/** Rows of trips: flag, place, date and length. Shared by the stats tab (latest three) and the trips tab. */
export function TripRows({ ctx, trips }: { ctx: PassportCtx; trips: Trip[] }) {
  const { countries, currentLang, onSelectCountry } = ctx;
  const styles = usePanelStyles();
  if (trips.length === 0) {
    return <Text style={styles.emptyText}>{tPassportScreen('no_trips_yet', currentLang)}</Text>;
  }
  return (
    <View>
      {trips.map((trip) => {
        const country = countries.find((c) => c.id === trip.countryId);
        const name = country ? getLocalizedCountryName(country, currentLang) : trip.countryId;
        const hasCities = trip.cities.length > 0;
        const cities = hasCities ? trip.cities.slice(0, 3).join(', ') : name;
        // the country is the title when no city was entered, so it is not repeated in the second line
        const meta = [hasCities ? name : '', tripDate(trip, currentLang), trip.days ? tPassportScreen('trip_days', currentLang, { n: trip.days }) : ''].filter(Boolean).join(' · ');
        return (
          <TouchableOpacity
            key={trip.id}
            accessibilityRole="button"
            onPress={() => onSelectCountry?.(trip.countryId)}
            activeOpacity={0.7}
            style={styles.tripRow}
          >
            <View style={styles.tripFlag}>
              <Text style={styles.tripFlagText}>{country?.flag ?? ''}</Text>
            </View>
            <View style={styles.tripBody}>
              <Text style={styles.tripTitle} numberOfLines={1}>{cities}</Text>
              <Text style={styles.tripMeta} numberOfLines={1}>{meta}</Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

/** Trips tab: every trip, newest first, with the journal button. */
export function TripsPanel({ ctx }: { ctx: PassportCtx }) {
  const { currentLang, onOpenJourney, trips } = ctx;
  const styles = usePanelStyles();
  return (
    <View>
      <TripRows ctx={ctx} trips={trips} />
      {onOpenJourney && (
        <Button
          onPress={onOpenJourney}
          variant="secondary"
          label={tPassportScreen('travel_journal', currentLang)}
          icon={(color) => <BookOpen size={16} color={color} />}
          style={styles.buttonTop}
        />
      )}
    </View>
  );
}
