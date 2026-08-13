#!/usr/bin/env node
'use strict';

const child = require('child_process');
const fs = require('fs');
const path = require('path');
const H = require('../../corpus-harness.js');
const L = require('../ledger/lib.js');

const pagePath = path.join(L.repoRoot, 'Six-Signal-Method.html');
const readmePath = path.join(L.repoRoot, 'README.md');
const headersPath = path.join(L.repoRoot, '_headers');
const page = fs.readFileSync(pagePath, 'utf8');
const readme = fs.readFileSync(readmePath, 'utf8');
const headers = fs.readFileSync(headersPath, 'utf8');
const errors = [];

function requireSurface(condition, message) {
  if (!condition) errors.push(message);
}

const expectedSignals = ['CALIBRATION', 'CONSEQUENCE', 'EVIDENCE', 'INTEGRITY', 'PRIVACY', 'ACTIVITY'];
const expectedHeadings = ['Calibration', 'Consequence', 'Evidence', 'Integrity', 'Privacy', 'Activity'];
const actualSignals = [...page.matchAll(/<article class="signal-card" data-signal="([A-Z]+)">/g)].map((match) => match[1]);
const actualHeadings = [...page.matchAll(/<h3>([^<]+)<\/h3>/g)].map((match) => match[1]);
requireSurface(JSON.stringify(actualSignals) === JSON.stringify(expectedSignals), 'six signal cards are missing, duplicated, or reordered');
requireSurface(JSON.stringify(actualHeadings) === JSON.stringify(expectedHeadings), 'signal headings are missing, renamed, or reordered');
for (const signal of expectedSignals) {
  const card = page.match(new RegExp(`<article class="signal-card" data-signal="${signal}">([\\s\\S]*?)<\\/article>`));
  requireSurface(Boolean(card), `${signal} card is missing`);
  if (card) {
    for (const field of ['Can establish', 'UNKNOWN means', 'Cannot establish']) {
      requireSurface(card[1].includes(`<dt>${field}</dt>`), `${signal} card is missing ${field}`);
    }
  }
}
requireSurface(page.includes('Educational method only. This page reads no inputs and reports no status about a system, site, AI, person, or deployment.'), 'scope notice is missing or changed');
requireSurface(page.includes('<main>') && page.includes('<header>') && page.includes('<ol class="signal-grid">'), 'semantic page structure is incomplete');
requireSurface(page.includes('UNKNOWN is a result.'), 'UNKNOWN boundary is missing');
requireSurface(page.includes('minmax(min(100%, 19rem), 1fr)'), '320-pixel-safe card reflow rule is missing');
requireSurface(page.includes('@media (forced-colors: active)') && page.includes('@media (prefers-reduced-motion: reduce)'), 'accessible media rules are incomplete');
requireSurface(page.includes(':focus-visible'), 'visible keyboard focus rule is missing');

const deniedPagePatterns = [
  [/<script\b/i, 'script element'],
  [/<(?:form|button|input|select|textarea|iframe)\b/i, 'interactive or embedded control'],
  [/\b(?:fetch|XMLHttpRequest|WebSocket|EventSource|sendBeacon)\s*\(/i, 'network API'],
  [/\b(?:localStorage|sessionStorage|indexedDB|serviceWorker|navigator\.storage|caches\.)\b/i, 'persistence API'],
  [/https?:\/\//i, 'external URL'],
  [/[A-Za-z]:[\\/](?:Users|Documents|Downloads|AppData)[\\/]/, 'absolute local path'],
  [/[0-9a-f]{64}/i, 'raw SHA-256 value'],
  [/delta-atlas-"?\s*\+?\s*"?signal-lab/i, 'private repository identifier']
];
for (const [pattern, label] of deniedPagePatterns) requireSurface(!pattern.test(page), `page contains denied ${label}`);

const methodHeaderBlock = (headers.match(/\/Six-Signal-Method\.html\r?\n((?:[ \t].*(?:\r?\n|$))+)/) || [])[1] || '';
requireSurface(Boolean(methodHeaderBlock), 'method route header block is missing');
requireSurface(methodHeaderBlock.includes("default-src 'none'"), 'method default-deny CSP is missing');
requireSurface(methodHeaderBlock.includes("connect-src 'none'"), 'method connect-src boundary is missing');
requireSurface(methodHeaderBlock.includes("form-action 'none'"), 'method form-action boundary is missing');
requireSurface(methodHeaderBlock.includes("frame-ancestors 'self'"), 'method same-origin framing policy is missing');

requireSurface(readme.includes('[`Six-Signal-Method.html`](Six-Signal-Method.html)'), 'GitHub-facing method link is missing');
requireSurface(readme.includes('[`research/atlas-snapshot-read-only/`](research/atlas-snapshot-read-only/)'), 'GitHub-facing reproduction-card link is missing');
requireSurface(page.includes('<a href="index.html" target="_top">Back to Delta Atlas</a>'), 'top-level return link is missing');
requireSurface(!page.includes('target="_blank"'), 'undisclosed new-tab link remains');

const canaries = [
  '<scr' + 'ipt src="x.js"></scr' + 'ipt>',
  '<bu' + 'tton>acknowledge</bu' + 'tton>',
  'fet' + 'ch("/private")'
];
for (const [index, canary] of canaries.entries()) {
  if (!deniedPagePatterns.some(([pattern]) => pattern.test(canary))) errors.push(`surface canary ${index} was not rejected`);
}

const packet = child.spawnSync(process.execPath, [path.join(L.repoRoot, 'research', 'atlas-snapshot-read-only', 'tools', 'verify-release.mjs')], {
  cwd: L.repoRoot,
  encoding: 'utf8',
  env: process.env
});
if (packet.status !== 0) errors.push(`public snapshot-card verifier failed: ${(packet.stderr || packet.stdout || '').trim()}`);

if (errors.length) H.fail('Six-Signal public surface and pinned-card boundary', errors);
else H.pass('six ordered educational signals, no-input page, GitHub discovery links, restricted headers, and pinned-card verifier');
H.pass(`${canaries.length} synthetic surface violations are detected`);
process.exit(H.summarize('SIX-SIGNAL PUBLIC SURFACE'));
