import { create } from 'zustand';
import { CountryStatus } from './types';

export interface StampEvent {
  id: number;
  countryId: string;
  status: CountryStatus;
  year?: string | null;
  month?: string | null;
}

interface CelebrationState {
  /** Hosts (the app root and every open modal) that can draw celebrations; only the top one draws. */
  hosts: string[];
  stamp: StampEvent | null;
  confettiKey: number;
  pushHost: (id: string) => void;
  popHost: (id: string) => void;
  showStamp: (event: Omit<StampEvent, 'id'>) => void;
  clearStamp: () => void;
  burstConfetti: () => void;
}

let counter = 0;

export const useCelebrationStore = create<CelebrationState>((set) => ({
  hosts: [],
  stamp: null,
  confettiKey: 0,
  pushHost: (id) => set((s) => ({ hosts: [...s.hosts.filter((h) => h !== id), id] })),
  popHost: (id) => set((s) => ({ hosts: s.hosts.filter((h) => h !== id) })),
  showStamp: (event) => set({ stamp: { ...event, id: ++counter } }),
  clearStamp: () => set({ stamp: null }),
  burstConfetti: () => set((s) => ({ confettiKey: s.confettiKey + 1 })),
}));
