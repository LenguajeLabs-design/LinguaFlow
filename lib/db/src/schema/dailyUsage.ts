import { pgTable, integer, date, primaryKey } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const dailyUsageTable = pgTable(
  "daily_usage",
  {
    userId: integer("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    date: date("date").notNull(),
    generateCount: integer("generate_count").notNull().default(0),
    glossCount: integer("gloss_count").notNull().default(0),
    ttsCount: integer("tts_count").notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.userId, t.date] })],
);

export type DailyUsage = typeof dailyUsageTable.$inferSelect;
