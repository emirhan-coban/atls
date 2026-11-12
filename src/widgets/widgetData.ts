/**
 * Everything the home screen and lock screen widgets show, computed here as plain data.
 *
 * Widgets run in an isolated runtime with no state, hooks or imports, so each widget only draws the props it is
 * given. All text (already in the app's language), numbers and the day-by-day timeline are decided in this file,
 * which is pure and unit tested.
 */
import {
  DayRecord,
  GameStats,
  MAX_GUESSES,
  dayKeyOf,
  liveStreak,
  puzzleNumber,
} from '../game/dailyCountry';
import { checklistProgress, daysUntil, nextPlan, parseDate, planPhase, tripLengthDays } from '../utils/planning';
import type { PlannedTrip } from '../stores/types';

export type WidgetLang = 'tr' | 'en';

export const WIDGET_URLS = {
  passport: 'atls://',
  game: 'atls://game',
  trip: 'atls://planner',
} as const;

const MONTHS = {
  tr: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
};
const SHORT = {
  tr: ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'],
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
};

/** Hour (local) at which an unplayed game with a live streak turns urgent. */
export const RISK_HOUR = 18;

// ---------------------------------------------------------------------------------------------
// Passport
// ---------------------------------------------------------------------------------------------

export interface PassportProps {
  count: number;
  /** Whole percent of the world, 0..100. */
  percent: number;
  flags: string[];
  eyebrow: string;
  unit: string;
  worldLine: string;
  recentLabel: string;
  metaLine: string;
  url: string;
}

interface PassportCountry {
  status: string;
  flag?: string;
  continent?: string;
}

const WORLD_TOTAL = 195;

export function passportProps(countries: PassportCountry[], tripCount: number, lang: WidgetLang): PassportProps {
  const marked = countries.filter((c) => c.status === 'visited' || c.status === 'lived');
  const count = marked.length;
  const percent = Math.min(100, Math.round((count / WORLD_TOTAL) * 100));
  const continents = new Set(marked.map((c) => c.continent).filter(Boolean)).size;
  const tr = lang === 'tr';
  return {
    count,
    percent,
    // the store keeps the newest first
    flags: marked.map((c) => c.flag ?? '').filter(Boolean).slice(0, 6),
    eyebrow: tr ? 'ZİYARET EDİLEN' : 'VISITED',
    unit: tr ? 'ülke' : count === 1 ? 'country' : 'countries',
    worldLine: tr ? `Dünyanın %${percent} kadarı` : `${percent}% of the world`,
    recentLabel: tr ? 'SON EKLENENLER' : 'RECENT',
    metaLine: tr
      ? `${continents} kıta · ${tripCount} gezi`
      : `${continents} ${continents === 1 ? 'continent' : 'continents'} · ${tripCount} ${tripCount === 1 ? 'trip' : 'trips'}`,
    url: WIDGET_URLS.passport,
  };
}

// ---------------------------------------------------------------------------------------------
// Secret Country
// ---------------------------------------------------------------------------------------------

export type GameWidgetState = 'unplayed' | 'won' | 'lost' | 'risk';

export interface GameProps {
  state: GameWidgetState;
  streak: number;
  /** Today's puzzle is finished, so the lock screen ring is solid. */
  done: boolean;
  eyebrow: string;
  headline: string;
  sub: string;
  cta: string;
  /** "3/6" after a win, empty otherwise. */
  score: string;
  /** Lock screen texts. */
  lockTitle: string;
  lockStatus: string;
  lockSub: string;
  inline: string;
  url: string;
}

export interface GameInput {
  days: Record<string, DayRecord>;
  stats: GameStats;
  lang: WidgetLang;
  visitedCount: number;
}

