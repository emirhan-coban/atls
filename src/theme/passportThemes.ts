export type PassportThemeKey = 'cosmic_obsidian' | 'classic_navy' | 'burgundy' | 'emerald' | 'royal_gold';

export interface PassportTheme {
  id: PassportThemeKey;
  nameEn: string;
  nameTr: string;
  gradient: [string, string];
  borderColor: string;
  accentColor: string;
  chipColor: string;
  textColor: string;
  subtextColor: string;
}

export const PASSPORT_THEMES: Record<PassportThemeKey, PassportTheme> = {
  cosmic_obsidian: {
    id: 'cosmic_obsidian',
    nameEn: 'Cosmic Void',
    nameTr: 'Kozmik Boşluk',
    gradient: ['#131B2E', '#06080E'],
    borderColor: 'rgba(255, 255, 255, 0.15)',
    accentColor: '#E5A93C',
    chipColor: '#FFD700',
    textColor: '#FFFFFF',
    subtextColor: '#94A3B8',
  },
  classic_navy: {
    id: 'classic_navy',
    nameEn: 'Classic Navy',
    nameTr: 'Klasik Lacivert',
    gradient: ['#1E293B', '#0F172A'],
    borderColor: '#334155',
    accentColor: '#38BDF8',
    chipColor: '#F59E0B',
    textColor: '#F8FAFC',
    subtextColor: '#94A3B8',
  },
  burgundy: {
    id: 'burgundy',
    nameEn: 'Diplomatic Burgundy',
    nameTr: 'Diplomatik Bordo',
    gradient: ['#831843', '#4C0519'],
    borderColor: '#9D174D',
    accentColor: '#F472B6',
    chipColor: '#FBBF24',
    textColor: '#FFF1F2',
    subtextColor: '#FECDD3',
  },
  emerald: {
    id: 'emerald',
    nameEn: 'Wanderer Emerald',
    nameTr: 'Gezgin Zümrüt',
    gradient: ['#065F46', '#022C22'],
    borderColor: '#047857',
    accentColor: '#34D399',
    chipColor: '#F59E0B',
    textColor: '#ECFDF5',
    subtextColor: '#A7F3D0',
  },
  royal_gold: {
    id: 'royal_gold',
    nameEn: 'Royal Sovereign',
    nameTr: 'Kraliyet Altını',
    gradient: ['#78350F', '#451A03'],
    borderColor: '#92400E',
    accentColor: '#FBBF24',
    chipColor: '#FCD34D',
    textColor: '#FFFBEB',
    subtextColor: '#FDE68A',
  },
};
