/** Which country the globe settles on at start: the user's nationality, then where they live, then Türkiye. */
import { normalize } from './countryNames';
import { labelOfIso } from './countryIndex';

interface Named { id: string; name: string; nameTr: string }
const DEMONYMS: Record<string, string> = { turkish: 'TR', turk: 'TR', german: 'DE', french: 'FR', british: 'GB', american: 'US', italian: 'IT', spanish: 'ES', dutch: 'NL', russian: 'RU', japanese: 'JP', chinese: 'CN', indian: 'IN', brazilian: 'BR', canadian: 'CA', australian: 'AU' };

export function resolveHomeCountry(
  profile: { nationality?: string; location?: string; locationTr?: string } | null | undefined,
  catalog: Named[]
): { iso2: string; lon: number; lat: number } {
  const tryText = (text?: string) => {
    if (!text) return null;
    const n = normalize(text);
    if (!n) return null;
    if (DEMONYMS[n]) return DEMONYMS[n];
    const hit = catalog.find((c) => normalize(c.name) === n || normalize(c.nameTr) === n || c.id.toLowerCase() === n);
    if (hit) return hit.id;
    // "Istanbul, Turkey": normalize() turned the comma into a space, so try the last word as a name
    const last = n.split(' ').slice(-1)[0];
    return DEMONYMS[last] ?? catalog.find((c) => normalize(c.name) === last || normalize(c.nameTr) === last)?.id ?? null;
  };
  for (const text of [profile?.nationality, profile?.location, profile?.locationTr]) {
    const iso = tryText(text);
    const label = iso ? labelOfIso(iso) : null;
    if (iso && label) return { iso2: iso, ...label };
  }
  const tr = labelOfIso('TR');
  // yaw 4.0 rad is the Middle East if even Türkiye is missing from the index
  return tr ? { iso2: 'TR', ...tr } : { iso2: 'TR', lon: 0.6, lat: 0.68 };
}
