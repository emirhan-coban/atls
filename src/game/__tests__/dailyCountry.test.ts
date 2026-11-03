/// <reference types="jest" />
import {
  MAX_GUESSES,
  applyGuess,
  buildClues,
  dailyCountryId,
  dayKeyOf,
  feedbackFor,
  liveStreak,
  openClueCount,
  playablePool,
  previousDayKey,
  puzzleNumber,
  recordResult,
  shareText,
  EMPTY_STATS,
} from '../dailyCountry';

describe('daily secret country', () => {
  it('picks the same country for the same day and spreads over days', () => {
    expect(dailyCountryId('2026-11-04')).toBe(dailyCountryId('2026-11-04'));
    const picks = new Set<string>();
    for (let d = 1; d <= 60; d++) picks.add(dailyCountryId(`2027-01-${String(d % 28 + 1).padStart(2, '0')}-${d}`));
    expect(picks.size).toBeGreaterThan(30);
  });

  it('every playable country has six clues, and the name never leaks before the last clue', () => {
    for (const c of playablePool()) {
      for (const lang of ['tr', 'en'] as const) {
        const clues = buildClues(c.id, lang);
        expect(clues).toHaveLength(MAX_GUESSES);
        clues.forEach((clue, i) => {
          expect(clue.text.length).toBeGreaterThan(0);
          expect(clue.text).not.toContain(c.name);
          expect(clue.text).not.toContain(c.nameTr);
          expect(Boolean(clue.flag)).toBe(i === MAX_GUESSES - 1);
        });
      }
    }
  });

  it('day keys and puzzle numbers', () => {
    expect(dayKeyOf(new Date(2026, 10, 5))).toBe('2026-11-05');
    expect(puzzleNumber('2026-11-01')).toBe(1);
    expect(puzzleNumber('2026-11-05')).toBe(5);
    expect(previousDayKey('2026-03-01')).toBe('2026-02-28');
    expect(previousDayKey('2027-01-01')).toBe('2026-12-31');
  });

  it('gives feedback by continent', () => {
    expect(feedbackFor('FR', 'FR')).toBe('correct');
    expect(feedbackFor('DE', 'FR')).toBe('continent');
    expect(feedbackFor('JP', 'FR')).toBe('wrong');
  });

  it('opens one clue per wrong guess and ends after a win or six misses', () => {
    expect(openClueCount(undefined)).toBe(1);
    let r = applyGuess(undefined, 'DE', 'FR');
    expect(openClueCount(r)).toBe(2);
    expect(applyGuess(r, 'DE', 'FR')).toBe(r); // repeated guess ignored
    r = applyGuess(r, 'FR', 'FR');
    expect(r).toMatchObject({ won: true, done: true });
    expect(openClueCount(r)).toBe(MAX_GUESSES);
    expect(applyGuess(r, 'IT', 'FR')).toBe(r);

    let lost = undefined as ReturnType<typeof applyGuess> | undefined;
    ['A1', 'A2', 'A3', 'A4', 'A5', 'A6'].forEach((g) => (lost = applyGuess(lost, g, 'FR')));
    expect(lost).toMatchObject({ won: false, done: true });
  });

  it('keeps and breaks the streak', () => {
    let s = recordResult(EMPTY_STATS, '2026-11-04', true);
    s = recordResult(s, '2026-11-05', true);
    expect(s).toMatchObject({ streak: 2, best: 2, played: 2, won: 2 });
    s = recordResult(s, '2026-11-07', true); // skipped a day
    expect(s.streak).toBe(1);
    expect(s.best).toBe(2);
    s = recordResult(s, '2026-11-08', false);
    expect(s.streak).toBe(0);
  });

  it('shows a streak as broken once a day was missed', () => {
    const s = { ...EMPTY_STATS, streak: 4, best: 4, lastWonDay: '2026-11-04' };
    expect(liveStreak(s, '2026-11-04')).toBe(4);
    expect(liveStreak(s, '2026-11-05')).toBe(4);
    expect(liveStreak(s, '2026-11-06')).toBe(0);
  });

  it('builds the share text', () => {
    const text = shareText('2026-11-05', { guesses: ['JP', 'DE', 'FR'], done: true, won: true }, 'FR', 'en');
    expect(text).toBe('atls. Secret Country #5 3/6\n🟥🟨🟩');
    const lost = shareText('2026-11-05', { guesses: ['JP'], done: true, won: false }, 'FR', 'tr');
    expect(lost).toBe('atls. Gizli Ülke #5 X/6\n🟥');
  });
});
