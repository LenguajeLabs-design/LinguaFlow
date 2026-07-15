import { Router, type IRouter } from "express";
import {
  GeneratePassageBody,
  GeneratePassageResponse,
} from "@workspace/api-zod";
import { generateKoreanPassage } from "../lib/passageGenerator";
import { generateChinesePassage } from "../lib/chinesePassageGenerator";
import { generateSpanishPassage } from "../lib/spanishPassageGenerator";
import { generateEnglishPassage } from "../lib/englishPassageGenerator";
import { generateItalianPassage } from "../lib/italianPassageGenerator";
import { guestGenerateLimiter } from "../middleware/rateLimiter";

const router: IRouter = Router();

router.post("/guest/generate", guestGenerateLimiter, async (req, res, next): Promise<void> => {
  const parsed = GeneratePassageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const lang = parsed.data.language ?? "ko";
  const supportLanguage = parsed.data.supportLanguage ?? "en";

  let passage: any;

  try {
    if (lang === "en") {
      const generated = await generateEnglishPassage({
        topic: parsed.data.topic,
        difficulty: parsed.data.difficulty,
        length: parsed.data.length,
        readingStyle: parsed.data.readingStyle,
        vocabularyFocus: parsed.data.vocabularyFocus ?? undefined,
        grammarFocus: parsed.data.grammarFocus ?? undefined,
        supportLanguage,
      });
      passage = {
        id: 0,
        language: "en",
        supportLanguage,
        title: generated.title,
        topic: parsed.data.topic,
        difficulty: parsed.data.difficulty,
        length: parsed.data.length,
        vocabularyFocus: parsed.data.vocabularyFocus ?? undefined,
        grammarFocus: parsed.data.grammarFocus ?? undefined,
        readingStyle: parsed.data.readingStyle,
        koreanText: generated.englishText,
        summary: generated.summary,
        sentences: generated.sentences.map((s) => ({
          korean: s.english,
          english: s.translation,
        })),
        tokens: null,
        vocabulary: generated.vocabulary.map((v) => ({
          korean: v.word,
          romanization: "",
          english: v.translation,
          partOfSpeech: v.partOfSpeech,
          exampleSentence: v.exampleSentence,
        })),
        comprehensionQuestions: generated.comprehensionQuestions,
        imageUrls: generated.imageUrls,
        isBookmarked: false,
        createdAt: new Date().toISOString(),
      };
    } else if (lang === "es") {
      const generated = await generateSpanishPassage({
        topic: parsed.data.topic,
        difficulty: parsed.data.difficulty,
        length: parsed.data.length,
        readingStyle: parsed.data.readingStyle,
        vocabularyFocus: parsed.data.vocabularyFocus ?? undefined,
        grammarFocus: parsed.data.grammarFocus ?? undefined,
        supportLanguage,
      });
      passage = {
        id: 0,
        language: "es",
        supportLanguage,
        title: generated.title,
        topic: parsed.data.topic,
        difficulty: parsed.data.difficulty,
        length: parsed.data.length,
        vocabularyFocus: parsed.data.vocabularyFocus ?? undefined,
        grammarFocus: parsed.data.grammarFocus ?? undefined,
        readingStyle: parsed.data.readingStyle,
        koreanText: generated.spanishText,
        summary: generated.summary,
        sentences: generated.sentences.map((s) => ({
          korean: s.spanish,
          english: s.english,
        })),
        tokens: null,
        vocabulary: generated.vocabulary.map((v) => ({
          korean: v.word,
          romanization: "",
          english: v.english,
          partOfSpeech: v.partOfSpeech,
          exampleSentence: v.exampleSentence,
        })),
        comprehensionQuestions: generated.comprehensionQuestions,
        imageUrls: generated.imageUrls,
        isBookmarked: false,
        createdAt: new Date().toISOString(),
      };
    } else if (lang === "it") {
      const generated = await generateItalianPassage({
        topic: parsed.data.topic,
        difficulty: parsed.data.difficulty,
        length: parsed.data.length,
        readingStyle: parsed.data.readingStyle,
        vocabularyFocus: parsed.data.vocabularyFocus ?? undefined,
        grammarFocus: parsed.data.grammarFocus ?? undefined,
        supportLanguage,
      });
      passage = {
        id: 0,
        language: "it",
        supportLanguage,
        title: generated.title,
        topic: parsed.data.topic,
        difficulty: parsed.data.difficulty,
        length: parsed.data.length,
        vocabularyFocus: parsed.data.vocabularyFocus ?? undefined,
        grammarFocus: parsed.data.grammarFocus ?? undefined,
        readingStyle: parsed.data.readingStyle,
        koreanText: generated.italianText,
        summary: generated.summary,
        sentences: generated.sentences.map((s) => ({
          korean: s.italian,
          english: s.english,
        })),
        tokens: null,
        vocabulary: generated.vocabulary.map((v) => ({
          korean: v.word,
          romanization: "",
          english: v.english,
          partOfSpeech: v.partOfSpeech,
          exampleSentence: v.exampleSentence,
        })),
        comprehensionQuestions: generated.comprehensionQuestions,
        imageUrls: generated.imageUrls,
        isBookmarked: false,
        createdAt: new Date().toISOString(),
      };
    } else if (lang === "zh") {
      const generated = await generateChinesePassage({
        topic: parsed.data.topic,
        difficulty: parsed.data.difficulty,
        length: parsed.data.length,
        readingStyle: parsed.data.readingStyle,
        vocabularyFocus: parsed.data.vocabularyFocus ?? undefined,
        grammarFocus: parsed.data.grammarFocus ?? undefined,
        supportLanguage,
      });
      passage = {
        id: 0,
        language: "zh",
        supportLanguage,
        title: generated.title,
        topic: parsed.data.topic,
        difficulty: parsed.data.difficulty,
        length: parsed.data.length,
        vocabularyFocus: parsed.data.vocabularyFocus ?? undefined,
        grammarFocus: parsed.data.grammarFocus ?? undefined,
        readingStyle: parsed.data.readingStyle,
        koreanText: generated.chineseText,
        summary: generated.summary,
        sentences: generated.sentences.map((s) => ({
          korean: s.chinese,
          english: s.english,
          pinyin: s.pinyin,
        })),
        tokens: generated.tokens,
        vocabulary: generated.vocabulary.map((v) => ({
          korean: v.hanzi,
          romanization: v.pinyin,
          english: v.meaning,
          partOfSpeech: v.partOfSpeech,
          exampleSentence: v.exampleSentence,
        })),
        comprehensionQuestions: generated.comprehensionQuestions,
        imageUrls: generated.imageUrls,
        isBookmarked: false,
        createdAt: new Date().toISOString(),
      };
    } else {
      const generated = await generateKoreanPassage({
        topic: parsed.data.topic,
        difficulty: parsed.data.difficulty,
        length: parsed.data.length,
        vocabularyFocus: parsed.data.vocabularyFocus ?? undefined,
        grammarFocus: parsed.data.grammarFocus ?? undefined,
        readingStyle: parsed.data.readingStyle,
        supportLanguage,
      });
      passage = {
        id: 0,
        language: "ko",
        supportLanguage,
        title: generated.title,
        topic: parsed.data.topic,
        difficulty: parsed.data.difficulty,
        length: parsed.data.length,
        vocabularyFocus: parsed.data.vocabularyFocus ?? undefined,
        grammarFocus: parsed.data.grammarFocus ?? undefined,
        readingStyle: parsed.data.readingStyle,
        koreanText: generated.koreanText,
        summary: generated.summary,
        sentences: generated.sentences,
        tokens: null,
        vocabulary: generated.vocabulary,
        comprehensionQuestions: generated.comprehensionQuestions,
        imageUrls: generated.imageUrls,
        isBookmarked: false,
        createdAt: new Date().toISOString(),
      };
    }

    res.json(GeneratePassageResponse.parse(passage));
  } catch (err) {
    next(err);
  }
});

export default router;
