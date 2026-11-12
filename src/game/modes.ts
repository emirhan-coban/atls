/**
 * Game modes of the daily Secret Country: the original clues game plus two bonus puzzles, Flag and Silhouette.
 * Pure rules only. Every mode has its own country of the day (its own shuffled sequence), its own number of
 * guesses and its own clue ladder. Only the clues game feeds the streak; the bonus modes keep plain counters.
 */
import { availableCatalog, CatalogCountry } from '../data/travelData';
import { COUNTRY_FACTS } from '../data/countryFacts';
import { gt } from '../localization/game';
import {
  DayRecord,
  GameStats,
  MAX_GUESSES,
  dailyCountryId,
  feedbackFor,
  playablePool,
  puzzleNumber,
} from './dailyCountry';
import { SILHOUETTE_IDS } from './silhouettePool';

export type GameMode = 'clues' | 'flag' | 'shape';
export type BonusMode = 'flag' | 'shape';
export const BONUS_MODES: readonly BonusMode[] = ['flag', 'shape'];
export const ALL_MODES: readonly GameMode[] = ['clues', ...BONUS_MODES];

export const MODE_GUESSES: Record<GameMode, number> = { clues: MAX_GUESSES, flag: 4, shape: 5 };

type Lang = 'tr' | 'en';

/** Countries a mode can pick from. */
export function modePool(mode: GameMode): CatalogCountry[] {
  const pool = playablePool();
  if (mode !== 'shape') return pool;
  const allowed = new Set(SILHOUETTE_IDS);
  return pool.filter((c) => allowed.has(c.id));
}

const SALT: Record<GameMode, string> = { clues: '', flag: 'flag-', shape: 'shape-' };

/** The country of the day for a mode. The clues mode is exactly the original sequence. */
export function modeCountryId(mode: GameMode, key: string): string {
  return dailyCountryId(key, modePool(mode), SALT[mode]);
}

export interface ModeClue {
  label: string;
  text: string;
  /** Only the classic clue ladder shows a flag (its last clue). */
  flag?: string;
}

const SIZE_LARGE_KM2 = 500_000;
const SIZE_MEDIUM_KM2 = 60_000;

/**
 * The clue ladder of a bonus mode. Clue i opens after i wrong guesses; the first one needs a miss (the picture itself
 * is the opening hint). Flag: continent, capital length, capital initial. Silhouette: continent, size, coast, initial.
 */
export function buildModeClues(mode: BonusMode, id: string, lang: Lang): ModeClue[] {
  const country = availableCatalog.find((c) => c.id === id)!;
  const facts = COUNTRY_FACTS[id];
  const capital = facts.capital[lang];
  const continent = lang === 'tr' ? country.continentTr : country.continent;
  const clue = (label: Parameters<typeof gt>[0], text: string): ModeClue => ({ label: gt(label, lang), text });
  const initial = clue('cl_capital_initial', capital.charAt(0));

  if (mode === 'flag') {
    return [clue('cl_continent', continent), clue('cl_capital', gt('letters_n', lang, { n: capital.length })), initial];
  }
  const sizeKey = facts.areaKm2 >= SIZE_LARGE_KM2 ? 'size_large' : facts.areaKm2 >= SIZE_MEDIUM_KM2 ? 'size_medium' : 'size_small';
  return [
    clue('cl_continent', continent),
    clue('cl_size', gt(sizeKey, lang)),
    clue('cl_coast', gt(facts.landlocked ? 'coast_no' : 'coast_yes', lang)),
    initial,
  ];
}

/** Clues open in a bonus mode: one per wrong guess, all of them once the game is over. */
export function openModeClueCount(mode: BonusMode, record: DayRecord | undefined, total: number): number {
  if (!record) return 0;
  if (record.done) return total;
  return Math.min(total, record.guesses.length);
}

// ---------------------------------------------------------------------------------------------
// Bonus counters (no streak)
// ---------------------------------------------------------------------------------------------

export interface ModeStats {
  played: number;
  won: number;
  /** Wins by guesses used; length is the mode's guess limit. */
  dist: number[];
}

export const emptyModeStats = (mode: BonusMode): ModeStats => ({ played: 0, won: 0, dist: new Array(MODE_GUESSES[mode]).fill(0) });

export function normalizeModeStats(mode: BonusMode, saved?: Partial<ModeStats>): ModeStats {
  const max = MODE_GUESSES[mode];
  return {
    played: Math.max(0, Number(saved?.played) || 0),
    won: Math.max(0, Number(saved?.won) || 0),
    dist: Array.from({ length: max }, (_, i) => Math.max(0, Number(saved?.dist?.[i]) || 0)),
  };
}

export function recordModeResult(mode: BonusMode, stats: ModeStats, won: boolean, guessCount: number): ModeStats {
  const next = normalizeModeStats(mode, stats);
  next.played += 1;
  if (won) {
    next.won += 1;
    if (guessCount >= 1 && guessCount <= MODE_GUESSES[mode]) next.dist[guessCount - 1] += 1;
  }
  return next;
}

/** The bonus modes appear once the player has finished the classic puzzle at least once. */
export const bonusUnlocked = (stats: GameStats): boolean => stats.played >= 1;

/** How many of today's three puzzles are finished. */
export function puzzlesDone(clues: DayRecord | undefined, flag: DayRecord | undefined, shape: DayRecord | undefined): number {
  return [clues, flag, shape].filter((r) => r?.done).length;
}

// ---------------------------------------------------------------------------------------------
// Sharing
// ---------------------------------------------------------------------------------------------

const SQUARE = { correct: '🟩', continent: '🟨', wrong: '🟥' } as const;

/** "atls. Silhouette #12 3/5" plus the coloured squares. Never names the country. */
export function bonusShareText(mode: BonusMode, dayKey: string, record: DayRecord, secretId: string, lang: Lang): string {
  const grid = record.guesses.map((g) => SQUARE[feedbackFor(g, secretId)]).join('');
  const max = MODE_GUESSES[mode];
  const score = record.won ? `${record.guesses.length}/${max}` : `X/${max}`;
  return `${gt(mode === 'flag' ? 'share_flag' : 'share_shape', lang)} #${puzzleNumber(dayKey)} ${score}\n${grid}`;
}
