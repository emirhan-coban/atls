import { create } from 'zustand';
import { AppLanguage, ActiveTab, ThemePreference } from './types';
import { initialProfile, initialCountries } from '../data/travelData';
import { storageService } from '../services/storageService';
import { useCountryStore } from './useCountryStore';
import { useProfileStore } from './useProfileStore';
import { useTripStore } from './useTripStore';
import { useProgressStore } from './useProgressStore';
import { usePlanStore } from './usePlanStore';
import { notificationService } from '../services/notificationService';
import { refreshMemoryReminders } from '../services/memoryReminders';

interface AppState {
  isLoaded: boolean;
  currentLang: AppLanguage;
  themePreference: ThemePreference;
  hasCompletedOnboarding: boolean;
  /** "This month, N years ago" notifications. Off until the user turns it on. */
  memoryReminders: boolean;
  activeTab: ActiveTab;
  /** Country whose detail sheet is open; also set by the atls://country/XX deep link. */
  selectedCountryId: string | null;
  isAddModalOpen: boolean;
  isShareModalOpen: boolean;

  // Actions
  initApp: () => Promise<void>;
  setLang: (lang: AppLanguage) => Promise<void>;
  setThemePreference: (theme: ThemePreference) => Promise<void>;
  /** Turning on asks for notification permission; resolves to false when it was not granted. */
  setMemoryReminders: (enabled: boolean) => Promise<boolean>;
  toggleLang: () => Promise<AppLanguage>;
  setActiveTab: (tab: ActiveTab) => void;
  setSelectedCountryId: (id: string | null) => void;
  setIsAddModalOpen: (open: boolean) => void;
  setIsShareModalOpen: (open: boolean) => void;
  completeOnboarding: (payload?: any) => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  isLoaded: false,
  currentLang: 'tr',
  themePreference: 'system',
  hasCompletedOnboarding: false,
  memoryReminders: false,
  activeTab: 'home',
  selectedCountryId: null,
  isAddModalOpen: false,
  isShareModalOpen: false,

  initApp: async () => {
    try {
      const data = await storageService.loadInitialData(initialProfile, initialCountries);
      
      set({
        currentLang: (data.lang as AppLanguage) || 'tr',
        themePreference: (data.theme as ThemePreference) || 'system',
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
      useTripStore.getState().setTrips(data.trips || [], data.tripsSeeded || []);
      useProgressStore.getState().hydrate(data.progress);
      usePlanStore.getState().setPlans(data.plans || []);
      const memoryEnabled = await storageService.getMemoryReminders();
      set({ memoryReminders: memoryEnabled });
      refreshMemoryReminders(memoryEnabled, (data.lang as AppLanguage) || 'tr').catch(() => {});
      usePlanStore.getState().restoreReminders((data.lang as AppLanguage) || 'tr').catch(() => {});
    } catch (error) {
      console.warn('[AppStore] initApp error:', error);
      set({ isLoaded: true });
    }
  },

  setMemoryReminders: async (enabled) => {
    if (enabled && !(await notificationService.requestPermissions())) return false;
    set({ memoryReminders: enabled });
    await storageService.saveMemoryReminders(enabled);
    await refreshMemoryReminders(enabled, get().currentLang);
    return enabled;
  },

  setLang: async (lang) => {
    set({ currentLang: lang });
    await storageService.saveLang(lang);
  },

  setThemePreference: async (theme) => {
    set({ themePreference: theme });
    await storageService.saveTheme(theme);
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

  setSelectedCountryId: (id) => set({ selectedCountryId: id }),

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
