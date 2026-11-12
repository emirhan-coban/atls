import { createT } from '../i18n';

/** Texts of GlobeView (moved out of inline `lang === 'tr'` checks). */
const strings = {
  world_globe: { tr: "Dünya küresi", en: "World globe" },
  use_the_search_button_to_reach_a_c: { tr: "Bir ülkeye ulaşmak için “Ülke ara” düğmesini kullan.", en: "Use the “Search” button to reach a country." },
};

export const tGlobeView = createT(strings);
export const tGlobeViewStrings = strings;
