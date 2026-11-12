import { createT } from './i18n';

/** Texts of the passport clash modal. */
const strings = {
  friend: { tr: 'Arkadaşın', en: 'Your friend' },
  title: { tr: 'Pasaport çarpıştır', en: 'Passport clash' },
  match: { tr: '{who} ile pasaport uyumu', en: 'Passport match with {who}' },
  both: { tr: 'İkiniz de gittiniz · {n}', en: 'You both went · {n}' },
  both_empty: { tr: 'Henüz ortak ülke yok.', en: 'No shared countries yet.' },
  only_me: { tr: 'Sadece sen · {n}', en: 'Only you · {n}' },
  only_them: { tr: 'Sadece {who} · {n}', en: 'Only {who} · {n}' },
  again: { tr: 'Başka biriyle karşılaştır', en: 'Compare with someone else' },
  send: { tr: 'Pasaportumu gönder', en: 'Send my passport' },
  copied: { tr: 'Kopyalandı', en: 'Copied' },
  copy: { tr: 'Mesajı kopyala', en: 'Copy message' },
  from_friend: { tr: 'ARKADAŞINDAN GELDİ Mİ?', en: 'GOT ONE FROM A FRIEND?' },
  paste: { tr: 'Mesajı, bağlantıyı ya da kodu buraya yapıştır', en: 'Paste the message, link or code here' },
  compare: { tr: 'Karşılaştır', en: 'Compare' },
  newer: {
    tr: 'Bu kod atls.’ın daha yeni bir sürümünden. Karşılaştırmak için uygulamayı güncelle.',
    en: 'This code comes from a newer version of atls. Update the app to compare.',
  },
  invalid: { tr: 'Bu bir atls. pasaport kodu gibi görünmüyor.', en: "That doesn't look like an atls. passport code." },
  lead: {
    tr: 'Pasaportunu bir arkadaşına gönder; ikinizin ortak ve farklı ülkelerini yan yana gör. Sadece ziyaret ettiğin ülkelerin listesi paylaşılır.',
    en: "Send your passport to a friend and see the countries you share and the ones you don't. Only your visited-country list is shared.",
  },
  intro: {
    tr: "Pasaportlarımızı çarpıştıralım! Bağlantıya dokun (atls. yüklü değilse App Store'a götürür):",
    en: "Let's clash our passports! Tap the link (it takes you to the App Store if you don't have atls.):",
  },
};

export const ct = createT(strings);
export const compareStrings = strings;
