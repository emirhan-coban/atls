#!/usr/bin/env node
/**
 * Builds src/data/countryFacts.ts from open data. Run: node scripts/build-country-facts.mjs
 *
 * Sources (all fetched at build time, nothing is fetched by the app):
 *  - mledoze/countries (ODbL)         capital, languages, currency, calling code, area, landlocked
 *  - Wikidata (CC0)                    Turkish capital names
 *  - Wikipedia "Visa requirements for Turkish citizens" (CC BY-SA)   visa status and allowed stay
 *  - Hand-curated in this file         Schengen / EU membership and driving side
 *
 * Country names for matching come from src/data/travelData.js (the app's own catalog of 193 countries).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const UA = 'atls-app-data-build/1.0 (contact: emirhancob4n@gmail.com)';

// ---------------------------------------------------------------------------------------------
// Hand-curated lists (verified by src/data/__tests__/countryFacts.test.ts)
// ---------------------------------------------------------------------------------------------
const SCHENGEN = ['AT','BE','BG','HR','CZ','DK','EE','FI','FR','DE','GR','HU','IS','IT','LV','LI','LT','LU','MT','NL','NO','PL','PT','RO','SK','SI','ES','SE','CH'];
const EU = ['AT','BE','BG','HR','CY','CZ','DK','EE','FI','FR','DE','GR','HU','IE','IT','LV','LT','LU','MT','NL','PL','PT','RO','SK','SI','ES','SE'];
const DRIVES_LEFT = ['AU','NZ','GB','IE','MT','CY','JP','IN','PK','BD','LK','NP','BT','TH','MY','SG','BN','ID','TL','MV','ZA','ZW','ZM','MW','MZ','BW','NA','SZ','LS','KE','UG','TZ','MU','SC','GY','SR','JM','BB','BS','TT','AG','DM','GD','KN','LC','VC','FJ','PG','SB','KI','TV','WS','TO','NR'];

// Names in the Wikipedia table that differ from the dataset's names
const VISA_NAME_ALIASES = {
  'Czech Republic': 'CZ', Czechia: 'CZ', 'Ivory Coast': 'CI', "Côte d'Ivoire": 'CI',
  'Democratic Republic of the Congo': 'CD', 'DR Congo': 'CD', 'Republic of the Congo': 'CG', 'Congo': 'CG',
  'East Timor': 'TL', 'Timor-Leste': 'TL', Eswatini: 'SZ', Swaziland: 'SZ', 'Cape Verde': 'CV', 'Cabo Verde': 'CV',
  Myanmar: 'MM', Burma: 'MM', 'North Macedonia': 'MK', Macedonia: 'MK', 'Vatican City': 'VA', 'Holy See': 'VA',
  Palestine: 'PS', 'State of Palestine': 'PS', Kosovo: 'XK', Taiwan: 'TW', 'The Gambia': 'GM', Gambia: 'GM',
  'The Bahamas': 'BS', Bahamas: 'BS', 'Saint Kitts and Nevis': 'KN', 'Saint Lucia': 'LC',
  'Saint Vincent and the Grenadines': 'VC', 'São Tomé and Príncipe': 'ST', 'Sao Tome and Principe': 'ST',
  'South Korea': 'KR', 'North Korea': 'KP', Russia: 'RU', 'United States': 'US', 'United Kingdom': 'GB',
  'Federated States of Micronesia': 'FM', Micronesia: 'FM', 'Brunei': 'BN', Laos: 'LA', Syria: 'SY', Iran: 'IR',
  Vietnam: 'VN', Moldova: 'MD', Tanzania: 'TZ', Bolivia: 'BO', Venezuela: 'VE', Türkiye: 'TR', Turkey: 'TR',
};

// Mixed entries ("eVisa / Visa on arrival", "Visa not required (conditional) / eVisa") are classified
// by the stricter requirement, so the app never promises easier entry than the source does.
const VISA_STATUS = (text) => {
  const s = text.toLowerCase();
  if (s.includes('freedom of movement')) return 'free';
  if (s.includes('not required')) return s.includes('/') || s.includes('conditional') ? 'conditional' : 'free';
  if (/evisa|e-visa|e-voa|online visa/.test(s)) return 'evisa';
  if (/\beta\b|electronic travel|electronic authori|electronic border/.test(s)) return 'eta';
  if (s.includes('on arrival')) return 'on_arrival';
  if (s.includes('admission refused')) return 'refused';
  if (s.includes('visa required')) return 'required';
  return null;
};

const stripTags = (html) =>
  html
    .replace(/<sup[\s\S]*?<\/sup>/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;|&#160;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/\s+/g, ' ')
    .trim();

async function getJson(url) {
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`${url} -> ${res.status}`);
  return res.json();
}

function parseStay(raw) {
  if (!raw) return null;
  const m = raw.match(/^(\d+)\s*(day|days|month|months)\b/i);
  if (!m) return null;
  return { value: Number(m[1]), unit: m[2].toLowerCase().startsWith('month') ? 'months' : 'days' };
}

async function main() {
  const catalogSrc = readFileSync(join(root, 'src/data/travelData.js'), 'utf8');
  const catalogIds = [...catalogSrc.matchAll(/"id": "([A-Z]{2})"/g)].map((m) => m[1]);

  console.log('fetching country dataset…');
  const countries = await getJson('https://raw.githubusercontent.com/mledoze/countries/master/countries.json');
  const byIso = new Map(countries.map((c) => [c.cca2, c]));
  if (!byIso.has('XK')) byIso.set('XK', null);

  console.log('fetching Turkish capital names…');
  const sparql =
    'SELECT ?iso ?capLabel WHERE { ?c wdt:P297 ?iso; wdt:P36 ?cap. FILTER NOT EXISTS { ?c wdt:P576 ?end } ' +
    'SERVICE wikibase:label { bd:serviceParam wikibase:language "tr,en". } }';
  const wd = await getJson(`https://query.wikidata.org/sparql?format=json&query=${encodeURIComponent(sparql)}`);
  const capitalsTr = new Map();
  for (const row of wd.results.bindings) {
    // Wikidata returns the bare id (e.g. "Q36262") when an item has no Turkish or English label; skip those
    if (/^Q\d+$/.test(row.capLabel.value)) continue;
    const list = capitalsTr.get(row.iso.value) || [];
    if (!list.includes(row.capLabel.value)) list.push(row.capLabel.value);
    capitalsTr.set(row.iso.value, list);
  }

  console.log('fetching visa table…');
  const visaPage = await getJson(
    'https://en.wikipedia.org/w/api.php?action=parse&page=Visa_requirements_for_Turkish_citizens&prop=text|revid&format=json&formatversion=2'
  );
  const tables = visaPage.parse.text.match(/<table[\s\S]*?<\/table>/g) || [];
  const mainTable = tables.find((t) => /Visa requirement/.test(t) && (t.match(/<tr/g) || []).length > 150);
  if (!mainTable) throw new Error('visa table not found');

  // name -> ISO lookup from the dataset plus aliases
  const nameToIso = new Map(Object.entries(VISA_NAME_ALIASES));
  for (const c of countries) {
    nameToIso.set(c.name.common, c.cca2);
    nameToIso.set(c.name.official, c.cca2);
    (c.altSpellings || []).forEach((a) => a.length > 3 && !nameToIso.has(a) && nameToIso.set(a, c.cca2));
  }

  const visa = new Map();
  const unmatched = [];
  for (const row of mainTable.match(/<tr[\s\S]*?<\/tr>/g)) {
    const cells = (row.match(/<t[hd][\s\S]*?<\/t[hd]>/g) || []).map(stripTags);
    if (cells.length < 2 || cells[0] === 'Country') continue;
    const iso = nameToIso.get(cells[0]);
    const status = VISA_STATUS(cells[1]);
    if (!iso) {
      unmatched.push(cells[0]);
      continue;
    }
    if (!status) {
      unmatched.push(`${cells[0]} (status "${cells[1]}")`);
      continue;
    }
    visa.set(iso, { status, stay: parseStay(cells[2]) });
  }

  const langNamesTr = new Intl.DisplayNames(['tr'], { type: 'language' });
  const currencyNamesTr = new Intl.DisplayNames(['tr'], { type: 'currency' });
  const toLangTr = (code, fallback) => {
    try {
      const name = langNamesTr.of(code);
      return name && name !== code ? name : fallback;
    } catch {
      return fallback;
    }
  };

  const facts = {};
  const problems = [];
  for (const iso of catalogIds) {
    const c = byIso.get(iso);
    if (!c) {
      problems.push(`${iso}: not in dataset`);
      continue;
    }
    const capEn = (c.capital || []).join(' / ');
    const capTr = (capitalsTr.get(iso) || c.capital || []).join(' / ');
    const currencyCode = Object.keys(c.currencies || {})[0] || (iso === 'FM' ? 'USD' : null);
    const currencyInfo = currencyCode ? (c.currencies || {})[currencyCode] || { name: 'United States dollar', symbol: '$' } : null;
    let nameTr = null;
    try {
      nameTr = currencyCode ? currencyNamesTr.of(currencyCode) : null;
    } catch {
      nameTr = null;
    }
    const langCodes = Object.keys(c.languages || {});
    const idd = c.idd?.root ? `${c.idd.root}${(c.idd.suffixes || []).length === 1 ? c.idd.suffixes[0] : ''}` : null;

    facts[iso] = {
      capital: { tr: capTr || capEn, en: capEn },
      languages: {
        en: langCodes.map((l) => c.languages[l]),
        tr: langCodes.map((l) => toLangTr(l, c.languages[l])),
      },
      currency: currencyCode
        ? {
            code: currencyCode,
            symbol: currencyInfo.symbol || currencyCode,
            nameEn: currencyInfo.name,
            nameTr: nameTr && nameTr !== currencyCode ? nameTr : currencyInfo.name,
          }
        : null,
      callingCode: idd,
      drivesOn: DRIVES_LEFT.includes(iso) ? 'left' : 'right',
      landlocked: Boolean(c.landlocked),
      areaKm2: Math.round(c.area || 0),
      schengen: SCHENGEN.includes(iso),
      eu: EU.includes(iso),
      visa: visa.get(iso) || { status: 'unknown', stay: null },
    };
  }

  const missingVisa = catalogIds.filter((id) => !visa.has(id));
  const meta = {
    generatedAt: new Date().toISOString().slice(0, 10),
    visaPassport: 'TR',
    visaSource: 'Wikipedia: Visa requirements for Turkish citizens (CC BY-SA 4.0)',
    visaRevision: visaPage.parse.revid,
    dataSources: 'mledoze/countries (ODbL), Wikidata (CC0), Wikipedia (CC BY-SA 4.0)',
  };

  const header = `// GENERATED by scripts/build-country-facts.mjs on ${meta.generatedAt}. Do not edit by hand; rerun the script.
// Sources: ${meta.dataSources}.
// Country facts are derived from the ODbL-licensed mledoze/countries dataset; visa data from Wikipedia revision ${meta.visaRevision}.
`;
  const body = `${header}
export type VisaStatus = 'free' | 'conditional' | 'on_arrival' | 'evisa' | 'eta' | 'required' | 'refused' | 'unknown';

export interface CountryFacts {
  capital: { tr: string; en: string };
  languages: { tr: string[]; en: string[] };
  currency: { code: string; symbol: string; nameTr: string; nameEn: string } | null;
  callingCode: string | null;
  drivesOn: 'left' | 'right';
  landlocked: boolean;
  areaKm2: number;
  schengen: boolean;
  eu: boolean;
  /** Visa requirement for a Turkish passport holder. */
  visa: { status: VisaStatus; stay: { value: number; unit: 'days' | 'months' } | null };
}

export const FACTS_META = ${JSON.stringify(meta, null, 2)};

export const COUNTRY_FACTS: Record<string, CountryFacts> = ${JSON.stringify(facts, null, 2)};
`;
  writeFileSync(join(root, 'src/data/countryFacts.ts'), body);

  const counts = {};
  Object.values(facts).forEach((f) => (counts[f.visa.status] = (counts[f.visa.status] || 0) + 1));
  console.log('countries:', Object.keys(facts).length, '/', catalogIds.length);
  console.log('visa status counts:', counts);
  console.log('no visa row for:', missingVisa.join(', ') || '-');
  console.log('unmatched table rows:', unmatched.join(' | ') || '-');
  if (problems.length) console.log('problems:', problems.join('; '));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
