#!/usr/bin/env node
/**
 * Single source of truth for the PWA version = src/lib/version.ts (APP_VERSION).
 *
 * This script propagates that ONE version into every file that needs it, so the
 * Service Worker, manifest and index.html can never drift apart again (which is
 * exactly what caused the "Cache bereinigt -> startet nicht mehr" bug).
 *
 * ONE format everywhere: full semver like 12.24.0 (never a short 12.24).
 * This matches how src/main.tsx compares versions (it uses the full string),
 * so the Service Worker cache names always line up.
 *
 * Usage:
 *   node scripts/bump-version.mjs --sync     # DO NOT change the number, just
 *                                            # copy version.ts into all files.
 *                                            # This runs automatically on build.
 *   node scripts/bump-version.mjs            # patch bump  (12.24.0 -> 12.24.1)
 *   node scripts/bump-version.mjs minor      # minor bump  (12.24.0 -> 12.25.0)
 *   node scripts/bump-version.mjs major      # major bump  (12.24.0 -> 13.0.0)
 *   node scripts/bump-version.mjs 12.25.0    # set an explicit version
 *
 * Files kept in sync:
 *   - src/lib/version.ts     APP_VERSION + header comment   (the source)
 *   - public/sw.js           VERSION + ?v= cache-bust query strings
 *   - public/manifest.json   version + start_url ?v=
 *   - index.html             header comment, /sw.js?v=, "SW registered v" log
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const arg = process.argv[2];

const versionFile = resolve(root, 'src/lib/version.ts');
const swFile = resolve(root, 'public/sw.js');
const manifestFile = resolve(root, 'public/manifest.json');
const indexFile = resolve(root, 'index.html');

// --- read current version (the single source of truth) ---------------------
const versionSrc = readFileSync(versionFile, 'utf8');
const current = versionSrc.match(/APP_VERSION\s*=\s*'([^']+)'/)?.[1];
if (!current) {
  console.error('ERROR: Could not read APP_VERSION from src/lib/version.ts');
  process.exit(1);
}

// Always work with a full 3-part semver: "12.24" -> "12.24.0", "13" -> "13.0.0"
const normalize = (v) => {
  const parts = String(v).split('.').map((n) => parseInt(n, 10) || 0);
  while (parts.length < 3) parts.push(0);
  return parts.slice(0, 3).join('.');
};

const [maj, min, pat] = normalize(current).split('.').map(Number);

// --- decide the next version ------------------------------------------------
let next;
if (arg === '--sync' || arg === 'sync') {
  next = normalize(current);            // no change, just re-sync all files
} else if (!arg || arg === 'patch') {
  next = `${maj}.${min}.${pat + 1}`;
} else if (arg === 'minor') {
  next = `${maj}.${min + 1}.0`;
} else if (arg === 'major') {
  next = `${maj + 1}.0.0`;
} else if (/^\d+(\.\d+){0,2}$/.test(arg)) {
  next = normalize(arg);
} else {
  console.error(`ERROR: Invalid version argument: ${arg}`);
  process.exit(1);
}

const isSync = arg === '--sync' || arg === 'sync';
console.log(isSync
  ? `Syncing all PWA files to version ${next}`
  : `Bumping version: ${normalize(current)} -> ${next}`);

// --- 1) src/lib/version.ts (the source) ------------------------------------
let v = versionSrc;
v = v.replace(/APP_VERSION\s*=\s*'[^']+'/, `APP_VERSION = '${next}'`);
v = v.replace(/^\/\/\s*v[\d.]+.*$/m, `// v${next}`);
writeFileSync(versionFile, v);

// --- 2) public/sw.js --------------------------------------------------------
let sw = readFileSync(swFile, 'utf8');
sw = sw.replace(/const VERSION\s*=\s*'[^']+'/, `const VERSION = '${next}'`);
sw = sw.replace(/\?v=\d+(?:\.\d+){1,2}/g, `?v=${next}`);   // cache-bust query strings
writeFileSync(swFile, sw);

// --- 3) public/manifest.json ------------------------------------------------
const manifest = JSON.parse(readFileSync(manifestFile, 'utf8'));
manifest.version = next;
manifest.start_url = `/?v=${next}`;
writeFileSync(manifestFile, JSON.stringify(manifest, null, 2) + '\n');

// --- 4) index.html ----------------------------------------------------------
let html = readFileSync(indexFile, 'utf8');
html = html.replace(/<!--\s*v[\d.]+[^>]*-->/, `<!-- v${next} -->`);
html = html.replace(/\/sw\.js\?v=\d+(?:\.\d+){1,2}/g, `/sw.js?v=${next}`);
html = html.replace(/SW registered v[\d.]+/g, `SW registered v${next}`);
writeFileSync(indexFile, html);

console.log('Done. In sync now:');
console.log('  - src/lib/version.ts');
console.log('  - public/sw.js');
console.log('  - public/manifest.json');
console.log('  - index.html');
console.log(`\nVersion: ${next}`);
