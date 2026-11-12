import { createT } from '../i18n';

/** Texts of GlobeOverlay (moved out of inline `lang === 'tr'` checks). */
const strings = {
  search_a_country: { tr: "Ülke ara", en: "Search a country" },
  close_search: { tr: "Aramayı kapat", en: "Close search" },
  search: { tr: "Ülke ara", en: "Search" },
};

export const tGlobeOverlay = createT(strings);
export const tGlobeOverlayStrings = strings;
