import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { notificationService } from '../services/notificationService';
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
  /** Evening reminder switch, off until the player turns it on. */
  reminder: boolean;
}

interface GameState extends Persisted {
  hydrated: boolean;
  isOpen: boolean;
  hydrate: () => Promise<void>;
  setOpen: (open: boolean) => void;
  /** Turning on asks for notification permission; resolves to false when it was not granted. */
  setReminder: (enabled: boolean) => Promise<boolean>;
  /** Guesses for today's puzzle; returns the updated record. */
  guess: (guessId: string) => DayRecord;
}

const save = (state: Persisted) => AsyncStorage.setItem(KEY, JSON.stringify(state)).catch(() => {});

export const useGameStore = create<GameState>((set, get) => ({
  days: {},
  stats: EMPTY_STATS,
  reminder: false,
  hydrated: false,
  isOpen: false,

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(KEY);
      const saved = raw ? (JSON.parse(raw) as Partial<Persisted>) : {};
      set({ days: saved.days ?? {}, stats: { ...EMPTY_STATS, ...saved.stats }, reminder: Boolean(saved.reminder), hydrated: true });
    } catch {
      set({ hydrated: true });
    }
  },

  setOpen: (isOpen) => set({ isOpen }),

  setReminder: async (enabled) => {
    if (enabled && !(await notificationService.requestPermissions())) return false;
    const { days, stats } = get();
    set({ reminder: enabled });
    save({ days, stats, reminder: enabled });
    return true;
  },

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
    save({ days: nextDays, stats: nextStats, reminder: get().reminder });
    return after;
  },
}));