/** The widget state for one moment: `at` decides the day and whether it is already evening. */
export function gameProps(input: GameInput, at: Date): GameProps {
  const { days, stats, lang, visitedCount } = input;
  const tr = lang === 'tr';
  const key = dayKeyOf(at);
  const record = days[key];
  const streak = liveStreak(stats, key);
  const done = Boolean(record?.done);
  const number = puzzleNumber(key);

  let state: GameWidgetState;
  if (done) state = record!.won ? 'won' : 'lost';
  else state = streak > 0 && at.getHours() >= RISK_HOUR ? 'risk' : 'unplayed';

  const eyebrow = (tr ? 'GİZLİ ÜLKE' : 'SECRET COUNTRY') + ` #${number}`;
  const title = tr ? `Gizli Ülke #${number}` : `Secret Country #${number}`;
  const score = state === 'won' ? `${record!.guesses.length}/${MAX_GUESSES}` : '';
  const streakWord = tr ? `Seri ${streak}` : `Streak ${streak}`;
  const countLine = tr ? `${visitedCount} ülke` : `${visitedCount} ${visitedCount === 1 ? 'country' : 'countries'}`;

  const text: Record<GameWidgetState, { headline: string; sub: string; cta: string; status: string }> = {
    unplayed: {
      headline: tr ? 'Bugünü oyna' : "Play today's",
      sub: streak > 0 ? (tr ? `${streak} günlük seri` : `${streak}-day streak`) : tr ? 'Her gün yeni bir ülke' : 'A new country every day',
      cta: tr ? 'Bugünü oyna' : 'Play now',
      status: tr ? 'Oynanmadı' : 'Not played',
    },
    risk: {
      headline: tr ? 'Bugün oynamazsan biter' : "Play today or it's over",
      sub: title,
      cta: tr ? 'Serini koru' : 'Keep your streak',
      status: tr ? 'Seri risk altında' : 'Streak at risk',
    },
    won: {
      headline: tr ? 'Bugünkü ülkeyi buldun' : "You found today's country",
      sub: tr ? `${streak} günlük seri` : `${streak}-day streak`,
      cta: tr ? 'Yarın yeni ülke' : 'New country tomorrow',
      status: tr ? `Buldun ${score}` : `Found ${score}`,
    },
    lost: {
      headline: tr ? 'Bugün olmadı' : 'Not today',
      sub: tr ? 'Yarın yeni bir ülke' : 'A new country tomorrow',
      cta: tr ? 'Yarın yeni ülke' : 'New country tomorrow',
      status: tr ? 'Bugün olmadı' : 'Missed today',
    },
  };
  const t = text[state];
  return {
    state,
    streak,
    done,
    eyebrow,
    headline: t.headline,
    sub: t.sub,
    cta: t.cta,
    score,
    lockTitle: title,
    lockStatus: `${streakWord} · ${t.status}`,
    lockSub: done ? (tr ? 'Yarın yeni ülke' : 'New country tomorrow') : tr ? 'Bugünü oyna' : 'Play today',
    inline: done ? (tr ? `Gizli Ülke ✓ · ${streakWord}` : `Secret Country ✓ · ${streakWord}`) : `${streakWord} · ${countLine}`,
    url: WIDGET_URLS.game,
  };
}

export interface TimelineEntry<T> {
  date: Date;
  props: T;
}

const startOfDay = (base: Date, plusDays: number, hour = 0) =>
  new Date(base.getFullYear(), base.getMonth(), base.getDate() + plusDays, hour, 0, 0, 0);

/**
 * Seven days of entries so the widget stays truthful even when the app is not opened: at every midnight the day
 * and streak roll over (a streak not extended breaks by itself), and at 18:00 a live streak turns urgent.
 */
export function gameTimeline(input: GameInput, now: Date, days = 7): TimelineEntry<GameProps>[] {
  const entries: TimelineEntry<GameProps>[] = [{ date: now, props: gameProps(input, now) }];
  for (let i = 0; i < days; i++) {
    const evening = startOfDay(now, i, RISK_HOUR);
    if (evening.getTime() > now.getTime()) entries.push({ date: evening, props: gameProps(input, evening) });
    const midnight = startOfDay(now, i + 1);
    entries.push({ date: midnight, props: gameProps(input, midnight) });
  }
  return entries;
}

// ---------------------------------------------------------------------------------------------
// Next trip
// ---------------------------------------------------------------------------------------------

export type TripWidgetKind = 'upcoming' | 'today' | 'ongoing' | 'empty';

export interface TripProps {
  kind: TripWidgetKind;
  eyebrow: string;
  flag: string;
  country: string;
  /** Days to go; for an ongoing trip, the day number. */
  days: number;
  unit: string;
  headline: string;
  /** "14 Aralık · 14 gün" */
  dateLine: string;
  /** "14 – 28 Aralık" */
  range: string;
  cities: string[];
  done: number;
  total: number;
  progressLabel: string;
  nextTask: string;
  cta: string;
  suggestionLine: string;
  url: string;
}

interface Place {
  name: string;
  flag: string;
}

export interface TripInput {
  plans: PlannedTrip[];
  lang: WidgetLang;
  /** Resolves a country id to its name in the widget's language and its flag. */
  place: (id: string) => Place;
  /** Wishlist country ids, used for the empty-state suggestion. */
  wishlist: string[];
}

