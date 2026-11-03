/// <reference types="jest" />
import { computeStoryFacts, haversineKm } from '../storyFacts';
import { labelOfIso } from '../../globe/countryIndex';
import { Country } from '../../stores/types';

const c = (id: string, continent: string, status: Country['status'] = 'visited'): Country => ({
  id, name: id, nameTr: id, continent, continentTr: continent, flag: '🏳️', status,
});

describe('story facts', () => {
  it('measures distance between two points', () => {
    const tr = labelOfIso('TR')!;
    const jp = labelOfIso('JP')!;
    const km = haversineKm(tr, jp);
    expect(km).toBeGreaterThan(8000);
    expect(km).toBeLessThan(10000);
    expect(haversineKm(tr, tr)).toBe(0);
  });

  it('counts visited and lived, ignores wishlist, and finds the farthest country', () => {
    const facts = computeStoryFacts(
      [c('DE', 'Europe'), c('JP', 'Asia'), c('FR', 'Europe', 'lived'), c('BR', 'South America', 'want')],
      'TR',
      200
    );
    expect(facts.count).toBe(3);
    expect(facts.percent).toBe(1.5);
    expect(facts.continents).toBe(2);
    expect(facts.farthest?.id).toBe('JP');
    expect(facts.reel).toHaveLength(3);
  });

  it('handles an empty passport and an unknown home', () => {
    const empty = computeStoryFacts([], 'TR', 200);
    expect(empty).toMatchObject({ count: 0, percent: 0, continents: 0, farthest: null });
    expect(computeStoryFacts([c('JP', 'Asia')], 'ZZ', 200).farthest).toBeNull();
  });
});
