import { createT } from '../i18n';

/** Texts of AddCountryModal (moved out of inline `lang === 'tr'` checks). */
const strings = {
  added_to_your_passport: { tr: "🎉 Pasaportuna Eklendi!", en: "🎉 Added to Your Passport!" },
  set_date_and_travel_status: { tr: "Tarih ve seyahat durumunu belirle", en: "Set date and travel status" },
  close: { tr: "Kapat", en: "Close" },
  clear_search: { tr: "Aramayı temizle", en: "Clear search" },
  wishlist: { tr: "HEDEFİNDE", en: "WISHLIST" },
  change: { tr: "Değiştir", en: "Change" },
  this_country_is_in_your_wishlist_y: { tr: "Bu ülke hedeflerinizde kayıtlı. Şimdi gittiğin ülke olarak işaretleyebilirsin!", en: "This country is in your wishlist. You can now mark it as visited!" },
  travel_date_month_year: { tr: "SEYAHAT TARİHİ (AY / YIL)", en: "TRAVEL DATE (MONTH / YEAR)" },
};

export const tAddCountryModal = createT(strings);
export const tAddCountryModalStrings = strings;
