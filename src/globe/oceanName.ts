/** Coarse ocean classifier for the name shown when open water is tapped. Lon/lat in radians. */

export type OceanKey = 'pacific' | 'atlantic' | 'indian' | 'southern' | 'arctic';

const NAMES: Record<OceanKey, { en: string; tr: string }> = {
  pacific: { en: 'Pacific Ocean', tr: 'Pasifik Okyanusu' },
  atlantic: { en: 'Atlantic Ocean', tr: 'Atlas Okyanusu' },
  indian: { en: 'Indian Ocean', tr: 'Hint Okyanusu' },
  southern: { en: 'Southern Ocean', tr: 'Güney Okyanusu' },
  arctic: { en: 'Arctic Ocean', tr: 'Kuzey Buz Denizi' },
};

export function classifyOcean(lon: number, lat: number): OceanKey {
  const latD = (lat * 180) / Math.PI;
  let lonD = (lon * 180) / Math.PI;
  lonD = ((((lonD + 180) % 360) + 360) % 360) - 180;
  if (latD <= -60) return 'southern';
  if (latD >= 66) return 'arctic';
  if (lonD >= 20 && lonD < 147) return latD > 30 && lonD < 60 ? 'atlantic' : 'indian'; // Mediterranean/Black Sea side reads as Atlantic
  if (lonD >= 147 || lonD < -70) return latD > 8 && lonD >= -100 && lonD < -70 ? 'atlantic' : 'pacific';
  return 'atlantic';
}

export function oceanName(key: OceanKey, lang: 'tr' | 'en'): string {
  return NAMES[key][lang];
}
