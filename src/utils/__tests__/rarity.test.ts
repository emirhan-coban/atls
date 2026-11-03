/// <reference types="jest" />
import { buildRarityMap, formatPercent, rarityOf, tierOf } from '../rarity';

describe('rarity', () => {
  it('maps a share of travelers to a tier', () => {
    expect(tierOf(0.5)).toBe('legendary');
    expect(tierOf(2)).toBe('rare');
    expect(tierOf(7.9)).toBe('rare');
    expect(tierOf(8)).toBe('uncommon');
    expect(tierOf(24.9)).toBe('uncommon');
    expect(tierOf(25)).toBeNull();
  });

  it('builds percentages and skips unusable rows', () => {
    const map = buildRarityMap([
      { country_id: 'fr', travelers: 60, total_travelers: 100 },
      { country_id: 'JP', travelers: 5, total_travelers: 100 },
      { country_id: 'XX', travelers: 1, total_travelers: 0 },
    ]);
    expect(map.get('FR')).toEqual({ percent: 60, tier: null });
    expect(map.get('JP')?.tier).toBe('rare');
    expect(map.has('XX')).toBe(false);
  });

  it('treats a missing country as unvisited by anyone, but only once stats exist', () => {
    const map = buildRarityMap([{ country_id: 'FR', travelers: 60, total_travelers: 100 }]);
    expect(rarityOf(map, 'tv')).toEqual({ percent: 0, tier: 'legendary' });
    expect(rarityOf(null, 'TV')).toBeNull();
    expect(rarityOf(new Map(), 'TV')).toBeNull();
  });

  it('formats small percentages', () => {
    expect(formatPercent(0)).toBe('0');
    expect(formatPercent(0.4)).toBe('<1');
    expect(formatPercent(3.6)).toBe('4');
  });
});
