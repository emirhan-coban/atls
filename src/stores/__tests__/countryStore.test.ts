/// <reference types="jest" />

import { useCountryStore } from '../useCountryStore';
import { Country } from '../types';

describe('useCountryStore Unit Logic', () => {
  it('calculates statistics accurately for visited, lived and want countries', () => {
    const mockCountries: Country[] = [
      {
        id: 'TR',
        name: 'Turkey',
        nameTr: 'Türkiye',
        flag: '🇹🇷',
        continent: 'Europe',
        continentTr: 'Avrupa',
        status: 'lived',
      },
      {
        id: 'FR',
        name: 'France',
        nameTr: 'Fransa',
        flag: '🇫🇷',
        continent: 'Europe',
        continentTr: 'Avrupa',
        status: 'visited',
      },
      {
        id: 'JP',
        name: 'Japan',
        nameTr: 'Japonya',
        flag: '🇯🇵',
        continent: 'Asia',
        continentTr: 'Asya',
        status: 'want',
      },
    ];

    useCountryStore.getState().setCountries(mockCountries);
    const stats = useCountryStore.getState().getStats();

    expect(stats.totalCountriesCount).toBe(3);
    expect(stats.visitedCount).toBe(2); // lived + visited
    expect(stats.wishlistCount).toBe(1);
    expect(stats.continentsCount).toBe(1); // Europe visited
    expect(stats.worldPercentage).toBeGreaterThan(0);
  });
});
