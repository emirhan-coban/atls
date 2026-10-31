/** Lookup between the ID-map index (1..N, 0 = sea) and the app's ISO alpha-2 ids, built from assets/globe/country-index.json. */
import index from '../../assets/globe/country-index.json';

interface IndexEntry {
  iso2: string;
  labelLon: number;
  labelLat: number;
}

const entries = index.countries as Record<string, IndexEntry>;
const isoToId = new Map<string, number>();
for (const key of Object.keys(entries)) isoToId.set(entries[key].iso2, Number(key));

export const COUNTRY_COUNT = isoToId.size;

export function isoOfId(id: number): string | null {
  return entries[String(id)]?.iso2 ?? null;
}

export function idOfIso(iso2: string): number {
  return isoToId.get(iso2) ?? 0;
}

/** Label point in radians, or null for an unknown country. */
export function labelOfIso(iso2: string): { lon: number; lat: number } | null {
  const id = isoToId.get(iso2);
  if (!id) return null;
  const e = entries[String(id)];
  return { lon: (e.labelLon * Math.PI) / 180, lat: (e.labelLat * Math.PI) / 180 };
}

/** Names from the index, for countries that are in the dataset but not in the app's catalog. */
export const indexNames = index.names as { id: number; iso2: string; name: string; nameTr: string; inCatalog: boolean }[];
