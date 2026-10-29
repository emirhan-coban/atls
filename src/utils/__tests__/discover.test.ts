/// <reference types="jest" />
import { formatMonthList, goodMonthsFor, isGoodIn, monthPicks, NOT_SUGGESTED } from '../discover';
import { getCountryFacts, visaGroup } from '../../data/countryProfile';

describe('monthPicks', () => {
  it('only returns countries that are good in that month and easy to enter', () => {
    for (const month of [0, 4, 7, 10]) {
      const picks = monthPicks(month, new Set(), 12);
      expect(picks.length).toBeGreaterThan(0);
      picks.forEach((p) => {
        expect(isGoodIn(p.id, month)).toBe(true);
        expect(['free', 'easy']).toContain(visaGroup(p.visa));
        expect(getCountryFacts(p.id)?.visa.status).toBe(p.visa);
      });
    }
  });

  it('skips visited countries, respects the limit and sorts easiest entry first', () => {
    const all = monthPicks(5, new Set(), 50);
    const skip = new Set([all[0].id]);
    const next = monthPicks(5, skip, 3);
    expect(next).toHaveLength(3);
    expect(next.some((p) => skip.has(p.id))).toBe(false);
    const ranks = all.map((p) => ['free', 'conditional', 'on_arrival', 'eta', 'evisa'].indexOf(p.visa));
    expect([...ranks].sort((a, b) => a - b)).toEqual(ranks);
  });

  it('never suggests countries on the not-suggested list', () => {
    for (let month = 0; month < 12; month++) {
      monthPicks(month, new Set(), 200).forEach((p) => expect(NOT_SUGGESTED.has(p.id)).toBe(false));
    }
  });

  it('returns no months for a country without data', () => {
    expect(goodMonthsFor('XX')).toEqual([]);
    expect(isGoodIn('XX', 3)).toBe(false);
  });

  it('formats month lists', () => {
    expect(formatMonthList([4, 5, 6], ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem'])).toBe('May · Haz · Tem');
  });
});
