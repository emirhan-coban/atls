import { create } from 'zustand';
import { AppLanguage, ActiveTab } from './types';
import { initialProfile, initialCountries } from '../data/travelData';
import { storageService } from '../services/storageService';
import { useCountryStore } from './useCountryStore';
import { useProfileStore } from './useProfileStore';

interface AppState {
  isLoaded: boolean;
  currentLang: AppLanguage;
  hasCompletedOnboarding: boolean;
  activeTab: ActiveTab;
  isAddModalOpen: boolean;
  isShareModalOpen: boolean;

  // Actions
  initApp: () => Promise<void>;
  setLang: (lang: AppLanguage) => Promise<void>;
  toggleLang: () => Promise<AppLanguage>;
  setActiveTab: (tab: ActiveTab) => void;
  setIsAddModalOpen: (open: boolean) => void;
  setIsShareModalOpen: (open: boolean) => void;
  completeOnboarding: (payload?: any) => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  isLoaded: false,
  currentLang: 'tr',
  hasCompletedOnboarding: false,
  activeTab: 'home',
  isAddModalOpen: false,
  isShareModalOpen: false,

  initApp: async () => {
    try {
      const data = await storageService.loadInitialData(initialProfile, initialCountries);
      
      set({
        currentLang: (data.lang as AppLanguage) || 'tr',
        hasCompletedOnboarding: Boolean(data.hasCompletedOnboarding),
        isLoaded: true,
      });

      useProfileStore.getState().setIsAuthenticated(Boolean(data.isAuthenticated));
      if (data.profile) {
        useProfileStore.getState().setProfile(data.profile);
      }
      if (data.countries) {
        useCountryStore.getState().setCountries(data.countries);
      }
    } catch (error) {
      console.warn('[AppStore] initApp error:', error);
      set({ isLoaded: true });
    }
  },

  setLang: async (lang) => {
    set({ currentLang: lang });
    await storageService.saveLang(lang);
  },

  toggleLang: async () => {
    const next: AppLanguage = get().currentLang === 'tr' ? 'en' : 'tr';
    set({ currentLang: next });
    await storageService.saveLang(next);
    return next;
  },

  setActiveTab: (tab) => {
    set({ activeTab: tab });
  },

  setIsAddModalOpen: (open) => {
    set({ isAddModalOpen: open });
  },

  setIsShareModalOpen: (open) => {
    set({ isShareModalOpen: open });
  },

  completeOnboarding: async (onboardingPayload = {}) => {
    set({ hasCompletedOnboarding: true });
    await storageService.saveOnboarding(true);

    const { onboardingCountries = [], homeLocation = null, userData = null } = onboardingPayload;

    if (userData) {
      useProfileStore.getState().setIsAuthenticated(true);
      await storageService.saveAuth(true);

      const sessionData = await storageService.loadUserSessionData(userData);
      if (sessionData && sessionData.countries && sessionData.countries.length > 0) {
        if (sessionData.profile) useProfileStore.getState().setProfile(sessionData.profile);
        useCountryStore.getState().setCountries(sessionData.countries);
      } else {
        const cleanProfile = {
          ...initialProfile,
          ...userData,
          ...(homeLocation ? { location: homeLocation, locationTr: homeLocation } : {}),
        };
        useProfileStore.getState().setProfile(cleanProfile);
        useCountryStore.getState().setCountries(onboardingCountries);
        await storageService.saveProfile(cleanProfile);
        await storageService.saveCountries(onboardingCountries);

        for (const c of onboardingCountries) {
          storageService.addCountry(c).catch(() => {});
        }
      }
    }
  },
}));
