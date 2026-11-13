/// <reference types="jest" />
import { computePassportStats, sortTripsNewestFirst } from '../passportStats';
import { Country, Trip } from '../../stores/types';

const c = (id: string, continent: string, status: Country['status'] = 'visited'): Country => ({
  id, name: id, nameTr: id, continent, continentTr: continent, flag: '🏳️', status,
});
const trip = (id: string, year: string, month: string | null, days: number | null, createdAt = '2026-01-01T00:00:00Z'): Trip => ({
  id, countryId: 'DE', year, month, days, cities: [], type: 'leisure' as Trip['type'], createdAt, updatedAt: createdAt,
});

describe('passport stats', () => {
  it('sums days only where a length was entered and counts trips', () => {
    const stats = computePassportStats(
      [c('DE', 'Europe'), c('JP', 'Asia'), c('BR', 'South America', 'want')],
      [trip('a', '2026', '10', 9), trip('b', '2026', '09', null), trip('c', '2025', null, 3)],
      'TR',
      200
    );
    expect(stats).toMatchObject({ countries: 2, continents: 2, trips: 3, days: 12, percent: 1 });
    expect(stats.farthestKm).toBeGreaterThan(8000);
  });

  it('is empty-safe', () => {
    expect(computePassportStats([], [], 'TR', 200)).toEqual({
      countries: 0, continents: 0, trips: 0, days: 0, farthestKm: null, percent: 0,
    });
  });

  it('sorts trips newest first and breaks ties by creation time', () => {
    const sorted = sortTripsNewestFirst([
      trip('old', '2024', '05', 1),
      trip('new', '2026', '10', 1),
      trip('same-late', '2025', '03', 1, '2026-02-01T00:00:00Z'),
      trip('same-early', '2025', '03', 1, '2026-01-01T00:00:00Z'),
    ]);
    expect(sorted.map((t) => t.id)).toEqual(['new', 'same-late', 'same-early', 'old']);
  });
});
