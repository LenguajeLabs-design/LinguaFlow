---
name: Target language vs support language separation
description: Pattern for apps that generate content in a "target" learning language but explain it in a separate "support" language.
---

When a language-learning app needs to add a new target language, keep a separate `supportLanguage` concept (the language used to explain vocab/grammar) distinct from the target language.

**Why:** Users learning language X don't always want explanations in English — e.g. a Spanish speaker learning Korean wants explanations in Spanish, not English. Conflating the two forces awkward workarounds later.

**How to apply:**
- Store support language client-side only (e.g. localStorage) unless the product explicitly wants it synced across devices — avoids unnecessary profile/DB schema churn.
- Default support language to `'en'` for backward compatibility with existing rows/users.
- When adding a support language column to existing DB tables, default it to `'en'` so old rows remain valid without a backfill migration.
- Pass support language through every generation/gloss/vocab endpoint explicitly rather than inferring it from the target language.
