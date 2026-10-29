import { Country, Profile, Trip } from '../stores/types';

const escapeCsv = (value: unknown): string => {
  const text = value === null || value === undefined ? '' : String(value);
  // Spreadsheet apps run text starting with = + - @ as a formula; prefix a quote so imported notes stay text
  const safe = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
  return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
};

export function tripsToCsv(trips: Trip[], countries: Country[]): string {
  const nameOf = new Map(countries.map((c) => [c.id, c.name]));
  const header = ['country_code', 'country', 'year', 'month', 'days', 'cities', 'type', 'rating', 'notes'];
  const rows = trips.map((t) =>
    [t.countryId, nameOf.get(t.countryId) ?? '', t.year, t.month ?? '', t.days ?? '', t.cities.join('; '), t.type, t.rating ?? '', t.notes ?? '']
      .map(escapeCsv)
      .join(',')
  );
  return [header.join(','), ...rows].join('\n') + '\n';
}

export function countriesToCsv(countries: Country[]): string {
  const header = ['country_code', 'country', 'continent', 'status', 'year', 'month', 'notes'];
  const rows = countries.map((c) =>
    [c.id, c.name, c.continent, c.status, c.visitedYear ?? c.year ?? '', c.visitedMonth ?? c.month ?? '', c.notes ?? '']
      .map(escapeCsv)
      .join(',')
  );
  return [header.join(','), ...rows].join('\n') + '\n';
}

/** Everything the user entered, in one JSON document (data portability). Photos are listed by name only. */
export function buildExportJson(profile: Profile | undefined, countries: Country[], trips: Trip[], now = new Date()): string {
  return JSON.stringify(
    {
      app: 'atls.',
      exportedAt: now.toISOString(),
      profile: profile
        ? {
            name: profile.name,
            handle: profile.handle,
            nationality: profile.nationality,
            homeCountryId: profile.homeCountryId ?? null,
            homeCity: profile.homeCity ?? null,
          }
        : null,
      countries: countries.map((c) => ({
        id: c.id,
        name: c.name,
        continent: c.continent,
        status: c.status,
        year: c.visitedYear ?? c.year ?? null,
        month: c.visitedMonth ?? c.month ?? null,
        notes: c.notes ?? '',
      })),
      trips: trips.map((t) => ({
        id: t.id,
        countryId: t.countryId,
        year: t.year,
        month: t.month ?? null,
        days: t.days ?? null,
        cities: t.cities,
        type: t.type,
        rating: t.rating ?? null,
        notes: t.notes ?? '',
        photos: t.photos ?? [],
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
      })),
    },
    null,
    2
  );
}
