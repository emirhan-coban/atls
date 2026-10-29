/// <reference types="jest" />
import { COUNTRY_FACTS, FACTS_META } from '../countryFacts';
import { availableCatalog } from '../travelData';
import { formatArea, formatStay, getCountryFacts, listLanguages, visaGroup, visaLabel } from '../countryProfile';

const entries = Object.entries(COUNTRY_FACTS);
const VISA_STATUSES = ['free', 'conditional', 'on_arrival', 'evisa', 'eta', 'required', 'refused', 'unknown'];

describe('country facts dataset', () => {
  it('covers every country in the app catalog and nothing else', () => {
    const catalogIds = availableCatalog.map((c: any) => c.id).sort();
    expect(Object.keys(COUNTRY_FACTS).sort()).toEqual(catalogIds);
  });

  it('has a capital, language and calling code for every country', () => {
    for (const [iso, f] of entries) {
      expect([iso, f.capital.en.length > 0]).toEqual([iso, true]);
      expect([iso, f.capital.tr.length > 0]).toEqual([iso, true]);
      expect([iso, f.languages.en.length > 0 && f.languages.en.length === f.languages.tr.length]).toEqual([iso, true]);
      expect([iso, !!f.callingCode && f.callingCode.startsWith('+')]).toEqual([iso, true]);
    }
  });

  it('never shows a raw Wikidata id (Q123) as a capital name', () => {
    const bad = entries.filter(([, f]) => /\bQ\d+\b/.test(f.capital.tr) || /\bQ\d+\b/.test(f.capital.en)).map(([iso]) => iso);
    expect(bad).toEqual([]);
  });

  it('has a currency for every country', () => {
    const missing = entries.filter(([, f]) => !f.currency).map(([iso]) => iso);
    expect(missing).toEqual([]);
  });

  it('uses only known visa statuses and a positive stay when one is given', () => {
    for (const [iso, f] of entries) {
      expect([iso, VISA_STATUSES.includes(f.visa.status)]).toEqual([iso, true]);
      if (f.visa.stay) expect([iso, f.visa.stay.value > 0]).toEqual([iso, true]);
    }
  });

  it('knows the visa rule for nearly every country (only own country and unlisted territories are unknown)', () => {
    const unknown = entries.filter(([, f]) => f.visa.status === 'unknown').map(([iso]) => iso).sort();
    expect(unknown).toEqual(['PS', 'TR', 'TW']);
  });

  it('has the right number of Schengen and EU members', () => {
    expect(entries.filter(([, f]) => f.schengen)).toHaveLength(29);
    expect(entries.filter(([, f]) => f.eu)).toHaveLength(27);
    // EU members outside Schengen are Cyprus and Ireland; Schengen outside the EU are IS, LI, NO, CH
    const euOnly = entries.filter(([, f]) => f.eu && !f.schengen).map(([iso]) => iso).sort();
    expect(euOnly).toEqual(['CY', 'IE']);
    const schengenOnly = entries.filter(([, f]) => f.schengen && !f.eu).map(([iso]) => iso).sort();
    expect(schengenOnly).toEqual(['CH', 'IS', 'LI', 'NO']);
  });

  it('sanity checks well-known facts', () => {
    expect(COUNTRY_FACTS.TR.capital.en).toBe('Ankara');
    expect(COUNTRY_FACTS.GB.capital.tr).toBe('Londra');
    expect(COUNTRY_FACTS.JP.drivesOn).toBe('left');
    expect(COUNTRY_FACTS.FR.drivesOn).toBe('right');
    expect(COUNTRY_FACTS.FR.currency?.code).toBe('EUR');
    expect(COUNTRY_FACTS.US.callingCode).toBe('+1');
    expect(COUNTRY_FACTS.CH.landlocked).toBe(true);
    expect(COUNTRY_FACTS.TR.currency?.nameTr).toBe('Türk lirası');
  });

  it('records where the visa data came from', () => {
    expect(FACTS_META.visaPassport).toBe('TR');
    expect(FACTS_META.visaSource).toMatch(/Wikipedia/);
    expect(FACTS_META.visaRevision).toBeGreaterThan(0);
  });
});

describe('profile helpers', () => {
  it('looks countries up case-insensitively and returns null for unknown ids', () => {
    expect(getCountryFacts('fr')?.capital.en).toBe('Paris');
    expect(getCountryFacts('XX')).toBeNull();
    expect(getCountryFacts(null)).toBeNull();
  });

  it('groups visa statuses for filtering', () => {
    expect(visaGroup('free')).toBe('free');
    expect(visaGroup('evisa')).toBe('easy');
    expect(visaGroup('on_arrival')).toBe('easy');
    expect(visaGroup('required')).toBe('required');
    expect(visaGroup('unknown')).toBeNull();
  });

  it('formats stay, area and languages', () => {
    expect(formatStay({ value: 90, unit: 'days' }, 'tr')).toBe('90 gün');
    expect(formatStay({ value: 3, unit: 'months' }, 'en')).toBe('3 months');
    expect(formatStay(null, 'tr')).toBeNull();
    expect(formatArea(1000, 'en')).toBe('1,000 km²');
    expect(listLanguages(COUNTRY_FACTS.ZA, 'en', 3)).toMatch(/\+8$/);
    expect(visaLabel('free', 'tr')).toBe('Vizesiz');
  });
});
