import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AppLanguage = 'ko' | 'zh';

interface LanguageStore {
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
}

export const useLanguageStore = create<LanguageStore>()(
  persist(
    (set) => ({
      language: 'ko',
      setLanguage: (language) => set({ language }),
    }),
    { name: 'hangulflow-language' }
  )
);

export const LANGUAGE_CONFIG = {
  ko: {
    name: 'Korean',
    nativeName: '한국어',
    label: '한',
    flag: '🇰🇷',
    appName: 'Hangul Flow',
    difficultyLabel: 'TOPIK Level',
    difficulties: [
      { value: 'beginner',           label: 'Beginner',           desc: 'TOPIK I-1 · Simple sentences' },
      { value: 'lower_intermediate', label: 'Lower Intermediate', desc: 'TOPIK I-2 · Basic grammar' },
      { value: 'intermediate',       label: 'Intermediate',       desc: 'TOPIK II-3 · Complex sentences' },
      { value: 'upper_intermediate', label: 'Upper Intermediate', desc: 'TOPIK II-4 · Native expressions' },
      { value: 'advanced',           label: 'Advanced',           desc: 'TOPIK II-5/6 · Nuanced prose' },
    ],
    readingStyles: [
      { value: 'story',      label: 'Story'           },
      { value: 'article',    label: 'Article'         },
      { value: 'dialogue',   label: 'Dialogue'        },
      { value: 'reflection', label: 'Personal Reflection' },
    ],
    topicSuggestions: [
      'Korean café culture', 'Hiking in Korea', 'K-pop industry',
      'Seoul subway life', 'Traditional food', 'Language learning',
      'Korean cinema', 'University life',
    ],
    gradientFrom: 'hsl(174,62%,42%)',
    gradientTo: 'hsl(255,52%,60%)',
  },
  zh: {
    name: 'Chinese',
    nativeName: '普通话',
    label: '汉',
    flag: '🇨🇳',
    appName: 'Hanzi Flow',
    difficultyLabel: 'HSK Level',
    difficulties: [
      { value: 'hsk1', label: 'HSK 1', desc: '150 words · Very basic' },
      { value: 'hsk2', label: 'HSK 2', desc: '300 words · Simple daily life' },
      { value: 'hsk3', label: 'HSK 3', desc: '600 words · Everyday topics' },
      { value: 'hsk4', label: 'HSK 4', desc: '1,200 words · Abstract topics' },
      { value: 'hsk5', label: 'HSK 5', desc: '2,500 words · Complex discourse' },
      { value: 'hsk6', label: 'HSK 6', desc: '5,000+ words · Near-native' },
    ],
    readingStyles: [
      { value: 'story',      label: 'Story'           },
      { value: 'article',    label: 'Article'         },
      { value: 'dialogue',   label: 'Dialogue'        },
      { value: 'reflection', label: 'Personal Reflection' },
      { value: 'summary',    label: 'Summary'         },
    ],
    topicSuggestions: [
      'Traveling in China', 'Chinese food culture', 'Learning Mandarin',
      'Life in Shanghai', 'Philosophy and mindfulness', 'Business in China',
      'Chinese New Year', 'Technology and AI',
    ],
    gradientFrom: 'hsl(0,70%,50%)',
    gradientTo: 'hsl(30,90%,55%)',
  },
} as const;
