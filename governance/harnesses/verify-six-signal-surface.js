#!/usr/bin/env node
'use strict';

const child = require('child_process');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const H = require('../../corpus-harness.js');
const L = require('../ledger/lib.js');

const pagePath = path.join(L.repoRoot, 'Six-Signal-Method.html');
const readmePath = path.join(L.repoRoot, 'README.md');
const headersPath = path.join(L.repoRoot, '_headers');
const indexPath = path.join(L.repoRoot, 'index.html');
const serviceWorkerPath = path.join(L.repoRoot, 'sw.js');
const page = fs.readFileSync(pagePath, 'utf8');
const readme = fs.readFileSync(readmePath, 'utf8');
const headers = fs.readFileSync(headersPath, 'utf8');
const index = fs.readFileSync(indexPath, 'utf8');
const library = fs.readFileSync(path.join(L.repoRoot, 'Delta-Atlas-Library.html'), 'utf8');
const serviceWorker = fs.readFileSync(serviceWorkerPath, 'utf8');
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

const expectedMethodHeaders = [
  ['Content-Security-Policy', "default-src 'none'; style-src 'unsafe-inline'; connect-src 'none'; img-src 'none'; font-src 'none'; object-src 'none'; media-src 'none'; form-action 'none'; base-uri 'none'; frame-ancestors 'self'"],
  ['Cache-Control', 'public, max-age=300'],
  ['Referrer-Policy', 'no-referrer'],
  ['X-Content-Type-Options', 'nosniff'],
  ['X-Frame-Options', 'SAMEORIGIN'],
  ['Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=()']
];

function parseHeaderBlocks(source) {
  const blocks = [];
  let current = null;
  for (const line of source.replace(/\r\n/g, '\n').split('\n')) {
    if (!line.trim()) {
      current = null;
      continue;
    }
    if (!/^[ \t]/.test(line)) {
      current = { route: line.trim(), entries: [] };
      blocks.push(current);
      continue;
    }
    if (!current) {
      blocks.push({ route: null, entries: [[null, line.trim()]] });
      continue;
    }
    const separator = line.indexOf(':');
    if (separator < 1) current.entries.push([null, line.trim()]);
    else current.entries.push([line.slice(0, separator).trim(), line.slice(separator + 1).trim()]);
  }
  return blocks;
}

function methodHeaderFailures(source) {
  const failures = [];
  const blocks = parseHeaderBlocks(source);
  for (const route of ['/Six-Signal-Method.html', '/Six-Signal-Method']) {
    const matching = blocks.filter((block) => block.route === route);
    if (matching.length !== 1) {
      failures.push(`${route} must have exactly one header block`);
      continue;
    }
    if (JSON.stringify(matching[0].entries) !== JSON.stringify(expectedMethodHeaders)) {
      failures.push(`${route} header names and values must match the exact restricted policy`);
    }
  }
  return failures;
}

for (const failure of methodHeaderFailures(headers)) requireSurface(false, failure);

requireSurface(readme.includes('[`Six-Signal-Method.html`](Six-Signal-Method.html)'), 'GitHub-facing method link is missing');
requireSurface(readme.includes('[`research/atlas-snapshot-read-only/`](research/atlas-snapshot-read-only/)'), 'GitHub-facing reproduction-card link is missing');
requireSurface(page.includes('<a href="index.html" target="_top">Back to Delta Atlas</a>'), 'top-level return link is missing');
requireSurface(!page.includes('target="_blank"'), 'undisclosed new-tab link remains');

const expectedRoutes = [
  ['Delta-Atlas-Evidence.html', 'Evidence'],
  ['Delta-Atlas-Library.html', 'Library'],
  ['Agentic-AI-Governance-GroundTruth.html', 'Curation dashboard'],
  ['Agentic-AI-Governance-Query.html', 'Explore'],
  ['Coherence-Audit.html', 'Framework Audit'],
  ['Delta-Atlas-Basin.html', 'The Basin'],
  ['Delta-Atlas-Cadence.html', 'The Cadence Dial'],
  ['Delta-Atlas-ContinuityAudit.html', 'Continuity Audit'],
  ['Delta-Atlas-Field.html', 'Lab: the Field'],
  ['Delta-Atlas-GapCheck.html', 'Gap Check'],
  ['Delta-Atlas-Primitives.html', 'Systems Primitives'],
  ['Delta-Atlas-Quick.html', 'Quick check'],
  ['Delta-Atlas-Start.html', 'Start here'],
  ['Delta-Atlas-Tracer.html', 'Priority Tracer'],
  ['Six-Signal-Method.html', 'Six Signals'],
  ['White-Paper.html', 'White Paper']
];

