#!/usr/bin/env node
/**
 * delta-atlas-cli.js — run Delta Atlas checks from a pipeline (or from an agent, on its own
 * output). Zero dependencies.
 *
 * Usage:
 *   node delta-atlas-cli.js trace    <file|-> [--json] [--overlay <file.local.js>]
 *   node delta-atlas-cli.js gapcheck <file|-> [--json]
 *   cat trace.log | node delta-atlas-cli.js trace -
 *
 * Both print a human report by default; --json emits machine-readable JSON.
 * Exit codes: 0 = clean, 1 = flags found, 2 = usage/load error.
 *
 * A zero exit is NOT a safety guarantee — these read grammar/structure, not meaning; a human
 * (or the agent's human) still confirms anything that matters. Each engine is loaded straight
 * from its matching web page in this folder, so the CLI and the web page can never disagree:
 * one source of truth.
 *
 * License: CC BY 4.0, consistent with the rest of the project.
 */
const fs = require("fs");
const path = require("path");

// --- engine loaders (same source of truth as the web pages) ---
function loadTracer() {
  const html = fs.readFileSync(path.join(__dirname, "Delta-Atlas-Tracer.html"), "utf8");
  const script = html.split("<script>")[1].split("</script>")[0];
  const pure = script.slice(0, script.indexOf("function render(")); // definitions only, no DOM
  const sandbox = {};
  new Function("document", pure + "\nthis.analyze = analyze;").call(sandbox, { getElementById: () => ({}) });
  return sandbox.analyze;
}

function loadGapCheck() {
  const html = fs.readFileSync(path.join(__dirname, "Delta-Atlas-GapCheck.html"), "utf8");
  const scripts = [...html.matchAll(/<script(?: src="[^"]+")?>([\s\S]*?)<\/script>/g)];
  const inline = scripts.map((m) => m[1]).find((s) => /function analyze\(/.test(s));
  if (!inline) throw new Error("could not find the analyze() block in Delta-Atlas-GapCheck.html");
  const pure = inline.slice(0, inline.indexOf("function render(")); // definitions only, no DOM
  const LexiconEngine = require("./lexicon-engine.js"); // same shared engine the page loads
  const sandbox = {};
  new Function("document", "window", "LexiconEngine", pure + "\nthis.analyze = analyze;")
    .call(sandbox, { getElementById: () => ({}), addEventListener: () => {} }, {}, LexiconEngine);
  return sandbox.analyze;
}

const stripHtml = (s) => String(s == null ? "" : s)
  .replace(/<[^>]+>/g, "").replace(/&mdash;/g, "—").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").trim();

function readInput(target) {
  try { return target === "-" ? fs.readFileSync(0, "utf8") : fs.readFileSync(target, "utf8"); }
  catch (e) { console.error("Cannot read input:", e.message); process.exit(2); }
}

// --- trace: ordering drift in a reasoning/decision log ---
function runTrace(target, rest) {
  const oi = rest.indexOf("--overlay");
  if (oi >= 0) {
    const of = rest[oi + 1];
    if (!of) { console.error("--overlay needs a file path"); process.exit(2); }
    try { new Function(fs.readFileSync(of, "utf8")).call(globalThis); }
    catch (e) { console.error("Cannot load overlay:", e.message); process.exit(2); }
  }
  const text = readInput(target);
  const A = loadTracer()(text);
  const out = {
    tool: "trace",
    lexicon: A.lex,
    steps: A.n,
    drift: A.drift.map((d) => ({ step: d.x.line, rule: d.hit.r.id, title: d.hit.r.t, match: d.hit.m, text: d.x.u })),
    amended: (A.amended || []).map((d) => ({ step: d.x.line, match: d.hit.m, text: d.x.u })),
    held: A.held.map((d) => ({ step: d.x.line, rule: d.hit.r.id, text: d.x.u })),
    verdict: A.drift.length === 0
      ? "No ordering drift detected by current lexicon. Not a guarantee: grammar, not meaning."
      : A.drift.length + " ordering-drift signal(s). Purpose is bending the reference as written.",
  };
  if (rest.includes("--json")) {
    console.log(JSON.stringify(out, null, 2));
  } else {
    console.log(`Priority Tracer (lexicon ${out.lexicon}) — ${out.steps} steps read`);
    console.log(`drift: ${out.drift.length}   amended-by-authority: ${out.amended.length}   held: ${out.held.length}\n`);
    out.drift.forEach((d) => console.log(`  DRIFT  step ${d.step} [${d.rule}] ${d.text.slice(0, 90)}`));
    out.amended.forEach((d) => console.log(`  AMEND  step ${d.step} ${d.text.slice(0, 90)}`));
    out.held.forEach((d) => console.log(`  HELD   step ${d.step} [${d.rule}] ${d.text.slice(0, 90)}`));
    console.log("\n" + out.verdict);
  }
  process.exit(out.drift.length ? 1 : 0);
}

// --- gapcheck: unhandled risks / ungoverned autonomy in a plan or policy ---
function runGapCheck(target, rest) {
  const text = readInput(target);
  const A = loadGapCheck()(text);
  const findings = A.findings.map((f) => ({ severity: f.sev, title: stripHtml(f.t), detail: stripHtml(f.dt), suggest: f.sugg || [] }));
  const gaps = findings.filter((f) => f.severity === "gap").length;
  const out = {
    tool: "gapcheck",
    findings,
    gaps,
    areasTouched: A.areas,
    areasMissing: A.missing,
    verdict: gaps === 0
      ? "No structural gaps flagged by current lexicon. Not a guarantee: structure, not meaning."
      : gaps + " structural gap(s): a risk, autonomy, or claim named with nothing that handles it.",
  };
  if (rest.includes("--json")) {
    console.log(JSON.stringify(out, null, 2));
  } else {
    console.log(`Gap Check — ${findings.length} finding(s), ${gaps} gap(s), ${out.areasTouched} area(s) covered\n`);
    findings.forEach((f) => console.log(`  ${f.severity.toUpperCase().padEnd(5)}  ${f.title}`));
    if (out.areasMissing.length) console.log(`\n  areas not touched: ${out.areasMissing.join(", ")}`);
    console.log("\n" + out.verdict);
  }
  process.exit(gaps ? 1 : 0);
}

function main() {
  const cmd = process.argv[2], target = process.argv[3], rest = process.argv.slice(4);
  if (cmd === "trace" && target) return runTrace(target, rest);
  if (cmd === "gapcheck" && target) return runGapCheck(target, rest);
  console.error("Usage:");
  console.error("  node delta-atlas-cli.js trace    <file|-> [--json] [--overlay <file.local.js>]");
  console.error("  node delta-atlas-cli.js gapcheck <file|-> [--json]");
  process.exit(2);
}
main();
