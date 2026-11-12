import { createT } from '../i18n';

/** Texts of locationHelper (moved out of inline `lang === 'tr'` checks). */
const strings = {
  home: { tr: "İkamet", en: "Home" },
  latest: { tr: "Son Durak", en: "Latest" },
};

export const tlocationHelper = createT(strings);
export const tlocationHelperStrings = strings;
