#!/usr/bin/env node
/**
 * Bumps the PWA version across all required files so devices auto-update.
 *
 * Usage:
 *   node scripts/bump-version.mjs            # patch bump (12.20 -> 12.21)
 *   node scripts/bump-version.mjs minor      # minor bump (12.20 -> 13.0)
 *   node scripts/bump-version.mjs 13.5       # explicit version
 *
 * Updates:
 *   - src/lib/version.ts        APP_VERSION
 *   - public/sw.js              VERSION + cache-bust query strings
 *   - public/manifest.json      version + start_url version query
 *   - index.html                SW register URL ?v=, log line, header comment
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

const current = readFileSync(versionFile, 'utf8').match(/APP_VERSION\s*=\s*'([^']+)'/)?.[1];
if (!current) {
  console.error('Could not read APP_VERSION from src/lib/version.ts');
  process.exit(1);
}
const [maj, min, patch = '0'] = current.split('.').map(Number);

let next;
if (!arg || arg === 'patch') {
  next = `${maj}.${min + 1}`;
} else if (arg === 'minor') {
  next = `${maj + 1}.0`;
} else if (arg === 'major') {
  next = `${maj + 1}.0`;
} else if (/^\d+\.\d+(\.\d+)?$/.test(arg)) {
  next = arg;
} else {
  console.error(`Invalid version: ${arg}`);
  process.exit(1);
}

const short = next.split('.').slice(0, 2).join('.');     // e.g. "12.21"
const full = next.includes('.') && next.split('.').length === 3 ? next : `${short}.0`; // e.g. "12.21.0"

console.log(`Bumping version: ${current} -> ${full} (short ${short})`);

// 1) src/lib/version.ts
let v = readFileSync(versionFile, 'utf8');
v = v.replace(/APP_VERSION\s*=\s*'[^']+'/, `APP_VERSION = '${full}'`);
v = v.replace(/^\/\/\s*v[\d.]+.*$/m, `// v${short}`);
writeFileSync(versionFile, v);

// 2) public/sw.js
let sw = readFileSync(swFile, 'utf8');
sw = sw.replace(/const VERSION\s*=\s*'[^']+'/, `const VERSION = '${short}'`);
// Cache-bust query strings (?v=...) anywhere in PRECACHE list / log lines
sw = sw.replace(/\?v=\d+\.\d+/g, `?v=${short}`);
sw = sw.replace(/service worker v[\d.]+/g, `service worker v${short}`);
writeFileSync(swFile, sw);

// 3) public/manifest.json
const manifest = JSON.parse(readFileSync(manifestFile, 'utf8'));
manifest.version = short;
manifest.start_url = `/?v=${short}`;
writeFileSync(manifestFile, JSON.stringify(manifest, null, 2) + '\n');

// 4) index.html
let html = readFileSync(indexFile, 'utf8');
html = html.replace(/<!--\s*v[\d.]+[^>]*-->/, `<!-- v${short} -->`);
html = html.replace(/\/sw\.js\?v=\d+\.\d+/g, `/sw.js?v=${short}`);
html = html.replace(/SW registered v[\d.]+/g, `SW registered v${short}`);
writeFileSync(indexFile, html);

console.log('Done. Files updated:');
console.log('  - src/lib/version.ts');
console.log('  - public/sw.js');
console.log('  - public/manifest.json');
console.log('  - index.html');
console.log(`\nNew version: ${short}`);
