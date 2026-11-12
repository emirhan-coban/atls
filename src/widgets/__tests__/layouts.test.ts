/// <reference types="jest" />
/**
 * Smoke test for the three widget layouts. Babel turns each `'widget'` function into source text (the native side
 * evaluates it in an isolated runtime where the SwiftUI components and modifiers are globals), so the test evaluates
 * that text against stand-in globals and checks that every family and state renders without throwing and shows the
 * texts it was given.
 */
import { EMPTY_STATS, dayKeyOf } from '../../game/dailyCountry';
import GameWidget from '../GameWidget';
import PassportWidget from '../PassportWidget';
import TripWidget from '../TripWidget';
import { gameProps, passportProps, tripProps } from '../widgetData';

jest.mock('expo-widgets', () => ({ createWidget: (name: string, layout: unknown) => ({ name, layout }) }));
jest.mock('@expo/ui/swift-ui', () => ({}));
jest.mock('@expo/ui/swift-ui/modifiers', () => ({}));

type Node = { type: string; props: Record<string, any> };

function evaluate(widget: unknown, props: object, env: object): Node {
  const { layout } = widget as { name: string; layout: unknown };
  const source = typeof layout === 'function' ? layout.toString() : String(layout);
  const node = (type: string) => (...args: any[]) => ({ mod: type, args });
  const globals = new Proxy({} as Record<string, unknown>, {
    has: () => true,
    get: (_t, key: string | symbol) => {
      if (typeof key === 'symbol') return undefined;
      if (key === '_jsx' || key === '_jsxs') return (type: string, p: Record<string, any>) => ({ type, props: p });
      if (key in globalThis) return (globalThis as any)[key];
      if (key === 'shapes') return { capsule: () => 'capsule', roundedRectangle: () => 'rrect', rectangle: () => 'rect' };
      if (/^[A-Z]/.test(key)) return key; // a component: its name stands in for it
      return node(key);
    },
  });
  const fn = new Function('g', `with (g) { return (${source}); }`)(globals);
  return fn(props, env);
}

const texts = (n: any): string[] => {
  if (n == null || typeof n === 'boolean') return [];
  if (typeof n === 'string' || typeof n === 'number') return [String(n)];
  if (Array.isArray(n)) return n.flatMap(texts);
  return [...texts(n.props?.children), ...texts(n.props?.currentValueLabel)];
};

const NOW = new Date(2026, 10, 12, 9);
const env = (widgetFamily: string, colorScheme: 'dark' | 'light' = 'dark') => ({ widgetFamily, colorScheme, date: NOW, configuration: undefined });

describe('widget layouts', () => {
  it('passport: small and medium, dark and light', () => {
    const props = passportProps(
      [
        { status: 'visited', flag: '🇯🇵', continent: 'Asia' },
        { status: 'lived', flag: '🇹🇷', continent: 'Asia' },
      ],
      3,
      'tr'
    );
    for (const family of ['systemSmall', 'systemMedium']) {
      for (const scheme of ['dark', 'light'] as const) {
        const all = texts(evaluate(PassportWidget, props, env(family, scheme))).join('|');
        expect(all).toContain('2');
        expect(all).toContain(props.worldLine);
        if (family === 'systemMedium') expect(all).toContain(props.metaLine);
      }
    }
  });

  it('game: every state on the home screen, and the three lock screen families', () => {
    const today = dayKeyOf(NOW);
    const variants = [
      gameProps({ days: {}, stats: EMPTY_STATS, lang: 'tr', visitedCount: 5 }, NOW),
      gameProps({ days: {}, stats: { ...EMPTY_STATS, streak: 5, lastWonDay: dayKeyOf(new Date(2026, 10, 11)) }, lang: 'tr', visitedCount: 5 }, new Date(2026, 10, 12, 20)),
      gameProps({ days: { [today]: { guesses: ['a', 'b', 'c'], done: true, won: true } }, stats: { ...EMPTY_STATS, streak: 6, lastWonDay: today }, lang: 'en', visitedCount: 5 }, NOW),
      gameProps({ days: { [today]: { guesses: [], done: true, won: false } }, stats: EMPTY_STATS, lang: 'tr', visitedCount: 5 }, NOW),
    ];
    expect(variants.map((v) => v.state)).toEqual(['unplayed', 'risk', 'won', 'lost']);
    for (const props of variants) {
      const small = texts(evaluate(GameWidget, props, env('systemSmall'))).join('|');
      expect(small).toContain(props.state === 'unplayed' ? props.cta : props.state === 'risk' ? props.headline : props.sub);
      expect(texts(evaluate(GameWidget, props, env('accessoryInline'))).join('')).toBe(props.inline);
      expect(texts(evaluate(GameWidget, props, env('accessoryCircular'))).join('')).toContain(String(props.streak));
      const rect = texts(evaluate(GameWidget, props, env('accessoryRectangular'))).join('|');
      expect(rect).toContain(props.lockTitle);
      expect(rect).toContain(props.lockStatus);
    }
  });

  it('trip: upcoming (small and medium), departure day, ongoing and empty', () => {
    const plan = {
      id: 'p', countryId: 'JP', startDate: '2026-12-14', endDate: '2026-12-27', cities: ['Tokyo', 'Kyoto'], notes: '',
      checklist: [{ id: '1', text: 'Vize', done: false }], budget: [], currency: 'TRY', notificationIds: [], createdAt: '', updatedAt: '',
    };
    const input = { plans: [plan], lang: 'tr' as const, place: () => ({ name: 'Japonya', flag: '🇯🇵' }), wishlist: ['PT'] };
    for (const at of [NOW, new Date(2026, 11, 14), new Date(2026, 11, 16)]) {
      const props = tripProps(input, at);
      for (const family of ['systemSmall', 'systemMedium']) {
        const all = texts(evaluate(TripWidget, props, env(family))).join('|');
        expect(all).toContain(props.eyebrow);
      }
    }
    const medium = texts(evaluate(TripWidget, tripProps(input, NOW), env('systemMedium'))).join('|');
    expect(medium).toContain('Tokyo');
    expect(medium).toContain('0 / 1');
    const empty = texts(evaluate(TripWidget, tripProps({ ...input, plans: [] }, NOW), env('systemSmall'))).join('|');
    expect(empty).toContain('Gezi planla');
    expect(empty).toContain('İstek listenden: 🇯🇵 Japonya');
  });
});
