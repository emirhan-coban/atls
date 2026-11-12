import { createT } from '../i18n';

/** Texts of memories (moved out of inline `lang === 'tr'` checks). */
const strings = {
  look_back_at_that_trip_your_photos: { tr: "O geziyi hatırla, fotoğraflarına ve notlarına göz at.", en: "Look back at that trip, your photos and your notes." },
};

export const tmemories = createT(strings);
export const tmemoriesStrings = strings;
