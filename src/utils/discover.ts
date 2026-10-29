import { COUNTRY_CLIMATE } from '../data/countryClimate';
import { getCountryFacts, VISA_RANK, visaGroup, VisaStatus } from '../data/countryProfile';
import { availableCatalog } from '../data/travelData';
import { bestMonths, monthScores } from './climate';

/**
 * Countries never suggested in "where this month": active conflict or official "do not travel" advice at the time of writing.
 * This is an editorial list, not live data. It only affects suggestions; every country stays reachable in the full list.
 */
export const NOT_SUGGESTED = new Set([
  'SY', 'AF', 'YE', 'SO', 'SS', 'LY', 'IQ', 'SD', 'ML', 'BF', 'NE', 'CF', 'HT', 'MM', 'KP', 'UA', 'PS', 'LB', 'IR', 'VE',
]);

export interface MonthPick {
  id: string;
  /** Mean temperature of the capital in that month, °C. */
  temp: number;
  visa: VisaStatus;
}

/** Months (0-11) that suit this country, or an empty list when there is no climate data. */
export function goodMonthsFor(countryId: string): number[] {
  const climate = COUNTRY_CLIMATE[countryId.toUpperCase()];
  return climate ? bestMonths(climate) : [];
}

export const isGoodIn = (countryId: string, month: number) => goodMonthsFor(countryId).includes(month);

/**
 * "Where this month?": countries that are comfortable in the given month and easy to enter with a Turkish passport
 * (visa-free, on arrival, e-visa or electronic authorisation), leaving out places the user has already been.
 * Easiest entry first, then the most comfortable month.
 */
export function monthPicks(month: number, skipIds: Set<string>, limit = 10): MonthPick[] {
  const picks: (MonthPick & { score: number })[] = [];
  for (const entry of availableCatalog) {
    const id = entry.id;
    if (skipIds.has(id) || NOT_SUGGESTED.has(id)) continue;
    const climate = COUNTRY_CLIMATE[id];
    const facts = getCountryFacts(id);
    if (!climate || !facts) continue;
    const group = visaGroup(facts.visa.status);
    if (group !== 'free' && group !== 'easy') continue;
    if (!bestMonths(climate).includes(month)) continue;
    picks.push({ id, temp: climate.t[month], visa: facts.visa.status, score: monthScores(climate)[month] });
  }
  return picks
    .sort((a, b) => VISA_RANK[a.visa] - VISA_RANK[b.visa] || b.score - a.score || a.id.localeCompare(b.id))
    .slice(0, limit)
    .map(({ score: _score, ...pick }) => pick);
}

/** "May · Haz · Tem" style list of month names, in calendar order. */
export function formatMonthList(months: number[], names: string[]): string {
  return months.map((m) => names[m]).join(' · ');
}
