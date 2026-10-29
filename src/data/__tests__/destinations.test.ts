/// <reference types="jest" />
import { CURATED_DESTINATIONS } from '../curatedDestinations';
import { MORE_DESTINATIONS } from '../moreDestinations';
import { availableCatalog } from '../travelData';

const all = [...CURATED_DESTINATIONS, ...MORE_DESTINATIONS];

describe('editorial routes', () => {
  it('has at least 60 routes with unique ids that exist in the catalog', () => {
    expect(all.length).toBeGreaterThanOrEqual(60);
    expect(new Set(all.map((d) => d.id)).size).toBe(all.length);
    const catalogIds = new Set(availableCatalog.map((c: any) => c.id));
    all.forEach((d) => expect(catalogIds.has(d.id)).toBe(true));
  });

  it('uses the catalog flag and a known continent for every route', () => {
    const flags = new Map(availableCatalog.map((c: any) => [c.id, c.flag]));
    all.forEach((d) => {
      expect(d.flag).toBe(flags.get(d.id));
      expect(['Europe', 'Asia', 'Africa', 'Americas', 'Oceania']).toContain(d.continent);
    });
  });

  it('fills every text field in both languages and every map query', () => {
    MORE_DESTINATIONS.forEach((d) => {
      expect(d.tag.tr && d.tag.en && d.headline.tr && d.headline.en && d.insiderTip.tr && d.insiderTip.en).toBeTruthy();
      expect(d.seePlaces.length).toBeGreaterThanOrEqual(2);
      expect(d.foodPlaces.length).toBeGreaterThanOrEqual(1);
      [...d.seePlaces, ...d.foodPlaces].forEach((p) => {
        expect(p.title && p.subtitle && p.city && p.desc.tr && p.desc.en && p.mapQuery).toBeTruthy();
      });
    });
  });
});
