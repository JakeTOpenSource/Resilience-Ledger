// verify-terms.js — applies a human-approved batch from Delta-Atlas-Verify.html:
// flips status 'candidate' -> 'reviewed' for exactly the term ids in the batch,
// nothing else. Zero dependencies.
//
//   node verify-terms.js apply verified-batch.json            apply and write
//   node verify-terms.js apply verified-batch.json --dry-run  preview only, writes nothing
//   node verify-terms.js selftest                              proves the logic on synthetic data
//
// verified-batch.json: a JSON array of term id strings, e.g. ["training-data","agent-loop"].
// Any id that doesn't exist, or isn't currently 'candidate', is reported and skipped —
// never silently touched. terms.enriched.json is versioned in git, which is the real
// undo button; this script also prints a before/after count so a mistake is visible
// immediately.

"use strict";
const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(__dirname, "terms.enriched.json");

function applyBatch(data, ids) {
  const byId = {};
  for (const t of data.terms || []) byId[t.id] = t;
  const flipped = [], unknown = [], skipped = [];
  const seen = new Set();
  for (const id of ids) {
    if (seen.has(id)) continue;
    seen.add(id);
    const t = byId[id];
    if (!t) { unknown.push(id); continue; }
    if (t.status !== "candidate") { skipped.push({ id, status: t.status }); continue; }
    t.status = "reviewed";
    flipped.push(id);
  }
  return { flipped, unknown, skipped };
}

function report(res) {
  console.log(res.flipped.length + " flipped to reviewed" + (res.flipped.length ? ": " + res.flipped.join(", ") : ""));
  if (res.skipped.length) console.log(res.skipped.length + " skipped (already non-candidate): " +
    res.skipped.map(s => s.id + " (" + s.status + ")").join(", "));
  if (res.unknown.length) console.log(res.unknown.length + " unknown id(s), not in terms.enriched.json: " + res.unknown.join(", "));
}

function main() {
  const [cmd, file, flag] = process.argv.slice(2);
  if (cmd === "selftest") {
    const data = { terms: [
      { id: "a", status: "candidate" },
      { id: "b", status: "reviewed" },
      { id: "d", status: "candidate" },
    ] };
    const res = applyBatch(data, ["a", "b", "c", "a"]); // c=unknown, a repeated (dedup)
    const okA = data.terms.find(t => t.id === "a").status === "reviewed";
    const okB = data.terms.find(t => t.id === "b").status === "reviewed"; // unchanged, was already reviewed
    const okD = data.terms.find(t => t.id === "d").status === "candidate"; // untouched — not in the batch
    const pass = okA && okB && res.flipped.length === 1 && res.flipped[0] === "a" &&
      res.skipped.length === 1 && res.skipped[0].id === "b" &&
      res.unknown.length === 1 && res.unknown[0] === "c" && okD;
    console.log(pass ? "PASS — flips only exact matches, skips non-candidates, reports unknowns, leaves everything else untouched" : "FAIL");
    process.exit(pass ? 0 : 1);
  }
  if (cmd === "apply") {
    if (!file) { console.error("usage: node verify-terms.js apply <batch.json> [--dry-run]"); process.exit(2); }
    let ids;
    try { ids = JSON.parse(fs.readFileSync(file, "utf8")); }
    catch (e) { console.error("could not read/parse " + file + ": " + e.message); process.exit(2); }
    if (!Array.isArray(ids)) { console.error(file + " must be a JSON array of term id strings"); process.exit(2); }
    let data;
    try { data = JSON.parse(fs.readFileSync(DATA_FILE, "utf8")); }
    catch (e) { console.error("could not read terms.enriched.json: " + e.message); process.exit(2); }
    const before = (data.terms || []).filter(t => t.status === "candidate").length;
    const res = applyBatch(data, ids);
    report(res);
    const after = (data.terms || []).filter(t => t.status === "candidate").length;
    console.log("candidate count: " + before + " -> " + after);
    if (flag === "--dry-run") { console.log("(dry run — terms.enriched.json not written)"); process.exit(0); }
    if (res.flipped.length) fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2) + "\n");
    console.log(res.flipped.length ? "terms.enriched.json written." : "nothing to write.");
    process.exit(0);
  }
  console.log("verify-terms.js — apply a human-verified batch to terms.enriched.json.\n" +
    "  node verify-terms.js apply <batch.json> [--dry-run]\n" +
    "  node verify-terms.js selftest");
}

if (require.main === module) main();
module.exports = { applyBatch };
