import { createT } from '../i18n';

/** Texts of OnboardingScreen (moved out of inline `lang === 'tr'` checks). */
const strings = {
  home_base_residence: { tr: "Memleketim / Yaşadığım Yer", en: "Home Base / Residence" },
  bucket_list_destination: { tr: "Gelecek Seyahat Hedefi", en: "Bucket List Destination" },
  please_enter_your_full_name: { tr: "Lütfen adınızı ve soyadınızı giriniz.", en: "Please enter your full name." },
  traveler: { tr: "Gezgin", en: "Traveler" },
  back: { tr: "Geri", en: "Back" },
  digital_world_passport: { tr: "DİJİTAL DÜNYA PASAPORTU", en: "DIGITAL WORLD PASSPORT" },
  travel_footprint: { tr: "SEYAHAT GEÇMİŞİN", en: "TRAVEL FOOTPRINT" },
  select_visited_countries: { tr: "Gittiğin Ülkeleri Seç", en: "Select Visited Countries" },
  select_all_the_countries_you_ve_se: { tr: "Bugüne kadar ayak bastığın ülkeleri işaretle; haritan canlı olarak renklensin.", en: "Select all the countries you’ve set foot in to colorize your live map." },
  countries_marked: { tr: "Ülke İşaretlendi", en: "Countries Marked" },
  tap_to_add_to_map: { tr: "DOKUN VE HARİTANA EKLE", en: "TAP TO ADD TO MAP" },
  selected: { tr: "{length} ülke seçildi", en: "{length} selected" },
  none_selected: { tr: "Henüz seçilmedi", en: "None selected" },
  marked: { tr: "ÜLKE İŞARETİ", en: "MARKED" },
  your_border_credentials_have_been: { tr: "Seyahat izin resmi pasaport defterine işlendi. Dijital pasaport numaran tahsis edildi.", en: "Your border credentials have been minted and certified." },
  verification_code_digit: { tr: "Doğrulama kodu, {p1}. hane", en: "Verification code, digit {p1}" },
  hide_password: { tr: "Şifreyi gizle", en: "Hide password" },
  show_password: { tr: "Şifreyi göster", en: "Show password" },
  continue_without_an_account: { tr: "Hesap açmadan devam et", en: "Continue without an account" },
  your_data_stays_on_this_device_you: { tr: "Verilerin bu cihazda kalır. İstediğin zaman hesap oluşturup buluta taşıyabilirsin.", en: "Your data stays on this device. You can create an account and sync it any time." },
};

export const tOnboardingScreen = createT(strings);
export const tOnboardingScreenStrings = strings;
