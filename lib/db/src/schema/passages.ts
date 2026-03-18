import { pgTable, text, serial, timestamp, boolean, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const passagesTable = pgTable("passages", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  topic: text("topic").notNull(),
  difficulty: text("difficulty").notNull(),
  length: text("length").notNull(),
  vocabularyFocus: text("vocabulary_focus"),
  grammarFocus: text("grammar_focus"),
  readingStyle: text("reading_style").notNull(),
  koreanText: text("korean_text").notNull(),
  sentences: jsonb("sentences").notNull().$type<Array<{ korean: string; english: string }>>(),
  vocabulary: jsonb("vocabulary").notNull().$type<Array<{ korean: string; romanization: string; english: string; partOfSpeech: string; exampleSentence?: string }>>(),
  imageUrls: text("image_urls").array().notNull().default([]),
  isBookmarked: boolean("is_bookmarked").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertPassageSchema = createInsertSchema(passagesTable).omit({ id: true, createdAt: true });
export type InsertPassage = z.infer<typeof insertPassageSchema>;
export type Passage = typeof passagesTable.$inferSelect;
