import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface OnboardingStore {
  hasOnboarded: boolean;
  completeOnboarding: () => void;
  skipOnboarding: () => void;
}

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set) => ({
      hasOnboarded: false,
      completeOnboarding: () => set({ hasOnboarded: true }),
      skipOnboarding: () => set({ hasOnboarded: true }),
    }),
    { name: 'linguaflow-onboarding' }
  )
);
