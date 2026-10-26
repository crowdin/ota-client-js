#!/usr/bin/env node
// E2E smoke test for the Crowdin OTA client — see SKILL.md.
// Run from the repo root so `.env` and the build output resolve correctly:
//   node --env-file=.env .claude/skills/e2e-test/e2e-test.cjs [methodName...]
// With no method names it runs the full suite; otherwise only the named methods
// (plus the manifest discovery the arg-based ones depend on).
const path = require('path');

// The build output lives at <repo>/out — resolve from the working directory
// (the repo root), not this script's folder.
const outPath = path.resolve(process.cwd(), 'out/index.js');
let OtaClient;
try {
    OtaClient = require(outPath).default;
} catch {
    console.error(`✗ Could not load ${outPath}. Run \`pnpm run build\` first (from the repo root).`);
    process.exit(1);
}

const distributionHash = process.env.DISTRIBUTION_HASH;
if (!distributionHash) {
    console.error('✗ DISTRIBUTION_HASH not set. Create .env from .env.example and run with `node --env-file=.env`.');
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
