/**
 * 256x1 RGBA lookup the shader keys by country id: colour of the user's status, alpha 0 for "no status".
 * Bytes are premultiplied, as the Skia image that wraps them is declared premultiplied; the shader divides alpha out.
 */
import type { Country } from '../stores/types';
import { idOfIso } from './countryIndex';

export type RGB = [number, number, number];
export interface StatusColors {
  visited: RGB;
  lived: RGB;
  want: RGB;
}

export function hexToRgb(hex: string): RGB {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

/** Wishlist stays a little lighter than the other two so it never reads as "been there". */
export const WANT_ALPHA = 200;

export function buildStatusLut(countries: Pick<Country, 'id' | 'status'>[], colors: StatusColors): Uint8Array {
  const lut = new Uint8Array(256 * 4);
  // lived outranks visited outranks want when the same id appears twice
  const rank = { want: 1, visited: 2, lived: 3 } as const;
  const best = new Map<number, keyof typeof rank>();
  for (const c of countries) {
    const id = idOfIso(c.id);
    if (!id || !(c.status in rank)) continue;
    const prev = best.get(id);
    if (!prev || rank[c.status as keyof typeof rank] > rank[prev]) best.set(id, c.status as keyof typeof rank);
  }
  best.forEach((status, id) => {
    const [r, g, b] = colors[status];
    const a = status === 'want' ? WANT_ALPHA : 255;
    lut.set([Math.round((r * a) / 255), Math.round((g * a) / 255), Math.round((b * a) / 255), a], id * 4);
  });
  return lut;
}
