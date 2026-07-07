import type { RequestHandler } from "express";
import { sql } from "drizzle-orm";
import { db } from "@workspace/db";

export type QuotaType = "generate" | "gloss" | "tts";

const DEFAULTS: Record<QuotaType, number> = {
  generate: 100,
  gloss: 500,
  tts: 300,
};

const ENV_KEYS: Record<QuotaType, string> = {
  generate: "QUOTA_DAILY_GENERATE",
  gloss: "QUOTA_DAILY_GLOSS",
  tts: "QUOTA_DAILY_TTS",
};

function getDailyLimit(type: QuotaType): number {
  const raw = process.env[ENV_KEYS[type]];
  if (!raw) return DEFAULTS[type];
  const n = parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : DEFAULTS[type];
}

function utcMidnightTimestamp(): number {
  const now = new Date();
  return Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1);
}

async function incrementAndGet(userId: number, type: QuotaType): Promise<number> {
  if (type === "generate") {
    const r = await db.execute(sql`
      INSERT INTO daily_usage (user_id, date, generate_count, gloss_count, tts_count)
      VALUES (${userId}, CURRENT_DATE, 1, 0, 0)
      ON CONFLICT (user_id, date) DO UPDATE
      SET generate_count = daily_usage.generate_count + 1
      RETURNING generate_count
    `);
    return Number((r.rows[0] as any).generate_count);
  }
  if (type === "gloss") {
    const r = await db.execute(sql`
      INSERT INTO daily_usage (user_id, date, generate_count, gloss_count, tts_count)
      VALUES (${userId}, CURRENT_DATE, 0, 1, 0)
      ON CONFLICT (user_id, date) DO UPDATE
      SET gloss_count = daily_usage.gloss_count + 1
      RETURNING gloss_count
    `);
    return Number((r.rows[0] as any).gloss_count);
  }
  const r = await db.execute(sql`
    INSERT INTO daily_usage (user_id, date, generate_count, gloss_count, tts_count)
    VALUES (${userId}, CURRENT_DATE, 0, 0, 1)
    ON CONFLICT (user_id, date) DO UPDATE
    SET tts_count = daily_usage.tts_count + 1
    RETURNING tts_count
  `);
  return Number((r.rows[0] as any).tts_count);
}

export function quotaCheck(type: QuotaType): RequestHandler {
  return async (req, res, next) => {
    if (req.isAdmin) {
      return next();
    }

    const limit = getDailyLimit(type);

    try {
      const count = await incrementAndGet(req.userId, type);

      if (count > limit) {
        const resetMs = utcMidnightTimestamp();
        res.setHeader("X-Quota-Limit", limit);
        res.setHeader("X-Quota-Used", count);
        res.setHeader("X-Quota-Reset", Math.floor(resetMs / 1000));
        res
          .status(429)
          .json({
            error: `Daily ${type} quota exceeded. Limit is ${limit} per day. Resets at midnight UTC.`,
            quotaType: type,
            limit,
            used: count,
            resetAt: new Date(resetMs).toISOString(),
          });
        return;
      }

      next();
    } catch (err) {
      console.error(`[quota] Failed to check ${type} quota for user ${req.userId}:`, err);
      next();
    }
  };
}
