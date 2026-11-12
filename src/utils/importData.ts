import { availableCatalog } from '../data/travelData';
import { Country, CountryStatus, Trip, TripType } from '../stores/types';

/** A backup larger than this is not something atls. wrote. */
export const MAX_IMPORT_BYTES = 2 * 1024 * 1024;

const STATUSES: CountryStatus[] = ['visited', 'lived', 'want'];
const TRIP_TYPES: TripType[] = ['leisure', 'business', 'family', 'study', 'transit'];
const KNOWN_IDS = new Set(availableCatalog.map((c) => c.id));

export interface ParsedBackup {
  countries: Pick<Country, 'id' | 'status' | 'year' | 'month' | 'notes'>[];
  trips: Trip[];
}

export interface ImportPlan {
  newCountries: Pick<Country, 'id' | 'status' | 'year' | 'month' | 'notes'>[];
  newTrips: Trip[];
  /** Entries that were already on this phone or could not be read; nothing on the phone is overwritten. */
  skipped: number;
}

const text = (v: unknown, max: number) => (typeof v === 'string' ? v.slice(0, max) : '');
const year = (v: unknown) => (typeof v === 'string' || typeof v === 'number') && /^\d{4}$/.test(String(v)) ? String(v) : null;
const month = (v: unknown) => {
  if (typeof v !== 'string' && typeof v !== 'number') return null;
  const m = String(v).padStart(2, '0');
  return /^(0[1-9]|1[0-2])$/.test(m) ? m : null;
};
const iso = (v: unknown, fallback: string) => (typeof v === 'string' && !Number.isNaN(Date.parse(v)) ? v : fallback);

/** Reads a file written by `buildExportJson`. Returns null when it is not one, and drops single bad entries. */
export function parseBackup(raw: string, now = new Date()): ParsedBackup | null {
  if (raw.length > MAX_IMPORT_BYTES) return null;
  let data: any;
  try {
    data = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!data || data.app !== 'atls.' || !Array.isArray(data.countries) || !Array.isArray(data.trips)) return null;
  const stamp = now.toISOString();

  const countries: ParsedBackup['countries'] = [];
  for (const c of data.countries.slice(0, 1000)) {
    const id = typeof c?.id === 'string' ? c.id.toUpperCase() : '';
    if (!KNOWN_IDS.has(id) || !STATUSES.includes(c.status)) continue;
    countries.push({ id, status: c.status, year: year(c.year), month: month(c.month), notes: text(c.notes, 5000) });
  }

  const trips: Trip[] = [];
  for (const t of data.trips.slice(0, 5000)) {
    const countryId = typeof t?.countryId === 'string' ? t.countryId.toUpperCase() : '';
    const y = year(t?.year);
    if (!KNOWN_IDS.has(countryId) || !y || typeof t.id !== 'string' || !t.id || t.id.length > 64) continue;
    const days = Number.isInteger(t.days) && t.days >= 0 && t.days <= 3650 ? t.days : null;
    const rating = Number.isInteger(t.rating) && t.rating >= 1 && t.rating <= 5 ? t.rating : null;
    trips.push({
      id: t.id,
      countryId,
      year: y,
      month: month(t.month),
      days,
      cities: Array.isArray(t.cities) ? t.cities.filter((x: unknown) => typeof x === 'string').slice(0, 30).map((x: string) => x.slice(0, 80)) : [],
      type: TRIP_TYPES.includes(t.type) ? t.type : 'leisure',
      rating,
      notes: text(t.notes, 5000),
      // photo files live on the old phone only; the names would point at nothing here
      photos: [],
      createdAt: iso(t.createdAt, stamp),
      updatedAt: iso(t.updatedAt, stamp),
    });
  }
  return { countries, trips };
}

/** Adds only what is missing: countries and trips already on this phone are left exactly as they are. */
export function planImport(backup: ParsedBackup, existingCountries: Pick<Country, 'id'>[], existingTripIds: string[]): ImportPlan {
  const haveCountry = new Set(existingCountries.map((c) => c.id.toUpperCase()));
  const haveTrip = new Set(existingTripIds);
  const newCountries: ImportPlan['newCountries'] = [];
  let skipped = 0;

  for (const c of backup.countries) {
    if (haveCountry.has(c.id)) skipped++;
    else {
      haveCountry.add(c.id);
      newCountries.push(c);
    }
  }

  const newTrips: Trip[] = [];
  for (const t of backup.trips) {
    if (haveTrip.has(t.id)) {
      skipped++;
      continue;
    }
    haveTrip.add(t.id);
    newTrips.push(t);
    // a trip needs its country on the map, even when the backup listed it only through the trip
    if (!haveCountry.has(t.countryId)) {
      haveCountry.add(t.countryId);
      newCountries.push({ id: t.countryId, status: 'visited', year: t.year, month: t.month ?? null, notes: '' });
    }
  }
  return { newCountries, newTrips, skipped };
}
