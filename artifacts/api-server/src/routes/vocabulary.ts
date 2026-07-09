import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, vocabularyTable } from "@workspace/db";
import { SaveVocabBody, DeleteVocabParams, UpdateVocabBody, ListVocabResponse, VocabItemResponse } from "@workspace/api-zod";
import { requireAuth } from "../middleware/requireAuth";

const router: IRouter = Router();

router.get("/vocabulary", requireAuth, async (req, res): Promise<void> => {
  const userId = req.userId;
  const lang = req.query.language as string | undefined;

  const items = await db
    .select()
    .from(vocabularyTable)
    .where(
      lang
        ? and(eq(vocabularyTable.userId, userId), eq(vocabularyTable.language, lang))
        : eq(vocabularyTable.userId, userId)
    )
    .orderBy(vocabularyTable.createdAt);

  res.json(ListVocabResponse.parse(items.map(formatVocab)));
});

router.get("/vocabulary/export.csv", requireAuth, async (req, res): Promise<void> => {
  const userId = req.userId;
  const lang = req.query.language as string | undefined;

  const items = await db
    .select()
    .from(vocabularyTable)
    .where(
      lang
        ? and(eq(vocabularyTable.userId, userId), eq(vocabularyTable.language, lang))
        : eq(vocabularyTable.userId, userId)
    )
    .orderBy(vocabularyTable.createdAt);

  const header = "Language,Word,Pinyin,Meaning,Example Sentence,Notes\n";
  const rows = items.map((v) => [
    v.language,
    `"${(v.word ?? "").replace(/"/g, '""')}"`,
    `"${(v.pinyin ?? "").replace(/"/g, '""')}"`,
    `"${(v.meaning ?? "").replace(/"/g, '""')}"`,
    `"${(v.exampleSentence ?? "").replace(/"/g, '""')}"`,
    `"${(v.notes ?? "").replace(/"/g, '""')}"`,
  ].join(","));

  const csv = header + rows.join("\n");
  const filename = lang ? `vocabulary_${lang}.csv` : "vocabulary.csv";

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.send("\uFEFF" + csv);
});

router.post("/vocabulary", requireAuth, async (req, res): Promise<void> => {
  const parsed = SaveVocabBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [item] = await db
    .insert(vocabularyTable)
    .values({
      userId: req.userId,
      language: parsed.data.language,
      supportLanguage: parsed.data.supportLanguage ?? "en",
      word: parsed.data.word,
      pinyin: parsed.data.pinyin ?? null,
      meaning: parsed.data.meaning,
      exampleSentence: parsed.data.exampleSentence ?? null,
      sourcePassageId: parsed.data.sourcePassageId ?? null,
      difficulty: parsed.data.difficulty ?? null,
      notes: parsed.data.notes ?? null,
      reviewed: false,
    })
    .returning();

  res.status(201).json(VocabItemResponse.parse(formatVocab(item)));
});

router.patch("/vocabulary/:id", requireAuth, async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  if (!id) { res.status(400).json({ error: "Invalid ID" }); return; }

  const parsed = UpdateVocabBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updates: Record<string, any> = {};
  if (parsed.data.notes !== undefined) updates.notes = parsed.data.notes;
  if (parsed.data.reviewed !== undefined) updates.reviewed = parsed.data.reviewed;

  const [item] = await db
    .update(vocabularyTable)
    .set(updates)
    .where(and(eq(vocabularyTable.id, id), eq(vocabularyTable.userId, req.userId)))
    .returning();

  if (!item) { res.status(404).json({ error: "Not found" }); return; }
  res.json(VocabItemResponse.parse(formatVocab(item)));
});

router.delete("/vocabulary/:id", requireAuth, async (req, res): Promise<void> => {
  const params = DeleteVocabParams.safeParse({ id: req.params.id });
  if (!params.success) { res.status(400).json({ error: "Invalid ID" }); return; }

  const [deleted] = await db
    .delete(vocabularyTable)
    .where(and(eq(vocabularyTable.id, params.data.id), eq(vocabularyTable.userId, req.userId)))
    .returning();

  if (!deleted) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ success: true });
});

function formatVocab(v: typeof vocabularyTable.$inferSelect) {
  return {
    ...v,
    supportLanguage: v.supportLanguage ?? "en",
    pinyin: v.pinyin ?? undefined,
    exampleSentence: v.exampleSentence ?? undefined,
    sourcePassageId: v.sourcePassageId ?? undefined,
    difficulty: v.difficulty ?? undefined,
    notes: v.notes ?? undefined,
  };
}

export default router;
