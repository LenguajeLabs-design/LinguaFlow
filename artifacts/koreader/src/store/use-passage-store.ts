import { create } from 'zustand';
import type { Passage } from '@workspace/api-client-react';

interface PassageStore {
  generatedPassage: Passage | null;
  setGeneratedPassage: (passage: Passage | null) => void;
  clearGeneratedPassage: () => void;
}

// Global store to hold a newly generated passage before it is saved to the library
export const usePassageStore = create<PassageStore>((set) => ({
  generatedPassage: null,
  setGeneratedPassage: (passage) => set({ generatedPassage: passage }),
  clearGeneratedPassage: () => set({ generatedPassage: null }),
}));
