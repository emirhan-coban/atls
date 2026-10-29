export type StampShape = 'circle' | 'rounded' | 'octagon' | 'oval';

export interface StampStyle {
  shape: StampShape;
  /** Rotation in degrees, small so it looks hand-stamped. */
  rotation: number;
  /** Whether the stamp has a second, inner outline. */
  doubleBorder: boolean;
  /** Dashed ring texture, like worn ink. */
  worn: boolean;
}

const SHAPES: StampShape[] = ['circle', 'rounded', 'octagon', 'oval'];

/** Small deterministic hash so a country always gets the same stamp. */
export function hashString(value: string): number {
  let h = 2166136261;
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Style for a stamp; `salt` (e.g. the trip id) makes repeat visits to one country look different. */
export function getStampStyle(countryId: string, salt = ''): StampStyle {
  const h = hashString(`${countryId.toUpperCase()}|${salt}`);
  return {
    shape: SHAPES[h % SHAPES.length],
    rotation: ((h >>> 3) % 25) - 12,
    doubleBorder: ((h >>> 8) & 1) === 1,
    worn: ((h >>> 9) & 1) === 1,
  };
}
