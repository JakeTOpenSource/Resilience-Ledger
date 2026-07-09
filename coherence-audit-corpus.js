// coherence-audit-corpus.js — labeled corpus for Framework Audit / coherence-score-engine.js.
// Didn't exist before this extraction; the three cases are the tool's own built-in
// examples (Strong / Weak / Typical), with the exact overall + per-part scores the
// engine already produced, captured as the floor. If a future change to the engine
// moves these numbers, the fix is to justify the change (write it down), never to
// silently accept a drifted score as the new normal.
// Run: node coherence-audit-corpus.js

"use strict";
const E = require("./coherence-score-engine.js");
const H = require("./corpus-harness.js");

function content(s) { return E.content(s); }

const CASES = [
  {
    name: "Strong plan (deploy safety) — overall 92",
    goal: "Ship the new release without breaking existing customers.",
    parts: [
      "Run the full test suite on every change; block the merge if any test fails.",
      "The on-call engineer reviews error rates for 30 minutes after each deploy.",
      "Keep the previous version ready; if error rates rise above 2%, roll back within 5 minutes.",
      "Email customers the change list 24 hours before release.",
      "Track failed logins daily; if they jump 20% above baseline, page security.",
    ],
    expectOverall: 92, expectPerPart: [85, 91, 95, 96, 95],
  },
  {
    name: "Weak plan (buzzword soup) — overall 38",
    goal: "Become the market leader.",
    parts: [
      "Leverage synergies to deliver world-class, best-in-class value.",
      "Always exceed every customer expectation, guaranteed.",
      "Foster a culture of innovation and excellence.",
      "Be agile, scalable, and future-proof.",
      "Empower our people to win.",
    ],
    expectOverall: 38, expectPerPart: [31, 46, 33, 40, 40],
  },
  {
    name: "Typical mixed plan (cafe) — overall 73",
    goal: "Open the cafe and cover our costs within six months.",
    parts: [
      "Deliver a best-in-class, unforgettable customer journey.",
      "Serve at least 60 customers a day by month three.",
      "The owner checks sales against the budget every Friday.",
      "We will always delight every single guest.",
      "If weekly sales miss target for a month, drop the priciest supplier.",
    ],
    expectOverall: 73, expectPerPart: [51, 91, 86, 41, 95],
  },
];

function run() {
  const scorer = E.makeScorer(); // default config — must match Framework Audit's shipped behavior exactly
  for (const c of CASES) {
    const goalTokens = content(c.goal);
    const scored = c.parts.map((t, i) => scorer.scorePart(t, goalTokens, c.parts, i));
    const overall = Math.round(scored.reduce((a, p) => a + p.avg, 0) / scored.length);
    const perPart = scored.map(p => p.avg);
    const problems = [];
    if (overall !== c.expectOverall) problems.push("overall=" + overall + " want " + c.expectOverall);
    c.expectPerPart.forEach((want, i) => { if (perPart[i] !== want) problems.push("part[" + i + "]=" + perPart[i] + " want " + want); });
    if (problems.length) H.fail(c.name, problems); else H.pass(c.name);
  }
  process.exit(H.summarize("scenarios"));
}
run();
