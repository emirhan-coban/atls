/** Numbers for the animated journey story. Pure, so the story screen only lays them out. */
import { Country } from '../stores/types';
import { labelOfIso } from '../globe/countryIndex';

const EARTH_RADIUS_KM = 6371;

export interface StoryFacts {
  count: number;
  /** Share of the world's countries, one decimal. */
  percent: number;
  continents: number;
  /** Visited country farthest from home (label point to label point), if both are known. */
  farthest: { id: string; km: number } | null;
  /** Visited countries, newest marked last, for the flag reel. */
  reel: Country[];
}

/** Great-circle distance between two lon/lat points given in radians. */
export function haversineKm(a: { lon: number; lat: number }, b: { lon: number; lat: number }): number {
  const dLat = b.lat - a.lat;
  const dLon = b.lon - a.lon;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat) * Math.cos(b.lat) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function computeStoryFacts(countries: Country[], homeIso: string, worldTotal: number): StoryFacts {
  const visited = countries.filter((c) => c.status === 'visited' || c.status === 'lived');
  const home = labelOfIso(homeIso);

  let farthest: StoryFacts['farthest'] = null;
  if (home) {
    for (const c of visited) {
      const at = labelOfIso(c.id);
      if (!at || c.id === homeIso) continue;
      const km = haversineKm(home, at);
      if (!farthest || km > farthest.km) farthest = { id: c.id, km: Math.round(km) };
    }
  }

  return {
    count: visited.length,
    percent: worldTotal > 0 ? Math.round((visited.length / worldTotal) * 1000) / 10 : 0,
    continents: new Set(visited.map((c) => c.continent).filter(Boolean)).size,
    farthest,
    reel: visited,
  };
}
