/// <reference types="jest" />
import { EMPTY_STATS, GameStats, dayKeyOf } from '../../game/dailyCountry';
import type { PlannedTrip } from '../../stores/types';
import { RISK_HOUR, WIDGET_URLS, gameProps, gameTimeline, passportProps, tripProps, tripTimeline } from '../widgetData';

const at = (y: number, m: number, d: number, h = 9) => new Date(y, m - 1, d, h, 0, 0);
const NOW = at(2026, 11, 12);

const stats = (over: Partial<GameStats>): GameStats => ({ ...EMPTY_STATS, ...over });
const game = (over: object = {}) => ({ days: {}, stats: EMPTY_STATS, lang: 'tr' as const, visitedCount: 47, ...over });

describe('passport widget', () => {
  const countries = [
    { status: 'visited', flag: '🇯🇵', continent: 'Asia' },
    { status: 'want', flag: '🇵🇹', continent: 'Europe' },
    { status: 'lived', flag: '🇹🇷', continent: 'Asia' },
    { status: 'visited', flag: '🇫🇷', continent: 'Europe' },
  ];

  it('counts marked countries, continents and the newest flags (wishlist excluded)', () => {
    const p = passportProps(countries, 12, 'tr');
    expect(p.count).toBe(3);
    expect(p.flags).toEqual(['🇯🇵', '🇹🇷', '🇫🇷']);
    expect(p.metaLine).toBe('2 kıta · 12 gezi');
    expect(p.percent).toBe(2);
    expect(p.url).toBe(WIDGET_URLS.passport);
  });

  it('speaks English and handles singular and zero', () => {
    expect(passportProps([{ status: 'visited', flag: '🇯🇵', continent: 'Asia' }], 1, 'en')).toMatchObject({
      unit: 'country',
      metaLine: '1 continent · 1 trip',
      worldLine: '1% of the world',
    });
    expect(passportProps([], 0, 'en')).toMatchObject({ count: 0, unit: 'countries', flags: [] });
  });

  it('shows at most six flags', () => {
    const many = Array.from({ length: 10 }, () => ({ status: 'visited', flag: '🏳️', continent: 'Europe' }));
    expect(passportProps(many, 0, 'tr').flags).toHaveLength(6);
  });
});

describe('game widget', () => {
  const today = dayKeyOf(NOW);

  it('invites to play when nothing was played', () => {
    const p = gameProps(game(), NOW);
    expect(p).toMatchObject({ state: 'unplayed', done: false, streak: 0, url: WIDGET_URLS.game });
    expect(p.inline).toBe('Seri 0 · 47 ülke');
  });

  it('shows the win with its score and the new streak', () => {
    const p = gameProps(
      game({ days: { [today]: { guesses: ['a', 'b', 'c'], done: true, won: true } }, stats: stats({ played: 1, won: 1, streak: 6, best: 6, lastWonDay: today }) }),
      NOW
    );
    expect(p).toMatchObject({ state: 'won', score: '3/6', streak: 6, done: true });
    expect(p.lockStatus).toBe('Seri 6 · Buldun 3/6');
    expect(p.inline).toBe('Gizli Ülke ✓ · Seri 6');
  });

  it('shows a miss and a broken streak', () => {
    const p = gameProps(game({ days: { [today]: { guesses: [], done: true, won: false } }, stats: stats({ played: 3 }) }), NOW);
    expect(p).toMatchObject({ state: 'lost', streak: 0, done: true });
  });

  it('turns urgent in the evening only while a streak is alive', () => {
    const yesterday = dayKeyOf(at(2026, 11, 11));
    const alive = game({ stats: stats({ streak: 5, lastWonDay: yesterday }) });
    expect(gameProps(alive, at(2026, 11, 12, RISK_HOUR - 1)).state).toBe('unplayed');
    expect(gameProps(alive, at(2026, 11, 12, RISK_HOUR)).state).toBe('risk');
    expect(gameProps(game(), at(2026, 11, 12, 22)).state).toBe('unplayed'); // nothing to lose
  });

  it('speaks English', () => {
    expect(gameProps(game({ lang: 'en' }), NOW)).toMatchObject({ headline: "Play today's", cta: 'Play now' });
  });

  it('timeline rolls the day over and breaks a streak that is not extended', () => {
    const yesterday = dayKeyOf(at(2026, 11, 11));
    const entries = gameTimeline(game({ stats: stats({ streak: 5, lastWonDay: yesterday }) }), NOW);
    const streakOn = (y: number, m: number, d: number, h: number) =>
      entries.find((e) => e.date.getTime() === at(y, m, d, h).getTime())!.props;

    expect(entries[0].date).toEqual(NOW);
    expect(streakOn(2026, 11, 12, RISK_HOUR)).toMatchObject({ state: 'risk', streak: 5 });
    // not played on the 12th: by the 13th the streak is gone
    expect(streakOn(2026, 11, 13, 0)).toMatchObject({ state: 'unplayed', streak: 0 });
    // dates are strictly increasing and span a week
    for (let i = 1; i < entries.length; i++) expect(entries[i].date.getTime()).toBeGreaterThan(entries[i - 1].date.getTime());
    expect(entries[entries.length - 1].date.getTime()).toBeGreaterThanOrEqual(at(2026, 11, 19, 0).getTime());
  });

  it('timeline keeps a streak alive into tomorrow when today was won', () => {
    const today = dayKeyOf(NOW);
    const input = game({
      days: { [today]: { guesses: ['a'], done: true, won: true } },
      stats: stats({ streak: 6, lastWonDay: today }),
    });
    const next = gameTimeline(input, NOW).find((e) => e.date.getTime() === at(2026, 11, 13, 0).getTime())!;
    expect(next.props).toMatchObject({ state: 'unplayed', streak: 6 });
  });
});

