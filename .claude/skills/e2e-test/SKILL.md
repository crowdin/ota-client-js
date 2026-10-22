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

## Public methods this skill can exercise

Auto-discovers a language, file, and strings key from the distribution's manifest, then calls:

- Helper: `getHash`, `getManifestTimestamp`, `listLanguages`, `getCurrentLocale` / `setCurrentLocale`, `clearStringsCache`
- Content: `getContent`, `getLanguageContent`, `getTranslations`, `getLanguageTranslations`, `getFileTranslations`
- Strings: `getStrings`, `getStringsByLocale`, `getStringByKey`

## Steps

Follow these steps exactly:

**1. Validate the hash**

Read `.env`. If the file is missing or `DISTRIBUTION_HASH` is empty, stop and tell the user:
> Create `.env` from `.env.example` and set `DISTRIBUTION_HASH` to a released distribution hash.

Never echo the hash value in your output — refer to it as `[MASKED]`.

**2. Determine what to test**

List any changed `src/` files first, so the summary can flag which are covered:

    git diff --name-only -- src
    git diff --name-only HEAD~1 HEAD -- src

- If `$ARGUMENTS` is empty, run the full suite (all public methods).
- If `$ARGUMENTS` lists one or more method names, run only those (plus the manifest discovery that
  the arg-based methods depend on). Pass them as CLI args to the scratch script below.
- If `$ARGUMENTS` is empty but there are changed `src/` files, still run the full suite —
  it covers every public method, which is the point of the safety check — but call out in the summary
  which tested methods are defined in the changed files.

**3. Build**

Run `pnpm run build`. If it fails, stop and show the error — do not proceed. The scratch script
imports the built `out/index.js`, so stale builds would hide regressions.

**4. Write the test script**

Write a file `e2e-scratch.cjs` with exactly this content:

```js
const OtaClient = require('./out/index.js').default;

const distributionHash = process.env.DISTRIBUTION_HASH;
if (!distributionHash) {
    console.error('✗ DISTRIBUTION_HASH not set in environment');
    process.exit(1);
}

// Optional method filter passed as CLI args; empty = run everything.
const only = process.argv.slice(2);
const want = (name) => only.length === 0 || only.includes(name);

const client = new OtaClient(distributionHash);

let failures = 0;
function summarize(value) {
    if (value === null || value === undefined) return String(value);
    if (Array.isArray(value)) return `array(${value.length})`;
    if (typeof value === 'object') return `object(${Object.keys(value).length} keys)`;
    const s = String(value);
    return s.length > 60 ? s.slice(0, 60) + '…' : s;
}
async function check(name, fn) {
    if (!want(name)) return undefined;
    try {
        const res = await fn();
        console.log(`✓ ${name} — ${summarize(res)}`);
        return res;
    } catch (e) {
        failures++;
        console.error(`✗ ${name} — ${e && e.message ? e.message : e}`);
        return undefined;
    }
}

async function run() {
    // Sync helpers
    if (want('getHash')) console.log(`✓ getHash — ${summarize(client.getHash())}`);

    // Manifest-level reads
    await check('getManifestTimestamp', () => client.getManifestTimestamp());

    // Fetch content + languages once. These drive discovery for every language-, file-, and
    // strings-scoped method, so fetch them even when the filter excludes them; report them as
    // checks only when requested.
    let content, languages;
    try {
        content = await client.getContent();
        if (want('getContent')) console.log(`✓ getContent — ${summarize(content)}`);
    } catch (e) {
        if (want('getContent')) { failures++; console.error(`✗ getContent — ${e && e.message ? e.message : e}`); }
    }
    try {
        languages = await client.listLanguages();
        if (want('listLanguages')) console.log(`✓ listLanguages — ${summarize(languages)}`);
    } catch (e) {
        if (want('listLanguages')) { failures++; console.error(`✗ listLanguages — ${e && e.message ? e.message : e}`); }
    }

    // Discover a language / file to drive language- and file-scoped methods.
    const lang = Array.isArray(languages) && languages.length ? languages[0] : undefined;
    const files = content && lang ? content[lang] || [] : [];
    const file = files[0];
    if (lang) console.log(`  (discovered language: ${lang}${file ? `, file: ${file}` : ''})`);
    else console.log('  (no languages found in manifest — language/file/strings methods will be skipped)');

    if (lang) {
        await check('getLanguageContent', () => client.getLanguageContent(lang));
        await check('getLanguageTranslations', () => client.getLanguageTranslations(lang));
    }
    if (file) {
        await check('getFileTranslations', () => client.getFileTranslations(file));
    }
    await check('getTranslations', () => client.getTranslations());

    // Strings methods (json-based files only)
    await check('getStrings', () => client.getStrings());

    // getStringsByLocale's result also seeds getStringByKey's key discovery, so fetch it when
    // either is requested; report it as a check only when getStringsByLocale itself is requested.
    let localeStrings;
    if (lang && (want('getStringsByLocale') || want('getStringByKey'))) {
        try {
            localeStrings = await client.getStringsByLocale(lang);
            if (want('getStringsByLocale')) console.log(`✓ getStringsByLocale — ${summarize(localeStrings)}`);
        } catch (e) {
            if (want('getStringsByLocale')) { failures++; console.error(`✗ getStringsByLocale — ${e && e.message ? e.message : e}`); }
        }
    }
    if (lang && want('getStringByKey')) {
        const firstKey = localeStrings && typeof localeStrings === 'object' ? Object.keys(localeStrings)[0] : undefined;
        if (firstKey) {
            await check('getStringByKey', () => client.getStringByKey(firstKey, lang));
        } else {
            console.log('⚠ getStringByKey — no json strings found for discovered language; skipped');
        }
    }

    // Locale + cache helpers (local state only, no network)
    if (want('setCurrentLocale') || want('getCurrentLocale')) {
        client.setCurrentLocale(lang || 'en');
        console.log(`✓ setCurrentLocale/getCurrentLocale — ${summarize(client.getCurrentLocale())}`);
    }
    if (want('clearStringsCache')) {
        client.clearStringsCache();
        console.log('✓ clearStringsCache — ok');
    }
}

run()
    .then(() => process.exit(failures > 0 ? 1 : 0))
    .catch((err) => {
        console.error(`✗ fatal — ${err && err.message ? err.message : err}`);
        process.exit(1);
    });
```

**5. Run the script**

Execute it with Node's built-in `--env-file` to load `DISTRIBUTION_HASH` from `.env` (Node >=20.6,
and CI runs 22/24). This is a single command — no shell pipes or `&&`, so it won't trip permission
prompts. Pass any `$ARGUMENTS` method names as CLI args:

```
node --env-file=.env e2e-scratch.cjs $ARGUMENTS
```

Show all output verbatim.

**6. Clean up**

Delete `e2e-scratch.cjs` regardless of success or failure.

**7. Summarize**

List each method tested with ✓ / ✗, note any skipped (and why — e.g. no json strings in the
distribution), and state whether the run is safe (all green) or surfaced a regression. If step 2
found changed `src/` files, call out which changed methods were covered.
