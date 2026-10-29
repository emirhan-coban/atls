import { COUNTRY_FACTS, CountryFacts, FACTS_META, VisaStatus } from './countryFacts';

type Lang = 'tr' | 'en';

export const getCountryFacts = (countryId: string | null | undefined): CountryFacts | null =>
  (countryId && COUNTRY_FACTS[countryId.toUpperCase()]) || null;

export { FACTS_META };
export type { CountryFacts, VisaStatus };

/** How easy it is to enter, lowest = easiest. Used for sorting and filter groups. */
export const VISA_RANK: Record<VisaStatus, number> = {
  free: 0,
  conditional: 1,
  on_arrival: 2,
  eta: 3,
  evisa: 4,
  required: 5,
  refused: 6,
  unknown: 7,
};

export type VisaGroup = 'free' | 'easy' | 'required';

/** Filter groups: "easy" = something short of a classic embassy visa, "required" = embassy visa or worse. */
export function visaGroup(status: VisaStatus): VisaGroup | null {
  if (status === 'free') return 'free';
  if (status === 'conditional' || status === 'on_arrival' || status === 'eta' || status === 'evisa') return 'easy';
  if (status === 'required' || status === 'refused') return 'required';
  return null;
}

const VISA_LABELS: Record<VisaStatus, { tr: string; en: string }> = {
  free: { tr: 'Vizesiz', en: 'Visa-free' },
  conditional: { tr: 'Koşullu / değişken', en: 'Conditional' },
  on_arrival: { tr: 'Kapıda vize', en: 'Visa on arrival' },
  eta: { tr: 'Elektronik izin', en: 'Electronic authorisation' },
  evisa: { tr: 'e-Vize', en: 'e-Visa' },
  required: { tr: 'Vize gerekli', en: 'Visa required' },
  refused: { tr: 'Giriş yasak', en: 'Entry refused' },
  unknown: { tr: 'Bilgi yok', en: 'No data' },
};

export const visaLabel = (status: VisaStatus, lang: Lang) => VISA_LABELS[status][lang];

export function formatStay(stay: CountryFacts['visa']['stay'], lang: Lang): string | null {
  if (!stay) return null;
  const unit =
    stay.unit === 'days' ? (lang === 'tr' ? 'gün' : stay.value === 1 ? 'day' : 'days') : lang === 'tr' ? 'ay' : stay.value === 1 ? 'month' : 'months';
  return `${stay.value} ${unit}`;
}

export function formatArea(areaKm2: number, lang: Lang): string {
  const n = new Intl.NumberFormat(lang === 'tr' ? 'tr-TR' : 'en-US').format(areaKm2);
  return `${n} km²`;
}

export function listLanguages(facts: CountryFacts, lang: Lang, max = 3): string {
  const list = facts.languages[lang];
  if (list.length <= max) return list.join(', ');
  return `${list.slice(0, max).join(', ')} +${list.length - max}`;
}
