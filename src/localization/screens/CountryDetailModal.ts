import { createT } from '../i18n';

/** Texts of CountryDetailModal (moved out of inline `lang === 'tr'` checks). */
const strings = {
  close: { tr: "Kapat", en: "Close" },
  residence: { tr: "İKAMET EDİLDİ 🏡", en: "RESIDENCE 🏡" },
  visited: { tr: "ZİYARET EDİLDİ ✈️", en: "VISITED ✈️" },
  in_wishlist: { tr: "HEDEFLERDE ❤️", en: "IN WISHLIST ❤️" },
  visited_year: { tr: "Ziyaret Yılı", en: "Visited Year" },
  country_code: { tr: "Ülke Kodu", en: "Country code" },
  cultural_trivia: { tr: "BUNU BİLİYOR MUYDUN?", en: "CULTURAL TRIVIA" },
  add_to_passport: { tr: "Pasaporta Ekle ✈️", en: "Add to Passport ✈️" },
  edit: { tr: "Düzenle", en: "Edit" },
  share_card: { tr: "Kartı Paylaş", en: "Share Card" },
};

export const tCountryDetailModal = createT(strings);
export const tCountryDetailModalStrings = strings;
