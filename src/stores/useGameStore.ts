import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { notificationService } from '../services/notificationService';
import { BonusMode, GameMode, MODE_GUESSES, ModeStats, emptyModeStats, modeCountryId, normalizeModeStats, recordModeResult } from '../game/modes';
import {
  DayRecord,
  EMPTY_STATS,
  GameStats,
  applyGuess,
  normalizeStats,
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
  /** Flag and Silhouette puzzles: per-day records and plain counters (no streak). */
  modeDays: Record<BonusMode, Record<string, DayRecord>>;
  modeStats: Record<BonusMode, ModeStats>;
}

interface GameState extends Persisted {
  hydrated: boolean;
  isOpen: boolean;
  hydrate: () => Promise<void>;
  setOpen: (open: boolean) => void;
  /** Turning on asks for notification permission; resolves to false when it was not granted. */
  setReminder: (enabled: boolean) => Promise<boolean>;
  /** Guesses for today's puzzle of a mode (the classic clues game by default); returns the updated record. */
  guess: (guessId: string, mode?: GameMode) => DayRecord;
}

const save = (state: Persisted) => AsyncStorage.setItem(KEY, JSON.stringify(state)).catch(() => {});

/** Only the last few days are kept; older ones are only needed for the streak, which lives in `stats`. */
function keepRecent(days: Record<string, DayRecord>, today: string, record: DayRecord): Record<string, DayRecord> {
  const kept = Object.keys(days).sort().slice(-KEEP_DAYS + 1);
  const next: Record<string, DayRecord> = {};
  kept.forEach((k) => (next[k] = days[k]));
  next[today] = record;
  return next;
}

const emptyModeDays = (): Persisted['modeDays'] => ({ flag: {}, shape: {} });
const emptyAllModeStats = (): Persisted['modeStats'] => ({ flag: emptyModeStats('flag'), shape: emptyModeStats('shape') });
const snapshot = (s: Persisted): Persisted => ({ days: s.days, stats: s.stats, reminder: s.reminder, modeDays: s.modeDays, modeStats: s.modeStats });

export const useGameStore = create<GameState>((set, get) => ({
  days: {},
  stats: EMPTY_STATS,
  reminder: false,
  modeDays: emptyModeDays(),
  modeStats: emptyAllModeStats(),
  hydrated: false,
  isOpen: false,

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(KEY);
      const saved = raw ? (JSON.parse(raw) as Partial<Persisted>) : {};
      set({
        days: saved.days ?? {},
        stats: normalizeStats(saved.stats),
        reminder: Boolean(saved.reminder),
        modeDays: { flag: saved.modeDays?.flag ?? {}, shape: saved.modeDays?.shape ?? {} },
        modeStats: { flag: normalizeModeStats('flag', saved.modeStats?.flag), shape: normalizeModeStats('shape', saved.modeStats?.shape) },
        hydrated: true,
      });
    } catch {
      set({ hydrated: true });
    }
  },

  setOpen: (isOpen) => set({ isOpen }),

  setReminder: async (enabled) => {
    if (enabled && !(await notificationService.requestPermissions())) return false;
    set({ reminder: enabled });
    save(snapshot(get()));
    return true;
  },

  guess: (guessId, mode = 'clues') => {
    const today = dayKeyOf();
    const state = get();

    if (mode !== 'clues') {
      const before = state.modeDays[mode][today];
      const after = applyGuess(before, guessId, modeCountryId(mode, today), MODE_GUESSES[mode]);
      if (after === before) return after;
      const nextStats = after.done && !before?.done
        ? { ...state.modeStats, [mode]: recordModeResult(mode, state.modeStats[mode], after.won, after.guesses.length) }
        : state.modeStats;
      const modeDays = { ...state.modeDays, [mode]: keepRecent(state.modeDays[mode], today, after) };
      set({ modeDays, modeStats: nextStats });
      save(snapshot(get()));
      return after;
    }

    const { days, stats } = state;
    const before = days[today];
    const after = applyGuess(before, guessId, dailyCountryId(today));
    if (after === before) return after;

    const nextStats = after.done && !before?.done ? recordResult(stats, today, after.won, after.guesses.length) : stats;
    set({ days: keepRecent(days, today, after), stats: nextStats });
    save(snapshot(get()));
    return after;
  },
}));
