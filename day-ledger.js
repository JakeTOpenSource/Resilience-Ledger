// day-ledger.js — append-only, hash-chained daily ledger with dual attestation.
// The first built slice of its pre-registered design study. Zero dependencies. Deterministic:
// same ledger file, same verdict, on any machine. No model in the loop.
//
// Format: JSON Lines, one entry per line, append-only. Entry kinds:
//   plan    {ts, kind:'plan', id, text}
//   done    {ts, kind:'done', id, text?, h, a}   closes a plan; h AND a required
//   miss    {ts, kind:'miss', id, text?, h, a}   closes a plan honestly; h AND a required
//   anomaly {ts, kind:'anomaly', text, h, a}     friction/surprise; h AND a required
// h = the human's note, a = the agent's note — symmetric attestation, both mandatory
// on every closing entry. Misses are honest data, not violations.
//
// Chain: every entry carries prev (hash of the previous line, '' for the first)
// and hash = sha256 over the canonical entry + prev. Editing any past line breaks
// every hash after it. Honest ceiling, stated in the study: this proves the file
// wasn't edited *undetected*; it cannot prove WHO edited a single-user file.
//
// CLI:
//   node day-ledger.js append <file> '<json-entry>'    validate, chain, append
//   node day-ledger.js verify <file>                   chain integrity (exit 1 on break)
//   node day-ledger.js reconcile <file> <YYYY-MM-DD>   end-of-day report (exit 1 on violations)
// Exit codes: 0 clean, 1 violation or broken chain, 2 usage/load error.

"use strict";
const fs = require("fs");
const crypto = require("crypto");

const VERSION = "0.1.0";
const KINDS = ["plan", "done", "miss", "anomaly"];
const CLOSERS = ["done", "miss"];

// canonical serialization: fixed key order, so hashes are machine-independent
function canonical(e) {
  return JSON.stringify({
    ts: e.ts, v: e.v, kind: e.kind, id: e.id || "", text: e.text || "",
    h: e.h || "", a: e.a || "", prev: e.prev
  });
}
function hashEntry(e) {
  return crypto.createHash("sha256").update(canonical(e), "utf8").digest("hex");
}

function parseLedger(raw) {
  const entries = [];
  const lines = raw.split(/\r?\n/).filter(l => l.trim().length);
  for (let i = 0; i < lines.length; i++) {
    let e;
    try { e = JSON.parse(lines[i]); }
    catch (err) { return { error: "line " + (i + 1) + " is not valid JSON" }; }
    entries.push(e);
  }
  return { entries };
}

// chain integrity: prev links + recomputed hashes
function verifyChain(entries) {
  let prev = "";
  for (let i = 0; i < entries.length; i++) {
    const e = entries[i];
    if (e.prev !== prev) return { ok: false, at: i + 1, why: "prev link mismatch" };
    if (hashEntry(e) !== e.hash) return { ok: false, at: i + 1, why: "hash mismatch (line altered)" };
    prev = e.hash;
  }
  return { ok: true };
}

// structural rules for a single new entry, given what came before
function validateEntry(e, before) {
  const errs = [];
  if (!e || typeof e !== "object") return ["entry is not an object"];
  if (KINDS.indexOf(e.kind) < 0) errs.push("unknown kind '" + e.kind + "'");
  if (!e.ts || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(e.ts)) errs.push("ts must be ISO-like YYYY-MM-DDTHH:MM");
  const last = before[before.length - 1];
  if (last && e.ts < last.ts) errs.push("ts earlier than previous entry (append-only clock)");
  if (e.kind === "plan") {
    if (!e.id) errs.push("plan needs an id");
    if (!e.text) errs.push("plan needs text");
    if (before.some(p => p.kind === "plan" && p.id === e.id)) errs.push("duplicate plan id '" + e.id + "'");
  }
  if (CLOSERS.indexOf(e.kind) >= 0) {
    if (!e.id) errs.push(e.kind + " needs the id of the plan it closes");
    else {
      if (!before.some(p => p.kind === "plan" && p.id === e.id)) errs.push(e.kind + " references unknown plan '" + e.id + "'");
      if (before.some(p => CLOSERS.indexOf(p.kind) >= 0 && p.id === e.id)) errs.push("plan '" + e.id + "' already closed");
    }
  }
  if (CLOSERS.indexOf(e.kind) >= 0 || e.kind === "anomaly") {
    if (!e.h || !String(e.h).trim()) errs.push(e.kind + " missing human note (h) — dual attestation is mandatory");
    if (!e.a || !String(e.a).trim()) errs.push(e.kind + " missing agent note (a) — dual attestation is mandatory");
  }
  return errs;
}

