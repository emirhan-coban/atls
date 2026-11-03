import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  DayRecord,
  EMPTY_STATS,
  GameStats,
  applyGuess,
  dailyCountryId,
  dayKeyOf,
  recordResult,
} from '../game/dailyCountry';

const KEY = '@atls_daily_game';
/** Older days are only needed for the streak, which lives in `stats`. */
const KEEP_DAYS = 14;

interface Persisted {
  days: Record<string, DayRecord>;
  stats: GameStats;
}

interface GameState extends Persisted {
  hydrated: boolean;
  isOpen: boolean;
  hydrate: () => Promise<void>;
  setOpen: (open: boolean) => void;
  /** Guesses for today's puzzle; returns the updated record. */
  guess: (guessId: string) => DayRecord;
}

const save = (state: Persisted) => AsyncStorage.setItem(KEY, JSON.stringify(state)).catch(() => {});

export const useGameStore = create<GameState>((set, get) => ({
  days: {},
  stats: EMPTY_STATS,
  hydrated: false,
  isOpen: false,

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(KEY);
      const saved = raw ? (JSON.parse(raw) as Partial<Persisted>) : {};
      set({ days: saved.days ?? {}, stats: { ...EMPTY_STATS, ...saved.stats }, hydrated: true });
    } catch {
      set({ hydrated: true });
    }
  },

  setOpen: (isOpen) => set({ isOpen }),

  guess: (guessId) => {
    const today = dayKeyOf();
    const { days, stats } = get();
    const before = days[today];
    const after = applyGuess(before, guessId, dailyCountryId(today));
    if (after === before) return after;

    const nextStats = after.done && !before?.done ? recordResult(stats, today, after.won) : stats;
    const kept = Object.keys(days)
      .sort()
      .slice(-KEEP_DAYS + 1);
    const nextDays: Record<string, DayRecord> = {};
    kept.forEach((k) => (nextDays[k] = days[k]));
    nextDays[today] = after;

    set({ days: nextDays, stats: nextStats });
    save({ days: nextDays, stats: nextStats });
    return after;
  },
}));
