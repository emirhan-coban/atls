import { createT } from '../i18n';

/** Texts of App (moved out of inline `lang === 'tr'` checks). */
const strings = {
  could_not_delete_account: { tr: "Hesap silinemedi", en: "Could not delete account" },
  your_account_could_not_be_deleted: { tr: "Hesabınız silinemedi. İnternet bağlantınızı kontrol edip tekrar deneyin.", en: "Your account could not be deleted. Check your connection and try again." },
};

export const tApp = createT(strings);
export const tAppStrings = strings;
