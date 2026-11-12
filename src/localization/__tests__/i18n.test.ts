/// <reference types="jest" />
import { createT, Entry, SUPPORTED_LANGS } from '../i18n';
import { gameStrings } from '../game';
import { compareStrings } from '../compare';
import { screenCatalogs } from '../screens';

const placeholders = (text: string) => (text.match(/\{\w+\}/g) ?? []).sort().join(',');

describe('createT', () => {
  const t = createT({ hi: { tr: 'Merhaba {name}', en: 'Hello {name}' }, only_en: { en: 'Only English' } });

  it('picks the language and fills placeholders', () => {
    expect(t('hi', 'tr', { name: 'Ada' })).toBe('Merhaba Ada');
    expect(t('hi', 'en', { name: 'Ada' })).toBe('Hello Ada');
  });

  it('falls back to English for a language without the entry', () => {
    expect(t('only_en', 'tr')).toBe('Only English');
    expect(t('hi', 'de', { name: 'Ada' })).toBe('Hello Ada');
  });

  it('leaves unknown placeholders visible instead of dropping them', () => {
    expect(t('hi', 'en', {})).toBe('Hello {name}');
  });
});

describe.each([
  ['game', gameStrings],
  ['compare', compareStrings],
] as [string, Record<string, Entry>][])('%s catalog', (_name, strings) => {
  it('has every supported language and matching placeholders', () => {
    for (const [key, entry] of Object.entries(strings)) {
      for (const lang of SUPPORTED_LANGS) {
        expect(`${key}.${lang}:${Boolean(entry[lang])}`).toBe(`${key}.${lang}:true`);
      }
      expect(`${key}:${placeholders(entry.tr ?? '')}`).toBe(`${key}:${placeholders(entry.en)}`);
    }
  });
});

describe('screen catalogs', () => {
  const entries = Object.entries(screenCatalogs) as [string, Record<string, Entry>][];

  it('exist for the moved screens', () => {
    expect(entries.length).toBeGreaterThan(10);
  });

  it.each(entries)('%s has every language, matching placeholders and no empty text', (_name, strings) => {
    expect(Object.keys(strings).length).toBeGreaterThan(0);
    for (const [key, entry] of Object.entries(strings)) {
      for (const lang of SUPPORTED_LANGS) expect(`${key}.${lang}:${Boolean(entry[lang]?.length)}`).toBe(`${key}.${lang}:true`);
      expect(`${key}:${placeholders(entry.tr ?? '')}`).toBe(`${key}:${placeholders(entry.en)}`);
    }
  });
});
