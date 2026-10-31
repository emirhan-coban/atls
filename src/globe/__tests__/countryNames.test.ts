import { availableCatalog } from '../../data/travelData';
import { searchCountries, shortenName, normalize } from '../countryNames';
import { classifyOcean } from '../oceanName';
import { idOfIso, isoOfId, labelOfIso, COUNTRY_COUNT } from '../countryIndex';
import { resolveHomeCountry } from '../homeCountry';

const first = (q: string) => searchCountries(q, availableCatalog)[0]?.id;
const deg = (d: number) => (d * Math.PI) / 180;

describe('search', () => {
  it('matches English aliases', () => {
    expect(first('usa')).toBe('US');
    expect(first('america')).toBe('US');
    expect(first('uk')).toBe('GB');
    expect(first('britain')).toBe('GB');
    expect(first('england')).toBe('GB');
    expect(first('uae')).toBe('AE');
    expect(first('dubai')).toBe('AE');
    expect(first('holland')).toBe('NL');
    expect(first('czech republic')).toBe('CZ');
    expect(first('burma')).toBe('MM');
    expect(first('macedonia')).toBe('MK');
    expect(first('swaziland')).toBe('SZ');
    expect(first('drc')).toBe('CD');
    expect(first('korea')).toBe('KR');
  });

  it('matches Turkish names and aliases', () => {
    expect(first('almanya')).toBe('DE');
    expect(first('ingiltere')).toBe('GB');
    expect(first('abd')).toBe('US');
    expect(first('Türkiye')).toBe('TR');
    expect(first('ISPANYA')).toBe('ES');
  });

  it('finds by prefix and ignores diacritics', () => {
    expect(first('niger')).toBe('NE');
    expect(searchCountries('nige', availableCatalog).map((c) => c.id)).toEqual(expect.arrayContaining(['NG', 'NE']));
    expect(normalize('İstanbul ı Ş')).toBe('istanbul i s');
    expect(searchCountries('', availableCatalog)).toEqual([]);
  });
});

describe('display shortener', () => {
  it('shortens long names and leaves others alone', () => {
    expect(shortenName('United States of America')).toBe('United States');
    expect(shortenName('Democratic Republic of the Congo')).toBe('DR Congo');
    expect(shortenName('Central African Republic')).toBe('Central African Rep.');
    expect(shortenName('United Arab Emirates')).toBe('UAE');
    expect(shortenName('Bosnia and Herzegovina')).toBe('Bosnia & Herz.');
    expect(shortenName('Nigeria')).toBe('Nigeria');
  });
});

describe('ocean classifier', () => {
  it('names the five oceans', () => {
    expect(classifyOcean(deg(-150), deg(0))).toBe('pacific');
    expect(classifyOcean(deg(170), deg(-10))).toBe('pacific');
    expect(classifyOcean(deg(-30), deg(20))).toBe('atlantic');
    expect(classifyOcean(deg(80), deg(-10))).toBe('indian');
    expect(classifyOcean(deg(0), deg(-70))).toBe('southern');
    expect(classifyOcean(deg(0), deg(80))).toBe('arctic');
  });
});

describe('country index', () => {
  it('fits one 8-bit channel and maps both ways', () => {
    expect(COUNTRY_COUNT).toBeLessThanOrEqual(254);
    for (const c of availableCatalog) {
      const id = idOfIso(c.id);
      expect(id).toBeGreaterThan(0);
      expect(isoOfId(id)).toBe(c.id);
      expect(labelOfIso(c.id)).not.toBeNull();
    }
    expect(idOfIso('NG')).not.toBe(idOfIso('NE'));
  });

  it('resolves the home country with fallbacks', () => {
    expect(resolveHomeCountry({ nationality: 'Turkish' }, availableCatalog).iso2).toBe('TR');
    expect(resolveHomeCountry({ nationality: 'Global Citizen', location: 'Germany' }, availableCatalog).iso2).toBe('DE');
    expect(resolveHomeCountry({ nationality: 'Global Citizen', location: 'Global Citizen' }, availableCatalog).iso2).toBe('TR');
    expect(resolveHomeCountry(null, availableCatalog).iso2).toBe('TR');
  });
});
