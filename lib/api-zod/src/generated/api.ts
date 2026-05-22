import * as zod from "zod";

const comprehensionQuestionSchema = zod.object({
  question: zod.string(),
  answer: zod.string(),
});

const chineseTokenSchema = zod.object({
  hanzi: zod.string(),
  pinyin: zod.string(),
  meaning: zod.string(),
  type: zod.enum(["word", "punct"]),
});

const passageShape = {
  id: zod.number(),
  language: zod.string().default("ko"),
  title: zod.string(),
  topic: zod.string(),
  difficulty: zod.string(),
  length: zod.string(),
  vocabularyFocus: zod.string().nullable().optional(),
  grammarFocus: zod.string().nullable().optional(),
  readingStyle: zod.string(),
  koreanText: zod.string(),
  summary: zod.string().nullable().optional(),
  sentences: zod.array(
    zod.object({
      korean: zod.string(),
      english: zod.string(),
      pinyin: zod.string().optional(),
    }),
  ),
  tokens: zod.array(chineseTokenSchema).nullable().optional(),
  vocabulary: zod.array(
    zod.object({
      korean: zod.string(),
      romanization: zod.string(),
      english: zod.string(),
      partOfSpeech: zod.string(),
      exampleSentence: zod.string().optional(),
    }),
  ),
  comprehensionQuestions: zod.array(comprehensionQuestionSchema).nullable().optional(),
  imageUrls: zod.array(zod.string()),
  isBookmarked: zod.boolean(),
  createdAt: zod.coerce.date(),
};

/**
 * @summary Health check
 */
export const HealthCheckResponse = zod.object({
  status: zod.string(),
});

/**
 * @summary Auth — signup
 */
export const SignupBody = zod.object({
  email: zod.string().email(),
  password: zod.string().min(8, "Password must be at least 8 characters"),
});

/**
 * @summary Auth — login
 */
export const LoginBody = zod.object({
  email: zod.string().email(),
  password: zod.string().min(1),
});

/**
 * @summary Auth user response shape
 */
export const AuthUserResponse = zod.object({
  id: zod.number(),
  email: zod.string(),
});

/**
 * @summary Generate a reading passage using AI (Korean or Chinese)
 */
export const GeneratePassageBody = zod.object({
  topic: zod.string(),
  language: zod.enum(["ko", "zh"]).default("ko"),
  difficulty: zod.string(),
  length: zod.enum(["short", "medium", "long"]),
  vocabularyFocus: zod.string().nullable().optional(),
  grammarFocus: zod.string().nullable().optional(),
  readingStyle: zod.enum(["story", "article", "dialogue", "reflection", "summary"]),
});

export const GeneratePassageResponse = zod.object(passageShape);

/**
 * @summary List all saved passages
 */
export const ListPassagesResponseItem = zod.object(passageShape);
export const ListPassagesResponse = zod.array(ListPassagesResponseItem);

/**
 * @summary Save a passage to the library
 */
export const SavePassageBody = zod.object({
  language: zod.string().default("ko"),
  title: zod.string(),
  topic: zod.string(),
  difficulty: zod.string(),
  length: zod.string(),
  vocabularyFocus: zod.string().nullable().optional(),
  grammarFocus: zod.string().nullable().optional(),
  readingStyle: zod.string(),
  koreanText: zod.string(),
  summary: zod.string().nullable().optional(),
  sentences: zod.array(
    zod.object({
      korean: zod.string(),
      english: zod.string(),
      pinyin: zod.string().optional(),
    }),
  ),
  tokens: zod.array(chineseTokenSchema).nullable().optional(),
  vocabulary: zod.array(
    zod.object({
      korean: zod.string(),
      romanization: zod.string(),
      english: zod.string(),
      partOfSpeech: zod.string(),
      exampleSentence: zod.string().optional(),
    }),
  ),
  comprehensionQuestions: zod.array(comprehensionQuestionSchema).nullable().optional(),
  imageUrls: zod.array(zod.string()).optional(),
  isBookmarked: zod.boolean().optional(),
});

/**
 * @summary Get a passage by ID
 */
export const GetPassageParams = zod.object({
  id: zod.coerce.number(),
});

export const GetPassageResponse = zod.object(passageShape);

/**
 * @summary Delete a passage
 */
export const DeletePassageParams = zod.object({
  id: zod.coerce.number(),
});

export const DeletePassageResponse = zod.object({
  success: zod.boolean(),
});

/**
 * @summary Toggle bookmark on a passage
 */
export const ToggleBookmarkParams = zod.object({
  id: zod.coerce.number(),
});

export const ToggleBookmarkBody = zod.object({
  isBookmarked: zod.boolean(),
});

export const ToggleBookmarkResponse = zod.object(passageShape);

/**
 * @summary Get gloss (definition, grammar note, example) for a word
 */
export const GlossWordBody = zod.object({
  word: zod.string(),
  language: zod.enum(["ko", "zh"]).optional(),
  context: zod.string().optional(),
  difficulty: zod.string().optional(),
});

export const GlossWordResponse = zod.object({
  word: zod.string(),
  romanization: zod.string(),
  englishMeaning: zod.string(),
  partOfSpeech: zod.string(),
  grammarNote: zod.string().optional(),
  exampleSentence: zod.string().optional(),
  exampleTranslation: zod.string().optional(),
});

/**
 * @summary Vocabulary — save a word
 */
export const SaveVocabBody = zod.object({
  language: zod.enum(["ko", "zh"]),
  word: zod.string(),
  pinyin: zod.string().nullable().optional(),
  meaning: zod.string(),
  exampleSentence: zod.string().nullable().optional(),
  sourcePassageId: zod.number().nullable().optional(),
  difficulty: zod.string().nullable().optional(),
  notes: zod.string().nullable().optional(),
});

export const VocabItemResponse = zod.object({
  id: zod.number(),
  language: zod.string(),
  word: zod.string(),
  pinyin: zod.string().nullable().optional(),
  meaning: zod.string(),
  exampleSentence: zod.string().nullable().optional(),
  sourcePassageId: zod.number().nullable().optional(),
  difficulty: zod.string().nullable().optional(),
  notes: zod.string().nullable().optional(),
  reviewed: zod.boolean(),
  createdAt: zod.coerce.date(),
});

export const ListVocabResponse = zod.array(VocabItemResponse);
export const DeleteVocabParams = zod.object({ id: zod.coerce.number() });
export const UpdateVocabBody = zod.object({
  notes: zod.string().nullable().optional(),
  reviewed: zod.boolean().optional(),
});
