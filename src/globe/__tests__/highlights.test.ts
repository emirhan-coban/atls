import { getHighlights } from '../highlights';
import { ROUTE_PHOTOS } from '../../data/routePhotos';
import { CURATED_DESTINATIONS } from '../../data/curatedDestinations';

describe('getHighlights', () => {
  it('returns photos and places for a curated country', () => {
    const id = CURATED_DESTINATIONS[0].id;
    const h = getHighlights(id, 'en');
    expect(h.photos.length).toBeGreaterThan(0);
    expect(h.places.length).toBeGreaterThan(0);
  });

  it('uses a route photo when there is no curated entry', () => {
    const id = Object.keys(ROUTE_PHOTOS).find((k) => !CURATED_DESTINATIONS.some((d) => d.id === k));
    if (!id) return;
    const h = getHighlights(id, 'tr');
    expect(h.photos).toHaveLength(1);
    expect(h.places).toEqual([]);
  });

  it('is empty for a country with neither', () => {
    expect(getHighlights('ZZ', 'en')).toEqual({ photos: [], places: [] });
  });
});
