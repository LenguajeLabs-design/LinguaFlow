import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type FontSize = 'normal' | 'large' | 'xlarge';

interface SettingsStore {
  fontSize: FontSize;
  showRomanization: boolean;
  ttsSpeed: number;
  setFontSize: (size: FontSize) => void;
  setShowRomanization: (v: boolean) => void;
  setTtsSpeed: (speed: number) => void;
}

export const useSettings = create<SettingsStore>()(
  persist(
    (set) => ({
      fontSize: 'normal',
      showRomanization: true,
      ttsSpeed: 0.85,
      setFontSize: (fontSize) => set({ fontSize }),
      setShowRomanization: (showRomanization) => set({ showRomanization }),
      setTtsSpeed: (ttsSpeed) => set({ ttsSpeed }),
    }),
    { name: 'koreader-settings' }
  )
);

export const fontSizeMap: Record<FontSize, string> = {
  normal: 'text-[1.35rem] sm:text-[1.5rem]',
  large: 'text-[1.55rem] sm:text-[1.75rem]',
  xlarge: 'text-[1.75rem] sm:text-[2rem]',
};
