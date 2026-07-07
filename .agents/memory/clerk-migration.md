---
name: Clerk Auth Migration
description: How LinguaFlow migrated from bcrypt/express-session to Clerk, and key decisions made along the way.
---

## Key decisions

**JIT provisioning by email**: When a Clerk user first hits a protected API route, `requireAuth` looks them up by `clerkId`. If not found, fetches email from Clerk backend and does an email-match against existing bcrypt users — linking accounts automatically. This preserves integer `userId` for all existing FK relationships.

**`@clerk/shared` must be a direct dep of api-server**: `publishableKeyFromHost` from `@clerk/shared/keys` is required in the backend `clerkMiddleware` — even for single-domain apps. In production, Replit swaps test→live Clerk keys; the static `CLERK_PUBLISHABLE_KEY` stays as `pk_test_*` on the server. Without `publishableKeyFromHost((req)=>...)`, the backend can't validate tokens issued by the live key → 401 on all authenticated requests in production.

**Why:** `@clerk/shared` is a peer dep of `@clerk/express`, not auto-hoisted. Must be installed explicitly: `pnpm --filter @workspace/api-server add @clerk/shared`.

**How to apply:** Use canonical `clerkMiddleware((req) => ({ publishableKey: publishableKeyFromHost(getClerkProxyHost(req) ?? "", process.env.CLERK_PUBLISHABLE_KEY) }))` — this is required for all deployments, not just multi-domain.

## DB schema change
- `users.clerk_id TEXT UNIQUE` (nullable) — Clerk user ID
- `users.password_hash` — made nullable (existing bcrypt hashes stay, Clerk users have null)

## Client setup
- `@clerk/react/internal` exports `publishableKeyFromHost` — works fine on frontend
- `proxyUrl={clerkProxyUrl}` is unconditional (empty in dev, auto-set in prod)
- CSS requires `@layer theme, base, clerk, components, utilities;` BEFORE `@import "tailwindcss"`
- Vite requires `tailwindcss({ optimize: false })` to prevent layer reordering in prod
