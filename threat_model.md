# Threat Model

## Project Overview

Koreader is a public web application for generating and storing AI-assisted Korean and Chinese reading practice content. The production stack is a React + Vite frontend at `/`, an Express 5 API at `/api`, PostgreSQL via Drizzle ORM, and OpenAI/Replit AI integrations for passage generation and word glossing.

The application uses email/password authentication with server-side sessions stored in PostgreSQL. The primary production assets are user accounts, session state, saved passages and vocabulary, and the AI/database credentials held by the backend.

## Assets

- **User accounts and sessions** — email addresses, password hashes, active session identifiers, and the session-signing secret. Compromise allows account takeover and access to private study data.
- **User study data** — saved passages, vocabulary entries, bookmarks, and notes. This is private user content and should only be visible to the owning account.
- **Application secrets** — `DATABASE_URL`, OpenAI/Replit AI credentials, and `SESSION_SECRET`. Exposure would let an attacker access the database, abuse AI billing, or forge authenticated sessions.
- **Backend service availability** — authenticated AI generation and gloss endpoints can consume external API quota and server resources; abuse can degrade service or create cost exposure.

## Trust Boundaries

- **Browser to API** — all client input crosses from an untrusted browser into the Express API. Authentication, authorization, and input validation must be enforced server-side.
- **API to PostgreSQL** — the backend has direct read/write access to users, passages, vocabulary, and sessions. Query scoping and parameter safety are critical.
- **API to external AI services** — the backend sends user-supplied prompts and context to OpenAI/Replit AI integrations. This boundary can amplify resource abuse and leak sensitive server-side context if mishandled.
- **Public to authenticated boundary** — health and auth bootstrap endpoints are public; passages, vocabulary, and gloss features require an authenticated session.
- **Production to dev-only boundary** — `artifacts/mockup-sandbox` is development-only and should be ignored unless production reachability is later demonstrated.

## Scan Anchors

- Production backend entry: `artifacts/api-server/src/index.ts`, `artifacts/api-server/src/app.ts`
- High-risk backend areas: `artifacts/api-server/src/routes/auth.ts`, `artifacts/api-server/src/routes/passages.ts`, `artifacts/api-server/src/routes/vocabulary.ts`, `artifacts/api-server/src/lib/openai.ts`
- Session/auth enforcement: `artifacts/api-server/src/middleware/requireAuth.ts`, `lib/api-client-react/src/custom-fetch.ts`
- Data model and ownership boundaries: `lib/db/src/schema/*.ts`
- Dev-only area: `artifacts/mockup-sandbox`

## Threat Categories

### Spoofing

The application relies on a cookie-backed server session to identify users. All protected API routes must require a valid session tied to a server-stored record, and the session-signing secret must be unpredictable and never fall back to a known default in production.

Login and signup endpoints are publicly reachable, so the application must resist account guessing and brute-force attempts. Session lifecycle events such as login and logout must not permit fixation or forged cookies.

### Tampering

The client can submit arbitrary JSON bodies for passage saves, bookmark changes, vocabulary updates, and AI generation requests. The backend must validate those bodies with Zod and enforce ownership in database writes using the authenticated user ID from the server session, never from client-supplied fields.

Because authenticated state is cookie-based, cross-origin request handling is security-sensitive. The API must not allow arbitrary websites to issue credentialed requests that can read or modify user data.

### Information Disclosure

Saved passages, vocabulary, notes, and account data are private per user. All read endpoints and exports must be scoped to `req.session.userId`, and responses or error messages must not expose internal secrets, stack traces, or other users' data.

The backend also holds database and AI credentials. Those secrets must stay server-side and must not be exposed through logs, client bundles, or misconfigured error handling.

### Denial of Service

The public auth endpoints and authenticated AI-generation endpoints can be abused to consume CPU, database capacity, and paid AI quota. The application must apply reasonable abuse controls, especially on login and signup, and should bound request sizes and expensive operations exposed to authenticated sessions.

### Elevation of Privilege

A user must never be able to access or mutate another user's passages or vocabulary by changing identifiers. Every route that reads or writes stored data must enforce ownership on the server side.

The application must also prevent session forgery, cross-origin credential abuse, and any injection paths that could turn user input into code, queries, or privileged backend actions.
