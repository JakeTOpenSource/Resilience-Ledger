// corpus-harness.js — the shared PASS/FAIL/exit-code presentation layer every labeled
// corpus in this project uses (Tracer, Gap Check, day-ledger, verify-terms, and any new
// one). Zero dependencies. It does NOT decide what counts as a pass — each corpus keeps
// its own domain-specific comparison logic (precision/recall, field-by-field checks,
// whatever fits) — this only unifies printing the result and the exit code, so "the
// labels are the floor" reads and behaves the same way everywhere.
//
// Usage:
//   const H = require('./corpus-harness.js');
//   H.pass('case name');                       // or:
//   H.fail('case name', 'reason it failed');    // (reason can be a string or array)
//   ... run more cases ...
//   process.exit(H.summarize('MODULE NAME'));   // prints totals, returns 0 or 1

"use strict";
let total = 0, failed = 0;

function pass(name) {
  total++;
  console.log("PASS  " + name);
}
function fail(name, reason) {
  total++; failed++;
  const detail = Array.isArray(reason) ? reason.join("; ") : reason;
  console.log("FAIL  " + name + (detail ? "  (" + detail + ")" : ""));
}
function summarize(label) {
  const ok = total - failed;
  console.log("\n" + ok + "/" + total + " " + (label || "cases") + " hold" + (failed ? " — " + failed + " FAILING" : ""));
  return failed ? 1 : 0;
}
function reset() { total = 0; failed = 0; } // for harnesses that run multiple named suites in one process

module.exports = { pass, fail, summarize, reset };
