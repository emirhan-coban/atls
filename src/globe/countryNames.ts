/** Search aliases and the display shortener for long country names. Pure, so it can be tested. */

export interface SearchableCountry {
  id: string;
  name: string;
  nameTr: string;
}

/** Lowercase, no diacritics, Turkish dotless i folded, single spaces. */
export function normalize(text: string): string {
  return text
    .replace(/İ/g, 'i')
    .replace(/ı/g, 'i')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9 ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** alias -> ISO alpha-2 */
export const ALIASES: Record<string, string> = {
  usa: 'US', us: 'US', america: 'US', 'united states of america': 'US', abd: 'US', amerika: 'US',
  uk: 'GB', britain: 'GB', 'great britain': 'GB', england: 'GB', scotland: 'GB', ingiltere: 'GB', 'birlesik krallik': 'GB',
  uae: 'AE', dubai: 'AE', 'abu dhabi': 'AE', 'birlesik arap emirlikleri': 'AE', bae: 'AE',
  holland: 'NL', hollanda: 'NL',
  'czech republic': 'CZ', cekya: 'CZ', 'cek cumhuriyeti': 'CZ',
  burma: 'MM',
  macedonia: 'MK', 'kuzey makedonya': 'MK',
  swaziland: 'SZ',
  drc: 'CD', 'dr congo': 'CD', 'congo kinshasa': 'CD',
  korea: 'KR', 'south korea': 'KR', 'guney kore': 'KR',
  almanya: 'DE', germany: 'DE', deutschland: 'DE',
  fransa: 'FR', ispanya: 'ES', italya: 'IT', yunanistan: 'GR', rusya: 'RU', cin: 'CN', japonya: 'JP',
  turkey: 'TR', turkiye: 'TR', turkei: 'TR',
  isvec: 'SE', isvicre: 'CH', norvec: 'NO', danimarka: 'DK', avusturya: 'AT', belcika: 'BE', polonya: 'PL',
  macaristan: 'HU', romanya: 'RO', bulgaristan: 'BG', hirvatistan: 'HR', sirbistan: 'RS', misir: 'EG',
  'ivory coast': 'CI', 'fildisi sahili': 'CI',
  'cape verde': 'CV', 'east timor': 'TL', 'vatican': 'VA', 'holy see': 'VA',
};

/** Long names -> what fits in the big title. */
const SHORT_NAMES: Record<string, string> = {
  'United States of America': 'United States',
  'Democratic Republic of the Congo': 'DR Congo',
  'Republic of the Congo': 'Congo',
  'Central African Republic': 'Central African Rep.',
  'United Arab Emirates': 'UAE',
  'Bosnia and Herzegovina': 'Bosnia & Herz.',
  'Saint Vincent and the Grenadines': 'St. Vincent & Gren.',
  'Saint Kitts and Nevis': 'St. Kitts & Nevis',
  'Antigua and Barbuda': 'Antigua & Barbuda',
  'Trinidad and Tobago': 'Trinidad & Tobago',
  'São Tomé and Príncipe': 'São Tomé & Príncipe',
  'Sao Tome and Principe': 'São Tomé & Príncipe',
  'Papua New Guinea': 'Papua New Guinea',
  'Federated States of Micronesia': 'Micronesia',
  'Equatorial Guinea': 'Equatorial Guinea',
  'North Macedonia': 'North Macedonia',
};

export function shortenName(name: string): string {
  return SHORT_NAMES[name] ?? name;
}

/**
 * Matches name, Turkish name and aliases. Exact alias wins, then prefix matches, then substrings;
 * results are sorted by that rank and then alphabetically.
 */
export function searchCountries<T extends SearchableCountry>(query: string, countries: T[], limit = 8): T[] {
  const q = normalize(query);
  if (!q) return [];
  const aliasIso = ALIASES[q];
  const scored: { c: T; rank: number }[] = [];
  for (const c of countries) {
    const names = [normalize(c.name), normalize(c.nameTr)];
    let rank = 99;
    if (aliasIso && c.id === aliasIso) rank = 0;
    else if (names.some((n) => n === q)) rank = 1;
    else if (names.some((n) => n.startsWith(q))) rank = 2;
    else if (Object.keys(ALIASES).some((a) => ALIASES[a] === c.id && a.startsWith(q))) rank = 3;
    else if (names.some((n) => n.split(' ').some((w) => w.startsWith(q)))) rank = 4;
    else if (q.length >= 3 && names.some((n) => n.includes(q))) rank = 5;
    if (rank < 99) scored.push({ c, rank });
  }
  scored.sort((a, b) => a.rank - b.rank || a.c.name.localeCompare(b.c.name));
  return scored.slice(0, limit).map((s) => s.c);
}
