/**
 * Daily "Secret Country" game: pure rules, no React and no storage, so it can be unit tested.
 * Everyone gets the same country on the same local calendar day; clues open one by one with each wrong guess.
 */
import { availableCatalog, CatalogCountry } from '../data/travelData';
import { COUNTRY_FACTS } from '../data/countryFacts';
import { COUNTRY_CLIMATE } from '../data/countryClimate';
import { countryTrivia } from '../data/countryTrivia';

export const MAX_GUESSES = 6;
/** Puzzle #1 was the day this feature shipped. */
const EPOCH = Date.UTC(2026, 10, 1);

type Lang = 'tr' | 'en';
export type GuessFeedback = 'correct' | 'continent' | 'wrong';

export interface DayRecord {
  guesses: string[]; // ISO ids in the order they were made
  done: boolean;
  won: boolean;
}

export interface GameStats {
  played: number;
  won: number;
  streak: number;
  best: number;
  lastWonDay: string | null;
}

export const EMPTY_STATS: GameStats = { played: 0, won: 0, streak: 0, best: 0, lastWonDay: null };

const pad = (n: number) => String(n).padStart(2, '0');

/** Local calendar day as YYYY-MM-DD. */
export function dayKeyOf(date: Date = new Date()): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function dayNumberOf(key: string): number {
  const [y, m, d] = key.split('-').map(Number);
  return Math.round((Date.UTC(y, m - 1, d) - EPOCH) / 86400000);
}

/** Puzzle number shown to the player, starting at 1. */
export function puzzleNumber(key: string): number {
  return dayNumberOf(key) + 1;
}

export function previousDayKey(key: string): string {
  const [y, m, d] = key.split('-').map(Number);
  return dayKeyOf(new Date(y, m - 1, d - 1));
}

