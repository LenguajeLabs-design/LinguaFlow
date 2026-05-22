export interface HealthStatus {
  status: string;
}

export interface ErrorResponse {
  error: string;
}

export interface SuccessResponse {
  success: boolean;
}

export type GeneratePassageRequestDifficulty =
  (typeof GeneratePassageRequestDifficulty)[keyof typeof GeneratePassageRequestDifficulty];

export const GeneratePassageRequestDifficulty = {
  beginner: "beginner",
  lower_intermediate: "lower_intermediate",
  intermediate: "intermediate",
  upper_intermediate: "upper_intermediate",
  advanced: "advanced",
  hsk1: "hsk1",
  hsk2: "hsk2",
  hsk3: "hsk3",
  hsk4: "hsk4",
  hsk5: "hsk5",
  hsk6: "hsk6",
} as const;

export type GeneratePassageRequestLength =
  (typeof GeneratePassageRequestLength)[keyof typeof GeneratePassageRequestLength];

export const GeneratePassageRequestLength = {
  short: "short",
  medium: "medium",
  long: "long",
} as const;

export type GeneratePassageRequestReadingStyle =
  (typeof GeneratePassageRequestReadingStyle)[keyof typeof GeneratePassageRequestReadingStyle];

export const GeneratePassageRequestReadingStyle = {
  story: "story",
  article: "article",
  dialogue: "dialogue",
  reflection: "reflection",
  summary: "summary",
} as const;

export type AppLanguage = "ko" | "zh";

export interface ChineseToken {
  hanzi: string;
  pinyin: string;
  meaning: string;
  type: "word" | "punct";
}

export interface GeneratePassageRequest {
  topic: string;
  language?: AppLanguage;
  difficulty: string;
  length: GeneratePassageRequestLength;
  vocabularyFocus?: string;
  grammarFocus?: string;
  readingStyle: GeneratePassageRequestReadingStyle;
}

export interface PassageSentence {
  korean: string;
  english: string;
  pinyin?: string;
}

export interface VocabularyItem {
  korean: string;
  romanization: string;
  english: string;
  partOfSpeech: string;
  exampleSentence?: string;
}

export interface CreatePassageRequest {
  language?: AppLanguage;
  title: string;
  topic: string;
  difficulty: string;
  length: string;
  vocabularyFocus?: string;
  grammarFocus?: string;
  readingStyle: string;
  koreanText: string;
  summary?: string;
  sentences: PassageSentence[];
  tokens?: ChineseToken[] | null;
  vocabulary: VocabularyItem[];
  imageUrls?: string[];
  isBookmarked?: boolean;
}

export interface BookmarkRequest {
  isBookmarked: boolean;
}

export interface Passage {
  id: number;
  language: string;
  title: string;
  topic: string;
  difficulty: string;
  length: string;
  vocabularyFocus?: string;
  grammarFocus?: string;
  readingStyle: string;
  koreanText: string;
  summary?: string;
  sentences: PassageSentence[];
  tokens?: ChineseToken[] | null;
  vocabulary: VocabularyItem[];
  imageUrls: string[];
  isBookmarked: boolean;
  createdAt: string;
}

export interface GlossRequest {
  word: string;
  language?: AppLanguage;
  context?: string;
  difficulty?: string;
}

export interface WordGloss {
  word: string;
  romanization: string;
  englishMeaning: string;
  partOfSpeech: string;
  grammarNote?: string;
  exampleSentence?: string;
  exampleTranslation?: string;
}

export interface SavedVocab {
  id: number;
  language: string;
  word: string;
  pinyin?: string | null;
  meaning: string;
  exampleSentence?: string | null;
  sourcePassageId?: number | null;
  difficulty?: string | null;
  notes?: string | null;
  reviewed: boolean;
  createdAt: string;
}

export interface SaveVocabRequest {
  language: AppLanguage;
  word: string;
  pinyin?: string | null;
  meaning: string;
  exampleSentence?: string | null;
  sourcePassageId?: number | null;
  difficulty?: string | null;
  notes?: string | null;
}

export interface UpdateVocabRequest {
  notes?: string | null;
  reviewed?: boolean;
}
