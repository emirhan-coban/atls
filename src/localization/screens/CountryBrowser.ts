import { createT } from '../i18n';

/** Texts of CountryBrowser (moved out of inline `lang === 'tr'` checks). */
const strings = {
  clear_filters: { tr: "Filtreleri temizle", en: "Clear filters" },
  show_more: { tr: "Daha fazla göster ({limit})", en: "Show more ({limit})" },
};

export const tCountryBrowser = createT(strings);
export const tCountryBrowserStrings = strings;