/** FNV-1a, enough to spread consecutive days over the pool. */
function hash(text: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Countries every clue exists for, sorted so the pick does not depend on catalog order. */
export function playablePool(): CatalogCountry[] {
  return availableCatalog
    .filter((c) => COUNTRY_FACTS[c.id] && COUNTRY_CLIMATE[c.id] && (countryTrivia as Record<string, unknown>)[c.id])
    .sort((a, b) => a.id.localeCompare(b.id));
}

export function dailyCountryId(key: string, pool: CatalogCountry[] = playablePool()): string {
  return pool[hash(`atls-secret-${key}`) % pool.length].id;
}

export function feedbackFor(guessId: string, secretId: string, catalog: CatalogCountry[] = availableCatalog): GuessFeedback {
  if (guessId === secretId) return 'correct';
  const g = catalog.find((c) => c.id === guessId);
  const s = catalog.find((c) => c.id === secretId);
  return g && s && g.continent === s.continent ? 'continent' : 'wrong';
}

export interface Clue {
  label: string;
  text: string;
  /** The last clue also shows the flag. */
  flag?: string;
}

/** Hide the country's own name when a clue happens to contain it. */
function maskName(text: string, country: CatalogCountry): string {
  let out = text;
  for (const name of [country.name, country.nameTr]) {
    if (name) out = out.split(name).join('▒▒▒');
  }
  return out;
}

const list = (items: string[]) => items.slice(0, 3).join(', ');

/** The six clues, from vague to obvious. Index i is shown once i wrong guesses were made. */
export function buildClues(id: string, lang: Lang): Clue[] {
  const country = availableCatalog.find((c) => c.id === id)!;
  const facts = COUNTRY_FACTS[id];
  const climate = COUNTRY_CLIMATE[id];
  const tr = lang === 'tr';

  const coldest = Math.min(...climate.t);
  const hottest = Math.max(...climate.t);
  const area = Math.round(facts.areaKm2).toLocaleString(tr ? 'tr-TR' : 'en-US');
  const trivia = (countryTrivia as Record<string, { tr: string; en: string }>)[id];
  const capital = facts.capital[lang];

  const clues: Clue[] = [
    {
      label: tr ? 'Kıta' : 'Continent',
      text: `${tr ? country.continentTr : country.continent} · ${
        facts.landlocked ? (tr ? 'denize kıyısı yok' : 'landlocked') : tr ? 'denize kıyısı var' : 'has a coastline'
      }`,
    },
    {
      label: tr ? 'Dil ve trafik' : 'Language & traffic',
      text: `${list(facts.languages[lang])} · ${
        facts.drivesOn === 'left' ? (tr ? 'trafik soldan' : 'drives on the left') : tr ? 'trafik sağdan' : 'drives on the right'
      }`,
    },
    {
      label: tr ? 'İklim (başkent)' : 'Climate (capital)',
      text: tr
        ? `Yıl boyu ortalama ${coldest}° ile ${hottest}° arası · yüzölçümü ${area} km²`
        : `Monthly averages from ${coldest}° to ${hottest}° · area ${area} km²`,
    },
    {
      label: tr ? 'Para ve telefon' : 'Money & phone',
      text: facts.currency
        ? `${tr ? facts.currency.nameTr : facts.currency.nameEn} (${facts.currency.code})${facts.callingCode ? ` · ${facts.callingCode}` : ''}`
        : facts.callingCode ?? '—',
    },
    {
      label: tr ? 'Bilgi' : 'Did you know',
      text: trivia[lang],
    },
    {
      label: tr ? 'Son ipucu' : 'Final clue',
      text: tr
        ? `Başkent ${capital.charAt(0)} harfiyle başlıyor (${capital.length} harf)`
        : `The capital starts with ${capital.charAt(0)} (${capital.length} letters)`,
      flag: country.flag,
    },
  ];
  // the currency or a sentence can carry the country's own name ("Birleşik Arap Emirlikleri dirhemi")
  return clues.map((c) => ({ ...c, text: maskName(c.text, country) }));
}

/** How many clues are open: one at the start, one more per wrong guess, all of them once the game is over. */
export function openClueCount(record: DayRecord | undefined): number {
  if (!record) return 1;
  if (record.done) return MAX_GUESSES;
  return Math.min(MAX_GUESSES, record.guesses.length + 1);
}

/** Applies a guess; guesses after the game ended and repeated guesses are ignored. */
export function applyGuess(record: DayRecord | undefined, guessId: string, secretId: string): DayRecord {
  const current = record ?? { guesses: [], done: false, won: false };
  if (current.done || current.guesses.includes(guessId)) return current;
  const guesses = [...current.guesses, guessId];
  const won = guessId === secretId;
  return { guesses, won, done: won || guesses.length >= MAX_GUESSES };
}

/** Streak survives a missed day only if yesterday was won; finishing the same day twice changes nothing. */
export function recordResult(stats: GameStats, dayKey: string, won: boolean): GameStats {
  const next: GameStats = { ...stats, played: stats.played + 1 };
  if (won) {
    const continues = stats.lastWonDay === previousDayKey(dayKey);
    next.won = stats.won + 1;
    next.streak = continues ? stats.streak + 1 : 1;
    next.best = Math.max(stats.best, next.streak);
    next.lastWonDay = dayKey;
  } else {
    next.streak = 0;
  }
  return next;
}

/** A streak that was not extended yesterday or today is already broken, even before the next loss. */
export function liveStreak(stats: GameStats, today: string): number {
  if (!stats.lastWonDay) return 0;
  return stats.lastWonDay === today || stats.lastWonDay === previousDayKey(today) ? stats.streak : 0;
}

const SQUARE: Record<GuessFeedback, string> = { correct: '🟩', continent: '🟨', wrong: '🟥' };

export function shareText(dayKey: string, record: DayRecord, secretId: string, lang: Lang): string {
  const grid = record.guesses.map((g) => SQUARE[feedbackFor(g, secretId)]).join('');
  const score = record.won ? `${record.guesses.length}/${MAX_GUESSES}` : `X/${MAX_GUESSES}`;
  const title = lang === 'tr' ? 'atls. Gizli Ülke' : 'atls. Secret Country';
  return `${title} #${puzzleNumber(dayKey)} ${score}\n${grid}`;
}
