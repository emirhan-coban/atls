import { buildStatusLut, hexToRgb, WANT_ALPHA } from '../statusLut';
import { createCelebrationDetector, createCelebrationQueue } from '../celebration';
import { idOfIso } from '../countryIndex';

const colors = { visited: hexToRgb('#10B981'), lived: hexToRgb('#3B82F6'), want: hexToRgb('#E5A93C') };
const c = (id: string, status: 'visited' | 'lived' | 'want') => ({ id, status });

describe('status LUT', () => {
  it('colours each status and leaves the rest transparent', () => {
    const lut = buildStatusLut([c('TR', 'visited'), c('DE', 'lived'), c('FR', 'want')], colors);
    expect(lut.length).toBe(1024);
    const at = (iso: string) => Array.from(lut.slice(idOfIso(iso) * 4, idOfIso(iso) * 4 + 4));
    expect(at('TR')).toEqual([16, 185, 129, 255]);
    expect(at('DE')).toEqual([59, 130, 246, 255]);
    expect(at('FR')).toEqual([Math.round((229 * WANT_ALPHA) / 255), Math.round((169 * WANT_ALPHA) / 255), Math.round((60 * WANT_ALPHA) / 255), WANT_ALPHA]);
    expect(at('IT')[3]).toBe(0);
    expect(Array.from(lut.slice(0, 4))).toEqual([0, 0, 0, 0]);
  });

  it('lets the stronger status win and ignores unknown ids', () => {
    const lut = buildStatusLut([c('TR', 'want'), c('TR', 'lived'), c('ZZ', 'visited')], colors);
    expect(lut[idOfIso('TR') * 4 + 2]).toBe(246);
    expect(lut.filter((_, i) => i % 4 === 3 && lut[i] > 0).length).toBe(1);
  });
});

describe('celebration detector', () => {
  const make = (hydrated = true) => createCelebrationDetector(() => hydrated);

  it('ignores the first snapshot (hydration)', () => {
    const diff = make();
    expect(diff([c('TR', 'visited'), c('DE', 'visited')])).toEqual([]);
  });

  it('fires when a country becomes visited or lived', () => {
    const diff = make();
    diff([c('TR', 'visited')]);
    expect(diff([c('TR', 'visited'), c('FR', 'visited')])).toEqual([{ id: 'FR', status: 'visited' }]);
    expect(diff([c('TR', 'lived'), c('FR', 'visited')])).toEqual([]); // visited -> lived is not new
    expect(diff([c('TR', 'lived'), c('FR', 'visited'), c('IT', 'want')])).toEqual([{ id: 'IT', status: 'want' }]);
    expect(diff([c('TR', 'lived'), c('FR', 'visited'), c('IT', 'visited')])).toEqual([{ id: 'IT', status: 'visited' }]); // want -> visited
  });

  it('treats bulk loads and removals as baselines', () => {
    const diff = make();
    diff([c('TR', 'visited')]);
    expect(diff([c('TR', 'visited'), c('DE', 'visited'), c('FR', 'visited')])).toEqual([]); // cloud sync
    expect(diff([])).toEqual([]);
    expect(diff([c('ES', 'visited')])).toEqual([{ id: 'ES', status: 'visited' }]);
  });

  it('does nothing before the store is hydrated', () => {
    const diff = make(false);
    diff([]);
    expect(diff([c('TR', 'visited')])).toEqual([]);
  });

  it('queues while Home is hidden and releases in order', () => {
    const q = createCelebrationQueue();
    q.push([{ id: 'TR', status: 'visited' }, { id: 'FR', status: 'lived' }]);
    expect(q.drain(false)).toEqual([]);
    expect(q.size()).toBe(2);
    expect(q.drain(true).map((e) => e.id)).toEqual(['TR', 'FR']);
    expect(q.size()).toBe(0);
  });

  it('hands events out one at a time', () => {
    const q = createCelebrationQueue();
    q.push([{ id: 'TR', status: 'visited' }, { id: 'FR', status: 'lived' }]);
    expect(q.next(false)).toBeUndefined();
    expect(q.next(true)?.id).toBe('TR');
    expect(q.next(true)?.id).toBe('FR');
    expect(q.next(true)).toBeUndefined();
  });
});
