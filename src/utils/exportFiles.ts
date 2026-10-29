import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { buildExportJson, tripsToCsv } from './exportData';
import { Country, Profile, Trip } from '../stores/types';

export type ExportFormat = 'json' | 'csv';

/** Writes the export into the cache folder and opens the share sheet (Files, AirDrop, Mail…). */
export async function exportAndShare(
  format: ExportFormat,
  data: { profile?: Profile; countries: Country[]; trips: Trip[] }
): Promise<void> {
  if (!(await Sharing.isAvailableAsync())) throw new Error('Sharing is not available on this device');

  const stamp = new Date().toISOString().slice(0, 10);
  const file = new File(Paths.cache, `atls-${stamp}.${format}`);
  if (file.exists) file.delete();
  file.create();
  file.write(format === 'json' ? buildExportJson(data.profile, data.countries, data.trips) : tripsToCsv(data.trips, data.countries));

  await Sharing.shareAsync(file.uri, {
    mimeType: format === 'json' ? 'application/json' : 'text/csv',
    UTI: format === 'json' ? 'public.json' : 'public.comma-separated-values-text',
    dialogTitle: 'atls.',
  });
}
