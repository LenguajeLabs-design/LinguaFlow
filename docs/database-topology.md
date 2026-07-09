# Database topology (read before touching DB config)

This project has **three** Postgres databases in play. Only two are actually used.

| # | Database | Env var | Used by | Status |
|---|----------|---------|---------|--------|
| 1 | Dev workspace DB (Replit) | `DATABASE_URL` (host `helium`) | Local development only | Active — dev data lives here |
| 2 | Replit-provisioned "production" DB | `DATABASE_URL` (prod value, shown in Replit's Publish UI / prod DB inspection tools) | Nothing | **Unused** — intentionally bypassed by app code |
| 3 | Supabase | `SUPABASE_DATABASE_URL` | Production deployment | **Source of truth for production data** |

## The rule

`lib/db/src/index.ts` selects the connection target like this:

- `NODE_ENV=production` → always use `SUPABASE_DATABASE_URL`.
- Otherwise (dev) → use `DATABASE_URL`.

Production **never** falls back to `DATABASE_URL`. If `SUPABASE_DATABASE_URL` is missing when `NODE_ENV=production`, the server refuses to start rather than silently serving from the wrong (empty) database.

## Why database #2 (Replit's own production DB) looks "connected" but is empty

Replit's Publish flow provisions its own managed Postgres for the deployment, and the "Production database connected" banner and any prod-DB inspection tooling refer to *that* database. It's correctly provisioned and reachable — it's just never written to, because the application code always prefers Supabase in production. Seeing 0 rows there is expected, not a bug.

**Do not** try to "fix" this by pointing production at database #2, and do not delete it as a fix for confusion — see recommendation below.

## Startup logging

On boot, the server logs which target it's using, without ever printing the connection string or credentials:

```
[db] Using Supabase production (source of truth) (NODE_ENV=production)
[db] Using development workspace DB (NODE_ENV=development)
```

## Recommendation for database #2 (the unused Replit production DB)

It's safe to simply **ignore** it — it costs nothing functionally and the app never touches it, so it can't cause data drift going forward now that the guardrail above exists. There isn't a dedicated Replit setting to "disable" an autoscale deployment's attached Postgres without affecting the deployment itself, so removing it isn't worth the risk. If it becomes distracting when checking data, the simplest mental model is: **"if it's not in Supabase, it's not real production data."**

## If you ever want to consolidate to a single database

That would mean either (a) migrating Supabase's data into Replit's Postgres and switching production to `DATABASE_URL`, or (b) formally retiring Replit's provisioned production DB. Both are data-affecting decisions and should be done deliberately, not as a side effect of a config cleanup — not done here.
