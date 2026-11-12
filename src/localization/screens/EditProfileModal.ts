import { createT } from '../i18n';

/** Texts of EditProfileModal (moved out of inline `lang === 'tr'` checks). */
const strings = {
  global_citizen: { tr: "Dünya Gezgini", en: "Global Citizen" },
  close: { tr: "Kapat", en: "Close" },
  full_name: { tr: "AD SOYAD", en: "FULL NAME" },
  your_name: { tr: "Adın Soyadın", en: "Your Name" },
  remove_country: { tr: "Ülkeyi kaldır", en: "Remove country" },
  clear_search: { tr: "Aramayı temizle", en: "Clear search" },
  permanently_delete_account: { tr: "Hesabı Kalıcı Olarak Sil", en: "Permanently Delete Account" },
  are_you_sure_you_want_to_delete_yo: { tr: "Hesabınızı silmek istediğinize emin misiniz? Tüm seyahatleriniz, pasaportunuz ve profil verileriniz kalıcı olarak silinecektir. Bu işlem geri alınamaz.", en: "Are you sure you want to delete your account? All your travels, passport, and profile data will be permanently wiped. This action cannot be undone." },
  cancel: { tr: "Vazgeç", en: "Cancel" },
  delete_account: { tr: "Hesabı Sil", en: "Delete Account" },
};

export const tEditProfileModal = createT(strings);
export const tEditProfileModalStrings = strings;
