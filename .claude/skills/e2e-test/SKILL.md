---
name: e2e-test
description: Run end-to-end tests against a real Crowdin OTA distribution using a hash from .env. Use when you want to verify that changes to the OTA client still work against actual CDN content.
argument-hint: "optional method name(s), e.g. getStrings or getStringByKey getLanguageTranslations"
---

# E2E Test — Crowdin OTA Client

Exercise the client's public methods against a real distribution on the Crowdin CDN
(`https://distributions.crowdin.net`). Requires a `.env` file with a valid `DISTRIBUTION_HASH`.

A distribution hash is the id of a released Crowdin project distribution (what you pass to
`new OtaClient(hash)`). Only released, public CDN content is read — no token or account is needed.

The test runner is bundled alongside this skill: [`e2e-test.cjs`](./e2e-test.cjs). It builds nothing
itself — it imports the compiled client from `out/` and calls each public method, auto-discovering a
language, file, and strings key from the distribution's manifest.

## Public methods it exercises

- Helper: `getHash`, `getManifestTimestamp`, `listLanguages`, `getCurrentLocale` / `setCurrentLocale`, `clearStringsCache`
- Content: `getContent`, `getLanguageContent`, `getTranslations`, `getLanguageTranslations`, `getFileTranslations`
- Strings: `getStrings`, `getStringsByLocale`, `getStringByKey`

## Steps

Follow these steps exactly. Run everything from the repo root.

**1. Validate the hash**

Read `.env`. If the file is missing or `DISTRIBUTION_HASH` is empty, stop and tell the user:
> Create `.env` from `.env.example` and set `DISTRIBUTION_HASH` to a released distribution hash.

Never echo the hash value in your output — refer to it as `[MASKED]`.

**2. Determine what to test**

List any changed `src/` files first, so the summary can flag which are covered:

    git diff --name-only -- src
    git diff --name-only HEAD~1 HEAD -- src

- If `$ARGUMENTS` is empty, run the full suite (all public methods).
- If `$ARGUMENTS` lists one or more method names, pass them as CLI args to the runner — it runs only
  those (plus the manifest discovery the arg-based methods depend on).
- If `$ARGUMENTS` is empty but there are changed `src/` files, still run the full suite — it covers
  every public method, which is the point of the safety check — but call out in the summary which
  tested methods are defined in the changed files.

**3. Build**

Run `pnpm run build`. If it fails, stop and show the error — do not proceed. The runner imports the
built `out/index.js`, so a stale build would hide regressions.

**4. Run the test**

Execute the bundled runner with Node's built-in `--env-file` to load `DISTRIBUTION_HASH` from `.env`
(Node >=20.6; CI runs 22/24). This is a single command — no shell pipes or `&&`, so it won't trip
permission prompts. Pass any `$ARGUMENTS` method names as CLI args:

```
node --env-file=.env .claude/skills/e2e-test/e2e-test.cjs $ARGUMENTS
```

Show all output verbatim. The runner exits non-zero if any method fails.

**5. Summarize**

List each method tested with ✓ / ✗, note any skipped (and why — e.g. no json strings in the
distribution), and state whether the run is safe (all green) or surfaced a regression. If step 2
found changed `src/` files, call out which changed methods were covered.
