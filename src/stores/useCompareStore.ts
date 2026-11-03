import { create } from 'zustand';
import { Invite } from '../utils/compareCode';

interface CompareState {
  isOpen: boolean;
  /** The friend's passport once a link was opened or pasted. */
  invite: Invite | null;
  open: () => void;
  close: () => void;
  setInvite: (invite: Invite | null) => void;
}

export const useCompareStore = create<CompareState>((set) => ({
  isOpen: false,
  invite: null,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false, invite: null }),
  // an incoming link opens the sheet straight on the result
  setInvite: (invite) => set(invite ? { invite, isOpen: true } : { invite: null }),
}));
