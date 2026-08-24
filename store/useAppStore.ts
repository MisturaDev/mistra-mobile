import { create } from 'zustand';
import {
  loadOnboardingCompleted,
  saveOnboardingCompleted,
} from '@/utils/onboardingPreferences';

interface AppState {
  onboardingCompleted: boolean;
  isHydrated: boolean;
  hydrate: () => Promise<void>;
  setOnboardingCompleted: (completed: boolean) => Promise<void>;
}

export const useAppStore = create<AppState>((set) => ({
  onboardingCompleted: false,
  isHydrated: false,

  hydrate: async () => {
    const onboardingCompleted = await loadOnboardingCompleted();
    set({ onboardingCompleted, isHydrated: true });
  },

  setOnboardingCompleted: async (completed) => {
    set({ onboardingCompleted: completed });
    await saveOnboardingCompleted(completed);
  },
}));
