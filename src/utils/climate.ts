import { CountryClimate } from '../data/countryClimate';

const TURKEY_UTC = 3;
const IDEAL_LOW = 14;
const IDEAL_HIGH = 24;

/**
 * Comfort score per month, higher is better. Penalises distance from a comfortable mean temperature
 * and heavy rain. It describes the capital only and is a guide, not a forecast.
 */
export function monthScores(climate: CountryClimate): number[] {
  return climate.t.map((temp, i) => {
    const tempPenalty = temp < IDEAL_LOW ? IDEAL_LOW - temp : temp > IDEAL_HIGH ? (temp - IDEAL_HIGH) * 1.3 : 0;
    const rainPenalty = (Math.min(climate.p[i], 200) / 200) * 8;
    return -(tempPenalty + rainPenalty);
  });
}

/** Month indexes (0-11) that are close to the best one, at most `max`, in calendar order. */
export function bestMonths(climate: CountryClimate, max = 4): number[] {
  const scores = monthScores(climate);
  const top = Math.max(...scores);
  return scores
    .map((score, month) => ({ score, month }))
    .filter((m) => m.score >= top - 2.5)
    .sort((a, b) => b.score - a.score || a.month - b.month)
    .slice(0, max)
    .map((m) => m.month)
    .sort((a, b) => a - b);
}

/** "UTC+3", "UTC-5", "UTC+5:30". */
export function formatUtc(offset: number): string {
  const sign = offset < 0 ? '-' : '+';
  const abs = Math.abs(offset);
  const hours = Math.floor(abs);
  const minutes = Math.round((abs - hours) * 60);
  return `UTC${sign}${hours}${minutes ? `:${String(minutes).padStart(2, '0')}` : ''}`;
}

/** Standard-time difference to Türkiye in hours (positive: the country is ahead). Daylight saving is ignored. */
export function hoursFromTurkey(offset: number): number {
  return offset - TURKEY_UTC;
}
