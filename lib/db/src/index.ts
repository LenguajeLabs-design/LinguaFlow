import { drizzle } from "drizzle-orm/node-postgres";
import { sql } from "drizzle-orm";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

const isProduction = process.env.NODE_ENV === "production";

// --- Database target selection ---------------------------------------
// This project intentionally uses TWO separate databases:
//   - Development: Replit's workspace Postgres, via DATABASE_URL.
//   - Production:  an external Supabase Postgres, via SUPABASE_DATABASE_URL.
//     Supabase is the single source of truth for production data.
//
// Replit also provisions its own "production" database (visible in the
// Publish UI and via prod DB inspection tools), but the app NEVER connects
// to it. It exists but is intentionally unused — do not be misled by it
// appearing "connected" in Replit's UI. See docs/database-topology.md.
//
// Guardrail: production must have SUPABASE_DATABASE_URL set. If it's
// missing, we fail loudly at startup instead of silently falling back to
// DATABASE_URL (which in production would point at Replit's unused DB and
// look "healthy" while actually being the wrong, empty database).
if (isProduction && !process.env.SUPABASE_DATABASE_URL) {
  throw new Error(
    "SUPABASE_DATABASE_URL is not set in production. Production must use " +
      "Supabase — refusing to silently fall back to DATABASE_URL (Replit's " +
      "database), which would serve empty/wrong data. Set SUPABASE_DATABASE_URL " +
      "before starting the server in production.",
  );
}

const connectionString = isProduction
  ? process.env.SUPABASE_DATABASE_URL
  : process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

function describeDbTarget(): string {
  if (isProduction) return "Supabase production (source of truth)";
  return "development workspace DB";
}

// Safe startup log: names which target is active, without leaking any
// part of the connection string/credentials.
console.log(`[db] Using ${describeDbTarget()} (NODE_ENV=${process.env.NODE_ENV ?? "development"})`);

export const pool = new Pool({
  connectionString,
  ssl: connectionString?.includes("supabase") ? { rejectUnauthorized: false } : undefined,
  max: 10,
  connectionTimeoutMillis: 10_000,
  idleTimeoutMillis: 30_000,
});
export const db = drizzle(pool, { schema });

function getDatabaseHost(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return "unknown";
  }
}

export async function ensureDatabaseReady(): Promise<void> {
  const host = getDatabaseHost(connectionString as string);

  if (isProduction && host === "helium") {
    throw new Error(
      "Production database is misconfigured: DATABASE_URL points to the dev-only host 'helium'. Provision a production database (or set SUPABASE_DATABASE_URL) before serving traffic.",
    );
  }

  try {
    await db.execute(sql`select 1`);
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS daily_usage (
        user_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        date      DATE    NOT NULL DEFAULT CURRENT_DATE,
        generate_count INTEGER NOT NULL DEFAULT 0,
        gloss_count    INTEGER NOT NULL DEFAULT 0,
        tts_count      INTEGER NOT NULL DEFAULT 0,
        PRIMARY KEY (user_id, date)
      )
    `);
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS quota_events (
        id         SERIAL PRIMARY KEY,
        user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        feature    TEXT    NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS quota_events_user_id_idx ON quota_events (user_id)
    `);
  } catch (err) {
    const code = (err as { code?: string; cause?: { code?: string } })?.code
      ?? (err as { cause?: { code?: string } })?.cause?.code;

    if (isProduction && (code === "EAI_AGAIN" || code === "ENOTFOUND")) {
      throw new Error(
        `Production database is unreachable due to DNS resolution failure. Host: ${host}. If this host is dev-only or Replit has not provisioned a production database yet, fix the production DATABASE_URL/PGHOST secret or complete database provisioning.`,
      );
    }

    throw err;
  }
}

export * from "./schema";
