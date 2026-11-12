/// <reference types="jest" />
import { INVITE_URL } from '../links';
import { availableCatalog } from '../../data/travelData';
import { CATALOG_VERSIONS, LATEST_VERSION } from '../compareCatalogs';
import { buildCompareLink, compareVisited, decodeVisited, encodeVisited, inviteProblem, parseInvite } from '../compareCode';

describe('compare code', () => {
  it('round-trips a country list and stays short', () => {
    const ids = ['TR', 'JP', 'FR', 'US', 'BR'];
    const code = encodeVisited(ids);
    expect(code.length).toBeLessThan(40);
    expect(decodeVisited(code)).toEqual([...ids].sort());
  });

  it('handles empty and full lists, case-insensitively', () => {
    expect(decodeVisited(encodeVisited([]))).toEqual([]);
    expect(decodeVisited(encodeVisited(['tr']))).toEqual(['TR']);
  });

  it('rejects codes it did not produce', () => {
    expect(decodeVisited('')).toBeNull();
    expect(decodeVisited('2AAAA')).toBeNull();
    expect(decodeVisited('1AAAA')).toBeNull(); // wrong length
    expect(decodeVisited('1' + '!'.repeat(33))).toBeNull();
  });

  it('compares two lists', () => {
    const r = compareVisited(['TR', 'JP', 'FR'], ['fr', 'JP', 'US', 'BR']);
    expect(r.both).toEqual(['FR', 'JP']);
    expect(r.onlyMine).toEqual(['TR']);
    expect(r.onlyTheirs).toEqual(['BR', 'US']);
    expect(r.overlap).toBe(40);
    expect(compareVisited([], []).overlap).toBe(0);
  });

  it('builds a link with an encoded, trimmed name', () => {
    const link = buildCompareLink(['TR'], 'Ayşe & Co');
    expect(link.startsWith(`${INVITE_URL}?c=1`)).toBe(true);
    expect(link).toContain('&n=Ay%C5%9Fe%20%26%20Co');
  });

  it('finds the invite in a pasted message, a bare link or a bare code', () => {
    const link = buildCompareLink(['TR', 'JP'], 'Ayşe');
    const message = `Pasaportlarımızı çarpıştıralım!\n${link}`;
    expect(parseInvite(message)).toEqual({ code: encodeVisited(['TR', 'JP']), name: 'Ayşe' });
    expect(parseInvite(link)?.code).toBe(encodeVisited(['TR', 'JP']));
    const bare = encodeVisited(['FR']);
    expect(parseInvite(`  ${bare} `)).toEqual({ code: bare, name: '' });
    expect(parseInvite('merhaba')).toBeNull();
    expect(parseInvite('atls://compare?c=1AAAA')).toBeNull();
    // links written by older builds (custom scheme) keep working
    expect(parseInvite(`atls://compare?c=${bare}&n=Ay%C5%9Fe`)).toEqual({ code: bare, name: 'Ayşe' });
  });

  it('keeps old codes decodable: every frozen version is sorted, unique and the latest one matches the catalog', () => {
    for (const ids of Object.values(CATALOG_VERSIONS)) {
      expect([...ids].sort()).toEqual(ids);
      expect(new Set(ids).size).toBe(ids.length);
    }
    // If this fails the catalog changed: add a new version in compareCatalogs.ts instead of editing the old list.
    expect(CATALOG_VERSIONS[LATEST_VERSION]).toEqual(availableCatalog.map((c) => c.id).sort());
  });

  it('tells a newer-version code apart from garbage', () => {
    const body = encodeVisited(['TR']).slice(1);
    expect(inviteProblem(`https://x/c/?c=9${body}`)).toBe('newer');
    expect(inviteProblem('merhaba')).toBe('invalid');
    expect(inviteProblem('')).toBe('invalid');
  });
});