describe('trip widget', () => {
  const plan = (over: Partial<PlannedTrip> = {}): PlannedTrip => ({
    id: 'p1', countryId: 'JP', startDate: '2026-12-14', endDate: '2026-12-27', cities: ['Tokyo', 'Kyoto', 'Osaka', 'Nara'],
    notes: '', checklist: [{ id: '1', text: 'Vize', done: false }, { id: '2', text: 'Bilet', done: true }], budget: [], currency: 'TRY',
    notificationIds: [], createdAt: '', updatedAt: '', ...over,
  });
  const place = (id: string) => ({ name: id === 'JP' ? 'Japonya' : 'Portekiz', flag: id === 'JP' ? '🇯🇵' : '🇵🇹' });
  const input = (plans: PlannedTrip[], extra: object = {}) => ({ plans, lang: 'tr' as const, place, wishlist: ['PT'], ...extra });

  it('counts down to the next trip and reports the checklist', () => {
    const p = tripProps(input([plan()]), NOW);
    expect(p).toMatchObject({
      kind: 'upcoming', days: 32, unit: 'gün', country: 'Japonya', flag: '🇯🇵', dateLine: '14 Aralık · 14 gün',
      range: '14 – 27 Aralık', done: 1, total: 2, nextTask: 'Sonraki: Vize', url: WIDGET_URLS.trip,
    });
    expect(p.cities).toEqual(['Tokyo', 'Kyoto', 'Osaka']);
  });

  it('formats a range across months', () => {
    expect(tripProps(input([plan({ startDate: '2026-12-30', endDate: '2027-01-03' })]), NOW).range).toBe('30 Ara – 3 Oca');
  });

  it('knows departure day and an ongoing trip', () => {
    expect(tripProps(input([plan()]), at(2026, 12, 14))).toMatchObject({ kind: 'today', headline: 'Yola çıkış günü' });
    expect(tripProps(input([plan()]), at(2026, 12, 16))).toMatchObject({ kind: 'ongoing', days: 3, headline: 'Gezinin 3. günü' });
  });

  it('moves on to the next plan once a trip is over', () => {
    const later = plan({ id: 'p2', countryId: 'PT', startDate: '2027-03-01', endDate: '2027-03-05' });
    expect(tripProps(input([plan(), later]), at(2026, 12, 30)).country).toBe('Portekiz');
  });

  it('suggests a wishlist country, or nothing, when there is no plan', () => {
    expect(tripProps(input([]), NOW)).toMatchObject({ kind: 'empty', headline: 'Henüz plan yok', suggestionLine: 'İstek listenden: 🇵🇹 Portekiz' });
    expect(tripProps(input([], { wishlist: [] }), NOW).suggestionLine).toBe('');
    expect(tripProps(input([plan({ endDate: '2026-01-02', startDate: '2026-01-01' })]), NOW).kind).toBe('empty');
  });

  it('speaks English', () => {
    expect(tripProps(input([plan()], { lang: 'en' }), NOW)).toMatchObject({ eyebrow: 'NEXT TRIP', unit: 'days', dateLine: '14 December · 14 days' });
  });

  it('timeline counts down one day per midnight', () => {
    const entries = tripTimeline(input([plan()]), NOW);
    expect(entries).toHaveLength(31);
    expect(entries[0].props.days).toBe(32);
    expect(entries[1].props.days).toBe(31);
    expect(entries[2].props.days).toBe(30);
  });
});
