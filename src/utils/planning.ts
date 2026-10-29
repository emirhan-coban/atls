import { BudgetItem, PlanItem, PlannedTrip } from '../stores/types';
import { VisaStatus } from '../data/countryFacts';

type Lang = 'tr' | 'en';

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Parses 'YYYY-MM-DD' into calendar parts; returns null for anything that is not a real date. */
export function parseDate(value: string | null | undefined): { y: number; m: number; d: number } | null {
  const match = value ? DATE_RE.exec(value) : null;
  if (!match) return null;
  const [y, m, d] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const check = new Date(Date.UTC(y, m - 1, d));
  if (check.getUTCFullYear() !== y || check.getUTCMonth() !== m - 1 || check.getUTCDate() !== d) return null;
  return { y, m, d };
}

export const formatDateKey = (y: number, m: number, d: number) =>
  `${String(y).padStart(4, '0')}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

export const daysInMonth = (y: number, m: number) => new Date(Date.UTC(y, m, 0)).getUTCDate();

export const toDateKey = (date: Date) => formatDateKey(date.getFullYear(), date.getMonth() + 1, date.getDate());

/** Whole calendar days from `now` to the date (negative when it is in the past). Works on local dates, so DST never shifts it. */
export function daysUntil(dateKey: string, now: Date = new Date()): number | null {
  const parts = parseDate(dateKey);
  if (!parts) return null;
  const target = Date.UTC(parts.y, parts.m - 1, parts.d);
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((target - today) / 86400000);
}

/** Number of days the trip lasts, both ends included. Null when there is no valid end date. */
export function tripLengthDays(startDate: string, endDate: string | null): number | null {
  const a = parseDate(startDate);
  const b = parseDate(endDate);
  if (!a || !b) return null;
  const diff = Math.round((Date.UTC(b.y, b.m - 1, b.d) - Date.UTC(a.y, a.m - 1, a.d)) / 86400000);
  return diff >= 0 ? diff + 1 : null;
}

export type PlanPhase = 'upcoming' | 'ongoing' | 'past';

export function planPhase(plan: Pick<PlannedTrip, 'startDate' | 'endDate'>, now: Date = new Date()): PlanPhase {
  const start = daysUntil(plan.startDate, now);
  if (start === null) return 'upcoming';
  if (start > 0) return 'upcoming';
  const end = daysUntil(plan.endDate ?? plan.startDate, now);
  return end !== null && end < 0 ? 'past' : 'ongoing';
}

/** Upcoming/ongoing plans first (soonest first), finished plans last (most recent first). */
export function sortPlans(plans: PlannedTrip[], now: Date = new Date()): PlannedTrip[] {
  const rank = (p: PlannedTrip) => (planPhase(p, now) === 'past' ? 1 : 0);
  return [...plans].sort((a, b) => {
    if (rank(a) !== rank(b)) return rank(a) - rank(b);
    return rank(a) === 0 ? a.startDate.localeCompare(b.startDate) : b.startDate.localeCompare(a.startDate);
  });
}

export const nextPlan = (plans: PlannedTrip[], now: Date = new Date()): PlannedTrip | null =>
  sortPlans(plans, now).find((p) => planPhase(p, now) !== 'past') ?? null;

// ---------------------------------------------------------------------------------------------
// Budget
// ---------------------------------------------------------------------------------------------

export const budgetTotal = (items: BudgetItem[]) => items.reduce((sum, i) => sum + (Number.isFinite(i.amount) ? i.amount : 0), 0);

/** Accepts "1.250,50" (Turkish), "1,250.50" (English) and plain numbers; returns null when it is not a positive amount. */
export function parseAmount(raw: string): number | null {
  const cleaned = raw.trim().replace(/[^\d.,]/g, '');
  if (!cleaned) return null;
  const lastComma = cleaned.lastIndexOf(',');
  const lastDot = cleaned.lastIndexOf('.');
  let normalised = cleaned;
  if (lastComma !== -1 && lastDot !== -1) {
    // the separator that comes last is the decimal one
    normalised = lastComma > lastDot ? cleaned.replace(/\./g, '').replace(',', '.') : cleaned.replace(/,/g, '');
  } else if (lastComma !== -1) {
    const tail = cleaned.length - lastComma - 1;
    normalised = tail === 3 && cleaned.indexOf(',') === lastComma ? cleaned.replace(',', '') : cleaned.replace(',', '.');
  } else if (lastDot !== -1) {
    const tail = cleaned.length - lastDot - 1;
    normalised = tail === 3 && cleaned.indexOf('.') === lastDot ? cleaned.replace('.', '') : cleaned;
  }
  const value = Number(normalised);
  return Number.isFinite(value) && value > 0 ? Math.round(value * 100) / 100 : null;
}

export function formatMoney(amount: number, currency: string, lang: Lang): string {
  try {
    return new Intl.NumberFormat(lang === 'tr' ? 'tr-TR' : 'en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
    }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
}

// ---------------------------------------------------------------------------------------------
// Checklists
// ---------------------------------------------------------------------------------------------

export type ChecklistTemplateId = 'general' | 'beach' | 'city' | 'winter' | 'nature';

interface TemplateItem {
  tr: string;
  en: string;
}

export const CHECKLIST_TEMPLATES: Record<ChecklistTemplateId, { tr: string; en: string; items: TemplateItem[] }> = {
  general: {
    tr: 'Genel',
    en: 'Essentials',
    items: [
      { tr: 'Pasaportun kalan geçerlilik süresini kontrol et', en: 'Check your passport validity' },
      { tr: 'Seyahat sağlık sigortası yaptır', en: 'Get travel health insurance' },
      { tr: 'Ulaşım biletlerini al', en: 'Book transport tickets' },
      { tr: 'Konaklamayı ayarla', en: 'Book accommodation' },
      { tr: 'Yurt dışında kullanılabilen kartı ve biraz nakit hazırla', en: 'Prepare a card that works abroad and some cash' },
      { tr: 'Telefon hattı, roaming veya eSIM seçeneğine bak', en: 'Sort out roaming or an eSIM' },
      { tr: 'Şarj aletleri ve priz adaptörü', en: 'Chargers and a plug adapter' },
      { tr: 'İlaçlar ve kişisel eşyalar', en: 'Medication and personal items' },
    ],
  },
  beach: {
    tr: 'Plaj',
    en: 'Beach',
    items: [
      { tr: 'Mayo / deniz şortu', en: 'Swimwear' },
      { tr: 'Güneş kremi', en: 'Sunscreen' },
      { tr: 'Şapka ve güneş gözlüğü', en: 'Hat and sunglasses' },
      { tr: 'Plaj havlusu', en: 'Beach towel' },
    ],
  },
  city: {
    tr: 'Şehir turu',
    en: 'City break',
    items: [
      { tr: 'Rahat yürüyüş ayakkabısı', en: 'Comfortable walking shoes' },
      { tr: 'Şehir kartı / müze biletlerine bak', en: 'Look at city passes and museum tickets' },
      { tr: 'Çevrimdışı harita indir', en: 'Download an offline map' },
      { tr: 'Küçük sırt çantası', en: 'Small daypack' },
    ],
  },
  winter: {
    tr: 'Kış',
    en: 'Winter',
    items: [
      { tr: 'Mont, eldiven, bere', en: 'Coat, gloves, hat' },
      { tr: 'Termal içlik', en: 'Thermal base layers' },
      { tr: 'Su geçirmez bot', en: 'Waterproof boots' },
      { tr: 'Nemlendirici ve dudak koruyucu', en: 'Moisturiser and lip balm' },
    ],
  },
  nature: {
    tr: 'Doğa',
    en: 'Nature',
    items: [
      { tr: 'Yürüyüş botu', en: 'Hiking boots' },
      { tr: 'Matara ve atıştırmalık', en: 'Water bottle and snacks' },
      { tr: 'Böcek kovucu', en: 'Insect repellent' },
      { tr: 'Küçük ilk yardım çantası', en: 'Small first-aid kit' },
    ],
  },
};

export const CHECKLIST_TEMPLATE_IDS = Object.keys(CHECKLIST_TEMPLATES) as ChecklistTemplateId[];

/** Items that depend on the destination's entry rules. */
export function entryRequirementItems(
  visa: VisaStatus | null | undefined,
  schengen: boolean,
  lang: Lang
): PlanItem[] {
  const items: { key: string; tr: string; en: string }[] = [];
  if (visa === 'required') items.push({ key: 'visa', tr: 'Vize başvurusu yap', en: 'Apply for a visa' });
  if (visa === 'evisa') items.push({ key: 'evisa', tr: 'e-Vize başvurusunu tamamla', en: 'Complete the e-Visa application' });
  if (visa === 'eta') items.push({ key: 'eta', tr: 'Elektronik seyahat iznini al', en: 'Get the electronic travel authorisation' });
  if (visa === 'on_arrival') items.push({ key: 'voa', tr: 'Kapıda vize için nakit / belge hazırla', en: 'Prepare cash and documents for visa on arrival' });
  if (visa === 'conditional') items.push({ key: 'cond', tr: 'Vize muafiyet koşullarını resmi kaynaktan kontrol et', en: 'Check the visa-exemption conditions with an official source' });
  if (schengen && (visa === 'required' || visa === 'conditional')) {
    items.push({ key: 'schengen', tr: 'Schengen vizesi için gereken sigorta ve belgeleri hazırla', en: 'Prepare the insurance and documents a Schengen visa needs' });
  }
  return items.map((i) => ({ id: `entry:${i.key}`, text: i[lang], done: false }));
}

/** Adds a template's items, skipping ones already on the list (ids are stable, so adding twice is harmless). */
export function addTemplate(current: PlanItem[], template: ChecklistTemplateId, lang: Lang): PlanItem[] {
  const existing = new Set(current.map((i) => i.id));
  const added = CHECKLIST_TEMPLATES[template].items
    .map((item, index) => ({ id: `${template}:${index}`, text: item[lang], done: false }))
    .filter((item) => !existing.has(item.id));
  return [...current, ...added];
}

export function addItems(current: PlanItem[], items: PlanItem[]): PlanItem[] {
  const existing = new Set(current.map((i) => i.id));
  return [...current, ...items.filter((i) => !existing.has(i.id))];
}

export const checklistProgress = (items: PlanItem[]) => ({
  done: items.filter((i) => i.done).length,
  total: items.length,
});

// ---------------------------------------------------------------------------------------------
// Reminders
// ---------------------------------------------------------------------------------------------

export interface Reminder {
  /** When to fire, local time. */
  at: Date;
  kind: 'week' | 'day' | 'checklist' | 'memory';
  title: string;
  body: string;
}

const REMINDER_HOUR = 9;

/**
 * Reminders for a plan, only the ones that are still in the future: a week before, the day before,
 * and a checklist nudge 3 days before when items are unfinished. Pure, so it is easy to test.
 */
export function buildReminders(
  plan: Pick<PlannedTrip, 'startDate' | 'checklist'>,
  countryName: string,
  lang: Lang,
  now: Date = new Date()
): Reminder[] {
  const parts = parseDate(plan.startDate);
  if (!parts) return [];
  const at = (daysBefore: number) => new Date(parts.y, parts.m - 1, parts.d - daysBefore, REMINDER_HOUR, 0, 0);
  const out: Reminder[] = [];

  out.push({
    at: at(7),
    kind: 'week',
    title: lang === 'tr' ? `${countryName} yolculuğuna 1 hafta kaldı ✈️` : `One week to ${countryName} ✈️`,
    body: lang === 'tr' ? 'Pasaportunu, biletlerini ve rezervasyonlarını bir kez daha kontrol et.' : 'Double-check your passport, tickets and bookings.',
  });

  const open = plan.checklist.filter((i) => !i.done).length;
  if (open > 0) {
    out.push({
      at: at(3),
      kind: 'checklist',
      title: lang === 'tr' ? `${countryName} için ${open} madde kaldı` : `${open} items left for ${countryName}`,
      body: lang === 'tr' ? 'Hazırlık listeni tamamlamak için biraz vakit ayır.' : 'Take a moment to finish your preparation list.',
    });
  }

  out.push({
    at: at(1),
    kind: 'day',
    title: lang === 'tr' ? `Yarın ${countryName}'e yola çıkıyorsun 🎒` : `You leave for ${countryName} tomorrow 🎒`,
    body: lang === 'tr' ? 'İyi yolculuklar! Çantanı ve belgelerini hazırla.' : 'Have a great trip! Pack your bag and documents.',
  });

  return out.filter((r) => r.at.getTime() > now.getTime());
}
