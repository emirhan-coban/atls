export interface TravelLevel {
  level: number;
  minCountries: number;
  nameTr: string;
  nameEn: string;
}

export const TRAVEL_LEVELS: TravelLevel[] = [
  { level: 1, minCountries: 0, nameTr: 'Yeni Gezgin', nameEn: 'New Traveler' },
  { level: 2, minCountries: 3, nameTr: 'Gezgin', nameEn: 'Wanderer' },
  { level: 3, minCountries: 8, nameTr: 'Kaşif', nameEn: 'Explorer' },
  { level: 4, minCountries: 20, nameTr: 'Dünya Vatandaşı', nameEn: 'Globetrotter' },
  { level: 5, minCountries: 50, nameTr: 'Efsane Gezgin', nameEn: 'Legend' },
];

export interface LevelProgress {
  current: TravelLevel;
  next: TravelLevel | null;
  /** Countries still needed for the next level (0 at max level). */
  remaining: number;
  /** 0..1 progress between the current and the next level. */
  fraction: number;
}

export function getLevelProgress(visitedCount: number): LevelProgress {
  let current = TRAVEL_LEVELS[0];
  for (const level of TRAVEL_LEVELS) {
    if (visitedCount >= level.minCountries) current = level;
  }
  const next = TRAVEL_LEVELS.find((l) => l.level === current.level + 1) ?? null;
  if (!next) return { current, next: null, remaining: 0, fraction: 1 };
  const span = next.minCountries - current.minCountries;
  return {
    current,
    next,
    remaining: next.minCountries - visitedCount,
    fraction: Math.min(1, Math.max(0, (visitedCount - current.minCountries) / span)),
  };
}
