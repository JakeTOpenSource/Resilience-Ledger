// day.js — the thin capture wrapper around day-ledger.js, so closing a day
// never requires hand-typing JSON. Pulls the engine straight from day-ledger.js:
// one source of truth, no copy to drift. Zero dependencies.
//
//   node day plan p1 "draft the outreach note"     open a plan
//   node day done p1 "my note" "agent note"        close it done (notes prompted if missing)
//   node day miss p1 "my note" "agent note"        close it honestly missed
//   node day anomaly "what rattled" "my note" "agent note"
//   node day show                                  today's entries
//   node day close                                 nightly ritual: verify chain + reconcile today
//   node day week                                  streak vs the pre-registered pass line
//
// Ledger file: my-days.jsonl NEXT TO THIS SCRIPT regardless of where you run
// from (override: DAY_LEDGER=path). Gitignored: the ledger is personal data
// and never ships. The wrapper stamps local time itself; the engine's rules
// stay the floor — anything the engine refuses, this refuses, and nothing is
// ever written unless the whole entry validates against a fresh read.

"use strict";
const fs = require("fs");
const path = require("path");
const readline = require("readline");
const L = require("./day-ledger.js");

const FILE = process.env.DAY_LEDGER || path.join(__dirname, "my-days.jsonl");

function nowStamp() {
  const d = new Date();
  const p = n => String(n).padStart(2, "0");
  return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate()) +
    "T" + p(d.getHours()) + ":" + p(d.getMinutes());
}
const today = () => nowStamp().slice(0, 10);

function load() {
  const raw = fs.existsSync(FILE) ? fs.readFileSync(FILE, "utf8") : "";
  const parsed = L.parseLedger(raw);
  if (parsed.error) { console.error("ledger load error: " + parsed.error); process.exit(2); }
  return parsed.entries;
}
function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(res => rl.question(question, ans => { rl.close(); res(ans); }));
}
async function needNotes(h, a) {
  while (!h || !String(h).trim()) h = await ask("  your note (h): ");
  while (!a || !String(a).trim()) a = await ask("  agent note (a): ");
  return [h, a];
}
// re-reads the ledger at the moment of writing, so a prompt left open while
// something else appends can never produce a stale prev hash (broken chain)
function append(e) {
  const entries = load();
  const res = L.appendEntry(entries, e);
  if (res.errors) {
    for (const x of res.errors) {
      console.error("refused: " + x);
      if (/ts earlier/.test(x)) console.error("  (your PC clock moved backwards — wait a minute or two and retry; this heals itself)");
    }
    process.exit(1);
  }
  fs.appendFileSync(FILE, JSON.stringify(res.entry) + "\n");
  console.log("logged " + res.entry.kind + (res.entry.id ? " " + res.entry.id : "") +
    " at " + res.entry.ts.slice(11) + "  (chain " + res.entry.hash.slice(0, 8) + ")");
}
// unquoted multi-word notes would silently land in the wrong fields of a
// permanent hash chain — refuse before anything is written
function refuseExtraArgs(cmd, args, max) {
  if (args.length > max) {
    console.error("refused — got " + args.length + " pieces, expected at most " + max + ". Wrap each note in quotes:");
    console.error('  node day ' + cmd + (cmd === "anomaly" ? ' "what happened"' : ' <id>') + ' "your note" "agent note"');
    process.exit(2);
  }
}

// Pre-registered pass line (committed before day 1):
// a day counts only if it holds >=1 plan opened that day AND >=1 closing
// entry (done|miss, dual notes enforced by the engine) dated that day.
// Seven consecutive calendar days, each a counting day, pass Gate 2.
// Any day that fails to count — empty or incomplete — resets the streak.
function week(entries) {
  const byDay = {};
  for (const e of entries) {
    const d = (e.ts || "").slice(0, 10);
    byDay[d] = byDay[d] || { plan: 0, close: 0 };
    if (e.kind === "plan") byDay[d].plan++;
    if (e.kind === "done" || e.kind === "miss") byDay[d].close++;
  }
  const counting = Object.keys(byDay).filter(d => byDay[d].plan > 0 && byDay[d].close > 0).sort();
  if (!counting.length) return { streak: 0, days: [], pass: false };
  let streak = 1;
  for (let i = counting.length - 1; i > 0; i--) {
    const gap = (Date.parse(counting[i] + "T00:00Z") - Date.parse(counting[i - 1] + "T00:00Z")) / 86400000;
    if (gap === 1) streak++; else break;
  }
  return { streak, days: counting.slice(-streak), pass: streak >= 7 };
}
const openPlans = entries => {
  const closed = new Set(entries.filter(e => e.kind === "done" || e.kind === "miss").map(e => e.id));
  return entries.filter(e => e.kind === "plan" && !closed.has(e.id));
};

