#!/usr/bin/env node
'use strict';

/* Deterministic, no-network acceptance checks for the public Atlas home surface.
   Pins the 2026-09-24 theory-first home: thesis, three skill cards, receipts strip,
   instruments, glossary search, honest evidence floor, and the retained garden scene. */
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..', '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const html = read('index.html');
const library = read('Delta-Atlas-Library.html');
const evidence = read('Delta-Atlas-Evidence.html');
const architecture = read('Delta-Atlas-Architecture.html');
const spec = read('BespokeNode-Spec-v0.1.md');
const serviceWorker = read('sw.js');
let failures = 0;
function check(condition, message) {
  if (!condition) { failures += 1; console.error(`FAIL ${message}`); }
  else console.log(`PASS ${message}`);
}

/* Structure and accessibility */
check(/<header\b[^>]*id="bar"/.test(html), 'semantic header exists');
try {
  for (const script of html.matchAll(/<script>([\s\S]*?)<\/script>/g)) new Function(script[1]);
  check(true, 'all inline scripts parse');
} catch (error) {
  check(false, `inline script parse: ${error.message}`);
}
check(/<nav\b[^>]*aria-label="Primary navigation"/.test(html), 'primary navigation is named');
check(/<main\b[^>]*id="stage"/.test(html), 'semantic main exists');
check(/<footer\b[^>]*class="floor"/.test(html), 'semantic footer exists');
check((html.match(/<h1\b/g) || []).length === 1, 'exactly one h1 exists');
check(/<a class="skip" href="#stage">/.test(html) && /<main\b[^>]*id="stage"[^>]*tabindex="-1"/.test(html),
  'skip link targets the focusable main landmark');
check(!/<(?:div|span|a)\b[^>]*\bonclick=/.test(html), 'no click-only div, span, or anchor controls remain');
check(/role="status" aria-live="polite"/.test(html) && /frame\.focus\(\)/.test(html),
  'embedded route loading is announced and focus is moved');
check(/min-height:44px/.test(html) && /@media \(max-width:700px\)/.test(html), 'mobile touch and navigation rules exist');
for (const tag of html.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)) {
  check(/rel="[^"]*noopener/.test(tag[0]), `new-tab link has noopener: ${tag[0].slice(0, 100)}`);
}

