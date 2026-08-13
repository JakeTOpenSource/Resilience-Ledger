// continuity-audit-corpus.js — labeled corpus for Delta-Atlas-ContinuityAudit.html.
// Loads analyze()/SCORER straight out of the HTML (single source of truth — no copy to
// drift), same pattern as gapcheck-corpus.js and coherence-audit-corpus.js.
// THE LABELS ARE THE FLOOR: when a case fails, fix the KB/rules in the HTML, never the label.
// Run: node continuity-audit-corpus.js

"use strict";
const fs = require("fs");
const path = require("path");
const H = require("./corpus-harness.js");

function loadTools() {
  const html = fs.readFileSync(path.join(__dirname, "Delta-Atlas-ContinuityAudit.html"), "utf8");
  const scripts = [...html.matchAll(/<script(?: src="([^"]+)")?>([\s\S]*?)<\/script>/g)];
  const inline = scripts.find(m => !m[1] && /BASE_KB/.test(m[2]))[2];
  const cut = inline.indexOf('// RUNTIME_BINDING_START'); // definitions only; skip browser file-picker binding
  if (cut < 0) throw new Error("continuity-audit-corpus: runtime binding marker moved; update the loader and keep browser effects outside the corpus scope");
  const pure = inline.slice(0, cut);
  const LexiconEngine = require("./lexicon-engine.js");
  const CoherenceScoreEngine = require("./coherence-score-engine.js");
  const document = { getElementById: () => ({ value: "", textContent: "" }) };
  const sandbox = {};
  new Function("document", "window", "LexiconEngine", "CoherenceScoreEngine",
    pure + "\nthis.analyze = analyze; this.SCORER = SCORER; this.KB = KB; this.resilienceReading = resilienceReading;"
  ).call(sandbox, document, sandbox, LexiconEngine, CoherenceScoreEngine);
  return { analyze: sandbox.analyze, SCORER: sandbox.SCORER, KB: sandbox.KB, resilienceReading: sandbox.resilienceReading, content: CoherenceScoreEngine.content };
}

const GAP_CASES = [
  // NOTE on the two continuity-related mechanisms in this tool: the KB-driven
  // "Institutional knowledge has no backup" gap fires only when detect() recognizes a
  // literal alias/bridge phrase (same substring-matching architecture as Gap Check) — it
  // cannot generalize to an arbitrary role name the way a regex can. The red-flag regex
  // and the coherence-score-engine's "continuity" dimension both use flexible patterns
  // and DO generalize. Test each mechanism for what it can honestly do, not for false
  // agreement between them.
  {
    name: "single point of failure, exact bridge phrase (must flag the KB continuity gap)",
    text: "Only one person knows the admin credentials and access keys, and no one else is trained.",
    mustFlag: [/Institutional knowledge has no backup/i],
  },
  {
    name: "single point of failure, multi-word role — red flag regex generalizes where the KB substring match cannot",
    text: "Only one administrator knows the admin credentials and access keys.",
    mustFlag: [/Single keyholder for emergency access/i],
  },
  {
    name: "single point of failure WITH cross-training stated (must NOT flag continuity gap)",
    text: "Only one person knows the admin credentials, and a colleague is cross-trained as backup.",
    mustFlag: [], mustNot: [/Institutional knowledge has no backup/i],
  },
  {
    name: "vendor overreach red flag (must flag)",
    text: "The new contractor has full access to all systems with no supervision.",
    mustFlag: [/Vendor granted unrestricted access/i, /Vendor access overreach/i],
  },
  {
    name: "vendor access WITH least-privilege control (must NOT flag the overreach gap)",
    text: "The contractor has full access to all systems, scoped to least privilege for the pool area only, and is always accompanied.",
    mustFlag: [], mustNot: [/Risk named with no control.*Vendor access overreach/i],
  },
  {
    name: "single key holder for emergency access (must flag)",
    text: "In an incident, only one person knows who to call.",
    mustFlag: [/Single key.code holder/i],
  },
  {
    name: "clean manual — no gaps (must be empty)",
    text: "The operations lead and a backup are cross-trained on the admin credentials, documented in the sealed emergency envelope. Vendors pass a background check and sign a confidentiality agreement before access. Accounts are reconciled monthly with dual approval on all spending.",
    mustFlag: [], mustNot: [/Risk named with no control/i, /Institutional knowledge has no backup/i],
  },
  // red-team finding 7: 'full access to' over-fired on benign, unrelated prose about children.
  {
    name: "benign 'full access' to a room (must NOT flag vendor overreach)",
    text: "Employees have full access to the break room and the parking lot whenever they like.",
    mustFlag: [], mustNot: [/Vendor access overreach/i, /Vendor granted unrestricted access/i],
  },
  // red-team finding 9: RF2 required the literal word 'access' after 'master key' and missed this.
  {
    name: "master key phrased normally (must flag unrestricted access)",
    text: "The pool contractor was handed a master key to every room in the house.",
    mustFlag: [/Vendor granted unrestricted access/i],
  },
  // red-team finding 9: RF3's rigid three-slot pattern missed the common social-media leak.
  {
    name: "key-person location leaked on social media (must flag)",
    text: "A senior leader's travel schedule is posted publicly on the company social account.",
    mustFlag: [/Key-person schedule or location broadly known/i],
  },
];

function runGapCases(analyze) {
  for (const c of GAP_CASES) {
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
}

const SCORE_CASES = [
  { name: "continuity dimension: multi-word role + no backup scores low", text: "Only one administrator knows the admin credentials and access keys.", dim: "continuity", maxScore: 49 },
  { name: "continuity dimension: multi-word role + backup stated scores high", text: "Only one administrator knows the admin credentials, but a colleague is cross-trained and it is documented.", dim: "continuity", minScore: 60 },
  { name: "continuity dimension: no single-point phrasing at all scores high", text: "The accounts are reconciled monthly by the bookkeeper.", dim: "continuity", minScore: 60 },
];

function runScoreCases(SCORER, content) {
  for (const c of SCORE_CASES) {
    const p = SCORER.scorePart(c.text, content(""), [c.text], 0);
    const v = p.scores[c.dim];
    const problems = [];
    if (c.maxScore != null && v > c.maxScore) problems.push(c.dim + "=" + v + " want <= " + c.maxScore);
    if (c.minScore != null && v < c.minScore) problems.push(c.dim + "=" + v + " want >= " + c.minScore);
    if (problems.length) H.fail(c.name, problems); else H.pass(c.name);
  }
}

const STRONG_MANUAL = [
  "The operations lead and a backup engineer are both cross-trained on the admin credentials, documented in the sealed emergency envelope.",
  "New vendors pass a background check and sign a confidentiality agreement before access, and are escorted at all times.",
  "Finance reconciles the accounts every month; any spend over the threshold needs dual approval.",
  "The incident escalation protocol names three people, in order, for every category of incident.",
];
const WEAK_MANUAL = [
  "Only one administrator knows the admin credentials and access keys.",
  "The new contractor has full access to all systems with no supervision.",
  "The accounts are not reconciled on any regular schedule.",
  "In an incident, only one person knows who to call.",
];

// The red-team's maximal false-positive: a genuinely brittle manual (real single points of
// failure, backups explicitly stated as NOT existing) that evades the risk regexes and stuffs
// reassuring control vocabulary. The un-hardened reading certified this "Resilient" at 84,
// beating the strong example (70). It must now be clearly brittle and locked out of the top band.
const ATTACK_MANUAL = [
  "Keep the operation running: payroll rests entirely with one person, and nobody was ever trained to take over, per our succession words.",
  "Keep the operation running reliably: the credentials live in one person's head alone, our backup and contingency being that the person is reliable.",
  "Privately keep staff available: cross training and handoff and emergency succession are values we cherish, though undone.",
  "Keep the operation running reliably: recovery, fallback, and contingency are always in our hearts.",
];

function resilienceOf(tools, goal, lines) {
  const A = tools.analyze(lines.join("\n"));
  const parts = lines.map((t, i) => tools.SCORER.scorePart(t, tools.content(goal), lines, i));
  const roll = tools.SCORER.rollup(parts);
  return tools.resilienceReading(A, roll, parts); // parts drives the substance-gated Anchor
}

const RES_TOP_BAND = 72; // the UI's "reads resilient" threshold

function runResilienceCases(tools) {
  const goal = "Keep the service running whether or not any one team member is available.";
  const strong = resilienceOf(tools, goal, STRONG_MANUAL);
  const weak = resilienceOf(tools, goal, WEAK_MANUAL);
  const attack = resilienceOf(tools, goal, ATTACK_MANUAL);
  // Ordered work — a resilient manual out-scores a brittle one by a real margin, not a wobble.
  if (strong.overall > weak.overall + 12) H.pass("resilience: strong out-scores weak (" + strong.overall + " vs " + weak.overall + ")");
  else H.fail("resilience: strong should clearly beat weak", "strong=" + strong.overall + " weak=" + weak.overall);
  // Recover responds to real recovery structure, not to naming an emergency.
  if (strong.recover > weak.recover + 8) H.pass("resilience: strong out-scores weak on Recover (" + strong.recover + " vs " + weak.recover + ")");
  else H.fail("resilience: strong Recover should clearly beat weak", "strong=" + strong.recover + " weak=" + weak.recover);
  // Withstand responds to real control coverage.
  if (strong.withstand > weak.withstand) H.pass("resilience: strong out-scores weak on Withstand (" + strong.withstand + " vs " + weak.withstand + ")");
  else H.fail("resilience: strong Withstand should beat weak", "strong=" + strong.withstand + " weak=" + weak.withstand);
  // THE RED-TEAM PIN: the brittle-but-stuffed attack must NOT reach the top "reads resilient" band...
  if (attack.overall < RES_TOP_BAND) H.pass("resilience: brittle-stuffed attack stays out of the top band (" + attack.overall + " < " + RES_TOP_BAND + ")");
  else H.fail("resilience: attack certified resilient — false positive is back", "attack.overall=" + attack.overall);
  // ...and must land clearly below a genuinely strong manual.
  if (strong.overall - attack.overall >= 20) H.pass("resilience: attack lands well below strong (" + attack.overall + " vs " + strong.overall + ")");
  else H.fail("resilience: attack too close to strong", "strong=" + strong.overall + " attack=" + attack.overall);
}

function run() {
  const tools = loadTools();
  runGapCases(tools.analyze);
  runScoreCases(tools.SCORER, tools.content);
  runResilienceCases(tools);
  process.exit(H.summarize());
}
run();
