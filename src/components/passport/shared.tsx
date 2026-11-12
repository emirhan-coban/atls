import { Country, Profile } from '../../stores/types';

export interface PassportScreenProps {
  profile: Profile;
  countries: Country[];
  onRemoveCountry: (countryId: string) => void;
  onUpdateCountry: (country: any) => void;
  onOpenAddModal: () => void;
  onOpenShareModal: () => void;
  onUpdateProfile: (profile: any) => void;
  onLogout: () => void;
  onDeleteAccount: () => void;
  onCreateAccount?: () => void;
  onOpenJourney: () => void;
  onOpenPlanner: () => void;
  onSelectCountry: (countryId: string) => void;
  t: Record<string, any>;
  currentLang: 'tr' | 'en';
  onToggleLang: () => void;
  isAccountModalOpen?: boolean;
  onCloseAccountModal?: () => void;
  [key: string]: any;
}
