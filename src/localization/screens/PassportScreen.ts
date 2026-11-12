import { createT } from '../i18n';

/** Texts of PassportScreen (moved out of inline `lang === 'tr'` checks). */
const strings = {
  edit: { tr: "Düzenle", en: "Edit" },
  in_your_wishlist: { tr: "Hedeflerinde bekliyor...", en: "In your wishlist..." },
  visited: { tr: "Gittim!", en: "Visited!" },
  remove_country: { tr: "Ülkeyi sil", en: "Remove country" },
  trip_planner: { tr: "Seyahat Planlayıcı", en: "Trip Planner" },
  travel_journal: { tr: "Seyahat Günlüğü", en: "Travel Journal" },
  account_management: { tr: "Hesap Yönetimi", en: "Account Management" },
  your_profile_and_session_settings: { tr: "Profil ve oturum ayarlarınız", en: "Your profile and session settings" },
  close: { tr: "Kapat", en: "Close" },
  biometric_passport_account: { tr: "Biyometrik Pasaport Hesabı", en: "Biometric Passport Account" },
  appearance: { tr: "GÖRÜNÜM", en: "APPEARANCE" },
  system: { tr: "Sistem", en: "System" },
  light: { tr: "Açık", en: "Light" },
  dark: { tr: "Koyu", en: "Dark" },
  edit_profile: { tr: "Profili Düzenle", en: "Edit Profile" },
  create_account_sync: { tr: "Hesap Oluştur ve Buluta Taşı", en: "Create Account & Sync" },
  privacy_policy: { tr: "Gizlilik Politikası", en: "Privacy Policy" },
  log_out: { tr: "Çıkış Yap", en: "Log Out" },
  you_have_no_account_so_logging_out: { tr: "Hesabın yok, bu yüzden çıkış yaparsan bu cihazdaki tüm kayıtların silinir. Önce hesap oluşturmanı öneririz.", en: "You have no account, so logging out deletes everything stored on this device. We recommend creating an account first." },
  are_you_sure_you_want_to_log_out_o: { tr: "Hesabınızdan çıkış yapmak istediğinize emin misiniz?", en: "Are you sure you want to log out of your account?" },
  cancel: { tr: "Vazgeç", en: "Cancel" },
  danger_zone: { tr: "Tehlikeli Bölge", en: "Danger Zone" },
  permanently_delete_your_account_an: { tr: "Hesabınızı ve kaydedilmiş tüm seyahat verilerinizi kalıcı olarak silin.", en: "Permanently delete your account and all associated travel records." },
  permanently_delete_account: { tr: "Hesabı Kalıcı Olarak Sil", en: "Permanently Delete Account" },
  are_you_sure_you_want_to_delete_yo: { tr: "Hesabınızı silmek istediğinize emin misiniz? Tüm seyahatleriniz, pasaportunuz ve profil verileriniz kalıcı olarak silinecektir. Bu işlem geri alınamaz.", en: "Are you sure you want to delete your account? All your travels, passport, and profile data will be permanently wiped. This action cannot be undone." },
  delete_account: { tr: "Hesabı Sil", en: "Delete Account" },
};

export const tPassportScreen = createT(strings);
export const tPassportScreenStrings = strings;
