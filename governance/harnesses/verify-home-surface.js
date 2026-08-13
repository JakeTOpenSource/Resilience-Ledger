#!/usr/bin/env node
'use strict';

/* Deterministic, no-network acceptance checks for the public Atlas home surface. */
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..', '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
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
check(/Paste a plan into Gap Check/.test(html) && html.indexOf('Paste a plan into Gap Check') < html.indexOf('<details class="sample">'), 'primary plan action precedes optional sample');
check(/sample\.addEventListener\('toggle'/.test(html) && /data-src="Delta-Atlas-GapCheck\.html#embed"/.test(html), 'sample frame is opt-in');
check(/min-height:44px/.test(html) && /@media \(max-width:700px\)/.test(html), 'mobile touch and navigation rules exist');
check(!/THE ONE NOBODY ELSE HAS/.test(html), 'unsupported competitive superlative is absent');
check(/Candidate source inventory: 439 vocabulary records/.test(html) && /Ask and Explore snapshot: <b>435 records<\/b>/.test(html),
  'source inventory and embedded projection counts remain distinct');
check(/160 recorded cross-domain primitives/.test(html), 'primitive count matches the recorded library');
check(!/\b150 cross-domain primitives\b/.test(html), 'stale primitive count is absent');
check(/These are the six topic filters available inside Explore/.test(html) &&
  (html.match(/<button class="area"/g) || []).length === 0 &&
  /Open Explore and choose an area/.test(html),
  'area summaries do not pretend to deep-link to an unselected filter');
check(/design hypothesis, not a transferred law/.test(html) && /conditional indicators, not diagnoses/.test(html),
  'analogy cards preserve their scientific claim ceilings');
check(/role="status" aria-live="polite"/.test(html) && /frame\.focus\(\)/.test(html),
  'embedded route loading is announced and focus is moved');
check(!/every change logged with its reason|every seam on record/i.test(html), 'absolute history-coverage copy is absent');
for (const tag of html.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)) {
  check(/rel="[^"]*noopener/.test(tag[0]), `new-tab link has noopener: ${tag[0].slice(0, 100)}`);
}
if (failures) process.exitCode = 1;
else console.log('Home surface verification PASS');
