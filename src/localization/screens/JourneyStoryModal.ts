import { createT } from '../i18n';

/** Texts of JourneyStoryModal (moved out of inline `lang === 'tr'` checks). */
const strings = {
  notice: { tr: "Bilgi", en: "Notice" },
  sharing_is_not_available_on_this_d: { tr: "Paylaşım bu cihazda desteklenmiyor.", en: "Sharing is not available on this device." },
  error: { tr: "Hata", en: "Error" },
  could_not_prepare_the_story: { tr: "Hikaye hazırlanamadı.", en: "Could not prepare the story." },
  my_journey_story: { tr: "Yolculuk Hikâyem", en: "My Journey Story" },
  free_on_the_app_store: { tr: "App Store'da ücretsiz", en: "Free on the App Store" },
  i_have_seen: { tr: "DÜNYANIN", en: "I HAVE SEEN" },
  k_: { tr: "%{p1}", en: "{p1}%" },
  of_the_world: { tr: "KADARINI GEZDİM", en: "OF THE WORLD" },
  countries: { tr: "ülke", en: "countries" },
  continents: { tr: "kıta", en: "continents" },
  replay: { tr: "Tekrar oynat", en: "Replay" },
  share_as_story: { tr: "Story olarak paylaş", en: "Share as story" },
};

export const tJourneyStoryModal = createT(strings);
export const tJourneyStoryModalStrings = strings;
