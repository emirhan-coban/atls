import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system';
import { useCountryStore } from '../stores/useCountryStore';
import { useTripStore } from '../stores/useTripStore';
import { Country } from '../stores/types';
import { MAX_IMPORT_BYTES, parseBackup, planImport } from './importData';

export type ImportResult =
  | { kind: 'cancelled' }
  | { kind: 'invalid' }
  | { kind: 'done'; countries: number; trips: number; skipped: number };

/** Lets the user pick an atls. JSON export and merges it in: only missing countries and trips are added. */
export async function pickAndImportBackup(): Promise<ImportResult> {
  const picked = await DocumentPicker.getDocumentAsync({
    type: ['application/json', 'text/plain', 'public.json'],
    copyToCacheDirectory: true,
    multiple: false,
  });
  if (picked.canceled || !picked.assets?.[0]) return { kind: 'cancelled' };
  const asset = picked.assets[0];
  if (asset.size != null && asset.size > MAX_IMPORT_BYTES) return { kind: 'invalid' };

  const raw = await new File(asset.uri).text();
  const backup = parseBackup(raw);
  if (!backup) return { kind: 'invalid' };

  const { countries, addCountry } = useCountryStore.getState();
  const trips = useTripStore.getState();
  const plan = planImport(backup, countries, trips.trips.map((t) => t.id));

  for (const c of plan.newCountries) {
    await addCountry({
      id: c.id,
      status: c.status,
      year: c.year,
      visitedYear: c.year,
      month: c.month,
      visitedMonth: c.month,
      notes: c.notes,
    } as Country);
  }
  await trips.importTrips(plan.newTrips);
  return { kind: 'done', countries: plan.newCountries.length, trips: plan.newTrips.length, skipped: plan.skipped };
}
