#!/usr/bin/env node
'use strict';

/* Deterministic, no-network acceptance checks for the public Atlas home surface. */
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..', '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const library = fs.readFileSync(path.join(root, 'Delta-Atlas-Library.html'), 'utf8');
let failures = 0;
function check(condition, message) {
  if (!condition) { failures += 1; console.error(`FAIL ${message}`); }
  else console.log(`PASS ${message}`);
}

check(/<header\b[^>]*id="bar"/.test(html), 'semantic header exists');
try {
  for (const [index, script] of [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].entries()) new Function(script[1]);
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
check(!/nothing leaves it|no tracking/i.test(html), 'unsupported absolute privacy copy is absent');
check(/Cloudflare Web Analytics/.test(html) && /plan and search text are (?:analyzed|processed) locally/i.test(html) &&
  /does not place submitted text in request URLs or send it to a model or API/i.test(html),
  'local-input and telemetry boundary is disclosed');
check(/history\.pushState/.test(html) && /addEventListener\('popstate'/.test(html), 'history traversal is implemented');
check(/var url=location\.href;/.test(html), 'Share preserves the active route');
check(/Object\.freeze\(\{/.test(html) && /NAV_ROUTES/.test(html) && /hasOwnProperty\.call\(NAV_ROUTES,routePath\)/.test(html), 'fixed route allowlist remains enforced');
const primaryNav = (html.match(/<nav\b[^>]*aria-label="Primary navigation"[^>]*>([\s\S]*?)<\/nav>/) || [])[1] || '';
const primaryLabels = [...primaryNav.matchAll(/<button\b[^>]*>([^<]+)<\/button>/g)].map((match) => match[1].trim());
check(JSON.stringify(primaryLabels) === JSON.stringify(['Tools', 'Evidence', 'Library']), 'primary navigation exposes exactly Tools, Evidence, and Library');
check(/id="home0"[^>]*onclick="goHome\(true\)"/.test(primaryNav) &&
  /data-f="Delta-Atlas-Evidence\.html"/.test(primaryNav) && /data-f="Delta-Atlas-Library\.html"/.test(primaryNav),
  'primary navigation binds the home and two index routes');
const searchControl = (html.match(/<button\b[^>]*id="search0"[^>]*>Search terms<\/button>/) || [])[0] || '';
check(Boolean(searchControl) && /onclick="showSearch\(\)"/.test(searchControl) &&
  !/\bhidden\b|aria-hidden="true"|display\s*:\s*none/.test(searchControl) &&
  /<input\b[^>]*id="hq"[^>]*aria-label="[^"]+"/.test(html), 'visible Search control targets the labelled glossary input');
const primaryTools = (html.match(/<div\b[^>]*class="[^"]*\bprimary-tools\b[^"]*"[^>]*>([\s\S]*?)<\/div>/) || [])[1] || '';
const taskCards = [...primaryTools.matchAll(/<button\b[^>]*type="button"[^>]*onclick="nav\('([^']+)'\)"[^>]*>([\s\S]*?)<\/button>/g)];
const expectedTasks = [
  ['Delta-Atlas-ContinuityAudit.html', 'Look for handover gaps', 'Answer five short questions'],
  ['Delta-Atlas-GapCheck.html', 'Review the wording of an AI plan', 'Try an example or paste a plan'],
  ['Delta-Atlas-Tracer.html', 'Review an AI action log', 'Try an example or paste recorded steps']
];
check(taskCards.length === 3 && taskCards.every((card, index) => card[1] === expectedTasks[index][0] &&
  card[2].includes(expectedTasks[index][1]) && card[2].includes(expectedTasks[index][2])),
  'three primary tasks identify their input and bind the intended existing tools');
check(taskCards[0]?.[2].includes('START HERE') && taskCards[2]?.[2].includes('TECHNICAL') &&
  html.includes('No document needed to try the examples.') && html.includes('Everyday wording can be missed.'),
  'beginner entry identifies a starting point, examples and text-check limits');
check(html.indexOf(primaryTools) < html.indexOf('<details class="sample">') &&
  /class="[^"]*tool-boundary[^"]*">[^<]*[Aa] clean result does not certify correctness or safety\./.test(html),
  'primary tasks precede the optional sample and retain a visible result ceiling');
check(!primaryTools.includes('Coherence-Audit.html') && /onclick="nav\('Coherence-Audit\.html'\)"[^>]*>Framework Audit: review a general plan/.test(html),
  'Framework Audit remains a reachable secondary tool');
check(/sample\.addEventListener\('toggle'/.test(html) && /data-src="Delta-Atlas-GapCheck\.html#embed"/.test(html), 'sample frame is opt-in');
check(/min-height:44px/.test(html) && /@media \(max-width:700px\)/.test(html), 'mobile touch and navigation rules exist');
check(!/THE ONE NOBODY ELSE HAS/.test(html), 'unsupported competitive superlative is absent');
check(/Candidate source inventory: 439 vocabulary records/.test(html) && /Ask and Explore snapshot: <b>435 records<\/b>/.test(html),
  'source inventory and embedded projection counts remain distinct');
check(/160 recorded cross-domain primitives/.test(library), 'Library primitive count matches the recorded inventory');
check(!/\b150 cross-domain primitives\b/.test(html + library), 'stale primitive count is absent');
check((`${html}\n${library}`.match(/<button\b[^>]*class="[^"]*\barea\b/g) || []).length === 0 &&
  /Open Explore and choose an area/.test(library),
  'Library directs readers to choose a real Explore filter');
check(/design hypothesis, not a transferred law/.test(library) && /conditional indicators, not diagnoses/.test(library),
  'relocated analogy cards preserve their scientific claim ceilings');
check(/role="status" aria-live="polite"/.test(html) && /frame\.focus\(\)/.test(html),
  'embedded route loading is announced and focus is moved');
check(!/every change logged with its reason|every seam on record/i.test(html), 'absolute history-coverage copy is absent');
for (const tag of html.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)) {
  check(/rel="[^"]*noopener/.test(tag[0]), `new-tab link has noopener: ${tag[0].slice(0, 100)}`);
}
if (failures) process.exitCode = 1;
else console.log('Home surface verification PASS');
