import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, passagesTable } from "@workspace/db";
import {
  GeneratePassageBody,
  GeneratePassageResponse,
  SavePassageBody,
  GetPassageParams,
  GetPassageResponse,
  DeletePassageParams,
  DeletePassageResponse,
  ToggleBookmarkParams,
  ToggleBookmarkBody,
  ToggleBookmarkResponse,
  ListPassagesResponse,
  GlossWordBody,
  GlossWordResponse,
} from "@workspace/api-zod";
import { generateKoreanPassage, glossKoreanWord } from "../lib/passageGenerator";
import { generateChinesePassage, glossChineseWord } from "../lib/chinesePassageGenerator";
import { generateSpanishPassage, glossSpanishWord } from "../lib/spanishPassageGenerator";
import { requireAuth } from "../middleware/requireAuth";
import { generateLimiter, glossLimiter } from "../middleware/rateLimiter";

const router: IRouter = Router();

router.post("/passages/generate", requireAuth, generateLimiter, async (req, res, next): Promise<void> => {
  const parsed = GeneratePassageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const lang = parsed.data.language ?? "ko";

  let passage: any;

  try {
  if (lang === "es") {
    const generated = await generateSpanishPassage({
      topic: parsed.data.topic,
      difficulty: parsed.data.difficulty,
      length: parsed.data.length,
      readingStyle: parsed.data.readingStyle,
      vocabularyFocus: parsed.data.vocabularyFocus ?? undefined,
      grammarFocus: parsed.data.grammarFocus ?? undefined,
    });

    passage = {
      id: 0,
      language: "es",
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
  } else if (lang === "zh") {
    const generated = await generateChinesePassage({
      topic: parsed.data.topic,
      difficulty: parsed.data.difficulty,
      length: parsed.data.length,
      readingStyle: parsed.data.readingStyle,
      vocabularyFocus: parsed.data.vocabularyFocus ?? undefined,
      grammarFocus: parsed.data.grammarFocus ?? undefined,
    });

    passage = {
      id: 0,
      language: "zh",
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
    });

    passage = {
      id: 0,
      language: "ko",
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

router.get("/passages", requireAuth, async (req, res): Promise<void> => {
  const userId = req.userId;
  const passages = await db
    .select()
    .from(passagesTable)
    .where(eq(passagesTable.userId, userId))
    .orderBy(passagesTable.createdAt);

  res.json(ListPassagesResponse.parse(passages.map(formatPassage)));
});

router.post("/passages", requireAuth, async (req, res): Promise<void> => {
  const parsed = SavePassageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [passage] = await db
    .insert(passagesTable)
    .values({
      language: parsed.data.language ?? "ko",
      title: parsed.data.title,
      topic: parsed.data.topic,
      difficulty: parsed.data.difficulty,
      length: parsed.data.length,
      vocabularyFocus: parsed.data.vocabularyFocus ?? null,
      grammarFocus: parsed.data.grammarFocus ?? null,
      readingStyle: parsed.data.readingStyle,
      koreanText: parsed.data.koreanText,
      summary: parsed.data.summary ?? null,
      sentences: parsed.data.sentences as any,
      tokens: (parsed.data.tokens ?? null) as any,
      vocabulary: parsed.data.vocabulary as any,
      comprehensionQuestions: (parsed.data.comprehensionQuestions ?? null) as any,
      imageUrls: (parsed.data.imageUrls as string[]) ?? [],
      isBookmarked: parsed.data.isBookmarked ?? false,
      userId: req.userId,
    })
    .returning();

  res.status(201).json(GetPassageResponse.parse(formatPassage(passage)));
});

router.get("/passages/:id", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetPassageParams.safeParse({ id: raw });
  if (!params.success) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  const [passage] = await db
    .select()
    .from(passagesTable)
    .where(and(eq(passagesTable.id, params.data.id), eq(passagesTable.userId, req.userId)));

  if (!passage) {
    res.status(404).json({ error: "Passage not found" });
    return;
  }

  res.json(GetPassageResponse.parse(formatPassage(passage)));
});

router.delete("/passages/:id", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = DeletePassageParams.safeParse({ id: raw });
  if (!params.success) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  const [deleted] = await db
    .delete(passagesTable)
    .where(and(eq(passagesTable.id, params.data.id), eq(passagesTable.userId, req.userId)))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Passage not found" });
    return;
  }

  res.json(DeletePassageResponse.parse({ success: true }));
});

router.put("/passages/:id/bookmark", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = ToggleBookmarkParams.safeParse({ id: raw });
  if (!params.success) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  const body = ToggleBookmarkBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const [passage] = await db
    .update(passagesTable)
    .set({ isBookmarked: body.data.isBookmarked })
    .where(and(eq(passagesTable.id, params.data.id), eq(passagesTable.userId, req.userId)))
    .returning();

  if (!passage) {
    res.status(404).json({ error: "Passage not found" });
    return;
  }

  res.json(ToggleBookmarkResponse.parse(formatPassage(passage)));
});

router.post("/words/gloss", requireAuth, glossLimiter, async (req, res): Promise<void> => {
  const parsed = GlossWordBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const lang = parsed.data.language ?? "ko";
  let gloss: any;

  if (lang === "zh") {
    gloss = await glossChineseWord(
      parsed.data.word,
      parsed.data.context ?? undefined,
    );
  } else if (lang === "es") {
    gloss = await glossSpanishWord(
      parsed.data.word,
      parsed.data.context ?? undefined,
    );
  } else {
    gloss = await glossKoreanWord(
      parsed.data.word,
      parsed.data.context ?? undefined,
      parsed.data.difficulty ?? undefined,
    );
  }

  res.json(GlossWordResponse.parse(gloss));
});

function formatPassage(p: typeof passagesTable.$inferSelect) {
  return {
    ...p,
    language: p.language ?? "ko",
    vocabularyFocus: p.vocabularyFocus ?? undefined,
    grammarFocus: p.grammarFocus ?? undefined,
    summary: p.summary ?? undefined,
    tokens: (p.tokens as any) ?? null,
    comprehensionQuestions: (p.comprehensionQuestions as any) ?? undefined,
    imageUrls: p.imageUrls ?? [],
    createdAt: p.createdAt,
  };
}

export default router;
