import { PassportThemeKey } from '../theme/passportThemes';

export type CountryStatus = 'visited' | 'lived' | 'want';

export interface Country {
  id: string; // ISO code (e.g. 'TR', 'FR')
  name: string;
  nameTr: string;
  continent: string;
  continentTr: string;
  flag: string;
  status: CountryStatus;
  year?: string | null;
  visitedYear?: string | null;
  month?: string | null;
  visitedMonth?: string | null;
  notes?: string;
  photos?: string[];
  [key: string]: any;
}

export interface Profile {
  name: string;
  handle: string;
  avatarInitials: string;
  location: string;
  locationTr: string;
  nationality: string;
  passportNo: string;
  issueDate: string;
  expiryDate: string;
  bio: string;
  avatarUrl?: string | null;
  email?: string;
  passportTheme?: PassportThemeKey;
  [key: string]: any;
}

export type AppLanguage = 'tr' | 'en';
export type ThemePreference = 'system' | 'light' | 'dark';
export type ActiveTab = 'home' | 'passport' | 'explore';

export type TripType = 'leisure' | 'business' | 'family' | 'study' | 'transit';

/** One journey to one country. A country can have many trips. */
export interface Trip {
  id: string;
  countryId: string; // ISO code, matches Country.id
  year: string; // 'YYYY'
  month?: string | null; // 'MM', optional
  days?: number | null; // length of stay, optional
  cities: string[];
  type: TripType;
  rating?: number | null; // 1-5
  notes?: string;
  /** File names of photos kept on this device (not synced to the cloud). */
  photos?: string[];
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp, used for last-write-wins when syncing
}

export interface YearlyGoal {
  year: number;
  target: number; // new countries to visit that year
}

export interface PlanItem {
  id: string;
  text: string;
  done: boolean;
}

export interface BudgetItem {
  id: string;
  label: string;
  amount: number;
}

/** A trip that has not happened yet. When it is over the user can turn it into a real Trip. */
export interface PlannedTrip {
  id: string;
  countryId: string;
  startDate: string; // 'YYYY-MM-DD', local calendar date
  endDate: string | null;
  cities: string[];
  notes: string;
  checklist: PlanItem[];
  budget: BudgetItem[];
  currency: string; // ISO code used to label the budget, no conversion is done
  /** Ids of scheduled local notifications, so they can be cancelled when the plan changes. */
  notificationIds: string[];
  createdAt: string;
  updatedAt: string;
}
