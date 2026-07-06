import { drizzle } from "drizzle-orm/node-postgres";
import { sql } from "drizzle-orm";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });

const isProduction = process.env.NODE_ENV === "production";

function getDatabaseHost(connectionString: string): string {
  try {
    return new URL(connectionString).hostname;
  } catch {
    return "unknown";
  }
}

export async function ensureDatabaseReady(): Promise<void> {
  const host = getDatabaseHost(process.env.DATABASE_URL as string);

  if (isProduction && host === "helium") {
    throw new Error(
      "Production database is misconfigured: DATABASE_URL points to the dev-only host 'helium'. Provision a production database and update the production secret before serving traffic.",
    );
  }

  try {
    await db.execute(sql`select 1`);
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
