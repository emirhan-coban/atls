/// <reference types="jest" />
import { CONTINENT_FILTERS, continentGroup, inContinent } from '../continents';
import { availableCatalog } from '../travelData';
import { getCountryFacts, visaGroup } from '../countryProfile';

describe('continent filters', () => {
  it('puts North and South America into one Americas group', () => {
    expect(continentGroup('North America')).toBe('Americas');
    expect(continentGroup('South America')).toBe('Americas');
    expect(continentGroup('Americas')).toBe('Americas');
    expect(continentGroup('Antarctica')).toBeNull();
  });

  it('gives every catalog country a group, and every filter at least one country', () => {
    availableCatalog.forEach((c) => expect(continentGroup(c.continent)).not.toBeNull());
    CONTINENT_FILTERS.filter((f) => f.id !== 'all').forEach((f) => {
      expect(availableCatalog.filter((c) => inContinent(c.continent, f.id)).length).toBeGreaterThan(5);
    });
  });

  it('finds visa-free countries in the Americas for a Turkish passport', () => {
    const free = availableCatalog.filter((c) => inContinent(c.continent, 'Americas') && visaGroup(getCountryFacts(c.id)?.visa.status ?? 'unknown') === 'free');
    expect(free.length).toBeGreaterThan(5);
  });
});
