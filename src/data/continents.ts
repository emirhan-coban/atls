/** The six continent groups shown in filters. The catalog splits the Americas into North and South; filters treat them as one. */
export type ContinentGroup = 'Europe' | 'Asia' | 'Americas' | 'Africa' | 'Oceania';
export type ContinentFilter = 'all' | ContinentGroup;

export const CONTINENT_FILTERS: { id: ContinentFilter; tr: string; en: string }[] = [
  { id: 'all', tr: 'Tümü', en: 'All' },
  { id: 'Europe', tr: 'Avrupa', en: 'Europe' },
  { id: 'Asia', tr: 'Asya', en: 'Asia' },
  { id: 'Americas', tr: 'Amerika', en: 'Americas' },
  { id: 'Africa', tr: 'Afrika', en: 'Africa' },
  { id: 'Oceania', tr: 'Okyanusya', en: 'Oceania' },
];

/** Maps a raw catalog continent ("North America", "South America", "Americas", ...) to its filter group. */
export function continentGroup(raw: string | null | undefined): ContinentGroup | null {
  const value = (raw ?? '').toLowerCase();
  if (value.includes('america')) return 'Americas';
  if (value === 'europe') return 'Europe';
  if (value === 'asia') return 'Asia';
  if (value === 'africa') return 'Africa';
  if (value === 'oceania') return 'Oceania';
  return null;
}

export const inContinent = (raw: string | null | undefined, filter: ContinentFilter): boolean =>
  filter === 'all' || continentGroup(raw) === filter;
