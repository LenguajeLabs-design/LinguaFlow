import { Router, type IRouter } from "express";
import { sql } from "drizzle-orm";
import { db } from "@workspace/db";
import { requireAuth } from "../middleware/requireAuth";

const router: IRouter = Router();

function adminOnly(req: any, res: any, next: any) {
  if (!req.isAdmin) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  next();
}

router.get("/admin/stats", requireAuth, adminOnly, async (_req, res) => {
  try {
    const [summaryRow] = (await db.execute(sql`
      SELECT
        (SELECT COUNT(*)::int FROM users)                           AS total_users,
        COALESCE((SELECT SUM(generate_count)::int FROM daily_usage), 0) AS total_generations,
        COALESCE((SELECT SUM(gloss_count)::int    FROM daily_usage), 0) AS total_gloss,
        COALESCE((SELECT SUM(tts_count)::int      FROM daily_usage), 0) AS total_tts,
        (SELECT COUNT(*)::int FROM vocabulary)                     AS total_vocab_saves
    `)).rows as any[];

    const topUsersRows = (await db.execute(sql`
      SELECT
        u.id                                                   AS user_id,
        u.email,
        COALESCE(SUM(d.generate_count), 0)::int               AS generate_total,
        COALESCE(SUM(d.gloss_count),    0)::int               AS gloss_total,
        COALESCE(SUM(d.tts_count),      0)::int               AS tts_total,
        (SELECT COUNT(*)::int FROM vocabulary v WHERE v.user_id = u.id) AS vocab_saves
      FROM users u
      LEFT JOIN daily_usage d ON d.user_id = u.id
      GROUP BY u.id, u.email
      ORDER BY
        (COALESCE(SUM(d.generate_count), 0)
          + COALESCE(SUM(d.gloss_count), 0)
          + COALESCE(SUM(d.tts_count),   0)) DESC
      LIMIT 50
    `)).rows as any[];

    const limitEventRows = (await db.execute(sql`
      SELECT
        qe.user_id,
        u.email,
        qe.feature,
        qe.created_at AS hit_at
      FROM quota_events qe
      JOIN users u ON u.id = qe.user_id
      ORDER BY qe.created_at DESC
      LIMIT 100
    `)).rows as any[];

    res.json({
      summary: {
        totalUsers:       Number(summaryRow.total_users       ?? 0),
        totalGenerations: Number(summaryRow.total_generations ?? 0),
        totalGloss:       Number(summaryRow.total_gloss       ?? 0),
        totalTts:         Number(summaryRow.total_tts         ?? 0),
        totalVocabSaves:  Number(summaryRow.total_vocab_saves ?? 0),
      },
      topUsers: topUsersRows.map((r) => ({
        userId:        Number(r.user_id),
        email:         String(r.email),
        generateTotal: Number(r.generate_total),
        glossTotal:    Number(r.gloss_total),
        ttsTotal:      Number(r.tts_total),
        vocabSaves:    Number(r.vocab_saves),
      })),
      recentLimitEvents: limitEventRows.map((r) => ({
        userId:  Number(r.user_id),
        email:   String(r.email),
        feature: String(r.feature),
        hitAt:   r.hit_at instanceof Date ? r.hit_at.toISOString() : String(r.hit_at),
      })),
    });
  } catch (err) {
    console.error("[admin] Stats query failed:", err);
    res.status(500).json({ error: "Failed to load stats" });
  }
});

export default router;
