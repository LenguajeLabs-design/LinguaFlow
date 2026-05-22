import { pgTable, text, serial, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { usersTable } from "./users";
import { passagesTable } from "./passages";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const vocabularyTable = pgTable("vocabulary", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  language: text("language").notNull().default("ko"),
  word: text("word").notNull(),
  pinyin: text("pinyin"),
  meaning: text("meaning").notNull(),
  exampleSentence: text("example_sentence"),
  sourcePassageId: integer("source_passage_id").references(() => passagesTable.id, { onDelete: "set null" }),
  difficulty: text("difficulty"),
  notes: text("notes"),
  reviewed: boolean("reviewed").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertVocabularySchema = createInsertSchema(vocabularyTable).omit({ id: true, createdAt: true });
export type InsertVocabulary = z.infer<typeof insertVocabularySchema>;
export type VocabularyEntry = typeof vocabularyTable.$inferSelect;
