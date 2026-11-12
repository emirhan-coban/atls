/**
 * Country outlines for the Silhouette mode, cut from the world map data (one shared projection, north up).
 * Overseas pieces (Azores, Hawaii, Svalbard…) would shrink the main shape to a speck, so only the parts near the
 * largest piece are drawn, and the view box is fitted to those.
 */
import { worldMapFeatures } from '../data/worldMapPaths';

export interface Silhouette {
  d: string;
  /** SVG view box ("x y w h") with a little air around the shape. */
  viewBox: string;
  width: number;
  height: number;
}

interface Box { minX: number; minY: number; maxX: number; maxY: number }

const byId = new Map(worldMapFeatures.map((f) => [f.id, f.d]));
const cache = new Map<string, Silhouette | null>();

function boxOf(subpath: string): Box | null {
  const nums = subpath.match(/-?\d+\.?\d*/g);
  if (!nums || nums.length < 4) return null;
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (let i = 0; i + 1 < nums.length; i += 2) {
    const x = Number(nums[i]);
    const y = Number(nums[i + 1]);
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  return { minX, minY, maxX, maxY };
}

const area = (b: Box) => (b.maxX - b.minX) * (b.maxY - b.minY);

/** The outline of a country, or null when the map has no shape for it. Cached. */
export function silhouetteFor(id: string): Silhouette | null {
  const key = id.toUpperCase();
  if (cache.has(key)) return cache.get(key)!;
  const full = byId.get(key);
  let result: Silhouette | null = null;
  if (full) {
    const parts = full.split(/(?=M)/).map((d) => ({ d, box: boxOf(d) })).filter((p): p is { d: string; box: Box } => p.box !== null);
    if (parts.length) {
      const main = parts.reduce((a, b) => (area(b.box) > area(a.box) ? b : a));
      const reach = Math.max(main.box.maxX - main.box.minX, main.box.maxY - main.box.minY) * 0.6;
      const near = parts.filter(
        (p) => p.box.maxX >= main.box.minX - reach && p.box.minX <= main.box.maxX + reach && p.box.maxY >= main.box.minY - reach && p.box.minY <= main.box.maxY + reach
      );
      const all = near.reduce<Box>(
        (acc, p) => ({ minX: Math.min(acc.minX, p.box.minX), minY: Math.min(acc.minY, p.box.minY), maxX: Math.max(acc.maxX, p.box.maxX), maxY: Math.max(acc.maxY, p.box.maxY) }),
        { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }
      );
      const width = all.maxX - all.minX;
      const height = all.maxY - all.minY;
      const pad = Math.max(width, height) * 0.06;
      result = {
        d: near.map((p) => p.d).join(''),
        viewBox: `${(all.minX - pad).toFixed(2)} ${(all.minY - pad).toFixed(2)} ${(width + pad * 2).toFixed(2)} ${(height + pad * 2).toFixed(2)}`,
        width,
        height,
      };
    }
  }
  cache.set(key, result);
  return result;
}

/** Shapes whose longest side is smaller than this (map units) are not recognisable and stay out of the mode. */
export const SILHOUETTE_MIN_SIDE = 8;
