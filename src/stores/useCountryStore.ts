import { create } from 'zustand';
import { Country, CountryStatus } from './types';
import { initialCountries } from '../data/travelData';
import { storageService, enrichCountry } from '../services/storageService';

interface CountryState {
  countries: Country[];
  setCountries: (countries: Country[]) => void;
  addCountry: (country: Country) => Promise<void>;
  updateCountry: (country: Country) => Promise<void>;
  removeCountry: (countryId: string) => Promise<void>;
  clearCountries: () => void;
  
  // Computed / Helper selectors
  getVisitedCountries: () => Country[];
  getWishlistCountries: () => Country[];
  getLivedCountries: () => Country[];
  getStats: () => {
    visitedCount: number;
    wishlistCount: number;
    livedCount: number;
    totalCountriesCount: number;
    continentsCount: number;
    worldPercentage: number;
  };
}

const TOTAL_WORLD_COUNTRIES = 195;

export const useCountryStore = create<CountryState>((set, get) => ({
  countries: initialCountries,

  setCountries: (countries) => {
    const enriched = (countries || []).map(enrichCountry);
    set({ countries: enriched });
  },

  addCountry: async (newCountry) => {
    const enriched = enrichCountry(newCountry);
    set((state) => ({
      countries: [enriched, ...state.countries.filter((c) => c.id !== enriched.id)],
    }));
    await storageService.addCountry(enriched);
  },

  updateCountry: async (updatedCountry) => {
    const enriched = enrichCountry(updatedCountry);
    set((state) => ({
      countries: [enriched, ...state.countries.filter((c) => c.id !== enriched.id)],
    }));
    await storageService.updateCountry(enriched);
  },

  removeCountry: async (countryId) => {
    set((state) => ({
      countries: state.countries.filter((c) => c.id !== countryId),
    }));
    await storageService.removeCountry(countryId);
  },

  clearCountries: () => {
    set({ countries: [] });
  },

  getVisitedCountries: () => {
    return get().countries.filter((c) => c.status === 'visited' || c.status === 'lived');
  },

  getWishlistCountries: () => {
    return get().countries.filter((c) => c.status === 'want');
  },

  getLivedCountries: () => {
    return get().countries.filter((c) => c.status === 'lived');
  },

  getStats: () => {
    const countries = get().countries;
    const visited = countries.filter((c) => c.status === 'visited' || c.status === 'lived');
    const wishlist = countries.filter((c) => c.status === 'want');
    const lived = countries.filter((c) => c.status === 'lived');

    const visitedContinents = new Set(
      visited.map((c) => c.continent).filter(Boolean)
    );

    const visitedCount = visited.length;
    const worldPercentage = Number(((visitedCount / TOTAL_WORLD_COUNTRIES) * 100).toFixed(1));

    return {
      visitedCount,
      wishlistCount: wishlist.length,
      livedCount: lived.length,
      totalCountriesCount: countries.length,
      continentsCount: visitedContinents.size,
      worldPercentage,
    };
  },
}));
