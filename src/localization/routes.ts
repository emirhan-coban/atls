type Lang = 'tr' | 'en';

const strings = {
  eyebrow: { tr: 'GEZGİN REHBERİ', en: 'TRAVEL GUIDE' },
  title: { tr: 'Nereye gitsek?', en: 'Where to next?' },
  subtitle: { tr: 'Mevsimine, vizene ve gitmediğin yerlere göre öneriler.', en: 'Picks by season, visa and where you have not been.' },
  thisMonth: { tr: 'Bu ay nereye?', en: 'Where this month?' },
  thisMonthSub: { tr: 'Havası uygun ve girişi kolay, henüz gitmediğin ülkeler.', en: 'Pleasant weather, easy entry, places you have not been.' },
  noPicks: { tr: 'Bu ay için öneri bulunamadı.', en: 'No picks for this month.' },
  routes: { tr: 'Rotalar', en: 'Routes' },
  routesCount: { tr: '{n} rota', en: '{n} routes' },
  filterAll: { tr: 'Hepsi', en: 'All' },
  filterNow: { tr: 'Bu ay uygun', en: 'Good this month' },
  filterFree: { tr: 'Vizesiz', en: 'Visa-free' },
  filterNew: { tr: 'Gitmediklerim', en: 'Not visited' },
  search: { tr: 'Ülke, şehir veya yemek ara', en: 'Search country, city or dish' },
  showMore: { tr: 'Daha fazla göster', en: 'Show more' },
  emptyTitle: { tr: 'Sonuç yok', en: 'Nothing found' },
  emptyDesc: { tr: 'Filtreleri veya aramayı değiştirmeyi dene.', en: 'Try changing the filters or the search.' },
  clear: { tr: 'Filtreleri temizle', en: 'Clear filters' },
  // detail sheet
  bestTime: { tr: 'En uygun aylar', en: 'Best months' },
  entry: { tr: 'Giriş', en: 'Entry' },
  clock: { tr: 'Saat', en: 'Time' },
  money: { tr: 'Para', en: 'Currency' },
  places: { tr: 'Gezilecek yerler', en: 'Places to see' },
  food: { tr: 'Ne yenir', en: 'What to eat' },
  tip: { tr: 'Gezgin tüyosu', en: 'Insider tip' },
  addWish: { tr: 'İstek listesine ekle', en: 'Add to wishlist' },
  inWish: { tr: 'İstek listende', en: 'On your wishlist' },
  visited: { tr: 'Gittin', en: 'Visited' },
  planTrip: { tr: 'Gezi planla', en: 'Plan a trip' },
  countryPage: { tr: 'Ülke sayfası', en: 'Country page' },
  photoBy: { tr: 'Fotoğraf', en: 'Photo' },
  hoursAhead: { tr: '{n} sa ileri', en: '{n} h ahead' },
  hoursBehind: { tr: '{n} sa geri', en: '{n} h behind' },
  sameTime: { tr: 'Aynı saat', en: 'Same time' },
  verify: { tr: 'Çalışma saatlerini ve fiyatları gitmeden önce kontrol et.', en: 'Check opening hours and prices before you go.' },
} as const;

export type RouteKey = keyof typeof strings;

export function rt(key: RouteKey, lang: Lang, vars?: Record<string, string | number>): string {
  let text: string = strings[key][lang];
  if (vars) for (const [k, v] of Object.entries(vars)) text = text.replace(`{${k}}`, String(v));
  return text;
}
