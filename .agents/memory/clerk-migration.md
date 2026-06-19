---
name: Clerk Auth Migration
description: How LinguaFlow migrated from bcrypt/express-session to Clerk, and key decisions made along the way.
---

## Key decisions

**JIT provisioning by email**: When a Clerk user first hits a protected API route, `requireAuth` looks them up by `clerkId`. If not found, fetches email from Clerk backend and does an email-match against existing bcrypt users — linking accounts automatically. This preserves integer `userId` for all existing FK relationships.

**`@clerk/shared/keys` subpath unavailable in tsx**: When `@clerk/express` is installed but `@clerk/shared` is not a direct dep, `import { publishableKeyFromHost } from "@clerk/shared/keys"` fails at runtime. Fix: use `clerkMiddleware({ publishableKey: process.env.CLERK_PUBLISHABLE_KEY })` directly — sufficient for single-domain apps.

**Why:** The shared package is a peer dep of @clerk/express, not automatically hoisted to api-server's scope.

**How to apply:** If publishableKeyFromHost is needed in future (multi-domain), add `@clerk/shared` as a direct dep of api-server first.

## DB schema change
- `users.clerk_id TEXT UNIQUE` (nullable) — Clerk user ID
- `users.password_hash` — made nullable (existing bcrypt hashes stay, Clerk users have null)

## Client setup
- `@clerk/react/internal` exports `publishableKeyFromHost` — works fine on frontend
- `proxyUrl={clerkProxyUrl}` is unconditional (empty in dev, auto-set in prod)
- CSS requires `@layer theme, base, clerk, components, utilities;` BEFORE `@import "tailwindcss"`
- Vite requires `tailwindcss({ optimize: false })` to prevent layer reordering in prod
