/**
 * Small string-catalog helper shared by the screens that have been moved off inline `lang === 'tr' ? a : b`.
 * A catalog maps a key to its text per language; `en` is required and is the fallback, so adding a language
 * (say `de`) means adding a `de` text to entries, never touching component logic. Placeholders are `{name}`.
 */
export type Lang = 'tr' | 'en';

/** Languages the app ships a full UI for; add the code here and in the catalogs when a new one lands. */
export const SUPPORTED_LANGS: readonly Lang[] = ['tr', 'en'];

export type Entry = { en: string } & Partial<Record<string, string>>;
export type Params = Record<string, string | number>;

export function createT<K extends string>(strings: Record<K, Entry>) {
  return (key: K, lang: string, params?: Params): string => {
    const entry = strings[key];
    const text = entry[lang] ?? entry.en;
    if (!params) return text;
    return text.replace(/\{(\w+)\}/g, (whole, name: string) => (name in params ? String(params[name]) : whole));
  };
}