function appendEntry(entries, e) {
  const errs = validateEntry(e, entries);
  if (errs.length) return { errors: errs };
  const last = entries[entries.length - 1];
  const full = { ts: e.ts, v: VERSION, kind: e.kind, id: e.id || "", text: e.text || "",
    h: e.h || "", a: e.a || "", prev: last ? last.hash : "" };
  full.hash = hashEntry(full);
  return { entry: full };
}

// end-of-day reconciliation: plans vs outcomes for one day, plus rule violations
function reconcile(entries, day) {
  const chain = verifyChain(entries);
  const dayEntries = entries.filter(e => (e.ts || "").slice(0, 10) === day);
  const plans = dayEntries.filter(e => e.kind === "plan");
  const violations = [];
  let cursor = [];
  for (const e of entries) { // replay full history so cross-references validate
    const errs = validateEntry(e, cursor);
    for (const err of errs) if ((e.ts || "").slice(0, 10) === day) violations.push({ ts: e.ts, kind: e.kind, id: e.id || "", why: err });
    cursor.push(e);
  }
  const closedIds = new Set(entries.filter(e => CLOSERS.indexOf(e.kind) >= 0).map(e => e.id));
  const done = dayEntries.filter(e => e.kind === "done");
  const missed = plans.filter(p => !closedIds.has(p.id));
  const misses = dayEntries.filter(e => e.kind === "miss");
  const anomalies = dayEntries.filter(e => e.kind === "anomaly");
  return {
    day, chainOk: chain.ok, chainWhy: chain.ok ? "" : ("line " + chain.at + ": " + chain.why),
    plans: plans.length, done: done.length, missed: missed.map(p => p.id),
    missesLogged: misses.length, anomalies: anomalies.length,
    violations, ok: chain.ok && violations.length === 0
  };
}

/* ---------------- CLI ---------------- */
function main() {
  const [cmd, file, arg] = process.argv.slice(2);
  const usage = () => { console.error("usage: node day-ledger.js append <file> '<json>' | verify <file> | reconcile <file> <YYYY-MM-DD>"); process.exit(2); };
  if (!cmd || !file) usage();
  const raw = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
  const parsed = parseLedger(raw);
  if (parsed.error) { console.error("load error: " + parsed.error); process.exit(2); }
  const entries = parsed.entries;

  if (cmd === "append") {
    if (!arg) usage();
    let e; try { e = JSON.parse(arg); } catch (err) { console.error("entry is not valid JSON"); process.exit(2); }
    const res = appendEntry(entries, e);
    if (res.errors) { for (const x of res.errors) console.error("refused: " + x); process.exit(1); }
    fs.appendFileSync(file, JSON.stringify(res.entry) + "\n");
    console.log("appended " + res.entry.kind + (res.entry.id ? " " + res.entry.id : "") + "  hash " + res.entry.hash.slice(0, 12));
    process.exit(0);
  }
  if (cmd === "verify") {
    const v = verifyChain(entries);
    console.log(v.ok ? "chain OK (" + entries.length + " entries)" : "chain BROKEN at line " + v.at + ": " + v.why);
    process.exit(v.ok ? 0 : 1);
  }
  if (cmd === "reconcile") {
    if (!arg || !/^\d{4}-\d{2}-\d{2}$/.test(arg)) usage();
    const r = reconcile(entries, arg);
    console.log("== " + r.day + " ==");
    console.log("chain: " + (r.chainOk ? "OK" : "BROKEN — " + r.chainWhy));
    console.log("plans " + r.plans + " · done " + r.done + " · missed " + r.missed.length +
      (r.missed.length ? " (" + r.missed.join(", ") + ")" : "") +
      " · misses logged " + r.missesLogged + " · anomalies " + r.anomalies);
    for (const v of r.violations) console.log("VIOLATION " + v.ts + " " + v.kind + (v.id ? " " + v.id : "") + ": " + v.why);
    console.log(r.ok ? "clean day: every closing entry carries both notes." : (r.violations.length + " violation(s)."));
    process.exit(r.ok ? 0 : 1);
  }
  usage();
}

if (require.main === module) main();
module.exports = { VERSION, parseLedger, verifyChain, validateEntry, appendEntry, reconcile, hashEntry };
