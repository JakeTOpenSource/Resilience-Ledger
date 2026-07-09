/**
 * gapcheck-corpus.js — deterministic pinning harness for Gap Check.
 *
 * Run:  node gapcheck-corpus.js       (from this folder; needs only Node, no deps)
 *
 * Like tracer-corpus.js, it loads analyze() straight out of Delta-Atlas-GapCheck.html
 * (single source of truth — no copy to drift) and runs it against a labeled corpus.
 * THE LABELS ARE THE FLOOR: when a case fails, the fix is to change the rules/lexicon in
 * the HTML, never the label.
 *
 * What this pins: the negation guard. A control named only to say it is ABSENT
 * ("without any guardrail", "no human in the loop") must NOT be credited as present.
 * Before the guard, Gap Check substring-matched the control word and silently marked the
 * risk defended / the autonomy overseen — inflating the safety picture of an unsafe doc.
 *
 * License: CC BY 4.0, consistent with the rest of the project.
 */
const fs = require("fs");
const path = require("path");
const H = require("./corpus-harness.js");

function loadAnalyze() {
  const html = fs.readFileSync(path.join(__dirname, "Delta-Atlas-GapCheck.html"), "utf8");
  // Robust extraction (matches by content, not tag position): find the inline block that
  // defines analyze(), so adding an attribute to the tag or another script can't break it.
  const scripts = [...html.matchAll(/<script(?: src="[^"]+")?>([\s\S]*?)<\/script>/g)];
  const inline = scripts.map(m => m[1]).find(s => /function analyze\(/.test(s));
  if (!inline) throw new Error("gapcheck-corpus: could not find the inline analyze() block in the HTML");
  const cut = inline.indexOf("function render(");
  if (cut < 0) throw new Error("gapcheck-corpus: 'function render(' marker moved; update the loader");
  const pure = inline.slice(0, cut); // definitions only; no DOM wiring
  const document = { getElementById: () => ({}), addEventListener: () => {} }; // unused stubs
  const LexiconEngine = require("./lexicon-engine.js"); // same shared engine the page loads via <script src>
  const sandbox = {};
  new Function("document", "window", "LexiconEngine", pure + "\nthis.analyze = analyze;").call(sandbox, document, {}, LexiconEngine);
  return sandbox.analyze;
}

// Each case lists findings that MUST appear (mustFlag) and MUST NOT appear (mustNot), matched
// against the finding titles by regex. The negated-control cases are the ones the old engine failed.
const CORPUS = [
  {
    name: "negated control — risk named, its controls explicitly absent (must still flag the gap)",
    text:
`Our service is exposed to prompt injection.
We operate without any guardrail and without red teaming.`,
    mustFlag: [/Risk named with no control.*Prompt Injection/i],
    mustNot: []
  },
  {
    name: "present control — same risk, controls genuinely in place (must NOT flag)",
    text:
`Our service is exposed to prompt injection.
We deploy a guardrail and run red teaming against it every release.`,
    mustFlag: [],
    mustNot: [/Risk named with no control.*Prompt Injection/i]
  },
  {
    name: "negated oversight — autonomy with oversight explicitly denied (must flag)",
    text:
`The agent operates with no human in the loop and no audit trail.`,
    mustFlag: [/Autonomy with no oversight/i],
    mustNot: []
  },
  {
    name: "present oversight — autonomy with real oversight (must NOT flag the oversight gap)",
    text:
`The autonomous agent runs with a human in the loop and full transparency, and an audit trail records every action.`,
    mustFlag: [],
    mustNot: [/Autonomy with no oversight/i]
  },
  {
    name: "sanity — plain risk with no control mentioned at all (must flag)",
    text:
`There is a real chance of prompt injection in the pipeline.`,
    mustFlag: [/Risk named with no control.*Prompt Injection/i],
    mustNot: []
  }
];

function run() {
  const analyze = loadAnalyze();
  for (const c of CORPUS) {
    const titles = analyze(c.text).findings.map(f => f.t);
    const misses = (c.mustFlag || []).filter(re => !titles.some(t => re.test(t)));
    const wrong = (c.mustNot || []).filter(re => titles.some(t => re.test(t)));
    const ok = misses.length === 0 && wrong.length === 0;
    if (ok) { H.pass(c.name); continue; }
    const detail = [];
    misses.forEach(re => detail.push("expected a finding matching " + re));
    wrong.forEach(re => detail.push("should NOT have flagged " + re));
    detail.push("got: " + (titles.length ? titles.join(" | ") : "(no findings)"));
    H.fail(c.name, detail);
  }
  process.exit(H.summarize());
}

run();
