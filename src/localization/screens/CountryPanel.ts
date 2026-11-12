import { createT } from '../i18n';

/** Texts of CountryPanel (moved out of inline `lang === 'tr'` checks). */
const strings = {
  close: { tr: "Kapat", en: "Close" },
  capital: { tr: "Başkent", en: "Capital" },
  currency: { tr: "Para birimi", en: "Currency" },
  language: { tr: "Dil", en: "Language" },
  tr_passport: { tr: "TR pasaportu", en: "TR passport" },
  driving: { tr: "Trafik", en: "Driving" },
  left: { tr: "Sol", en: "Left" },
  right: { tr: "Sağ", en: "Right" },
  area: { tr: "Alan", en: "Area" },
  mark: { tr: "İşaretle", en: "Mark" },
  edit: { tr: "Düzenle", en: "Edit" },
  no_atls_traveler_has_been_here_yet: { tr: "henüz hiçbir atls gezgini gitmedi", en: "no atls traveler has been here yet" },
  of_atls_travelers_have_been_here: { tr: "atls gezginlerinde oran: %{p1}", en: "{p1}% of atls travelers have been here" },
  full_country_details: { tr: "Tüm ülke detayları", en: "Full country details" },
  highlights_for_are_on_the_way: { tr: "{name} için öne çıkanlar yolda.", en: "Highlights for {name} are on the way." },
  enlarge_photo: { tr: "Fotoğrafı büyüt", en: "Enlarge photo" },
};

export const tCountryPanel = createT(strings);
export const tCountryPanelStrings = strings;
