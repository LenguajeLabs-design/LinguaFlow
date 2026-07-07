import { drizzle } from "drizzle-orm/node-postgres";
import { sql } from "drizzle-orm";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

const isProduction = process.env.NODE_ENV === "production";

const connectionString =
  isProduction && process.env.SUPABASE_DATABASE_URL
    ? process.env.SUPABASE_DATABASE_URL
    : process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

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
