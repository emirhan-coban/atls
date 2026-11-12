import { createT } from '../i18n';

/** Texts of AppHeader (moved out of inline `lang === 'tr'` checks). */
const strings = {
  tr: { tr: "EN", en: "TR" },
};

export const tAppHeader = createT(strings);
export const tAppHeaderStrings = strings;
