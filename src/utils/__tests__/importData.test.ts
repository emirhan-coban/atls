/// <reference types="jest" />
import { buildExportJson } from '../exportData';
import { MAX_IMPORT_BYTES, parseBackup, planImport } from '../importData';
import { Country, Trip } from '../../stores/types';

const country = (id: string, status: Country['status'], extra: Partial<Country> = {}): Country =>
  ({ id, name: id, nameTr: id, continent: 'Europe', continentTr: 'Avrupa', flag: '🏳️', status, ...extra }) as Country;

const trip = (id: string, countryId: string, extra: Partial<Trip> = {}): Trip => ({
  id, countryId, year: '2024', month: '06', days: 7, cities: ['Paris'], type: 'leisure', rating: 4, notes: 'güzel', photos: ['a.jpg'],
  createdAt: '2024-06-01T00:00:00.000Z', updatedAt: '2024-06-02T00:00:00.000Z', ...extra,
});

describe('backup import', () => {
  it('reads what the export wrote, and drops photo names that mean nothing on a new phone', () => {
    const json = buildExportJson(undefined, [country('FR', 'visited', { visitedYear: '2024', notes: 'x' })], [trip('t1', 'FR')]);
    const parsed = parseBackup(json)!;
    expect(parsed.countries).toEqual([{ id: 'FR', status: 'visited', year: '2024', month: null, notes: 'x' }]);
    expect(parsed.trips[0]).toMatchObject({ id: 't1', countryId: 'FR', year: '2024', month: '06', days: 7, rating: 4, photos: [] });
  });

  it('rejects files that are not an atls. backup', () => {
    expect(parseBackup('not json')).toBeNull();
    expect(parseBackup('{"app":"other","countries":[],"trips":[]}')).toBeNull();
    expect(parseBackup('{"app":"atls.","countries":{},"trips":[]}')).toBeNull();
    expect(parseBackup(' '.repeat(MAX_IMPORT_BYTES + 1))).toBeNull();
  });

  it('skips unreadable entries instead of failing the whole file', () => {
    const raw = JSON.stringify({
      app: 'atls.',
      countries: [{ id: 'fr', status: 'visited' }, { id: 'ZZ', status: 'visited' }, { id: 'TR', status: 'flying' }, null],
      trips: [
        { id: 'ok', countryId: 'TR', year: '2023', type: 'weird', rating: 9, days: -2, cities: ['İzmir', 5] },
        { id: 'bad-year', countryId: 'TR', year: 'last year' },
        { countryId: 'TR', year: '2023' },
      ],
    });
    const parsed = parseBackup(raw)!;
    expect(parsed.countries.map((c) => c.id)).toEqual(['FR']);
    expect(parsed.trips).toHaveLength(1);
    expect(parsed.trips[0]).toMatchObject({ type: 'leisure', rating: null, days: null, cities: ['İzmir'] });
  });

  it('only adds what is missing and never overwrites the phone', () => {
    const backup = parseBackup(
      buildExportJson(undefined, [country('FR', 'visited'), country('JP', 'want')], [trip('t1', 'FR'), trip('t2', 'IT')])
    )!;
    const plan = planImport(backup, [country('FR', 'lived')], ['t1']);
    expect(plan.newCountries.map((c) => c.id).sort()).toEqual(['IT', 'JP']); // IT comes in through its trip
    expect(plan.newTrips.map((t) => t.id)).toEqual(['t2']);
    expect(plan.skipped).toBe(2); // FR country and t1 already there
    expect(plan.newCountries.find((c) => c.id === 'IT')?.status).toBe('visited');
  });

  it('importing the same file twice adds nothing the second time', () => {
    const backup = parseBackup(buildExportJson(undefined, [country('FR', 'visited')], [trip('t1', 'FR')]))!;
    const first = planImport(backup, [], []);
    const second = planImport(backup, first.newCountries, first.newTrips.map((t) => t.id));
    expect(second.newCountries).toHaveLength(0);
    expect(second.newTrips).toHaveLength(0);
  });
});
