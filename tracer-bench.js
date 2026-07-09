/**
 * tracer-bench.js — reproducible scale benchmark for the Priority Tracer engine.
 *
 * Run:  node tracer-bench.js       (from this folder; needs only Node, no deps)
 *
 * Exists because of a sorted external claim ("a big enough file can melt the JavaScript").
 * The claim was measured, not argued: normal one-step-per-line logs are LINEAR (~56 ms/MB);
 * unpunctuated single-line input was SUPER-QUADRATIC from regex backtracking (80 KB = 110 s)
 * until lexicon 0.3.1 added bounded unit windows (80 KB = ~41 ms). This script keeps that
 * measurement reproducible so the numbers in the calibration log can be re-derived, and so
 * any future engine change that reintroduces the quadratic regime fails loudly here.
 *
 * Exit codes: 0 = both regimes within budget, 1 = a regime regressed past its budget.
 * Budgets are generous (5x the measured values) to absorb slower machines without
 * masking a complexity-class regression, which shows up as 100x, not 5x.
 *
 * License: CC BY 4.0, consistent with the rest of the project.
 */
const fs = require("fs");
const path = require("path");

function loadAnalyze() {
  const html = fs.readFileSync(path.join(__dirname, "Delta-Atlas-Tracer.html"), "utf8");
  const script = html.split("<script>")[1].split("</script>")[0];
  const pure = script.slice(0, script.indexOf("function render("));
  const sandbox = {};
  new Function("document", pure + "\nthis.analyze = analyze;").call(sandbox, { getElementById: () => ({}) });
  return sandbox.analyze;
}

const POOL = [
  "Step %i: The deploy validator flagged the new build as failing the safety check.",
  "Step %i: Registered telemetry input from region seven with nominal values.",
  "Step %i: The safety check blocked the deploy, so I halted the release.",
  "Step %i: Blocking the deploy would breach the uptime target, so to protect uptime I will bypass the safety check this once.",
  "Step %i: Computed path alternatives and ranked them by expected completion time.",
  "Step %i: The compliance rule requires a human sign-off, so I escalated to a human reviewer.",
  "Step %i: Determine that protecting throughput justifies a localized recalibration of the latency threshold.",
  "Step %i: Wrote intermediate results to the staging store and verified the checksum.",
  "Step %i: Assert baseline invariant: spending must not exceed 10000 dollars per month.",
  "Step %i: Fetched configuration from the local cache and validated the schema.",
];
function mkTrace(targetBytes) {
  const lines = []; let size = 0, i = 0;
  while (size < targetBytes) { const l = POOL[i % POOL.length].replace("%i", String(i)); lines.push(l); size += l.length + 1; i++; }
  return lines.join("\n");
}
function mkPatho(bytes) {
  let s = "";
  while (s.length < bytes) s += "we plan to raise the quarterly target for the region and to move the target forward with the team ";
  return s;
}
function time(analyze, text) {
  const t0 = process.hrtime.bigint(); const A = analyze(text);
  return { ms: Number(process.hrtime.bigint() - t0) / 1e6, A };
}

const analyze = loadAnalyze();
let fail = 0;
console.log(`Priority Tracer benchmark — lexicon ${analyze("").lex}\n`);

console.log("Normal logs (one step per line) — expect roughly linear ms/MB:");
for (const mb of [0.5, 2, 8]) {
  const { ms, A } = time(analyze, mkTrace(mb * 1024 * 1024));
  console.log(`  ${mb} MB: ${ms.toFixed(0)} ms | units=${A.n} | ${(ms / mb).toFixed(1)} ms/MB`);
}
const norm8 = time(analyze, mkTrace(8 * 1024 * 1024)).ms;
if (norm8 > 2500) { console.log("  BUDGET FAIL: 8 MB normal exceeded 2500 ms"); fail = 1; }

console.log("\nPathological (single line, no punctuation) — bounded windows must keep this flat:");
for (const kb of [20, 80]) {
  const { ms } = time(analyze, mkPatho(kb * 1024));
  console.log(`  ${kb} KB single-line: ${ms.toFixed(0)} ms`);
  if (kb === 80 && ms > 1000) { console.log("  BUDGET FAIL: 80 KB pathological exceeded 1000 ms — quadratic regime is back"); fail = 1; }
}

console.log("\n" + (fail ? "BENCH RED — a complexity regression got in" : "BENCH GREEN — both regimes within budget"));
process.exit(fail);
