# API Server — Deployment Notes

## Clerk key behaviour in Replit

Replit-managed Clerk automatically swaps publishable keys between environments:

| Environment | Publishable key prefix | Set by |
|-------------|----------------------|--------|
| Development | `pk_test_*` | Stored secret (`CLERK_PUBLISHABLE_KEY`) |
| Production  | `pk_live_*` | Injected by Replit at publish time |

**The stored secret always holds the test key.** The live key is injected into the running process only at publish time — it is never visible in the secrets UI.

### Why the backend must resolve keys by host

The frontend Clerk SDK calls `publishableKeyFromHost(hostname, fallbackKey)` to
resolve the correct key at runtime. The backend **must do the same**. If the
backend uses a static `process.env.CLERK_PUBLISHABLE_KEY`, it will validate
tokens against the test key even in production — causing every authenticated
request to return **401 Unauthorized**.

The correct backend wiring (already in `src/app.ts`):

```ts
import { publishableKeyFromHost } from "@clerk/shared/keys";
import { getClerkProxyHost } from "./middlewares/clerkProxyMiddleware";

app.use(
  clerkMiddleware((req) => ({
    publishableKey: publishableKeyFromHost(
      getClerkProxyHost(req) ?? "",
      process.env.CLERK_PUBLISHABLE_KEY,
    ),
  })),
);
```

`@clerk/shared` must be an **explicit direct dependency** of the api-server
package — it is a peer dep of `@clerk/express` and is not automatically hoisted.

### Startup fast-fail

`src/index.ts` calls `checkAuthConfig()` before binding the port. In production,
if `CLERK_PUBLISHABLE_KEY` does not start with `pk_live_`, the process exits
immediately with a clear error rather than silently failing auth at runtime.

---

## Post-publish smoke test checklist

Run these steps after every publish to confirm auth is end-to-end healthy.

1. **Sign in** — open the published app and sign in with a real account. Confirm
   you land on the Library page without a redirect loop or error banner.

2. **Verify authenticated API** — open the browser DevTools → Network tab,
   reload the Library page, and confirm `GET /api/passages` returns **200**.
   Alternatively hit the protected endpoint directly while signed in:

   ```
   GET https://<your-app>.replit.app/api/auth/verify
   ```

   Expected response:
   ```json
   { "ok": true, "userId": <number> }
   ```

   A **401** here means Clerk key resolution is broken (check server startup
   logs for the `[auth]` lines). A **500** means the DB lookup failed.

3. **Open a passage** — tap any story in the Library. Confirm it loads and
   vocabulary annotations appear.

4. **Generate a new passage** — use the Generate button, pick a topic, confirm
   the passage saves and appears in the Library.

5. **Reload after generate** — hard-refresh the Library and confirm the new
   passage persists (rules out a session/cache-only illusion).

---

## Reading auth logs

All auth events are prefixed `[auth]` in server logs.

| Log message | Meaning |
|---|---|
| `[auth] Clerk config OK — key-type=live` | Startup: everything is wired correctly |
| `[auth] FATAL: Non-live Clerk key in production` | Startup: key mismatch — process exits |
| `[auth] 401: token present but Clerk validation failed` | Runtime: token exists but invalid — key mismatch or expired |
| `[auth] 500: Clerk user lookup failed after token validated` | Runtime: `CLERK_SECRET_KEY` wrong or Clerk API down |
| `[auth] 500: DB user lookup/provision failed` | Runtime: database connectivity issue |
