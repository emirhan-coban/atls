/** Photos and places shown in the country sheet, from the data the app already ships. */
import { CURATED_DESTINATIONS } from '../data/curatedDestinations';
import { ROUTE_PHOTOS } from '../data/routePhotos';

export interface HighlightPhoto {
  url: string;
  credit?: string;
}
export interface HighlightPlace {
  title: string;
  city: string;
  blurb: string;
}
export interface Highlights {
  photos: HighlightPhoto[];
  places: HighlightPlace[];
}

export function getHighlights(iso: string, lang: 'tr' | 'en'): Highlights {
  const photos: HighlightPhoto[] = [];
  const route = ROUTE_PHOTOS[iso];
  if (route) photos.push({ url: route.url, credit: route.credit });
  const curated = CURATED_DESTINATIONS.find((d) => d.id === iso);
  if (curated?.heroImage && !photos.some((p) => p.url === curated.heroImage)) photos.push({ url: curated.heroImage });
  const places = (curated?.seePlaces ?? []).slice(0, 5).map((p) => ({ title: p.title, city: p.city, blurb: p.desc[lang] }));
  // a country with places but no photo still has nothing to page through
  return { photos, places: photos.length ? places : [] };
}
