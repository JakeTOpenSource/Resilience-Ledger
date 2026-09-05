#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const child = require('child_process');
const L = require('../ledger/lib.js');

const root = path.resolve(__dirname, '..', '..');
const recordingCommit = 'f08dd60e4c4070d2cd5a1d8f0b88d780fb67fff6';
const relative = {
  home: 'index.html',
  guide: 'White-Paper.html',
  library: 'Delta-Atlas-Library.html',
  evidence: 'Delta-Atlas-Evidence.html',
  contract: 'governance/contracts/public-explanation-surfaces.contract.v1.json',
  decision: 'governance/decision-log/0011-public-explanation-surface-cleanup.md',
  event: 'governance/ledger/events/governance/000010-public-explanation-surfaces-prepared.json'
};

function bytes(locator) {
  return fs.readFileSync(path.join(root, locator));
}

function text(locator) {
  return bytes(locator).toString('utf8');
}

// The preparation event describes its recording commit. Current navigation is
// checked below; changing it does not rewrite the old event or its source bytes.
function historicalBytes(locator) {
  return child.execFileSync('git', ['-c', `safe.directory=${root}`, 'show', `${recordingCommit}:${locator}`], {
    cwd: root, encoding: null, maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe']
  });
}

function count(source, pattern) {
  return (source.match(pattern) || []).length;
}

function safeLocal(locator) {
  if (typeof locator !== 'string' || path.isAbsolute(locator) || locator.split(/[\\/]/).includes('..')) return null;
  const absolute = path.resolve(root, locator);
  return absolute.startsWith(`${root}${path.sep}`) ? absolute : null;
}

function scriptsParse(source, label, errors) {
  for (const [index, match] of [...source.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].entries()) {
    if (/\bsrc\s*=/.test(match[1])) continue;
    try { new Function(match[2]); }
    catch (error) { errors.push(`${label}: inline script ${index + 1} does not parse: ${error.message}`); }
  }
}

