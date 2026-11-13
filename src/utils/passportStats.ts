/** Numbers for the passport "stats" tab. Pure, so the screen only lays them out. */
import { Country, Trip } from '../stores/types';
import { computeStoryFacts } from './storyFacts';

export interface PassportStats {
  /** Visited + lived countries. */
  countries: number;
  continents: number;
  trips: number;
  /** Sum of the trip lengths that were entered; 0 when no trip has a length. */
  days: number;
  /** Farthest visited country from home in km, or null when it cannot be measured. */
  farthestKm: number | null;
  /** Share of the world's countries, one decimal. */
  percent: number;
}

export function computePassportStats(countries: Country[], trips: Trip[], homeIso: string, worldTotal: number): PassportStats {
  const facts = computeStoryFacts(countries, homeIso, worldTotal);
  return {
    countries: facts.count,
    continents: facts.continents,
    trips: trips.length,
    days: trips.reduce((sum, t) => sum + (t.days && t.days > 0 ? t.days : 0), 0),
    farthestKm: facts.farthest ? facts.farthest.km : null,
    percent: facts.percent,
  };
}

/** Trips newest first: by year, then month, then creation time. */
export function sortTripsNewestFirst(trips: Trip[]): Trip[] {
  const key = (t: Trip) => Number(t.year || 0) * 100 + Number(t.month || 0);
  return [...trips].sort((a, b) => key(b) - key(a) || b.createdAt.localeCompare(a.createdAt));
}
