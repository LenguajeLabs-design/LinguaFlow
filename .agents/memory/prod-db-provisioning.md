---
name: No-Prod-DB Provisioning Gotcha
description: Replit doesn't always auto-provision a production Postgres DB for a Repl; a "broken in prod but works in dev" symptom can simply mean prod has no database at all.
---

If a deployed app has broken auth/data features that work fine in dev, check whether a production database actually exists before assuming a code bug. It's possible no production Postgres was ever provisioned for the Repl, so `DATABASE_URL` in production is unset/invalid or silently falls through.

**Why:** In this project, "auth/generation broken in production" was fully explained by there being zero production database — not a code defect. Time was saved once this was checked directly instead of debugging app logic.

**How to apply:** When production behavior diverges from dev around anything DB-backed, first confirm a real prod DB is provisioned and reachable (e.g. via the database skill with `environment: "production"`, or by inspecting which env var the prod build actually uses for its connection string). Only move on to app-level debugging once the DB's existence and connectivity are confirmed. If no prod DB exists, provisioning one (e.g. via Supabase or another external Postgres) and wiring the app to use it in production (while keeping dev on its existing DB) is a viable fix.

Related: when importing/backfilling data into a fresh DB where original foreign keys (e.g. `user_id`) don't resolve, inserting with a null/unowned FK is reversible — just remember any user-scoped API route (e.g. `GET /passages`) will filter those rows out by design until they're reassigned to a real user id after that user exists in the target DB.
