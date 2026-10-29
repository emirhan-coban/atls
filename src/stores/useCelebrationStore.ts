import { create } from 'zustand';

interface CelebrationState {
  /** Hosts (the app root and every open modal) that can draw celebrations; only the top one draws. */
  hosts: string[];
  confettiKey: number;
  pushHost: (id: string) => void;
  popHost: (id: string) => void;
  burstConfetti: () => void;
}

export const useCelebrationStore = create<CelebrationState>((set) => ({
  hosts: [],
  confettiKey: 0,
  pushHost: (id) => set((s) => ({ hosts: [...s.hosts.filter((h) => h !== id), id] })),
  popHost: (id) => set((s) => ({ hosts: s.hosts.filter((h) => h !== id) })),
  burstConfetti: () => set((s) => ({ confettiKey: s.confettiKey + 1 })),
}));
