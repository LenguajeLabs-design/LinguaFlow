import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AppLanguage = 'ko' | 'zh' | 'es' | 'en' | 'it';

interface LanguageStore {
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  supportLanguage: AppLanguage;
  setSupportLanguage: (lang: AppLanguage) => void;
}

export const useLanguageStore = create<LanguageStore>()(
  persist(
    (set) => ({
      language: 'ko',
      setLanguage: (language) => set({ language }),
      supportLanguage: 'en',
      setSupportLanguage: (supportLanguage) => set({ supportLanguage }),
    }),
    { name: 'linguaflow-language' }
  )
);

export const LANGUAGE_CONFIG = {
  ko: {
    name: 'Korean',
    nativeName: '한국어',
    label: '한',
    flag: '🇰🇷',
    appName: 'LinguaFlow',
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
    appName: 'LinguaFlow',
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
  es: {
    name: 'Spanish',
    nativeName: 'Español',
    label: 'Es',
    flag: '🇪🇸',
    appName: 'LinguaFlow',
    difficultyLabel: 'CEFR Level',
    difficulties: [
      { value: 'a1', label: 'A1 – Beginner',           desc: '~500 words · Essential basics' },
      { value: 'a2', label: 'A2 – Elementary',          desc: '~1,000 words · Simple daily life' },
      { value: 'b1', label: 'B1 – Intermediate',        desc: '~2,000 words · Everyday topics' },
      { value: 'b2', label: 'B2 – Upper Intermediate',  desc: '~4,000 words · Complex discourse' },
      { value: 'c1', label: 'C1 – Advanced',            desc: '~8,000 words · Sophisticated prose' },
      { value: 'c2', label: 'C2 – Mastery',             desc: '~16,000+ words · Near-native' },
    ],
    readingStyles: [
      { value: 'story',      label: 'Story'                },
      { value: 'article',    label: 'Article'              },
      { value: 'dialogue',   label: 'Dialogue'             },
      { value: 'reflection', label: 'Personal Reflection'  },
      { value: 'summary',    label: 'Summary'              },
    ],
    topicSuggestions: [
      'La vida en la ciudad', 'Comida latinoamericana', 'Familia y tradiciones',
      'Viajes por España', 'Música y cultura', 'Historia y política',
      'La naturaleza', 'Tecnología y el futuro',
    ],
    gradientFrom: 'hsl(355,80%,50%)',
    gradientTo: 'hsl(45,95%,50%)',
  },
  en: {
    name: 'English',
    nativeName: 'English',
    label: 'En',
    flag: '🇺🇸',
    appName: 'LinguaFlow',
    difficultyLabel: 'CEFR Level',
    difficulties: [
      { value: 'a1', label: 'A1 – Beginner',           desc: '~500 words · Essential basics' },
      { value: 'a2', label: 'A2 – Elementary',          desc: '~1,000 words · Simple daily life' },
      { value: 'b1', label: 'B1 – Intermediate',        desc: '~2,000 words · Everyday topics' },
      { value: 'b2', label: 'B2 – Upper Intermediate',  desc: '~4,000 words · Complex discourse' },
      { value: 'c1', label: 'C1 – Advanced',            desc: '~8,000 words · Sophisticated prose' },
      { value: 'c2', label: 'C2 – Mastery',             desc: '~16,000+ words · Near-native' },
    ],
    readingStyles: [
      { value: 'story',      label: 'Story'                },
      { value: 'article',    label: 'Article'              },
      { value: 'dialogue',   label: 'Dialogue'             },
      { value: 'reflection', label: 'Personal Reflection'  },
      { value: 'summary',    label: 'Summary'              },
    ],
    topicSuggestions: [
      'Life in a big city', 'Travel around the world', 'Food and cooking',
      'Technology and the future', 'Music and culture', 'History and politics',
      'Nature and the environment', 'Learning new skills',
    ],
    gradientFrom: 'hsl(217,90%,55%)',
    gradientTo: 'hsl(190,80%,50%)',
  },
  it: {
    name: 'Italian',
    nativeName: 'Italiano',
    label: 'It',
    flag: '🇮🇹',
    appName: 'LinguaFlow',
    difficultyLabel: 'CEFR Level',
    difficulties: [
      { value: 'a1', label: 'A1 – Beginner',           desc: '~500 parole · Basi essenziali' },
      { value: 'a2', label: 'A2 – Elementary',          desc: '~1,000 parole · Vita quotidiana' },
      { value: 'b1', label: 'B1 – Intermediate',        desc: '~2,000 parole · Argomenti comuni' },
      { value: 'b2', label: 'B2 – Upper Intermediate',  desc: '~4,000 parole · Discorso complesso' },
      { value: 'c1', label: 'C1 – Advanced',            desc: '~8,000 parole · Prosa sofisticata' },
      { value: 'c2', label: 'C2 – Mastery',             desc: '~16,000+ parole · Quasi nativo' },
    ],
    readingStyles: [
      { value: 'story',      label: 'Story'                },
      { value: 'article',    label: 'Article'              },
      { value: 'dialogue',   label: 'Dialogue'             },
      { value: 'reflection', label: 'Personal Reflection'  },
      { value: 'summary',    label: 'Summary'              },
    ],
    topicSuggestions: [
      'Un weekend a Firenze', 'La cucina italiana', 'Il cinema italiano',
      'La famiglia e le tradizioni', 'Arte e storia', 'La moda italiana',
      'Viaggiare in Italia', 'La musica e la cultura',
    ],
    gradientFrom: 'hsl(7,80%,50%)',
    gradientTo: 'hsl(45,95%,50%)',
  },
} as const;

export const SUPPORT_LANGUAGE_OPTIONS: Array<{ value: AppLanguage; label: string; flag: string }> = [
  { value: 'en', label: 'English', flag: '🇺🇸' },
  { value: 'ko', label: 'Korean', flag: '🇰🇷' },
  { value: 'zh', label: 'Chinese', flag: '🇨🇳' },
  { value: 'es', label: 'Spanish', flag: '🇪🇸' },
  { value: 'it', label: 'Italian', flag: '🇮🇹' },
];
