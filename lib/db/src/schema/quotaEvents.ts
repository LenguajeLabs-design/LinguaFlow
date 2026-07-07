import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const quotaEventsTable = pgTable("quota_events", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  feature: text("feature").notNull(), // 'generate' | 'gloss' | 'tts'
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type QuotaEvent = typeof quotaEventsTable.$inferSelect;
