import { create } from 'zustand';
import { Country, Trip, TripType } from './types';
import { storageService } from '../services/storageService';
import { useCountryStore } from './useCountryStore';
import { deriveLegacyTrips } from '../utils/stats';
import { useCelebrationStore } from './useCelebrationStore';

export interface TripInput {
  countryId: string;
  year: string;
  month?: string | null;
  days?: number | null;
  cities?: string[];
  type?: TripType;
  rating?: number | null;
  notes?: string;
  photos?: string[];
}

interface TripState {
  trips: Trip[];
  isHydrated: boolean;
  /** Countries already given their first trip; a deleted trip is never recreated for them. */
  seeded: string[];
  setTrips: (trips: Trip[], seeded?: string[]) => void;
  /** Creates a trip, and marks the country as visited when it was not yet. */
  addTrip: (input: TripInput) => Promise<Trip>;
  updateTrip: (id: string, changes: Partial<TripInput>) => Promise<void>;
  removeTrip: (id: string) => Promise<void>;
  clearTrips: () => void;
  /** Gives every visited/lived country that has no trip a trip built from its own year/month/notes. */
  ensureLegacyTrips: (countries: Country[]) => Promise<void>;
  getTripsForCountry: (countryId: string) => Trip[];
}

const newId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export const useTripStore = create<TripState>((set, get) => ({
  trips: [],
  isHydrated: false,
  seeded: [],

  setTrips: (trips, seeded) =>
    set((state) => ({ trips, isHydrated: true, seeded: seeded ?? state.seeded })),

  addTrip: async (input) => {
    const now = new Date().toISOString();
    const trip: Trip = {
      id: newId(),
      countryId: input.countryId,
      year: input.year,
      month: input.month ?? null,
      days: input.days ?? null,
      cities: input.cities ?? [],
      type: input.type ?? 'leisure',
      rating: input.rating ?? null,
      notes: input.notes ?? '',
      photos: input.photos ?? [],
      createdAt: now,
      updatedAt: now,
    };
    set((state) => ({ trips: [trip, ...state.trips] }));

    const countryStore = useCountryStore.getState();
    const existing = countryStore.countries.find((c) => c.id === trip.countryId);
    if (!existing || existing.status === 'want') {
      await countryStore.addCountry({
        ...(existing || { id: trip.countryId }),
        status: 'visited',
        year: trip.year,
        visitedYear: trip.year,
        month: trip.month ?? null,
        visitedMonth: trip.month ?? null,
      } as Country);
    }
    await storageService.saveTrip(trip);
    useCelebrationStore.getState().burstConfetti();
    return trip;
  },

  updateTrip: async (id, changes) => {
    const current = get().trips.find((t) => t.id === id);
    if (!current) return;
    const updated: Trip = {
      ...current,
      ...changes,
      cities: changes.cities ?? current.cities,
      updatedAt: new Date().toISOString(),
    };
    set((state) => ({ trips: state.trips.map((t) => (t.id === id ? updated : t)) }));
    await storageService.saveTrip(updated);
  },

  removeTrip: async (id) => {
    set((state) => ({ trips: state.trips.filter((t) => t.id !== id) }));
    await storageService.removeTrip(id);
  },

  clearTrips: () => set({ trips: [], seeded: [] }),

  ensureLegacyTrips: async (countries) => {
    if (!get().isHydrated) return;
    const seeded = new Set(get().seeded);
    const unseeded = countries.filter((c) => !seeded.has(c.id));
    if (unseeded.length === 0) return;

    const missing = deriveLegacyTrips(unseeded, get().trips);
    const nextSeeded = [...seeded, ...unseeded.filter((c) => c.status !== 'want').map((c) => c.id)];
    set((state) => ({ trips: [...missing, ...state.trips], seeded: nextSeeded }));
    await storageService.saveTripsSeeded(nextSeeded);
    for (const trip of missing) {
      await storageService.saveTrip(trip);
    }
  },

  getTripsForCountry: (countryId) => get().trips.filter((t) => t.countryId === countryId),
}));
