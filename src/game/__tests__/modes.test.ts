/// <reference types="jest" />
import { EMPTY_STATS, applyGuess, dailyCountryId, dayKeyOf, playablePool } from '../dailyCountry';
import {
  BONUS_MODES,
  MODE_GUESSES,
  bonusShareText,
  bonusUnlocked,
  buildModeClues,
  emptyModeStats,
  modeCountryId,
  modePool,
  normalizeModeStats,
  openModeClueCount,
  puzzlesDone,
  recordModeResult,
} from '../modes';
import { SILHOUETTE_MIN_SIDE, silhouetteFor } from '../silhouette';
import { SILHOUETTE_IDS } from '../silhouettePool';

const days = (from: Date, count: number) =>
  Array.from({ length: count }, (_, i) => dayKeyOf(new Date(from.getFullYear(), from.getMonth(), from.getDate() + i)));

describe('mode countries', () => {
  it('the clues mode is exactly the original sequence', () => {
    for (const k of days(new Date(2026, 10, 1), 60)) expect(modeCountryId('clues', k)).toBe(dailyCountryId(k));
  });

  it('each mode has its own country most days, and never repeats back to back', () => {
    const keys = days(new Date(2026, 10, 20), 120);
    for (const mode of BONUS_MODES) {
      const picks = keys.map((k) => modeCountryId(mode, k));
      for (let i = 1; i < picks.length; i++) expect(picks[i]).not.toBe(picks[i - 1]);
      const sameAsClues = keys.filter((k, i) => picks[i] === modeCountryId('clues', k)).length;
      expect(sameAsClues).toBeLessThan(keys.length * 0.1);
    }
    const flag = keys.map((k) => modeCountryId('flag', k));
    const shape = keys.map((k) => modeCountryId('shape', k));
    expect(flag.filter((f, i) => f === shape[i]).length).toBeLessThan(keys.length * 0.1);
  });

  it('covers the whole pool once per cycle', () => {
    for (const mode of BONUS_MODES) {
      const pool = modePool(mode);
      const picks = days(new Date(2026, 10, 20), pool.length).map((k) => modeCountryId(mode, k));
      expect(new Set(picks).size).toBe(pool.length);
    }
  });

  it('the silhouette mode only picks countries from the silhouette pool', () => {
    const allowed = new Set(SILHOUETTE_IDS);
    for (const k of days(new Date(2026, 10, 20), 300)) expect(allowed.has(modeCountryId('shape', k))).toBe(true);
  });
});

describe('silhouette pool', () => {
  it('matches the map data: every id is playable and drawable, and nothing eligible is missing', () => {
    const playable = new Set(playablePool().map((c) => c.id));
    const eligible = [...playable].sort().filter((id) => {
      const s = silhouetteFor(id);
      return s && Math.max(s.width, s.height) >= SILHOUETTE_MIN_SIDE;
    });
    // if this fails the map data or the threshold changed: regenerate silhouettePool.ts on purpose
    expect([...SILHOUETTE_IDS]).toEqual(eligible);
  });

  it('every shape has a path and a usable view box', () => {
    for (const id of SILHOUETTE_IDS) {
      const s = silhouetteFor(id)!;
      expect(s.d.startsWith('M')).toBe(true);
      const [, , w, h] = s.viewBox.split(' ').map(Number);
      expect(w).toBeGreaterThan(0);
      expect(h).toBeGreaterThan(0);
    }
  });

  it('keeps overseas pieces out of the view box (Portugal without the Azores)', () => {
    const pt = silhouetteFor('PT')!;
    expect(pt.width).toBeLessThan(40);
  });

  it('unknown ids have no shape', () => {
    expect(silhouetteFor('ZZ')).toBeNull();
  });
});

describe('bonus clues', () => {
  it('flag has three clues and silhouette four, in a fixed order', () => {
    expect(buildModeClues('flag', 'JP', 'en').map((c) => c.label)).toEqual(['Continent', 'Capital', 'Capital starts with']);
    expect(buildModeClues('shape', 'JP', 'tr').map((c) => c.label)).toEqual(['Kıta', 'Büyüklük', 'Kıyı', 'Başkentin ilk harfi']);
  });

  it('never leaks the country name, for every country in both languages', () => {
    for (const mode of BONUS_MODES) {
      for (const c of modePool(mode)) {
        for (const lang of ['tr', 'en'] as const) {
          const text = buildModeClues(mode, c.id, lang).map((x) => x.text).join(' | ').toLowerCase();
          for (const name of [c.name, c.nameTr]) if (name && name.length > 3) expect(text).not.toContain(name.toLowerCase());
        }
      }
    }
  });

  it('opens one clue per wrong guess and all of them when the game ends', () => {
    expect(openModeClueCount('flag', undefined, 3)).toBe(0);
    const one = applyGuess(undefined, 'FR', 'JP', MODE_GUESSES.flag);
    expect(openModeClueCount('flag', one, 3)).toBe(1);
    let rec = one;
    for (const g of ['DE', 'IT', 'ES']) rec = applyGuess(rec, g, 'JP', MODE_GUESSES.flag);
    expect(rec.done).toBe(true); // 4 guesses used
    expect(openModeClueCount('flag', rec, 3)).toBe(3);
  });
});

describe('bonus counters', () => {
  it('records plays, wins and the guess distribution without a streak', () => {
    let s = emptyModeStats('shape');
    s = recordModeResult('shape', s, true, 3);
    s = recordModeResult('shape', s, false, 5);
    expect(s).toEqual({ played: 2, won: 1, dist: [0, 0, 1, 0, 0] });
    expect(emptyModeStats('shape').dist).toEqual([0, 0, 0, 0, 0]); // not mutated
    expect(emptyModeStats('flag').dist).toHaveLength(4);
  });

  it('tolerates missing or damaged saved data', () => {
    expect(normalizeModeStats('flag', undefined)).toEqual({ played: 0, won: 0, dist: [0, 0, 0, 0] });
    expect(normalizeModeStats('flag', { played: 3, dist: [1] as number[] }).dist).toEqual([1, 0, 0, 0]);
  });

  it('bonus modes unlock after the first finished classic puzzle', () => {
    expect(bonusUnlocked(EMPTY_STATS)).toBe(false);
    expect(bonusUnlocked({ ...EMPTY_STATS, played: 1 })).toBe(true);
  });

  it('counts the finished puzzles of the day', () => {
    const done = { guesses: ['a'], done: true, won: true };
    const open = { guesses: [], done: false, won: false };
    expect(puzzlesDone(undefined, undefined, undefined)).toBe(0);
    expect(puzzlesDone(done, open, done)).toBe(2);
  });
});

describe('bonus share text', () => {
  const secret = 'IT';
  it('shows the mode, number, score and squares, never the country', () => {
    const rec = { guesses: ['FR', 'ES', 'IT'], done: true, won: true };
    const text = bonusShareText('shape', '2026-11-12', rec, secret, 'en');
    expect(text).toBe('atls. Silhouette #12 3/5\n🟨🟨🟩');
    expect(text).not.toMatch(/Ital/i);
  });

  it('marks a loss with X and the mode limit, in Turkish too', () => {
    const lost = { guesses: ['JP', 'CN', 'KR', 'BR'], done: true, won: false };
    expect(bonusShareText('flag', '2026-11-12', lost, secret, 'tr')).toMatch(/^atls\. Bayrak #12 X\/4\n/);
  });
});
