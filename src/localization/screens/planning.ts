import { createT } from '../i18n';

/** Texts of planning (moved out of inline `lang === 'tr'` checks). */
const strings = {
  one_week_to: { tr: "{countryName} yolculuğuna 1 hafta kaldı ✈️", en: "One week to {countryName} ✈️" },
  double_check_your_passport_tickets: { tr: "Pasaportunu, biletlerini ve rezervasyonlarını bir kez daha kontrol et.", en: "Double-check your passport, tickets and bookings." },
  items_left_for: { tr: "{countryName} için {open} madde kaldı", en: "{open} items left for {countryName}" },
  take_a_moment_to_finish_your_prepa: { tr: "Hazırlık listeni tamamlamak için biraz vakit ayır.", en: "Take a moment to finish your preparation list." },
  you_leave_for_tomorrow: { tr: "Yarın {countryName}'e yola çıkıyorsun 🎒", en: "You leave for {countryName} tomorrow 🎒" },
  have_a_great_trip_pack_your_bag_an: { tr: "İyi yolculuklar! Çantanı ve belgelerini hazırla.", en: "Have a great trip! Pack your bag and documents." },
};

export const tplanning = createT(strings);
export const tplanningStrings = strings;
