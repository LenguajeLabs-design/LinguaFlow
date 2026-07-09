---
name: No-Prod-DB Provisioning Gotcha
description: Replit doesn't always auto-provision a production Postgres DB for a Repl; a "broken in prod but works in dev" symptom can simply mean prod has no database at all.
---

If a deployed app has broken auth/data features that work fine in dev, check whether a production database actually exists before assuming a code bug. It's possible no production Postgres was ever provisioned for the Repl, so `DATABASE_URL` in production is unset/invalid or silently falls through.

**Why:** In this project, "auth/generation broken in production" was fully explained by there being zero production database — not a code defect. Time was saved once this was checked directly instead of debugging app logic.

**How to apply:** When production behavior diverges from dev around anything DB-backed, first confirm a real prod DB is provisioned and reachable (e.g. via the database skill with `environment: "production"`, or by inspecting which env var the prod build actually uses for its connection string). Only move on to app-level debugging once the DB's existence and connectivity are confirmed. If no prod DB exists, provisioning one (e.g. via Supabase or another external Postgres) and wiring the app to use it in production (while keeping dev on its existing DB) is a viable fix.

Related: when importing/backfilling data into a fresh DB where original foreign keys (e.g. `user_id`) don't resolve, inserting with a null/unowned FK is reversible — just remember any user-scoped API route (e.g. `GET /passages`) will filter those rows out by design until they're reassigned to a real user id after that user exists in the target DB.

**Dual-"production"-database drift:** if the app's db package prefers an external secret (e.g. `SUPABASE_DATABASE_URL`) over `DATABASE_URL` when `NODE_ENV=production`, that external DB is what the deployed app actually talks to — but Replit's own schema-diff-on-publish and the `executeSql environment:"production"` tool both operate on whichever DB `DATABASE_URL` resolves to, which can be a completely different (unused) Replit-managed Postgres. This causes `column "x" does not exist` errors in the live app even though `executeSql environment:"production"` shows the column present, because it's checking the wrong database.

**Why:** `drizzle-kit push` (and Replit's publish-time diff) only updates whatever `DATABASE_URL` points to at that moment; it doesn't know about a separate connection string the app branches to at runtime. Schema drift between the two DBs is silent until a real user request fails.

**How to apply:** When "prod schema looks fine but the live app still errors" on a DB-backed feature, grep the db package's connection logic for `isProduction` branching around alternate secrets (e.g. `SUPABASE_DATABASE_URL`). If found, push schema directly to that secret's value: `DATABASE_URL="$SUPABASE_DATABASE_URL" npx drizzle-kit push --force --config <path>/drizzle.config.ts`. Verify by reproducing the exact failing query with the same connection string/SSL options the deployed app uses (not just via the generic prod-query tool).
