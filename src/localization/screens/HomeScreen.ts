import { createT } from '../i18n';

/** Texts of HomeScreen (moved out of inline `lang === 'tr'` checks). */
const strings = {
  visited: { tr: "gidildi", en: "visited" },
  lived: { tr: "yaşandı", en: "lived" },
  wishlist: { tr: "istek", en: "wishlist" },
  start_passport: { tr: "PASAPORTUNU BAŞLAT", en: "START PASSPORT" },
  add_your_first_country: { tr: "İlk Ülkeni Ekle", en: "Add Your First Country" },
  select_countries_you_have_visited: { tr: "Gittiğin veya yaşamak istediğin ülkeleri seç, sana özel seyahat haritan ve vizelerin canlansın.", en: "Select countries you have visited or dream of visiting to bring your personal world map to life." },
  add_country: { tr: "Ülke Ekle", en: "Add Country" },
  lived_2: { tr: "YAŞANDI", en: "LIVED" },
  visited_2: { tr: "ZİYARET EDİLDİ", en: "VISITED" },
  countries: { tr: "Ülke", en: "Countries" },
  previous_country: { tr: "Önceki ülke", en: "Previous country" },
  next_country: { tr: "Sonraki ülke", en: "Next country" },
  lived_3: { tr: "Yaşadın", en: "Lived" },
  visited_3: { tr: "Gittin", en: "Visited" },
  travel_guide: { tr: "GEZGİN REHBERİ", en: "TRAVEL GUIDE" },
  what_to_eat_what_to_explore: { tr: "Hangi ülkede ne yenir, ne gezilir?", en: "What to eat, what to explore?" },
  iconic_street_bites_secret_travel: { tr: "İkonik lezzetler ve gizli seyahat tüyoları", en: "Iconic street bites & secret travel hacks" },
};

export const tHomeScreen = createT(strings);
export const tHomeScreenStrings = strings;
