import { createT } from '../i18n';

/** Texts of WorldMap (moved out of inline `lang === 'tr'` checks). */
const strings = {
  lived: { tr: "YAŞANAN", en: "LIVED" },
  wishlist: { tr: "HEDEF", en: "WISHLIST" },
  visited: { tr: "GEZİLEN", en: "VISITED" },
  unexplored: { tr: "KEŞFEDİLMEDİ", en: "UNEXPLORED" },
  loading_map: { tr: "Harita yükleniyor…", en: "Loading map…" },
  world_map: { tr: "DÜNYA HARİTASI", en: "WORLD MAP" },
  marked_countries: { tr: "{length} İŞARETLİ ÜLKE", en: "{length} MARKED COUNTRIES" },
};

export const tWorldMap = createT(strings);
export const tWorldMapStrings = strings;
