/**
 * ask-corpus.js — deterministic calibration harness for the Ask engine.
 *
 * Run:  node ask-corpus.js       (from this folder; Node only, no deps)
 *
 * Loads answer() straight out of Agentic-AI-Governance-Chat.html (single source of truth) and
 * asserts three things the red-team-style probe surfaced:
 *   1. Real terms and their variants (plurals, acronyms, sloppy phrasing) resolve to the RIGHT term.
 *   2. A query that only matches a FRAGMENT of a term never confidently returns the wrong one
 *      ("sandbagging" must not become "Bagging"; "vector store" must not become "Store"). It may
 *      hit the right term or fall back to closest-matches, but it must not sound sure while wrong.
 *   3. A genuine non-term falls back to closest matches (a miss), never a false definition.
 * The labels are the floor: when a case fails, fix the matching rules in the HTML, not the label.
 *
 * License: CC BY 4.0, consistent with the rest of the project.
 */
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const H = require("./corpus-harness.js");

function loadAnswer() {
  const lines = fs.readFileSync(path.join(__dirname, "Agentic-AI-Governance-Chat.html"), "utf8").split(/\r?\n/);
  const start = lines.findIndex(l => l.trim() === "<script>");
  const end = lines.findIndex(l => l.startsWith("const feed="));
  if (start < 0 || end < 0) throw new Error("ask-corpus: could not bound the inline script");
  const sandbox = { document: { getElementById: () => ({}) }, location: { search: "" }, console };
  vm.createContext(sandbox);
  vm.runInContext(lines.slice(start + 1, end).join("\n") + "\nthis.answer = answer;", sandbox);
  return sandbox.answer;
}

const defName = r => { const m = (r.reading || "").match(/^define\(([^)]*)\)/); return m ? m[1] : null; };

// 1) must resolve to the right term (define == expected)
const HITS = [
  ["context window", "Context Window"],
  ["guardrails", "Guardrail"],
  ["hallucinations", "Hallucination"],
  ["MCP", "Model Context Protocol"],
  ["what is RAG?", "Retrieval-Augmented Generation"],
  ["red teaming", "Red Teaming"],
  ["tool poisoning", "Tool Poisoning"],
  ["what is a harness?", "Harness"],
  ["vector database", "Vector Database"],
  ["excessive agency", "Excessive Agency"],
];
// 2) must NOT confidently define the wrong (fragment-collision) term
const NOT_WRONG = [
  ["sandbagging", "Bagging"],
  ["what is a vector store", "Store"],
  ["prompt injektion", "Prompt"],
];
// 3) genuine non-term must fall back to a miss, never a false definition
const MISSES = ["what is the meaning of life"];

function run() {
  const answer = loadAnswer();
  for (const [q, want] of HITS) {
    const got = defName(answer(q));
    if (got === want) H.pass('resolves "' + q + '" -> ' + want);
    else H.fail('resolves "' + q + '"', "wanted define(" + want + "), got " + (got ? "define(" + got + ")" : "no confident define"));
  }
  for (const [q, forbidden] of NOT_WRONG) {
    const got = defName(answer(q));
    if (got !== forbidden) H.pass('"' + q + '" does not confidently return the wrong "' + forbidden + '" (got ' + (got ? "define(" + got + ")" : "closest-matches") + ")");
    else H.fail('"' + q + '" sounds sure while wrong', "confidently defined " + forbidden);
  }
  for (const q of MISSES) {
    const r = answer(q);
    if (r.miss && !defName(r)) H.pass('"' + q + '" falls back to closest matches (honest miss)');
    else H.fail('"' + q + '" should be an honest miss', "got define(" + defName(r) + ")");
  }
  process.exit(H.summarize());
}
run();
