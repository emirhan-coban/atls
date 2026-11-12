import { createT } from '../i18n';

/** Texts of AchievementBadge (moved out of inline `lang === 'tr'` checks). */
const strings = {
  done: { tr: "Açıldı", en: "Done" },
};

export const tAchievementBadge = createT(strings);
export const tAchievementBadgeStrings = strings;
