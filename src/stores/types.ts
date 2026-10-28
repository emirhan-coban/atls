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
export type ActiveTab = 'home' | 'passport' | 'explore';
