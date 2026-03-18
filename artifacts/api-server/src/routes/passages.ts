import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
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

const router: IRouter = Router();

router.post("/passages/generate", async (req, res): Promise<void> => {
  const parsed = GeneratePassageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const generated = await generateKoreanPassage({
    topic: parsed.data.topic,
    difficulty: parsed.data.difficulty,
    length: parsed.data.length,
    vocabularyFocus: parsed.data.vocabularyFocus ?? undefined,
    grammarFocus: parsed.data.grammarFocus ?? undefined,
    readingStyle: parsed.data.readingStyle,
  });

  const passage = {
    id: 0,
    title: generated.title,
    topic: parsed.data.topic,
    difficulty: parsed.data.difficulty,
    length: parsed.data.length,
    vocabularyFocus: parsed.data.vocabularyFocus ?? null,
    grammarFocus: parsed.data.grammarFocus ?? null,
    readingStyle: parsed.data.readingStyle,
    koreanText: generated.koreanText,
    sentences: generated.sentences,
    vocabulary: generated.vocabulary,
    imageUrls: generated.imageUrls,
    isBookmarked: false,
    createdAt: new Date().toISOString(),
  };

  res.json(GeneratePassageResponse.parse(passage));
});

router.get("/passages", async (_req, res): Promise<void> => {
  const passages = await db
    .select()
    .from(passagesTable)
    .orderBy(passagesTable.createdAt);

  res.json(ListPassagesResponse.parse(passages.map(formatPassage)));
});

router.post("/passages", async (req, res): Promise<void> => {
  const parsed = SavePassageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [passage] = await db
    .insert(passagesTable)
    .values({
      title: parsed.data.title,
      topic: parsed.data.topic,
      difficulty: parsed.data.difficulty,
      length: parsed.data.length,
      vocabularyFocus: parsed.data.vocabularyFocus ?? null,
      grammarFocus: parsed.data.grammarFocus ?? null,
      readingStyle: parsed.data.readingStyle,
      koreanText: parsed.data.koreanText,
      sentences: parsed.data.sentences as Array<{ korean: string; english: string }>,
      vocabulary: parsed.data.vocabulary as Array<{ korean: string; romanization: string; english: string; partOfSpeech: string; exampleSentence?: string }>,
      imageUrls: (parsed.data.imageUrls as string[]) ?? [],
      isBookmarked: parsed.data.isBookmarked ?? false,
    })
    .returning();

  res.status(201).json(GetPassageResponse.parse(formatPassage(passage)));
});

router.get("/passages/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetPassageParams.safeParse({ id: raw });
  if (!params.success) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  const [passage] = await db
    .select()
    .from(passagesTable)
    .where(eq(passagesTable.id, params.data.id));

  if (!passage) {
    res.status(404).json({ error: "Passage not found" });
    return;
  }

  res.json(GetPassageResponse.parse(formatPassage(passage)));
});

router.delete("/passages/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = DeletePassageParams.safeParse({ id: raw });
  if (!params.success) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  const [deleted] = await db
    .delete(passagesTable)
    .where(eq(passagesTable.id, params.data.id))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Passage not found" });
    return;
  }

  res.json(DeletePassageResponse.parse({ success: true }));
});

router.put("/passages/:id/bookmark", async (req, res): Promise<void> => {
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
    .where(eq(passagesTable.id, params.data.id))
    .returning();

  if (!passage) {
    res.status(404).json({ error: "Passage not found" });
    return;
  }

  res.json(ToggleBookmarkResponse.parse(formatPassage(passage)));
});

router.post("/words/gloss", async (req, res): Promise<void> => {
  const parsed = GlossWordBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const gloss = await glossKoreanWord(
    parsed.data.word,
    parsed.data.context ?? undefined,
    parsed.data.difficulty ?? undefined,
  );

  res.json(GlossWordResponse.parse(gloss));
});

function formatPassage(p: typeof passagesTable.$inferSelect) {
  return {
    ...p,
    vocabularyFocus: p.vocabularyFocus ?? undefined,
    grammarFocus: p.grammarFocus ?? undefined,
    imageUrls: p.imageUrls ?? [],
    createdAt: p.createdAt.toISOString(),
  };
}

export default router;
