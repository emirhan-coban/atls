import { create } from 'zustand';
import { Profile } from './types';
import { initialProfile } from '../data/travelData';
import { storageService } from '../services/storageService';

interface ProfileState {
  profile: Profile;
  isAuthenticated: boolean;
  setProfile: (profile: Profile) => void;
  setIsAuthenticated: (val: boolean) => void;
  updateProfile: (updated: Partial<Profile>) => Promise<void>;
  loginSuccess: (userData: any) => Promise<any>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  startAccountUpgrade: () => Promise<void>;
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

  // Guest -> account: shows the sign-in screen but keeps the guest's data on the device,
  // so it is merged into the new account on login.
  startAccountUpgrade: async () => {
    set({ isAuthenticated: false });
    await storageService.saveAuth(false);
  },

  // Throws when the cloud account could not be deleted, leaving the user signed in.
  deleteAccount: async () => {
    await storageService.deleteAccount();
    set({
      isAuthenticated: false,
      profile: initialProfile,
    });
  },
}));