function formatDay(dateKey: string, lang: WidgetLang, short = false): string {
  const p = parseDate(dateKey);
  if (!p) return '';
  return `${p.d} ${(short ? SHORT : MONTHS)[lang][p.m - 1]}`;
}

function formatRange(start: string, end: string | null, lang: WidgetLang): string {
  const a = parseDate(start);
  const b = parseDate(end);
  if (!a) return '';
  if (!b || (a.y === b.y && a.m === b.m && a.d === b.d)) return formatDay(start, lang);
  if (a.m === b.m && a.y === b.y) return `${a.d} – ${b.d} ${MONTHS[lang][a.m - 1]}`;
  return `${formatDay(start, lang, true)} – ${formatDay(end!, lang, true)}`;
}

export function tripProps(input: TripInput, now: Date): TripProps {
  const { plans, lang, place, wishlist } = input;
  const tr = lang === 'tr';
  const plan = nextPlan(plans, now);
  const base = { url: WIDGET_URLS.trip, cities: [] as string[], done: 0, total: 0, progressLabel: '', nextTask: '', range: '', dateLine: '' };

  if (!plan) {
    const pick = wishlist.length ? wishlist[Math.floor(now.getTime() / 86400000) % wishlist.length] : null;
    const sug = pick ? place(pick) : null;
    return {
      ...base,
      kind: 'empty',
      eyebrow: tr ? 'SONRAKİ GEZİ' : 'NEXT TRIP',
      flag: '',
      country: '',
      days: 0,
      unit: '',
      headline: tr ? 'Henüz plan yok' : 'No trip planned',
      cta: tr ? 'Gezi planla' : 'Plan a trip',
      suggestionLine: sug ? (tr ? `İstek listenden: ${sug.flag} ${sug.name}` : `From your wishlist: ${sug.flag} ${sug.name}`) : '',
    };
  }

  const p = place(plan.countryId);
  const toStart = daysUntil(plan.startDate, now) ?? 0;
  const length = tripLengthDays(plan.startDate, plan.endDate);
  const phase = planPhase(plan, now);
  const progress = checklistProgress(plan.checklist ?? []);
  const next = (plan.checklist ?? []).find((i) => !i.done);
  const range = formatRange(plan.startDate, plan.endDate, lang);
  const lengthText = length ? (tr ? `${length} gün` : `${length} ${length === 1 ? 'day' : 'days'}`) : '';
  const common = {
    ...base,
    flag: p.flag,
    country: p.name,
    cities: (plan.cities ?? []).slice(0, 3),
    done: progress.done,
    total: progress.total,
    progressLabel: tr ? 'Hazırlık' : 'Ready',
    nextTask: next ? (tr ? `Sonraki: ${next.text}` : `Next: ${next.text}`) : '',
    range,
    dateLine: [formatDay(plan.startDate, lang), lengthText].filter(Boolean).join(' · '),
    cta: '',
    suggestionLine: '',
  };

  if (phase === 'ongoing' && toStart < 0) {
    const day = Math.abs(toStart) + 1;
    return {
      ...common,
      kind: 'ongoing',
      eyebrow: tr ? 'ŞU AN GEZİDESİN' : 'ON YOUR TRIP',
      days: day,
      unit: tr ? '. gün' : day === 1 ? 'st day' : 'th day',
      headline: tr ? `Gezinin ${day}. günü` : `Day ${day} of your trip`,
    };
  }
  if (toStart === 0) {
    return {
      ...common,
      kind: 'today',
      eyebrow: tr ? 'BUGÜN' : 'TODAY',
      days: 0,
      unit: '',
      headline: tr ? 'Yola çıkış günü' : 'Departure day',
      cta: tr ? 'İyi yolculuklar' : 'Bon voyage',
    };
  }
  return {
    ...common,
    kind: 'upcoming',
    eyebrow: tr ? 'SONRAKİ GEZİ' : 'NEXT TRIP',
    days: toStart,
    unit: tr ? 'gün' : toStart === 1 ? 'day' : 'days',
    headline: p.name,
  };
}

/** Thirty midnights ahead, so the countdown ticks down without the app. */
export function tripTimeline(input: TripInput, now: Date, days = 30): TimelineEntry<TripProps>[] {
  const entries: TimelineEntry<TripProps>[] = [{ date: now, props: tripProps(input, now) }];
  for (let i = 1; i <= days; i++) {
    const midnight = startOfDay(now, i);
    entries.push({ date: midnight, props: tripProps(input, midnight) });
  }
  return entries;
}
