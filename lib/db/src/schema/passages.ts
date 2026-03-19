import { pgTable, text, serial, timestamp, boolean, integer, jsonb, foreignKey } from "drizzle-orm/pg-core";
import { usersTable } from "./users";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export interface PassageSentence {
  korean: string;
  english: string;
}

export interface VocabularyItem {
  korean: string;
  romanization: string;
  english: string;
  partOfSpeech: string;
  exampleSentence?: string;
}

export interface ComprehensionQuestion {
  question: string;
  answer: string;
}

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
  summary: text("summary"),
  sentences: jsonb("sentences").notNull().$type<PassageSentence[]>(),
  vocabulary: jsonb("vocabulary").notNull().$type<VocabularyItem[]>(),
  comprehensionQuestions: jsonb("comprehension_questions").$type<ComprehensionQuestion[]>(),
  imageUrls: text("image_urls").array().notNull().default([]),
  userId: integer("user_id").references(() => usersTable.id, { onDelete: "cascade" }),
  isBookmarked: boolean("is_bookmarked").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertPassageSchema = createInsertSchema(passagesTable).omit({ id: true, createdAt: true });
export type InsertPassage = z.infer<typeof insertPassageSchema>;
export type Passage = typeof passagesTable.$inferSelect;