/* Navigation shell */
check(/history\.pushState/.test(html) && /addEventListener\('popstate'/.test(html), 'history traversal is implemented');
check(/var url=location\.href;/.test(html), 'Share preserves the active route');
check(/Object\.freeze\(\{/.test(html) && /NAV_ROUTES/.test(html) && /hasOwnProperty\.call\(NAV_ROUTES,routePath\)/.test(html), 'fixed route allowlist remains enforced');
const primaryNav = (html.match(/<nav\b[^>]*aria-label="Primary navigation"[^>]*>([\s\S]*?)<\/nav>/) || [])[1] || '';
const primaryLabels = [...primaryNav.matchAll(/<button\b[^>]*>([^<]+)<\/button>/g)].map((match) => match[1].trim());
check(JSON.stringify(primaryLabels) === JSON.stringify(['Home', 'Evidence', 'Library']), 'primary navigation exposes exactly Home, Evidence, and Library');
check(/id="home0"[^>]*onclick="goHome\(true\)"/.test(primaryNav) &&
  /data-f="Delta-Atlas-Evidence\.html"/.test(primaryNav) && /data-f="Delta-Atlas-Library\.html"/.test(primaryNav),
  'primary navigation binds the home and two index routes');
const searchControl = (html.match(/<button\b[^>]*id="search0"[^>]*>Search terms<\/button>/) || [])[0] || '';
check(Boolean(searchControl) && /onclick="showSearch\(\)"/.test(searchControl) &&
  !/\bhidden\b|aria-hidden="true"|display\s*:\s*none/.test(searchControl) &&
  /<input\b[^>]*id="hq"[^>]*aria-label="[^"]+"/.test(html), 'visible Search control targets the labelled glossary input');

/* Thesis and purpose */
check(/<p class="headline">Simplification is systems maintenance; <b>the substrate is human cost\.<\/b><\/p>/.test(html),
  'home leads with the thesis sentence, verbatim');
check(/href="Delta-Atlas-Architecture\.html"[^>]*target="_top"/.test(html) && fs.existsSync(path.join(root, 'Delta-Atlas-Architecture.html')),
  'home links to an existing architecture page at top level');
check(!/Start with a simple example|Look for handover gaps|START HERE/.test(html), 'beginner-first framing is absent from the home surface');

/* Three skill cards, in order, each with a run action and a receipt */
const skillsBlock = (html.match(/<div\b[^>]*class="[^"]*\bprimary-skills\b[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/section>/) || [])[1] || '';
const skillCards = [...skillsBlock.matchAll(/<article class="skill"[^>]*>([\s\S]*?)<\/article>/g)].map((match) => match[1]);
const skillNames = skillCards.map((card) => ((card.match(/<h3\b[^>]*>([^<]+)<\/h3>/) || [])[1] || '').trim());
check(JSON.stringify(skillNames) === JSON.stringify(['BespokeNode', 'Pin-Check', 'OpenMirror']),
  'three skill cards name BespokeNode, Pin-Check, and OpenMirror in that order');
check(skillCards.length === 3 && skillCards.every((card) => card.includes('<span class="lab">Run it now</span>') && card.includes('<span class="lab">Receipt</span>')),
  'every skill card carries a Run it now action and a Receipt');
check(skillCards[0]?.includes('https://github.com/JakeTOpenSource/parallel-advisor-pilot-001') &&
  skillCards[0]?.includes('Delta-Atlas-Document.html?file=BespokeNode-Spec-v0.1.md') && /minted gold by owner decision on 2026-09-23/.test(skillCards[0] || ''),
  'BespokeNode card binds pilot-001, the public specification, and the dated mint');
check(skillCards[1]?.includes('python skills/pin-check/pin_check.py') && skillCards[1]?.includes('Delta-Atlas-Document.html?file=skills/pin-check/README.md') &&
  fs.existsSync(path.join(root, 'skills/pin-check/pin_check.py')),
  'Pin-Check card shows the run command and the script and README exist in the repository');
check(skillCards[2]?.includes('Delta-Atlas-Document.html?file=skills/bridge-card/README.md') && skillCards[2]?.includes('Delta-Atlas-Architecture.html#crosswalk') &&
  /id="crosswalk"/.test(architecture) && fs.existsSync(path.join(root, 'skills/bridge-card/README.md')),
  'OpenMirror card binds the Bridge Card and the crosswalk anchor, both of which exist');
check(/not an empirically validated law/.test(skillCards[2] || '') && !/\bis an? (?:empirically )?(?:validated|proven) law\b/.test(skillCards[2] || ''),
  'OpenMirror card states the crosswalk is not a validated law and never upgrades it into one');
check(/I red-teamed it against a first draft; those notes are not yet published\./.test(skillCards[2] || '') && !/\baccepted (?:rebuild|version|one)\b/.test(skillCards[2] || ''),
  'OpenMirror receipt is stated in the first person with its notes marked unpublished, not as an accepted state with no ledger entry');

/* Receipts strip */
const winBlock = (html.match(/<div class="rcol win">([\s\S]*?)<\/div>/) || [])[1] || '';
const flagBlock = (html.match(/<div class="rcol flag">([\s\S]*?)<\/div>/) || [])[1] || '';
check(/<h3>Proven<\/h3>/.test(winBlock) && /<h3>Not proven<\/h3>/.test(flagBlock), 'receipts strip has a Proven column and a Not proven column');
check(/Nothing has been independently replicated\./.test(flagBlock) && /not validated laws/.test(flagBlock) &&
  /No evidence on true concurrency, scheduler preemption, power loss, crash durability, or production behavior\./.test(flagBlock),
  'Not proven column carries the substrate, crosswalk and replication limits');
check(!/replicated|production|concurrency|preemption|power loss|durability|validated law/i.test(winBlock),
  'Proven column makes no substrate, replication or law claim');
check(/on synthetic cases/.test(winBlock) && /on deterministic synthetic cases/.test(winBlock), 'Proven column scopes its claims to synthetic cases');
check(html.indexOf('<p class="headline">Simplification is systems maintenance;') < html.indexOf('class="doors primary-tools primary-skills"') &&
  html.indexOf('class="doors primary-tools primary-skills"') < html.indexOf('<div class="rcol win">'),
  'thesis precedes the skill cards, which precede the receipts strip');
check(/onclick="nav\('Delta-Atlas-Evidence\.html'\)"[^>]*>Full receipts/.test(html), 'home routes to the full receipts page');

/* Instruments and sample */
for (const [route, label] of [['Delta-Atlas-GapCheck.html', 'Gap Check'], ['Delta-Atlas-Tracer.html', 'Priority Tracer'],
  ['Coherence-Audit.html', 'Framework Audit'], ['Delta-Atlas-ContinuityAudit.html', 'Continuity Audit']]) {
  check(new RegExp(`onclick="nav\\('${route.replace('.', '\\.')}'\\)"[^>]*>${label}`).test(html), `${label} remains reachable from the instruments strip`);
}
check(html.indexOf('class="doors primary-tools primary-skills"') < html.indexOf('<details class="sample">') &&
  /class="[^"]*tool-boundary[^"]*">[^<]*[Aa] clean result does not certify correctness or safety\./.test(html),
  'skills precede the optional sample and the instruments retain a visible result ceiling');
check(/sample\.addEventListener\('toggle'/.test(html) && /data-src="Delta-Atlas-GapCheck\.html#embed"/.test(html), 'sample frame is opt-in');

/* Honest floor */
check(!/nothing leaves it|no tracking/i.test(html), 'unsupported absolute privacy copy is absent');
check(/Cloudflare Web Analytics/.test(html) && /plan and search text are (?:analyzed|processed) locally/i.test(html) &&
  /does not place submitted text in request URLs or send it to a model or API/i.test(html),
  'local-input and telemetry boundary is disclosed');
check(!/THE ONE NOBODY ELSE HAS/.test(html), 'unsupported competitive superlative is absent');
check(!/every change logged with its reason|every seam on record/i.test(html), 'absolute history-coverage copy is absent');
check(/Candidate source inventory: 439 vocabulary records/.test(html) && /Ask and Explore snapshot: <b>435 records<\/b>/.test(html),
  'source inventory and embedded projection counts remain distinct');

/* Garden scene retained and wired */
check(/<div id="garden-scene" aria-hidden="true">/.test(html) && /id="garden-still"/.test(html) && /id="garden-water"/.test(html) && /id="garden-deer"/.test(html),
  'garden scene, still image, water canvas and deer layer are present');
check(/<button class="garden-motion-toggle" id="motion-toggle"/.test(html) && /id="motion-status" role="status" aria-live="polite"/.test(html),
  'garden motion toggle and status note are present');
const liveHtml = html.replace(/<!--[\s\S]*?-->/g, '');
check(/<script src="assets\/garden-water-v1\.js" defer><\/script>/.test(liveHtml) && /<script src="assets\/garden-deer-pose-v1\.js" defer><\/script>/.test(liveHtml) &&
  /<script src="assets\/garden-deer-v1\.js" defer><\/script>/.test(liveHtml), 'garden water and deer scripts are live script tags');
check(/<link rel="stylesheet" href="assets\/garden-home-v1\.css"\/>/.test(liveHtml), 'garden stylesheet is a live link tag');
check(/<img id="garden-still" src="assets\/hanging-garden-v1\.webp"/.test(liveHtml) && /<link rel="preload" href="assets\/hanging-garden-v1\.webp" as="image"\/>/.test(liveHtml),
  'garden still image source and preload both name the hanging-garden asset');
check(/<div id="garden-scene" aria-hidden="true">[\s\S]*?<canvas id="garden-water"><\/canvas>[\s\S]*?<div id="garden-deer" aria-hidden="true"><\/div>/.test(liveHtml),
  'garden scene contains the water canvas and deer layer in live markup');
check(!/#garden-scene\s*\{[^}]*display\s*:\s*none/.test(liveHtml) && !/#garden-scene\s*\{[^}]*visibility\s*:\s*hidden/.test(liveHtml),
  'home stylesheet does not hide the garden scene');
for (const asset of ['assets/garden-water-v1.js', 'assets/garden-deer-pose-v1.js', 'assets/garden-deer-v1.js', 'assets/garden-home-v1.css', 'assets/hanging-garden-v1.webp',
  'assets/garden-deer-mother-v1.webp', 'assets/garden-deer-young-v1.webp', 'assets/garden-deer-alert-v1.webp']) {
  check(fs.existsSync(path.join(root, asset)), `garden asset file is present: ${asset}`);
}
check(!/<svg\b/.test(html), 'no inline decorative SVG remains in the home document');

/* Service worker */
check(/const CACHE='aaig-v(\d+)';/.test(serviceWorker) && Number(serviceWorker.match(/const CACHE='aaig-v(\d+)';/)[1]) >= 100,
  'service-worker cache generation is at or above v100');
for (const asset of ['Delta-Atlas-Architecture.html', 'BespokeNode-Spec-v0.1.md', 'skills/pin-check/README.md', 'skills/bridge-card/README.md', 'assets/hanging-garden-v1.webp']) {
  check(serviceWorker.includes(`'${asset}'`), `service-worker core caches ${asset}`);
}

/* Library */
check(/160 recorded cross-domain primitives/.test(library), 'Library primitive count matches the recorded inventory');
check(!/\b150 cross-domain primitives\b/.test(html + library), 'stale primitive count is absent');
check((`${html}\n${library}`.match(/<button\b[^>]*class="[^"]*\barea\b/g) || []).length === 0 &&
  /Open Explore and choose an area/.test(library),
  'Library directs readers to choose a real Explore filter');
check(/design hypothesis, not a transferred law/.test(library) && /conditional indicators, not diagnoses/.test(library),
  'relocated analogy cards preserve their scientific claim ceilings');
check(/Delta-Atlas-Architecture\.html/.test(library) && /skills\/pin-check\/README\.md/.test(library) && /skills\/bridge-card\/README\.md/.test(library),
  'Library lists the architecture page and both skills');
for (const [route, label] of [['Delta-Atlas-GapCheck.html', 'Gap Check'], ['Delta-Atlas-Tracer.html', 'Priority Tracer'],
  ['Coherence-Audit.html', 'Framework Audit'], ['Delta-Atlas-ContinuityAudit.html', 'Continuity Audit']]) {
  check(new RegExp(`href="index\\.html#${route.replace('.', '\\.')}"[^>]*>${label}<`).test(library), `Library keeps ${label} reachable through the shell`);
}

/* Unpublished work stays status-only: no thresholds, bench counts, or vignette figures on public surfaces */
const visibleText = (source) => source.replace(/<style\b[\s\S]*?<\/style>/gi, '').replace(/<script\b[\s\S]*?<\/script>/gi, '');
const unpublishedFigures = /\b(?:30%|70%|50%|20%|90%|100\/100|16 vignettes|55 alarms|56 frozen prompts|50 crude-hint|GT-[0-9]+\b|MED v2|Track [CM]\b|zero false alarms|false alarms?|exact matches?|premise and honest|honest runs|substantive disagreements|denaturation|crosstalk)/i;
for (const [label, surface] of [['home', html], ['evidence', evidence], ['architecture', architecture], ['library', library]]) {
  check(!unpublishedFigures.test(visibleText(surface)), `${label} carries no figures or identifiers from unpublished probe work in its visible text`);
}

/* Owner writing rule: no em dashes on the surfaces this build touched */
for (const [label, surface] of [['home', html], ['evidence', evidence], ['architecture', architecture], ['library', library], ['specification', spec]]) {
  check(!/—|&mdash;|&#8212;|&#x2014;/i.test(surface), `${label} contains no em dash`);
}

/* Specification edits are disclosed, not silent */
check(/## Editorial note \(2026-09-24 review before site build\)/.test(spec) && /accumulate far fewer, and each one is small enough to gate/.test(spec) &&
  /The claim this framework makes is that more information does not resolve drift/.test(spec),
  'specification carries its two softened sentences and the note that discloses them');

if (failures) process.exitCode = 1;
else console.log('Home surface verification PASS');
