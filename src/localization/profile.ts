type Lang = 'tr' | 'en';

const strings = {
  facts: { tr: 'ÜLKE BİLGİLERİ', en: 'COUNTRY FACTS' },
  capital: { tr: 'Başkent', en: 'Capital' },
  language: { tr: 'Dil', en: 'Language' },
  currency: { tr: 'Para birimi', en: 'Currency' },
  callingCode: { tr: 'Telefon kodu', en: 'Calling code' },
  driving: { tr: 'Trafik', en: 'Driving' },
  drivesLeft: { tr: 'Soldan', en: 'Left' },
  drivesRight: { tr: 'Sağdan', en: 'Right' },
  area: { tr: 'Yüzölçümü', en: 'Area' },
  landlocked: { tr: 'Denize kıyısı yok', en: 'Landlocked' },
  entry: { tr: 'GİRİŞ KOŞULLARI', en: 'ENTRY REQUIREMENTS' },
  forPassport: { tr: 'T.C. pasaportu ile', en: 'With a Turkish passport' },
  stay: { tr: 'Kalış süresi', en: 'Allowed stay' },
  schengen: { tr: 'Schengen bölgesi', en: 'Schengen area' },
  eu: { tr: 'AB üyesi', en: 'EU member' },
  schengenNote: {
    tr: 'Schengen ülkelerinden biri için alınan vize, bölgedeki diğer ülkelerde de geçerlidir.',
    en: 'A Schengen visa from one member also covers the other member countries.',
  },
  disclaimer: {
    tr: 'Bilgi {date} tarihli {source} verisine dayanır ve değişmiş olabilir. Seyahatten önce ilgili ülkenin büyükelçiliğinden veya T.C. Dışişleri Bakanlığı sayfasından kontrol et.',
    en: 'Based on {source} data dated {date}; rules may have changed. Check with the embassy or the Turkish Ministry of Foreign Affairs before you travel.',
  },
  source: { tr: 'Vikipedi', en: 'Wikipedia' },
  exploreRoutes: { tr: 'Rotalar', en: 'Routes' },
  exploreCountries: { tr: 'Tüm Ülkeler', en: 'All Countries' },
  visaFilter: { tr: 'T.C. PASAPORTU İÇİN', en: 'WITH A TURKISH PASSPORT' },
  filterAll: { tr: 'Hepsi', en: 'All' },
  filterFree: { tr: 'Vizesiz', en: 'Visa-free' },
  filterEasy: { tr: 'Kapıda / e-Vize', en: 'On arrival / e-Visa' },
  filterRequired: { tr: 'Vize gerekli', en: 'Visa required' },
  filterSchengen: { tr: 'Schengen', en: 'Schengen' },
  climate: { tr: 'İKLİM VE ZAMAN', en: 'CLIMATE AND TIME' },
  bestTime: { tr: 'Tahmini en uygun aylar', en: 'Likely best months' },
  timeZone: { tr: 'Saat dilimi', en: 'Time zone' },
  vsTurkey: { tr: 'Türkiye ile fark', en: 'Difference to Türkiye' },
  sameTime: { tr: 'Aynı saat', en: 'Same time' },
  hoursAhead: { tr: '{n} saat ileride', en: '{n} h ahead' },
  hoursBehind: { tr: '{n} saat geride', en: '{n} h behind' },
  climateNote: { tr: 'Başkent şehrinin uzun dönem aylık ortalamalarına göre bir tahmindir. Büyük ülkelerde bölgeler çok farklı olabilir. Yaz saati uygulaması hesaba katılmaz.', en: 'An estimate from the capital\'s long-term monthly averages. Regions of large countries can differ a lot. Daylight saving is not included.' },
  avgTemp: { tr: 'ort. sıcaklık', en: 'avg temp' },
  rain: { tr: 'yağış', en: 'rain' },
  filterNotVisited: { tr: 'Gitmediklerim', en: 'Not visited yet' },
  collectionsLabel: { tr: 'HAZIR KOLEKSİYONLAR', en: 'COLLECTIONS' },
  colFreeEurope: { tr: 'Vizesiz Avrupa', en: 'Visa-free Europe' },
  colFreeAsia: { tr: 'Vizesiz Asya', en: 'Visa-free Asia' },
  colFreeAmericas: { tr: 'Vizesiz Amerika', en: 'Visa-free Americas' },
  colEasyNext: { tr: 'Kolay giriş, henüz gitmedin', en: 'Easy entry, not visited' },
  colSchengenNext: { tr: 'Gitmediğin Schengen', en: 'Schengen not visited' },
  countriesFound: { tr: '{n} ülke', en: '{n} countries' },
  searchCountries: { tr: 'Ülke ara…', en: 'Search countries…' },
  noMatch: { tr: 'Eşleşen ülke yok', en: 'No matching countries' },
  noMatchDesc: { tr: 'Filtreleri veya aramayı değiştirmeyi dene.', en: 'Try changing the filters or the search.' },
  dataCredit: { tr: 'Veri kaynakları', en: 'Data sources' },
} as const;

export type ProfileKey = keyof typeof strings;

export function pt(key: ProfileKey, lang: Lang, vars?: Record<string, string | number>): string {
  let text: string = strings[key][lang];
  if (vars) for (const [k, v] of Object.entries(vars)) text = text.replace(`{${k}}`, String(v));
  return text;
}
