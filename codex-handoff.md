# LinguaFlow — Production DB Failure: Handoff for Codex

Repo: https://github.com/LenguajeLabs-design/LinguaFlow

## Symptom (user-facing)

On the **published/production** app only (`https://linguaflow-app.replit.app`):
- Library page shows: "Failed to load library. Please try again."
- "Generate Korean Passage" (and other language generators) fail to generate.
- Login via Clerk works fine — only data-backed features fail.
- **Development environment works correctly** — this is production-only.

## Root cause identified so far

Every authenticated API request goes through `requireAuth` middleware, which does a DB lookup (`select ... from users where clerk_id = $1`) before anything else runs. In production, that query throws:

```
code: 'EAI_AGAIN'
cause: Error: getaddrinfo EAI_AGAIN helium
```

This is a DNS resolution failure for hostname `helium`, which is Replit's **development-only** internal Postgres hostname (confirmed: `PGHOST=helium`, `PGDATABASE=heliumdb` in the dev container). This hostname is not resolvable from the deployed/production runtime — by design, per Replit's own docs, "Helium" databases are dev-container-scoped.

Since `DATABASE_URL`/`PGHOST`/etc. are Replit **secrets** (not per-environment env vars), the same connection string is used in both dev and prod unless Replit's deploy pipeline provisions and injects a separate production database automatically.

**Confirmed via Replit's own tooling:** querying the production database directly returns:
```
PRODUCTION_DATABASE_ERROR: Repl 2d3d85b1-1360-4c92-ac25-fbb35e6a583d does not have a production Neon database. Deploy your app first to create a production database.
```
This message persisted even immediately after republishing the app multiple times. The Replit "Database" pane in the workspace only shows a "Development Database" — no production database section or creation option is exposed in the UI for this repl.

## What has already been ruled out (do not re-investigate these)

- **Not a code/logic bug.** The `requireAuth` middleware, the `usersTable`/`passagesTable` schema, and the `/api/passages` and `/api/passages/generate` routes are all correct. The error occurs at the DB connection layer, before any app logic runs.
- **Not a `.replit` config issue.** `modules = ["nodejs-24", "postgresql-16"]` is correctly declared.
- **Not fixed by republishing.** Republished twice; error is identical and immediate both times.
- **Not an OpenAI/API-key issue.** Story generation fails at the same `requireAuth` DB step, before it ever reaches the OpenAI call.

## Relevant files (for context, not because they need code changes)

- `artifacts/api-server/src/middleware/requireAuth.ts` — does the failing DB lookup
- `artifacts/api-server/src/routes/passages.ts` — `/api/passages` (library) and `/api/passages/generate` (story generation), both gated by `requireAuth`
- `lib/db/src/index.ts` — Postgres connection setup (`new Pool({ connectionString: process.env.DATABASE_URL })`) — generic, correct, nothing prod-specific here
- `.replit` — deployment target `autoscale`, Postgres module declared

## What I'd like Codex to help with

This looks like a **Replit platform-side provisioning gap** (production Neon database never created for this repl despite successful builds), not something fixable purely by editing application code. Please:

1. **Verify my diagnosis is correct** by re-reading `requireAuth.ts`, `lib/db/src/index.ts`, and the deployment config — confirm there's no code-side misconfiguration causing the wrong hostname to be used in production (e.g. hardcoded fallback, wrong env var name, missing `NODE_ENV` branching for connection string selection).
2. **Add resilience/observability** regardless of root cause: e.g., a clearer startup-time check that fails loudly with a specific message like "Production database is unreachable — DATABASE_URL points to a dev-only host" instead of the generic `EAI_AGAIN` propagating through `requireAuth`. This will make the issue immediately diagnosable without deployment log spelunking if it recurs.
3. **If you have access to Replit's support/infra escalation path**, or the repo owner does, escalate the specific error `"Repl <repl-id> does not have a production Neon database. Deploy your app first to create a production database"` occurring after multiple successful publishes — this is very likely a Replit-side provisioning bug, not something a code change can resolve.

## Repl ID (for support escalation)

`2d3d85b1-1360-4c92-ac25-fbb35e6a583d`
