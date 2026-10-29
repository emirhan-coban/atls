/// <reference types="jest" />
import { bestMonths, formatUtc, hoursFromTurkey, monthScores } from '../climate';
import { COUNTRY_CLIMATE } from '../../data/countryClimate';
import { availableCatalog } from '../../data/travelData';

const flat = (t: number, p: number) => ({ t: Array(12).fill(t), p: Array(12).fill(p), tz: 'UTC', utc: 0 });

describe('best months', () => {
  it('prefers mild, dry months', () => {
    const climate = { ...flat(10, 20), t: [2, 3, 8, 13, 18, 22, 25, 25, 20, 14, 8, 3], p: [60, 50, 50, 40, 40, 30, 10, 10, 30, 60, 70, 70] };
    expect(bestMonths(climate).every((m) => m >= 3 && m <= 9)).toBe(true);
    expect(bestMonths(climate)).toContain(6);
    expect(bestMonths(climate)).not.toContain(0);
  });

  it('avoids the rainy season even when it is warm', () => {
    const climate = { ...flat(27, 20), p: [5, 5, 5, 10, 50, 200, 300, 300, 150, 40, 10, 5] };
    const best = bestMonths(climate);
    expect(best).not.toContain(6);
    expect(best.length).toBeGreaterThan(0);
  });

  it('never returns more than the limit and always at least one month', () => {
    expect(bestMonths(flat(20, 0))).toHaveLength(4);
    expect(bestMonths(flat(40, 300)).length).toBeGreaterThanOrEqual(1);
    expect(monthScores(flat(20, 0)).every((s) => s === 0)).toBe(true);
  });
});

describe('time zone helpers', () => {
  it('formats offsets', () => {
    expect(formatUtc(3)).toBe('UTC+3');
    expect(formatUtc(-5)).toBe('UTC-5');
    expect(formatUtc(5.5)).toBe('UTC+5:30');
    expect(formatUtc(0)).toBe('UTC+0');
  });
  it('measures the difference to Türkiye', () => {
    expect(hoursFromTurkey(3)).toBe(0);
    expect(hoursFromTurkey(9)).toBe(6);
    expect(hoursFromTurkey(-5)).toBe(-8);
  });
});

describe('generated climate data', () => {
  it('covers nearly every catalog country with sane values', () => {
    const covered = availableCatalog.filter((c: any) => COUNTRY_CLIMATE[c.id]);
    expect(covered.length / availableCatalog.length).toBeGreaterThan(0.9);
    for (const [id, c] of Object.entries(COUNTRY_CLIMATE)) {
      expect(c.t).toHaveLength(12);
      expect(c.p).toHaveLength(12);
      expect(c.t.every((v) => v > -50 && v < 50)).toBe(true);
      expect(c.p.every((v) => v >= 0 && v < 3000)).toBe(true);
      expect(c.utc).toBeGreaterThanOrEqual(-12);
      expect(c.utc).toBeLessThanOrEqual(14);
      expect(c.tz).toBeTruthy();
      expect(id).toMatch(/^[A-Z]{2}$/);
    }
  });

  it('matches known facts', () => {
    expect(COUNTRY_CLIMATE.TR.utc).toBe(3);
    expect(COUNTRY_CLIMATE.JP.utc).toBe(9);
    expect(COUNTRY_CLIMATE.IN.utc).toBe(5.5);
    // Southern hemisphere: Buenos Aires is warmest around January
    const ar = COUNTRY_CLIMATE.AR.t;
    expect(ar.indexOf(Math.max(...ar))).toBeLessThanOrEqual(1);
    // Reykjavik is cold in every month
    expect(Math.max(...COUNTRY_CLIMATE.IS.t)).toBeLessThan(16);
  });
});
