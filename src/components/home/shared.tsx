import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { Country, Profile } from '../../stores/types';

export type StatusFilter = Country['status'] | 'all';

export interface HomeScreenProps {
  countries: Country[];
  profile: Profile;
  onOpenAddModal: () => void;
  onSelectCountry: (countryId: string) => void;
  onNavigateToPassport: () => void;
  onNavigateToExplore: () => void;
  t: Record<string, any>;
  currentLang: 'tr' | 'en';
  onToggleLang: () => void;
  onOpenAuth?: () => void;
  tripCount?: number;
  onOpenJourney: () => void;
  onOpenPlanner: () => void;
  onOpenGame?: () => void;
  /** Home is the visible tab. */
  isActive?: boolean;
  /** A full-screen modal hides the globe completely: stop drawing. */
  isCovered?: boolean;
  /** Any modal is open over Home: hold celebrations until it closes. */
  isModalOpen?: boolean;
  onEditCountry?: (country: Country) => void;
  [key: string]: any;
}

export const DOCK = 92;

export function useAppIsActive() {
  const [active, setActive] = useState(AppState.currentState === 'active');
  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => setActive(s === 'active'));
    return () => sub.remove();
  }, []);
  return active;
}
