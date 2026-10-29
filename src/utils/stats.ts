import { Country, Trip, YearlyGoal } from '../stores/types';

const isVisited = (c: Country) => c.status === 'visited' || c.status === 'lived';

/**
 * Countries marked visited/lived before trips existed have no Trip. This creates one from the
 * country's own year/month/notes so old data shows up in the timeline. Pure: returns only the
 * trips that are missing, never changes the input.
 */
export function deriveLegacyTrips(countries: Country[], trips: Trip[], now = new Date()): Trip[] {
  const withTrips = new Set(trips.map((t) => t.countryId));
  const created: Trip[] = [];
  for (const c of countries) {
    if (!isVisited(c) || withTrips.has(c.id)) continue;
    const year = (c.visitedYear || c.year || '').toString();
    if (!/^\d{4}$/.test(year)) continue;
    const stamp = now.toISOString();
    created.push({
      id: `legacy-${c.id}`,
      countryId: c.id,
      year,
      month: c.visitedMonth || c.month || null,
      days: null,
      cities: [],
      type: c.status === 'lived' ? 'family' : 'leisure',
      rating: null,
      notes: c.notes || '',
      createdAt: stamp,
      updatedAt: stamp,
    });
  }
  return created;
}

/** Newest first: by year, then month (missing month sorts as the end of the year). */
export function sortTripsNewestFirst(trips: Trip[]): Trip[] {
  const key = (t: Trip) => Number(t.year) * 100 + (t.month ? Number(t.month) : 13);
  return [...trips].sort((a, b) => key(b) - key(a) || b.updatedAt.localeCompare(a.updatedAt));
}

export interface TravelStats {
  visitedCount: number;
  livedCount: number;
  wishlistCount: number;
  tripCount: number;
  totalDays: number;
  tripsWithDays: number;
  yearsTraveled: number;
  tripsByYear: { year: string; count: number }[];
  topCountries: { countryId: string; count: number }[];
  firstTrip: Trip | null;
  lastTrip: Trip | null;
  averageRating: number | null;
  /** Country ids whose earliest trip happened in each year. */
  newCountriesByYear: Record<string, string[]>;
}

export function computeStats(countries: Country[], trips: Trip[]): TravelStats {
  const visited = countries.filter(isVisited);
  const byYear = new Map<string, number>();
  const byCountry = new Map<string, number>();
  let totalDays = 0;
  let tripsWithDays = 0;
  let ratingSum = 0;
  let ratingCount = 0;

  for (const t of trips) {
    byYear.set(t.year, (byYear.get(t.year) || 0) + 1);
    byCountry.set(t.countryId, (byCountry.get(t.countryId) || 0) + 1);
    if (t.days && t.days > 0) {
      totalDays += t.days;
      tripsWithDays += 1;
    }
    if (t.rating) {
      ratingSum += t.rating;
      ratingCount += 1;
    }
  }

  const ordered = sortTripsNewestFirst(trips);

  // first year each country was visited
  const firstYear = new Map<string, string>();
  for (const t of trips) {
    const seen = firstYear.get(t.countryId);
    if (!seen || t.year < seen) firstYear.set(t.countryId, t.year);
  }
  const newCountriesByYear: Record<string, string[]> = {};
  firstYear.forEach((year, countryId) => {
    (newCountriesByYear[year] ||= []).push(countryId);
  });

  return {
    visitedCount: visited.length,
    livedCount: countries.filter((c) => c.status === 'lived').length,
    wishlistCount: countries.filter((c) => c.status === 'want').length,
    tripCount: trips.length,
    totalDays,
    tripsWithDays,
    yearsTraveled: byYear.size,
    tripsByYear: [...byYear.entries()]
      .map(([year, count]) => ({ year, count }))
      .sort((a, b) => a.year.localeCompare(b.year)),
    topCountries: [...byCountry.entries()]
      .map(([countryId, count]) => ({ countryId, count }))
      .sort((a, b) => b.count - a.count || a.countryId.localeCompare(b.countryId))
      .slice(0, 5),
    firstTrip: ordered.length ? ordered[ordered.length - 1] : null,
    lastTrip: ordered.length ? ordered[0] : null,
    averageRating: ratingCount ? Math.round((ratingSum / ratingCount) * 10) / 10 : null,
    newCountriesByYear,
  };
}

export interface GoalProgress {
  year: number;
  target: number;
  achieved: number;
  fraction: number;
  done: boolean;
}

export function getGoalProgress(goal: YearlyGoal | null, stats: TravelStats): GoalProgress | null {
  if (!goal || goal.target <= 0) return null;
  const achieved = (stats.newCountriesByYear[String(goal.year)] || []).length;
  return {
    year: goal.year,
    target: goal.target,
    achieved,
    fraction: Math.min(1, achieved / goal.target),
    done: achieved >= goal.target,
  };
}

export interface YearSummary {
  year: string;
  tripCount: number;
  days: number;
  /** Countries visited for the first time in this year, in order of first trip. */
  newCountryIds: string[];
  /** Every country with a trip in this year. */
  countryIds: string[];
  topCountryId: string | null;
}

export function computeYearSummary(trips: Trip[], year: string): YearSummary {
  const inYear = trips.filter((t) => t.year === year);
  const firstYear = new Map<string, string>();
  for (const t of trips) {
    const seen = firstYear.get(t.countryId);
    if (!seen || t.year < seen) firstYear.set(t.countryId, t.year);
  }
  const countryIds = [...new Set(inYear.map((t) => t.countryId))];
  const counts = new Map<string, number>();
  inYear.forEach((t) => counts.set(t.countryId, (counts.get(t.countryId) || 0) + 1));
  const top = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0];
  return {
    year,
    tripCount: inYear.length,
    days: inYear.reduce((sum, t) => sum + (t.days && t.days > 0 ? t.days : 0), 0),
    newCountryIds: countryIds.filter((id) => firstYear.get(id) === year),
    countryIds,
    topCountryId: top ? top[0] : null,
  };
}

/** Years that have at least one trip, newest first. */
export function yearsWithTrips(trips: Trip[]): string[] {
  return [...new Set(trips.map((t) => t.year))].sort((a, b) => b.localeCompare(a));
}
