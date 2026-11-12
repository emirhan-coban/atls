import { createT } from '../i18n';

/** Texts of DocumentVault (moved out of inline `lang === 'tr'` checks). */
const strings = {
  delete: { tr: "Sil", en: "Delete" },
};

export const tDocumentVault = createT(strings);
export const tDocumentVaultStrings = strings;
