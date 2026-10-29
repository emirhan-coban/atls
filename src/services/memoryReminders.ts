import { notificationService } from './notificationService';
import { availableCatalog, getLocalizedCountryName } from '../data/travelData';
import { buildMemoryReminders } from '../utils/memories';
import { useTripStore } from '../stores/useTripStore';

const nameOf = (countryId: string, lang: 'tr' | 'en') => {
  const entry = availableCatalog.find((c: any) => c.id.toUpperCase() === countryId.toUpperCase());
  return entry ? getLocalizedCountryName(entry, lang) : countryId;
};

/** Rebuilds the anniversary reminders from the current trips. Without `enabled` it only clears them. */
export async function refreshMemoryReminders(enabled: boolean, lang: 'tr' | 'en'): Promise<void> {
  const reminders = enabled ? buildMemoryReminders(useTripStore.getState().trips, (id) => nameOf(id, lang), lang) : [];
  await notificationService.setMemoryReminders(reminders);
}
