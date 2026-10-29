/// <reference types="jest" />
import { computeStats, computeYearSummary, deriveLegacyTrips, getGoalProgress, sortTripsNewestFirst, yearsWithTrips } from '../stats';
import { getLevelProgress } from '../../data/levels';
import { Country, Trip } from '../../stores/types';

const country = (id: string, status: Country['status'], extra: Partial<Country> = {}): Country => ({
  id,
  name: id,
  nameTr: id,
  continent: 'Europe',
  continentTr: 'Avrupa',
  flag: '🏳️',
  status,
  ...extra,
});

const trip = (id: string, countryId: string, year: string, extra: Partial<Trip> = {}): Trip => ({
  id,
  countryId,
  year,
  cities: [],
  type: 'leisure',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  ...extra,
});

describe('deriveLegacyTrips', () => {
  const now = new Date('2026-06-01T00:00:00.000Z');

  it('creates one trip for visited countries that have none', () => {
    const created = deriveLegacyTrips(
      [country('FR', 'visited', { year: '2023', month: '07', notes: 'Paris' })],
      [],
      now
    );
    expect(created).toHaveLength(1);
    expect(created[0]).toMatchObject({ id: 'legacy-FR', countryId: 'FR', year: '2023', month: '07', notes: 'Paris' });
  });

  it('skips wishlist countries, countries that already have trips and countries without a valid year', () => {
    const created = deriveLegacyTrips(
      [country('JP', 'want'), country('DE', 'visited', { year: '2022' }), country('IT', 'visited', { year: '' })],
      [trip('t1', 'DE', '2022')],
      now
    );
    expect(created).toEqual([]);
  });

  it('is idempotent once the trips are stored', () => {
    const countries = [country('FR', 'visited', { year: '2023' })];
    const first = deriveLegacyTrips(countries, [], now);
    expect(deriveLegacyTrips(countries, first, now)).toEqual([]);
  });
});

describe('computeStats', () => {
  const countries = [country('FR', 'visited'), country('TR', 'lived'), country('JP', 'want'), country('DE', 'visited')];
  const trips = [
    trip('a', 'FR', '2022', { days: 5, rating: 4 }),
    trip('b', 'FR', '2024', { month: '08', days: 7, rating: 5 }),
    trip('c', 'DE', '2024', { month: '02' }),
    trip('d', 'TR', '2018', { days: 365 }),
  ];
  const stats = computeStats(countries, trips);

  it('counts countries and trips', () => {
    expect(stats.visitedCount).toBe(3);
    expect(stats.livedCount).toBe(1);
    expect(stats.wishlistCount).toBe(1);
    expect(stats.tripCount).toBe(4);
    expect(stats.yearsTraveled).toBe(3);
  });

  it('sums days only from trips that have them', () => {
    expect(stats.totalDays).toBe(5 + 7 + 365);
    expect(stats.tripsWithDays).toBe(3);
  });

  it('ranks countries by trip count and orders years ascending', () => {
    expect(stats.topCountries[0]).toEqual({ countryId: 'FR', count: 2 });
    expect(stats.tripsByYear.map((y) => y.year)).toEqual(['2018', '2022', '2024']);
  });

  it('finds first and last trip, and the average rating', () => {
    expect(stats.firstTrip?.id).toBe('d');
    expect(stats.lastTrip?.id).toBe('b'); // August 2024 is later than February 2024
    expect(stats.averageRating).toBe(4.5);
  });

  it('attributes each country to the year of its first trip', () => {
    expect(stats.newCountriesByYear['2022']).toEqual(['FR']);
    expect(stats.newCountriesByYear['2024']).toEqual(['DE']);
  });

  it('handles an empty history', () => {
    const empty = computeStats([], []);
    expect(empty.firstTrip).toBeNull();
    expect(empty.averageRating).toBeNull();
    expect(empty.topCountries).toEqual([]);
  });
});

describe('sortTripsNewestFirst', () => {
  it('puts trips without a month after dated trips of the same year', () => {
    const sorted = sortTripsNewestFirst([trip('x', 'FR', '2024', { month: '03' }), trip('y', 'DE', '2024')]);
    expect(sorted.map((t) => t.id)).toEqual(['y', 'x']);
  });
});

describe('yearly goal', () => {
  const stats = computeStats([country('FR', 'visited')], [trip('a', 'FR', '2026')]);

  it('measures new countries in the goal year', () => {
    expect(getGoalProgress({ year: 2026, target: 4 }, stats)).toMatchObject({ achieved: 1, fraction: 0.25, done: false });
  });

  it('is done once the target is met and null without a goal', () => {
    expect(getGoalProgress({ year: 2026, target: 1 }, stats)?.done).toBe(true);
    expect(getGoalProgress(null, stats)).toBeNull();
  });
});

describe('levels', () => {
  it('moves up at the thresholds and reports what is left', () => {
    expect(getLevelProgress(0).current.level).toBe(1);
    expect(getLevelProgress(3).current.level).toBe(2);
    expect(getLevelProgress(7)).toMatchObject({ remaining: 1 });
    expect(getLevelProgress(60).next).toBeNull();
  });
});

describe('year summary', () => {
  const trips = [
    trip('a', 'FR', '2023', { days: 4 }),
    trip('b', 'FR', '2024', { days: 6 }),
    trip('c', 'DE', '2024', { days: 3 }),
    trip('d', 'DE', '2024'),
    trip('e', 'JP', '2024'),
  ];

  it('counts trips and days in the year and finds new countries by first visit', () => {
    const summary = computeYearSummary(trips, '2024');
    expect(summary.tripCount).toBe(4);
    expect(summary.days).toBe(9);
    expect(summary.countryIds.sort()).toEqual(['DE', 'FR', 'JP']);
    expect(summary.newCountryIds.sort()).toEqual(['DE', 'JP']); // France was first visited in 2023
    expect(summary.topCountryId).toBe('DE');
  });

  it('handles a year without trips', () => {
    const summary = computeYearSummary(trips, '2030');
    expect(summary).toMatchObject({ tripCount: 0, days: 0, newCountryIds: [], topCountryId: null });
  });

  it('lists years newest first without duplicates', () => {
    expect(yearsWithTrips(trips)).toEqual(['2024', '2023']);
  });
});
