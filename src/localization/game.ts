import { createT } from './i18n';

/** Texts of the daily Secret Country game card and modal. */
const strings = {
  card_win: { tr: 'Bugünkü ülkeyi buldun ✓', en: "Today's country found ✓" },
  card_loss: { tr: 'Bugün olmadı, yarın yeni ülke', en: 'Not today, new country tomorrow' },
  card_invite: { tr: 'Bugünün gizli ülkesi hangisi?', en: "What's today's secret country?" },
  card_streak: { tr: '🔥 {n} günlük seri', en: '🔥 {n}-day streak' },
  card_pitch: { tr: 'Her gün yeni bir ülke, 6 ipucu', en: 'A new country every day, 6 clues' },

  notif_off_title: { tr: 'Bildirim izni kapalı', en: 'Notifications are off' },
  notif_off_body: {
    tr: "Hatırlatma için Ayarlar > atls. > Bildirimler'den izin verebilirsin.",
    en: 'You can allow them in Settings > atls. > Notifications.',
  },
  eyebrow: { tr: 'GİZLİ ÜLKE', en: 'SECRET COUNTRY' },
  title: { tr: 'Bugünün gizli ülkesi', en: "Today's secret country" },
  clue_locked: { tr: '{n}. ipucu yanlış tahminle açılır', en: 'Clue {n} opens after a wrong guess' },
  fb_correct: { tr: 'Doğru!', en: 'Correct!' },
  fb_continent: { tr: 'Aynı kıta', en: 'Same continent' },
  fb_wrong: { tr: 'Farklı kıta', en: 'Other continent' },
  found_in: { tr: '{n}. tahminde buldun!', en: 'Found in {n}!' },
  not_today: { tr: 'Bugün olmadı', en: 'Not today' },
  stats_line: {
    tr: 'Seri: {streak} · En iyi: {best} · Kazanma: {won}/{played}',
    en: 'Streak {streak} · Best {best} · Won {won}/{played}',
  },
  share: { tr: 'Sonucu paylaş', en: 'Share result' },
  reminder: { tr: 'Akşam 20:00 hatırlatması', en: 'Evening reminder at 20:00' },
  reminder_a11y: { tr: 'Akşam hatırlatması', en: 'Evening reminder' },
  next_country: { tr: 'Yeni ülke gece yarısı geliyor.', en: 'A new country arrives at midnight.' },
  guesses_left: { tr: '{n} tahmin hakkın kaldı', en: '{n} guesses left' },
  search: { tr: 'Ülke ara…', en: 'Search a country…' },
  dist_a11y: { tr: 'Tahmin dağılımı', en: 'Guess distribution' },
  dist_lost: { tr: 'Kaybedilen', en: 'Lost' },
  dist_title: { tr: 'KAÇINCI TAHMİNDE BULDUN', en: 'GUESSES TO SOLVE' },
  dist_missed: { tr: 'Bulunamayan: {n}', en: 'Missed: {n}' },
};

export const gt = createT(strings);
export const gameStrings = strings;
