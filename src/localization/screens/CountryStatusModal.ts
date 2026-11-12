import { createT } from '../i18n';

/** Texts of CountryStatusModal (moved out of inline `lang === 'tr'` checks). */
const strings = {
  added_to_your_passport: { tr: "🎉 Pasaportuna Eklendi!", en: "🎉 Added to Your Passport!" },
  remove_country: { tr: "Ülkeyi Kaldır", en: "Remove Country" },
  cancel: { tr: "Vazgeç", en: "Cancel" },
  remove: { tr: "Kaldır", en: "Remove" },
  lived: { tr: "YAŞANDI", en: "LIVED" },
  wishlist: { tr: "HEDEFİNDE", en: "WISHLIST" },
  visited: { tr: "GEZİLDİ", en: "VISITED" },
  close: { tr: "Kapat", en: "Close" },
  fulfill_your_dream_destination: { tr: "Hedefini Gerçeğe Dönüştür", en: "Fulfill Your Dream Destination" },
  have_you_visited_or_moved_here_upd: { tr: "Bu ülkeyi ziyaret ettin mi veya oraya mı taşındın? Durumunu güncelleyerek pasaportuna ekleyebilirsin.", en: "Have you visited or moved here? Update its status to add it to your passport." },
  passport_status: { tr: "PASAPORT STATÜSÜ", en: "PASSPORT STATUS" },
  visited_2: { tr: "Gezildi", en: "Visited" },
  lived_2: { tr: "Yaşandı", en: "Lived" },
  wishlist_2: { tr: "Hedef", en: "Wishlist" },
  travel_date_month_year: { tr: "SEYAHAT TARİHİ (AY / YIL)", en: "TRAVEL DATE (MONTH / YEAR)" },
  travel_memory_notes: { tr: "SEYAHAT ANISI / NOTUN", en: "TRAVEL MEMORY / NOTES" },
  e_g_want_to_see_the_northern_light: { tr: "Örn: Kuzey ışıklarını izlemek istiyorum...", en: "e.g. Want to see the Northern Lights..." },
  e_g_first_time_walking_tokyo_stree: { tr: "Örn: İlk kez Tokyo sokaklarında yürüdüm...", en: "e.g. First time walking Tokyo streets..." },
  add_to_passport: { tr: "Pasaporta İşle ✈️", en: "Add to Passport ✈️" },
  save_changes: { tr: "Değişiklikleri Kaydet", en: "Save Changes" },
  remove_from_passport: { tr: "Pasaporttan Kaldır", en: "Remove from Passport" },
};

export const tCountryStatusModal = createT(strings);
export const tCountryStatusModalStrings = strings;