function checkNewTabLinks(source, label, errors) {
  for (const match of source.matchAll(/<a\b[^>]*\btarget=["']_blank["'][^>]*>/gi)) {
    if (!/\brel=["'][^"']*\bnoopener\b[^"']*["']/i.test(match[0])) {
      errors.push(`${label}: new-tab link lacks noopener: ${match[0].slice(0, 120)}`);
    }
  }
}

function contentFailures(home, guide, library, evidence) {
  const errors = [];
  const requireRule = (condition, message) => { if (!condition) errors.push(message); };
  const forbidden = [
    /THE ONE NOBODY ELSE HAS/i,
    /browse all 439 terms/i,
    /same for everyone, every time/i,
    /nothing (?:you )?paste(?:d)? (?:ever )?leaves your machine/i,
    /every change is logged/i,
    /every seam on record/i,
    /fooling it can'?t happen silently/i,
    /Physics measured three zones/i,
    /measured law for quantum systems[\s\S]{0,120}transfers to everything else/i,
    /\(next\)/i,
    /(?:Witness Ledger|v0\.6)[\s\S]{0,80}(?:in preparation|next edition)/i
  ];
  for (const pattern of forbidden) {
    requireRule([home, guide, library, evidence].every((surface) => !pattern.test(surface)), `unsupported claim remains: ${pattern}`);
  }

  requireRule(/candidate source inventory[\s\S]{0,120}439/i.test(home),
    'home must identify 439 as the candidate-source inventory');
  requireRule(/Ask and Explore snapshot[\s\S]{0,80}435/i.test(home),
    'home must identify the 435-record Ask and Explore snapshot');
  requireRule(/public data-sync baseline/i.test(home) &&
    /href=["'](?:Delta-Atlas-Document\.html\?file=)?governance\/contracts\/atlas-data-sync-baseline\.md["']/i.test(home),
  'home must expose the recorded projection mismatch baseline');
  requireRule(/160 recorded cross-domain primitives/i.test(library) && !/150 cross-domain primitives/i.test(home + library),
    'Library must report the pinned 160-record primitives inventory');
  requireRule(/older 435-term snapshot/i.test(library),
    'Library must scope the curation dashboard to its older snapshot');
  requireRule(/defined subset of core routes and engines, not every page/i.test(home) &&
    /href=["']sw\.js["']/i.test(home), 'home must bound and expose the offline cache claim');
  requireRule(/design hypothesis, not a transferred law/i.test(library),
    'Library must bound the Cadence cross-domain analogy');
  requireRule(/conditional indicators, not diagnoses for every real system/i.test(library),
    'Library must bound the Basin cross-domain analogy');
  requireRule(/Open Explore and choose an area/i.test(library) &&
    !/<button\b[^>]*class=["'][^"']*\barea\b/i.test(home + library),
  'area labels must be descriptive until distinct filters are implemented');
  requireRule(/Cloudflare Web Analytics/i.test(home) &&
    /does not place submitted text in request URLs or send it to a model or API/i.test(home),
  'home must state the scoped input and telemetry boundary');

  const homeSkip = home.match(/<a\b[^>]*class=["'][^"']*\bskip\b[^"']*["'][^>]*href=["']#([^"']+)["']/i);
  requireRule(Boolean(homeSkip), 'home must expose a skip link');
  if (homeSkip) requireRule(new RegExp(`\\bid=["']${homeSkip[1]}["']`, 'i').test(home),
    'home skip link must resolve to an element');
  requireRule(count(home, /<main\b/gi) === 1 && count(home, /<h1\b/gi) === 1,
    'home must contain one main landmark and one h1');
  requireRule(/id=["']loading["'][^>]*role=["']status["'][^>]*aria-live=["']polite["']/i.test(home),
    'home route loading state must be announced');

  requireRule(/Project Guide and Evidence Boundaries/i.test(guide) && /dated, maintained public guide/i.test(guide),
    'explanation page must describe itself as a dated public project guide');
  requireRule(/candidate source (?:file|inventory)[\s\S]{0,160}439/i.test(guide) &&
    /435-term embedded snapshot/i.test(guide) && /433 terms/i.test(guide),
  'explanation page must distinguish the candidate inventory and older projections');
  requireRule(/<th\b[^>]*scope=["']row["'][^>]*>[\s\S]{0,20}Reset to baseline[\s\S]{0,50}alias: Return/i.test(guide) &&
    !/<th\b[^>]*scope=["']row["'][^>]*>Return(?:\s|<)/i.test(guide),
  'explanation page must use Reset as the function and Return only as an alias');
  requireRule(/archival/i.test(guide) &&
    /href=["'](?:Resilience(?:%20| )Ledger(?:%20| )v0(?:%20| )4\.pdf)["']/i.test(guide) &&
    /href=["'](?:Resilience(?:%20| )Ledger(?:%20| )v0(?:%20| )5\.pdf)["']/i.test(guide),
  'explanation page must link and label both historical PDFs as archival');
  requireRule(/Both PDFs have known pagination defects/i.test(guide) &&
    /does not hide or repair those archival bytes/i.test(guide),
  'explanation page must disclose the observed archival pagination defects without claiming repair');
  requireRule(/atlas-data-sync-baseline\.md/i.test(guide),
    'explanation page must link the projection baseline');
  requireRule(/<code>governance\/ledger\/events<\/code>/i.test(guide) &&
    /<code>governance\/ledger\/checkpoints<\/code>/i.test(guide),
    'explanation page must identify the append-only event and checkpoint ledger');
  requireRule(/Delta-Atlas-Cadence\.html/i.test(guide) && /Delta-Atlas-Basin\.html/i.test(guide) &&
    count(guide, /https:\/\/doi\.org\//gi) >= 4,
  'explanation page must expose lesson boundaries and primary-source links');
  requireRule(/2026-08-13/.test(guide), 'explanation page ledger must record this cleanup');
  requireRule(count(guide, /<main\b/gi) === 1 && count(guide, /<h1\b/gi) === 1,
    'explanation page must contain one main landmark and one h1');
  const guideSkip = guide.match(/<a\b[^>]*class=["'][^"']*\bskip\b[^"']*["'][^>]*href=["']#([^"']+)["']/i);
  requireRule(Boolean(guideSkip), 'explanation page must expose a skip link');
  if (guideSkip) requireRule(new RegExp(`<main\\b[^>]*\\bid=["']${guideSkip[1]}["']`, 'i').test(guide),
    'explanation skip link must resolve to the main landmark');
  requireRule(count(guide, /<table\b/gi) === count(guide, /<caption\b/gi),
    'every explanation table must have a caption');
  requireRule(count(guide, /<th\b/gi) === count(guide, /<th\b[^>]*\bscope=["'](?:col|row)["']/gi),
    'every explanation table heading must declare column or row scope');

  scriptsParse(home, 'index.html', errors);
  scriptsParse(guide, 'White-Paper.html', errors);
  checkNewTabLinks(home, 'index.html', errors);
  checkNewTabLinks(guide, 'White-Paper.html', errors);
  for (const [label, surface] of [['Library', library], ['Evidence', evidence]]) {
    requireRule(count(surface, /<main\b/gi) === 1 && count(surface, /<h1\b/gi) === 1,
      `${label} index must have one main landmark and one h1`);
    const skip = surface.match(/<a\b[^>]*class=["'][^"']*\bskip\b[^"']*["'][^>]*href=["']#([^"']+)["']/i);
    requireRule(Boolean(skip) && new RegExp(`<main\\b[^>]*\\bid=["']${skip && skip[1]}["'][^>]*tabindex=["']-1["']`, 'i').test(surface),
      `${label} skip link must target the focusable main landmark`);
    requireRule(!/<(?:script|form|input|textarea|iframe)\b/i.test(surface),
      `${label} remains a passive index without a new input or script path`);
    requireRule(/href=["']index\.html["'][^>]*target=["']_top["']/i.test(surface),
      `${label} must return to the top-level tools page`);
    checkNewTabLinks(surface, label, errors);
  }
  return errors;
}

const errors = [];
const contract = JSON.parse(text(relative.contract));
const decision = text(relative.decision);
const home = text(relative.home);
const guide = text(relative.guide);
const library = text(relative.library);
const evidence = text(relative.evidence);

for (const locator of [relative.contract, relative.decision, relative.event]) {
  if (L.sha256CanonicalTextBytes(bytes(locator)) !== L.sha256CanonicalTextBytes(historicalBytes(locator))) {
    errors.push(`${locator}: historical preparation record changed`);
  }
}

if (contract.schema_version !== 'public-explanation-surfaces-contract.v1' ||
    contract.status !== 'PROPOSED_SOURCE_CLEANUP' || contract.mode !== 'PREPARE_ONLY' ||
    !contract.claim_ceiling.includes('OWNER_MERGE_REQUIRED') ||
    !contract.claim_ceiling.includes('NOT_MERGE_OR_DEPLOYMENT_AUTHORITY')) {
  errors.push('contract preparation or authority boundary is invalid');
}
if (!/Decision: \*\*ACCEPT_WITH_LIMITS\*\*/.test(decision) || !/Mode: \*\*PREPARE_ONLY\*\*/.test(decision) ||
    !/Owner merge remains required/.test(decision)) {
  errors.push('decision preparation or authority boundary is invalid');
}

const profile = contract.source_profile;
const textSources = [
  profile.atlas_candidate_source,
  profile.atlas_projection_baseline,
  profile.systems_primitives
];
for (const source of textSources) {
  if (L.sha256CanonicalTextBytes(bytes(source.path)) !== source.sha256) {
    errors.push(`${source.path}: pinned text digest mismatch`);
  }
}
for (const source of [profile.resilience_ledger_v0_4, profile.resilience_ledger_v0_5]) {
  if (L.sha256Bytes(bytes(source.path)) !== source.sha256) errors.push(`${source.path}: archival PDF bytes changed`);
}
const candidate = JSON.parse(text(profile.atlas_candidate_source.path));
const primitives = JSON.parse(text(profile.systems_primitives.path));
if (!Array.isArray(candidate.terms) || candidate.terms.length !== 439 ||
    !Array.isArray(candidate.sources) || candidate.sources.length !== 193 ||
    !Array.isArray(candidate.relations) || candidate.relations.length !== 360) {
  errors.push('candidate-source inventory no longer matches the contract');
}
if (!Array.isArray(primitives.primitives) || primitives.primitives.length !== 160) {
  errors.push('primitives inventory no longer matches the contract');
}

errors.push(...contentFailures(home, guide, library, evidence));

if (!fs.existsSync(path.join(root, relative.event))) {
  errors.push(`${relative.event}: prepared-source event is missing`);
} else {
  const event = JSON.parse(text(relative.event));
  if (event.event_id !== 'evt_governance_public_explanation_surfaces_prepared_0010' ||
      event.sequence !== 10 || event.decision !== 'ACCEPT_WITH_LIMITS' ||
      event.payload.mode !== 'PREPARE_ONLY' || event.payload.owner_merge_required !== true ||
      event.payload.production_deployment !== 'NOT_ATTEMPTED') {
    errors.push('prepared-source event boundary is invalid');
  }
  for (const reference of event.evidence_refs || []) {
    if (reference.sha256 === null) continue;
    const absolute = safeLocal(reference.source_locator);
    if (!absolute || !fs.existsSync(absolute)) {
      errors.push(`${reference.ref_id}: unsafe or missing evidence locator`);
      continue;
    }
    const recorded = historicalBytes(reference.source_locator);
    const actual = reference.kind === 'archival_pdf' ? L.sha256Bytes(recorded) :
      L.sha256CanonicalTextBytes(recorded);
    if (actual !== reference.sha256) errors.push(`${reference.ref_id}: historical evidence digest mismatch`);
  }
}

const canaries = [
  [home.replace('</body>', '<p>THE ONE NOBODY ELSE HAS</p></body>'), guide],
  [home.replace('</body>', '<p>Nothing you paste ever leaves your machine.</p></body>'), guide],
  [home, guide.replace(/<b>Reset(?: to baseline)?<\/b>/i, '<b>Return</b>')],
  [home, guide.replace(/archival/gi, 'historical')],
  [home, guide.replace('</body>', '<p>The next edition, Witness Ledger v0.6, is in preparation.</p></body>')],
  [home.replace(/(<a\b[^>]*class=["'][^"']*\bskip\b[^"']*["'][^>]*href=["'])#[^"']+(["'])/i,
    '$1#missing-content$2'), guide],
  [home, guide.replace(/atlas-data-sync-baseline\.md/gi, 'missing-baseline.md')],
  [home, guide.replace('</body>', '<p>Every change is logged.</p></body>')],
  [home, guide.replace('</body>', '<p>Browse all 439 terms.</p></body>')]
].map(([mutatedHome, mutatedGuide]) => [mutatedHome, mutatedGuide, library, evidence]);
canaries.push(
  [home, guide, library.replace('160 recorded cross-domain primitives', '150 cross-domain primitives'), evidence],
  [home, guide, library.replace('design hypothesis, not a transferred law', 'a universal law'), evidence],
  [home, guide, library.replace('conditional indicators, not diagnoses for every real system', 'diagnoses for every real system'), evidence],
  [home, guide, library.replace('older 435-term snapshot', 'current accepted inventory'), evidence],
  [home, guide, library, evidence.replace('</body>', '<script src="unreviewed.js"></script></body>')]
);
const currentSurfaces = [home, guide, library, evidence];
for (const [index, surfaces] of canaries.entries()) {
  if (surfaces.every((surface, position) => surface === currentSurfaces[position])) errors.push(`mutation canary ${index + 1} did not alter a surface`);
  else if (contentFailures(...surfaces).length === 0) errors.push(`mutation canary ${index + 1} was not rejected`);
}

if (errors.length) {
  for (const error of errors) console.error(`FAIL ${error}`);
  process.exit(1);
}
console.log(`Public explanation-surface verification PASS (${canaries.length} mutation canaries)`);