async function main() {
  const [cmd, ...args] = process.argv.slice(2);

  if (cmd === "plan") {
    const [id, ...text] = args;
    if (!id || !text.length) { console.error("usage: node day plan <id> \"text\""); process.exit(2); }
    return append({ ts: nowStamp(), kind: "plan", id, text: text.join(" ") });
  }
  if (cmd === "done" || cmd === "miss") {
    refuseExtraArgs(cmd, args, 3);
    const [id, h0, a0] = args;
    if (!id) { console.error("usage: node day " + cmd + " <id> [\"your note\"] [\"agent note\"]"); process.exit(2); }
    const planEntry = load().find(e => e.kind === "plan" && e.id === id);
    if (planEntry && planEntry.ts.slice(0, 10) !== today()) {
      console.log("note: '" + id + "' was opened on " + planEntry.ts.slice(0, 10) + "; this close is dated today (" +
        today() + "), so " + planEntry.ts.slice(0, 10) + " only counts toward the streak if it also got a close that day.");
    }
    const [h, a] = await needNotes(h0, a0);
    return append({ ts: nowStamp(), kind: cmd, id, h, a });
  }
  if (cmd === "anomaly") {
    refuseExtraArgs(cmd, args, 3);
    const [text, h0, a0] = args;
    if (!text) { console.error("usage: node day anomaly \"what happened\" [\"your note\"] [\"agent note\"]"); process.exit(2); }
    const [h, a] = await needNotes(h0, a0);
    return append({ ts: nowStamp(), kind: "anomaly", text, h, a });
  }
  if (cmd === "show") {
    const d = today();
    const rows = load().filter(e => (e.ts || "").slice(0, 10) === d);
    if (!rows.length) return console.log("nothing logged today (" + d + ")");
    for (const e of rows) console.log(e.ts.slice(11) + "  " + e.kind.padEnd(7) + (e.id || "").padEnd(6) +
      (e.text || "") + (e.h ? '  h:"' + e.h + '"' : "") + (e.a ? '  a:"' + e.a + '"' : ""));
    return;
  }
  if (cmd === "close") {
    const entries = load();
    const v = L.verifyChain(entries);
    console.log("chain: " + (v.ok ? "OK (" + entries.length + " entries)" : "BROKEN at line " + v.at + " — " + v.why));
    const r = L.reconcile(entries, today());
    console.log(today() + ": plans " + r.plans + " · done " + r.done + " · missed " + r.missed.length +
      (r.missed.length ? " (" + r.missed.join(", ") + " — close them with done or miss)" : "") +
      " · anomalies " + r.anomalies);
    for (const x of r.violations) console.log("VIOLATION " + x.ts + " " + x.kind + ": " + x.why);
    const carried = openPlans(entries).filter(e => e.ts.slice(0, 10) !== today());
    for (const c of carried) console.log("carried over, still open: " + c.id + " (opened " + c.ts.slice(0, 10) + ")");
    const mins = 24 * 60 - (new Date().getHours() * 60 + new Date().getMinutes());
    if (mins <= 25 && r.missed.length) console.log("midnight in " + mins + " min — close open plans before 00:00 or today will not count.");
    const w = week(entries);
    console.log("streak: " + w.streak + "/7" + (w.pass ? "  — Gate 2 PASSED" : ""));
    process.exit(v.ok && r.violations.length === 0 ? 0 : 1);
  }
  if (cmd === "week") {
    const w = week(load());
    console.log("counting days: " + (w.days.join(", ") || "none yet"));
    console.log("streak: " + w.streak + "/7  " + (w.pass ? "Gate 2 PASSED" : "(a day counts with >=1 plan and >=1 close; an incomplete or empty day resets)"));
    process.exit(0);
  }
  const entries = load();
  console.log("day — the daily ledger, without the JSON.\n" +
    "  node day plan <id> \"text\"      open a plan\n" +
    "  node day done <id> [h] [a]     close it (notes prompted if missing)\n" +
    "  node day miss <id> [h] [a]     close it honestly missed\n" +
    "  node day anomaly \"text\" [h] [a]\n" +
    "  node day show | close | week\n" +
    "ledger: " + FILE + (entries.length ? "  (" + entries.length + " entries)" : "  (new)"));
}
main();
