/// <reference types="jest" />
import { buildExportJson, countriesToCsv, tripsToCsv } from '../exportData';
import { mergeTrips } from '../../services/storageService';
import { Country, Trip } from '../../stores/types';

const country = (id: string, extra: Partial<Country> = {}): Country => ({
  id,
  name: id,
  nameTr: id,
  continent: 'Europe',
  continentTr: 'Avrupa',
  flag: '🏳️',
  status: 'visited',
  ...extra,
});

const trip = (extra: Partial<Trip> = {}): Trip => ({
  id: 't1',
  countryId: 'FR',
  year: '2024',
  cities: ['Paris', 'Lyon'],
  type: 'leisure',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  ...extra,
});

describe('CSV export', () => {
  it('writes a header and one row per trip', () => {
    const csv = tripsToCsv([trip({ days: 5, rating: 4 })], [country('FR', { name: 'France' })]);
    const lines = csv.trim().split('\n');
    expect(lines[0]).toBe('country_code,country,year,month,days,cities,type,rating,notes');
    expect(lines[1]).toBe('FR,France,2024,,5,Paris; Lyon,leisure,4,');
  });

  it('quotes commas, quotes and line breaks', () => {
    const csv = tripsToCsv([trip({ notes: 'Great "food", nice\nweather' })], []);
    expect(csv).toContain('"Great ""food"", nice\nweather"');
  });

  it('neutralises spreadsheet formulas in free text', () => {
    const csv = tripsToCsv([trip({ notes: '=HYPERLINK("http://x")' })], []);
    expect(csv).toContain(`"'=HYPERLINK(""http://x"")"`);
    expect(countriesToCsv([country('FR', { notes: '+1' })])).toContain("'+1");
  });
});

describe('JSON export', () => {
  it('contains countries and trips and no cloud or auth data', () => {
    const json = JSON.parse(
      buildExportJson({ name: 'Ada', handle: '@ada', email: 'ada@example.com', passportNo: 'AT-1' } as any, [country('FR')], [trip({ photos: ['a.jpg'] })], new Date('2026-01-01T00:00:00Z'))
    );
    expect(json.exportedAt).toBe('2026-01-01T00:00:00.000Z');
    expect(json.countries).toHaveLength(1);
    expect(json.trips[0].photos).toEqual(['a.jpg']);
    expect(JSON.stringify(json)).not.toContain('ada@example.com');
  });
});

describe('trip merge with photos', () => {
  it('keeps local photos when the cloud copy is the newer one', () => {
    const local = trip({ photos: ['a.jpg'], updatedAt: '2024-01-01T00:00:00.000Z' });
    const cloud = { ...trip({ notes: 'edited elsewhere' }), updatedAt: '2025-01-01T00:00:00.000Z' };
    const { trips } = mergeTrips([local], [cloud], { keepLocalOnly: false, pendingKeys: new Set() });
    expect(trips[0].notes).toBe('edited elsewhere');
    expect(trips[0].photos).toEqual(['a.jpg']);
  });
});
