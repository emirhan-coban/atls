import { createT } from '../i18n';

/** Texts of PassportShareModal (moved out of inline `lang === 'tr'` checks). */
const strings = {
  atls_passport_card: { tr: "atls. Pasaport Kartı", en: "atls. Passport Card" },
  notice: { tr: "Bilgi", en: "Notice" },
  sharing_is_not_available_on_this_d: { tr: "Paylaşım bu cihazda desteklenmiyor.", en: "Sharing is not available on this device." },
  error: { tr: "Hata", en: "Error" },
  failed_to_capture_passport_card_ph: { tr: "Kart fotoğrafı oluşturulurken bir sorun oluştu.", en: "Failed to capture passport card photo." },
  passport_card: { tr: "Pasaport Kartı", en: "Passport Card" },
  share_your_card_as_a_high_resoluti: { tr: "Kartını yüksek çözünürlüklü 4:3 fotoğraf olarak paylaş", en: "Share your card as a high-resolution 4:3 photo" },
  close: { tr: "Kapat", en: "Close" },
  k_4_3_card: { tr: "💳 4:3 Kart", en: "💳 4:3 Card" },
  k_9_16_story: { tr: "📱 9:16 Story", en: "📱 9:16 Story" },
  biometric_passport: { tr: "BİYOMETRİK PASAPORT", en: "BIOMETRIC PASSPORT" },
  explored: { tr: "%{earthPercent} DÜNYA KEŞFİ", en: "%{earthPercent} EXPLORED" },
  partly_local_mostly_curious: { tr: "Biraz Buralı, Çokça Meraklı.", en: "Partly local, mostly curious." },
  generating_photo: { tr: "Fotoğraf Hazırlanıyor...", en: "Generating Photo..." },
  share_save_photo: { tr: "Fotoğraf Olarak Paylaş / Kaydet", en: "Share / Save Photo" },
  create_your_animated_story: { tr: "✨ Animasyonlu hikâyeni oluştur", en: "✨ Create your animated story" },
  clash_passports: { tr: "🤝 Pasaportları çarpıştır", en: "🤝 Clash passports" },
};

export const tPassportShareModal = createT(strings);
export const tPassportShareModalStrings = strings;
