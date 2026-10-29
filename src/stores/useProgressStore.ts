import { create } from 'zustand';
import { Country, Profile, Trip, YearlyGoal } from './types';
import { ACHIEVEMENTS, Achievement } from '../data/achievements';
import { storageService } from '../services/storageService';

interface PersistedProgress {
  unlocked: Record<string, string>; // achievement id -> ISO date it was unlocked
  initialized: boolean;
  yearlyGoal: YearlyGoal | null;
}

interface ProgressState extends PersistedProgress {
  /** Achievements unlocked but not shown yet, shown one by one as a banner. */
  queue: string[];
  hydrate: (saved: Partial<PersistedProgress> | null | undefined) => void;
  /**
   * Compares achievements against what is already unlocked. The first run only records the
   * current state, so existing users are not flooded with banners for badges they already earned.
   */
  checkUnlocks: (countries: Country[], profile: Profile | undefined, trips: Trip[]) => void;
  dismissCurrent: () => void;
  setYearlyGoal: (goal: YearlyGoal | null) => void;
  reset: () => void;
  currentBadge: () => Achievement | null;
}

const persist = (state: PersistedProgress) =>
  storageService.saveProgress({
    unlocked: state.unlocked,
    initialized: state.initialized,
    yearlyGoal: state.yearlyGoal,
  });

export const useProgressStore = create<ProgressState>((set, get) => ({
  unlocked: {},
  initialized: false,
  yearlyGoal: null,
  queue: [],

  hydrate: (saved) =>
    set({
      unlocked: saved?.unlocked ?? {},
      initialized: saved?.initialized ?? false,
      yearlyGoal: saved?.yearlyGoal ?? null,
      queue: [],
    }),

  checkUnlocks: (countries, profile, trips) => {
    const state = get();
    const nowUnlocked = ACHIEVEMENTS.filter((a) => a.isUnlocked(countries, profile, trips)).map((a) => a.id);
    const fresh = nowUnlocked.filter((id) => !state.unlocked[id]);
    if (state.initialized && fresh.length === 0) return;

    const stamp = new Date().toISOString();
    const unlocked = { ...state.unlocked };
    fresh.forEach((id) => {
      unlocked[id] = stamp;
    });
    set({
      unlocked,
      initialized: true,
      queue: state.initialized ? [...state.queue, ...fresh] : state.queue,
    });
    persist({ unlocked, initialized: true, yearlyGoal: state.yearlyGoal });
  },

  dismissCurrent: () => set((state) => ({ queue: state.queue.slice(1) })),

  setYearlyGoal: (goal) => {
    set({ yearlyGoal: goal });
    const { unlocked, initialized } = get();
    persist({ unlocked, initialized, yearlyGoal: goal });
  },

  reset: () => set({ unlocked: {}, initialized: false, yearlyGoal: null, queue: [] }),

  currentBadge: () => {
    const id = get().queue[0];
    return ACHIEVEMENTS.find((a) => a.id === id) ?? null;
  },
}));
