import { TripType } from '../stores/types';

type Lang = 'tr' | 'en';

const strings = {
  title: { tr: 'Seyahat Günlüğü', en: 'Travel Journal' },
  tabTimeline: { tr: 'Geziler', en: 'Trips' },
  tabStats: { tr: 'İstatistik', en: 'Stats' },
  tabBadges: { tr: 'Rozetler', en: 'Badges' },
  addTrip: { tr: 'Gezi Ekle', en: 'Add Trip' },
  editTrip: { tr: 'Geziyi Düzenle', en: 'Edit Trip' },
  save: { tr: 'Kaydet', en: 'Save' },
  deleteTrip: { tr: 'Geziyi Sil', en: 'Delete Trip' },
  deleteTitle: { tr: 'Gezi silinsin mi?', en: 'Delete this trip?' },
  deleteMsg: { tr: 'Bu gezi günlüğünden kalıcı olarak silinir.', en: 'This trip will be permanently removed from your journal.' },
  cancel: { tr: 'Vazgeç', en: 'Cancel' },
  chooseCountry: { tr: 'Ülke seç', en: 'Choose country' },
  searchCountry: { tr: 'Ülke ara...', en: 'Search country...' },
  year: { tr: 'YIL', en: 'YEAR' },
  month: { tr: 'AY (İSTEĞE BAĞLI)', en: 'MONTH (OPTIONAL)' },
  days: { tr: 'KAÇ GÜN (İSTEĞE BAĞLI)', en: 'HOW MANY DAYS (OPTIONAL)' },
  daysPlaceholder: { tr: 'Örn: 7', en: 'e.g. 7' },
  cities: { tr: 'ŞEHİRLER (VİRGÜLLE AYIR)', en: 'CITIES (SEPARATE WITH COMMAS)' },
  citiesPlaceholder: { tr: 'Örn: Roma, Floransa, Venedik', en: 'e.g. Rome, Florence, Venice' },
  type: { tr: 'GEZİ TÜRÜ', en: 'TRIP TYPE' },
  rating: { tr: 'PUANIN', en: 'YOUR RATING' },
  notes: { tr: 'NOTLAR', en: 'NOTES' },
  notesPlaceholder: { tr: 'Bu gezide seni en çok ne etkiledi?', en: 'What stood out most on this trip?' },
  emptyTitle: { tr: 'Henüz gezi yok', en: 'No trips yet' },
  emptyDesc: {
    tr: 'Gittiğin yerleri tarih, şehir ve notlarla kaydet. Aynı ülkeye birden çok gezi ekleyebilirsin.',
    en: 'Record where you have been with dates, cities and notes. You can add several trips to the same country.',
  },
  unknownMonth: { tr: 'Ay yok', en: 'No month' },
  daysUnit: { tr: 'gün', en: 'days' },
  trips: { tr: 'Gezi', en: 'Trips' },
  countries: { tr: 'Ülke', en: 'Countries' },
  daysAbroad: { tr: 'Yurt Dışı Günü', en: 'Days Abroad' },
  yearsTraveled: { tr: 'Gezilen Yıl', en: 'Years Traveled' },
  avgRating: { tr: 'Ortalama Puan', en: 'Avg. Rating' },
  tripsPerYear: { tr: 'YILLARA GÖRE GEZİLER', en: 'TRIPS PER YEAR' },
  topCountries: { tr: 'EN ÇOK GİTTİKLERİN', en: 'MOST VISITED' },
  firstTrip: { tr: 'İlk gezin', en: 'First trip' },
  lastTrip: { tr: 'Son gezin', en: 'Latest trip' },
  level: { tr: 'SEVİYE', en: 'LEVEL' },
  levelRemaining: { tr: 'sonraki seviyeye {n} ülke kaldı', en: '{n} more countries to the next level' },
  levelMax: { tr: 'En yüksek seviyedesin', en: 'You reached the top level' },
  goalTitle: { tr: 'YILLIK HEDEF', en: 'YEARLY GOAL' },
  goalSet: { tr: 'Bu yıl için hedef belirle', en: 'Set a goal for this year' },
  goalHint: { tr: 'Bu yıl kaç yeni ülke görmek istiyorsun?', en: 'How many new countries do you want to see this year?' },
  goalProgress: { tr: '{a} / {t} yeni ülke', en: '{a} / {t} new countries' },
  goalDone: { tr: 'Hedefe ulaştın!', en: 'Goal reached!' },
  goalEdit: { tr: 'Hedefi değiştir', en: 'Change goal' },
  goalClear: { tr: 'Hedefi kaldır', en: 'Remove goal' },
  badgesUnlocked: { tr: '{n} / {t} rozet açıldı', en: '{n} of {t} badges unlocked' },
  newBadge: { tr: 'Yeni rozet', en: 'New badge' },
  journalCardTitle: { tr: 'Seyahat Günlüğün', en: 'Your Travel Journal' },
  journalCardCta: { tr: 'Gezilerini, istatistiklerini ve rozetlerini gör', en: 'See your trips, stats and badges' },
  openJournal: { tr: 'Seyahat Günlüğü', en: 'Travel Journal' },
  tripsOfCountry: { tr: 'GEZİLER', en: 'TRIPS' },
  stamped: { tr: 'PASAPORTA MÜHÜRLENDİ', en: 'STAMPED INTO YOUR PASSPORT' },
  tabStamps: { tr: 'Damgalar', en: 'Stamps' },
  stampsEmpty: { tr: 'Gezi ekledikçe pasaport sayfan damgalarla dolar.', en: 'Your passport pages fill with stamps as you add trips.' },
  photos: { tr: 'FOTOĞRAFLAR', en: 'PHOTOS' },
  addPhotos: { tr: 'Fotoğraf ekle', en: 'Add photos' },
  photosHint: { tr: 'Fotoğraflar yalnızca bu cihazda saklanır.', en: 'Photos are stored on this device only.' },
  shareYear: { tr: 'Yıl özetini paylaş', en: 'Share year summary' },
  yearInReview: { tr: 'YIL ÖZETİ', en: 'YEAR IN REVIEW' },
  newCountries: { tr: 'yeni ülke', en: 'new countries' },
  shareCard: { tr: 'Kartı paylaş', en: 'Share card' },
  shareFailed: { tr: 'Paylaşım şu an kullanılamıyor.', en: 'Sharing is not available right now.' },
  exportData: { tr: 'Verilerimi dışa aktar', en: 'Export my data' },
  exportChoose: { tr: 'Hangi biçimde?', en: 'Which format?' },
  exportFailed: { tr: 'Dışa aktarma başarısız oldu.', en: 'Export failed.' },
} as const;

export type JourneyKey = keyof typeof strings;

export function jt(key: JourneyKey, lang: Lang, vars?: Record<string, string | number>): string {
  let text: string = strings[key][lang];
  if (vars) {
    for (const [k, v] of Object.entries(vars)) text = text.replace(`{${k}}`, String(v));
  }
  return text;
}

export const TRIP_TYPES: { id: TripType; tr: string; en: string }[] = [
  { id: 'leisure', tr: 'Tatil', en: 'Leisure' },
  { id: 'business', tr: 'İş', en: 'Business' },
  { id: 'family', tr: 'Aile / Arkadaş', en: 'Family / Friends' },
  { id: 'study', tr: 'Eğitim', en: 'Study' },
  { id: 'transit', tr: 'Aktarma', en: 'Transit' },
];

export const tripTypeLabel = (type: TripType, lang: Lang) =>
  TRIP_TYPES.find((t) => t.id === type)?.[lang] ?? type;
