import { create } from 'zustand';

interface RegistrationState {
  token: string | null;
  userId: string | null;
  email: string | null;
  firstName: string | null;
  bankId: string | null;
  bankName: string | null;
  activationMethod: 'debit_card' | 'aadhaar' | null;
  setSession: (token: string, userId: string, email: string) => void;
  setName: (firstName: string) => void;
  setBank: (bankId: string, bankName: string) => void;
  setActivationMethod: (method: 'debit_card' | 'aadhaar') => void;
  clear: () => void;
}

export const useRegistrationStore = create<RegistrationState>((set) => ({
  token: null,
  userId: null,
  email: null,
  firstName: null,
  bankId: null,
  bankName: null,
  activationMethod: null,

  setSession: (token, userId, email) => set({ token, userId, email }),
  setName: (firstName) => set({ firstName }),
  setBank: (bankId, bankName) => set({ bankId, bankName }),
  setActivationMethod: (method) => set({ activationMethod: method }),
  clear: () => set({
    token: null, userId: null, email: null,
    firstName: null, bankId: null, bankName: null,
    activationMethod: null,
  }),
}));