function navigationFailures(source) {
  const failures = [];
  const routeBlock = (source.match(/var NAV_ROUTES=Object\.freeze\(\{([\s\S]*?)\}\);/) || [])[1] || '';
  const routes = new Map([...routeBlock.matchAll(/'([^']+\.html)':'([^']+)'/g)].map((match) => [match[1], match[2]]));
  const navigationTargets = [...source.matchAll(/nav\('([^']+\.html)'/g)].map((match) => match[1]);
  if (JSON.stringify([...routes]) !== JSON.stringify(expectedRoutes)) failures.push('route allowlist or canonical titles changed');
  if (routes.get('Six-Signal-Method.html') !== 'Six Signals') failures.push('Six-Signal route or canonical title is missing');
  if (!/<button\b[^>]*data-f="Delta-Atlas-Library\.html"[^>]*>Library<\/button>/.test(source) ||
      !/<a\b[^>]*href="index\.html#Six-Signal-Method\.html"[^>]*>Six Signals<\/a>/.test(library)) {
    failures.push('Six Signals must remain visibly reachable through Library');
  }
  if (!navigationTargets.every((target) => routes.has(target))) failures.push('a navigation target bypasses the fixed route allowlist');
  const libraryRoutes = [...library.matchAll(/href="index\.html#([^"#]+\.html)"/g)].map((match) => match[1]);
  if (!libraryRoutes.every((route) => routes.has(route))) failures.push('a Library link targets an unavailable home route');
  for (const [route] of expectedRoutes) {
    if (!fs.existsSync(path.join(L.repoRoot, route))) failures.push(`${route}: preserved direct URL target is missing`);
  }
  if (!/<iframe\b(?=[^>]*\bid="frame")(?=[^>]*\btitle="Delta Atlas content")[^>]*><\/iframe>/.test(source)) {
    failures.push('iframe fallback title is missing');
  }

  const programStart = source.indexOf('var NAV_ROUTES=Object.freeze(');
  const programEnd = source.indexOf('function goHome(', programStart);
  if (programStart < 0 || programEnd < 0) {
    failures.push('navigation program boundary is missing');
    return failures;
  }
  const program = source.slice(programStart, programEnd);
  if ((program.match(/replaceFrameLocation\(frame,routePath\)/g) || []).length !== 1 || /\bframe\.src\s*=/.test(program)) {
    failures.push('navigation must replace exactly one main-frame location bound to routePath without adding child history');
  }
  if ((program.match(/\bframe\.title\s*=/g) || []).length !== 1 || !program.includes('frame.title=routeLabel;')) {
    failures.push('navigation must contain exactly one main-frame title assignment bound to routeLabel');
  }
  if (/\bframe\s*\[\s*['"](?:src|title)['"]\s*\]\s*=|\bframe\.setAttribute\(\s*['"](?:src|title)['"]|\bframe\.src\s*=/.test(program)) {
    failures.push('navigation contains an alternate main-frame source or title mutation');
  }

  const frameReplacements = [];
  const frame = {
    style: { display: 'unchanged' },
    title: 'unchanged',
    contentWindow: { location: { replace(value) { frameReplacements.push(value); } } }
  };
  const home = { style: { display: 'unchanged' } };
  const loading = { style: { display: 'unchanged' } };
  const historyCalls = [];
  const document = {
    title: 'unchanged',
    querySelectorAll() { return []; }
  };
  const context = { frame, home, loading, document, history: { pushState(...args) { historyCalls.push(args); } } };
  try {
    vm.runInNewContext(program, context, { timeout: 1000 });
    const beforeUnknown = JSON.stringify({ frame, home, loading, documentTitle: document.title, historyCalls, frameReplacements });
    if (context.nav('https://exfil.invalid/owned.html', 'forged label') !== false ||
        JSON.stringify({ frame, home, loading, documentTitle: document.title, historyCalls, frameReplacements }) !== beforeUnknown) {
      failures.push('unknown navigation mutates presentation state or is not rejected');
    }
    for (const [route, title] of expectedRoutes) {
      frame.title = 'unchanged';
      document.title = 'unchanged';
      historyCalls.length = 0;
      frameReplacements.length = 0;
      if (context.nav(route, 'forged label') !== true || JSON.stringify(frameReplacements) !== JSON.stringify([route]) || frame.title !== title ||
          document.title !== title || historyCalls.length !== 1 || historyCalls[0][2] !== `#${encodeURIComponent(route)}`) {
        failures.push(`${route} does not bind the allowlisted replacement location, title, and hash atomically`);
      }
    }
  } catch (error) {
    failures.push(`navigation program cannot be replayed safely: ${error.message}`);
  }
  return failures;
}

for (const failure of navigationFailures(index)) requireSurface(false, failure);

const coreBlock = (serviceWorker.match(/const CORE=\[([\s\S]*?)\];/) || [])[1] || '';
const coreMethodCount = (coreBlock.match(/'Six-Signal-Method\.html'/g) || []).length;
const cacheDeclarations = [...serviceWorker.matchAll(/const CACHE='aaig-v(\d+)';/g)];
requireSurface(cacheDeclarations.length === 1 && Number(cacheDeclarations[0][1]) >= 87,
  'service-worker cache identifier must be a single integer generation at or above v87');
requireSurface(coreMethodCount === 1, 'Six-Signal page must appear exactly once in the service-worker core');

const canaries = [
  '<scr' + 'ipt src="x.js"></scr' + 'ipt>',
  '<bu' + 'tton>acknowledge</bu' + 'tton>',
  'fet' + 'ch("/private")'
];
for (const [index, canary] of canaries.entries()) {
  if (!deniedPagePatterns.some(([pattern]) => pattern.test(canary))) errors.push(`surface canary ${index} was not rejected`);
}

const exactBoundaryCanaries = [
  [methodHeaderFailures(headers.replaceAll("connect-src 'none'; img-src", "connect-src 'none' https://exfil.invalid; img-src")).length > 0,
    'header egress extension'],
  [methodHeaderFailures(`${headers}\n/Six-Signal-Method\n  X-Frame-Options: SAMEORIGIN\n`).length > 0,
    'duplicate canonical header block'],
  [navigationFailures(index.replace('frame.title=routeLabel; setActive(routePath);',
    "frame.title=routeLabel; frame.src='https://exfil.invalid'; setActive(routePath);")).length > 0,
    'second main-frame source assignment'],
  [navigationFailures(index.replace('frame.title=routeLabel; setActive(routePath);',
    "frame.title=routeLabel; frame.title='forged'; setActive(routePath);")).length > 0,
    'second main-frame title assignment']
];
for (const [rejected, label] of exactBoundaryCanaries) {
  if (!rejected) errors.push(`${label} canary was not rejected`);
}

const packet = child.spawnSync(process.execPath, [path.join(L.repoRoot, 'research', 'atlas-snapshot-read-only', 'tools', 'verify-release.mjs')], {
  cwd: L.repoRoot,
  encoding: 'utf8',
  env: process.env
});
if (packet.status !== 0) errors.push(`public snapshot-card verifier failed: ${(packet.stderr || packet.stdout || '').trim()}`);

if (errors.length) H.fail('Six-Signal public surface and pinned-card boundary', errors);
else H.pass('six ordered educational signals, no-input page, GitHub discovery links, restricted headers, and pinned-card verifier');
H.pass(`${canaries.length + exactBoundaryCanaries.length} synthetic surface violations are detected`);
process.exit(H.summarize('SIX-SIGNAL PUBLIC SURFACE'));
