import { create } from 'zustand';
import { Profile } from './types';
import { initialProfile } from '../data/travelData';
import { storageService } from '../services/storageService';
import { authService } from '../services/authService';

interface ProfileState {
  profile: Profile;
  isAuthenticated: boolean;
  setProfile: (profile: Profile) => void;
  setIsAuthenticated: (val: boolean) => void;
  updateProfile: (updated: Partial<Profile>) => Promise<void>;
  loginSuccess: (userData: any) => Promise<any>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: initialProfile,
  isAuthenticated: false,

  setProfile: (profile) => set({ profile }),
  setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),

  updateProfile: async (updatedFields) => {
    const newProfile = { ...get().profile, ...updatedFields };
    set({ profile: newProfile });
    await storageService.saveProfile(newProfile);
  },

  loginSuccess: async (userData) => {
    set({ isAuthenticated: true });
    await storageService.saveAuth(true);

    const sessionData = await storageService.loadUserSessionData(userData);
    if (sessionData && sessionData.profile) {
      set({ profile: sessionData.profile });
      return sessionData;
    } else {
      const merged = { ...get().profile, ...userData };
      set({ profile: merged });
      await storageService.saveProfile(merged);
      return { profile: merged, countries: [] };
    }
  },

  logout: async () => {
    set({
      isAuthenticated: false,
      profile: initialProfile,
    });
    await storageService.clearAuth();
  },

  deleteAccount: async () => {
    try {
      await authService.deleteAccount();
      await storageService.deleteAccount();
    } catch (e) {
      console.warn('[ProfileStore] deleteAccount warning:', e);
    } finally {
      set({
        isAuthenticated: false,
        profile: initialProfile,
      });
    }
  },
}));
