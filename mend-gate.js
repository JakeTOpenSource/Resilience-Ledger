#!/usr/bin/env node
/**
 * mend-gate.js — deterministic gate runner for the Mend Gate register (proposals.json).
 *
 * One register for every proposed change to this project, whatever its source: a model's
 * recommendation, a reviewer's return, an MCP counterparty's manifest change, the author's
 * own 2am spark. The gate enforces the sorting discipline mechanically:
 *
 *   - Anyone (including a model) may ADD a proposal (recording who: --kind model|human|counterparty).
 *   - Statuses move only through this tool's commands: queue (to the cold-read pile),
 *     fold, decline. Sorting (fold/decline) requires a written reason — the tool refuses
 *     without one — and is a human act; models must not run fold/decline.
 *   - Folds in the site-tools stream cannot commit while the corpus or bench is red.
 *   - Folded and declined are terminal: re-sorting a sorted proposal is refused. Open a
 *     new proposal instead — history is append-only.
 *
 * Usage:
 *   node mend-gate.js                         validate + show the register and cold-read queue
 *   node mend-gate.js add "title" --stream site-tools|ledger-candidates|mcp --source "who" [--kind model|human|counterparty] [--type t]
 *   node mend-gate.js queue <id>              proposed -> cold-read-pending
 *   node mend-gate.js fold <id>    --reason "why"
 *   node mend-gate.js decline <id> --reason "why"
 *   node mend-gate.js gates                   run corpus + bench, report green/red with cause
 *
 * Exit codes: 0 ok, 1 register invalid or gates red, 2 usage error.
 * Dates are UTC (ISO). License: CC BY 4.0, consistent with the rest of the project.
 */
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const FILE = path.join(__dirname, "proposals.json");
const STREAMS = ["site-tools", "ledger-candidates", "mcp"];
const STATUSES = ["proposed", "cold-read-pending", "folded", "declined"];
const TERMINAL = ["folded", "declined"];
const KINDS = ["model", "human", "counterparty"];
const TYPES = ["detector", "tool", "data", "term", "decision", "cold-read", "return", "idea"];

function save(reg) { fs.writeFileSync(FILE, JSON.stringify(reg, null, 2) + "\n", "utf8"); }
function today() { return new Date().toISOString().slice(0, 10); }

function validate(reg) {
  const errs = [];
  const ids = new Set();
  if (!Array.isArray(reg.proposals)) return ["proposals is not an array"];
  for (const p of reg.proposals) {
    const at = "proposal '" + (p.id || "?") + "': ";
    if (!p.id || !/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(p.id)) errs.push(at + "id must be kebab-case, non-empty, no edge hyphens");
    if (ids.has(p.id)) errs.push(at + "duplicate id"); ids.add(p.id);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(p.date || "")) errs.push(at + "date must be YYYY-MM-DD");
    if (!p.source || !KINDS.includes(p.source.kind)) errs.push(at + "source.kind must be one of " + KINDS.join("|"));
    if (!p.source || typeof p.source.name !== "string" || !p.source.name.trim()) errs.push(at + "source.name required (chain of custody)");
    if (!STREAMS.includes(p.stream)) errs.push(at + "stream must be one of " + STREAMS.join("|"));
    if (!STATUSES.includes(p.status)) errs.push(at + "status must be one of " + STATUSES.join("|"));
    if (!TYPES.includes(p.type)) errs.push(at + "type must be one of " + TYPES.join("|"));
    if (!p.title || p.title.trim().length < 8) errs.push(at + "title too short to be a real proposal");
    if (!p.gates || typeof p.gates !== "object") errs.push(at + "gates object required");
    if (p.log !== undefined && !Array.isArray(p.log)) errs.push(at + "log must be an array");
    if (TERMINAL.includes(p.status)) {
      const sorted = (p.log || []).some(l => l.action === p.status && typeof l.reason === "string" && l.reason.trim().length >= 12);
      if (!sorted) errs.push(at + "status is " + p.status + " but no log entry carries a written reason - a sort without a reason is a ratchet");
    }
    // Un-sorting guard: once the log records a terminal sort, the status may not regress.
    const sortedInLog = (p.log || []).find(l => TERMINAL.includes(l.action));
    if (sortedInLog && !TERMINAL.includes(p.status)) errs.push(at + "log records '" + sortedInLog.action + "' but status has regressed to '" + p.status + "' - un-sorting erases history; open a new proposal instead");
  }
  return errs;
}

function runGates() {
  const results = {};
  for (const [name, script] of [["corpus", "tracer-corpus.js"], ["bench", "tracer-bench.js"]]) {
    try {
      execFileSync(process.execPath, [path.join(__dirname, script)], { stdio: "pipe", timeout: 300000 });
      results[name] = "green";
    } catch (e) {
      const why = e.code === "ENOENT" ? "script missing"
        : e.signal ? "killed (" + e.signal + ")"
        : e.status != null ? "exit " + e.status
        : String(e.message || e).slice(0, 80);
      results[name] = "RED (" + why + ")";
    }
  }
  return results;
}

function show(reg) {
  const by = {};
  reg.proposals.forEach(p => { (by[p.status] = by[p.status] || []).push(p); });
  console.log("Mend Gate register — " + reg.proposals.length + " proposals\n");
  for (const s of STATUSES) {
    if (!by[s]) continue;
    console.log(s.toUpperCase() + " (" + by[s].length + ")");
    by[s].forEach(p => console.log("  [" + p.stream + "] " + p.id + " — " + p.title.slice(0, 88) + "  <" + p.source.kind + ": " + p.source.name.slice(0, 40) + ">"));
    console.log("");
  }
  const queue = reg.proposals.filter(p => p.status === "cold-read-pending");
  if (queue.length) {
    console.log("COLD-READ QUEUE (yours, one per session):");
    queue.forEach((p, i) => console.log("  " + (i + 1) + ". " + p.id + " — " + p.title.slice(0, 92)));
  }
}

// Flag parsing that refuses to treat a flag token as a value.
function flagOf(argv, name) {
  const i = argv.indexOf("--" + name);
  if (i < 0) return undefined;
  const v = argv[i + 1];
  return (v !== undefined && !v.startsWith("--")) ? v : null; // null = flag present but value missing/invalid
}
function reasonOf(argv) {
  const ri = argv.indexOf("--reason");
  if (ri < 0) return "";
  let end = argv.length;
  for (let j = ri + 1; j < argv.length; j++) if (argv[j].startsWith("--")) { end = j; break; }
  return argv.slice(ri + 1, end).join(" ").trim();
}

function main() {
  const argv = process.argv.slice(2);
  const cmd = argv[0] || "list";
  let reg;
  try { reg = JSON.parse(fs.readFileSync(FILE, "utf8")); }
  catch (e) { console.error("REGISTER INVALID:\n  cannot read/parse " + FILE + ": " + e.message); process.exit(1); }
  const errs = validate(reg);
  if (errs.length) { console.error("REGISTER INVALID:\n  " + errs.join("\n  ")); process.exit(1); }

  if (cmd === "list") { show(reg); process.exit(0); }

  if (cmd === "gates") {
    const g = runGates();
    console.log("corpus:", g.corpus, "  bench:", g.bench);
    process.exit(g.corpus === "green" && g.bench === "green" ? 0 : 1);
  }

  if (cmd === "add") {
    const title = argv[1];
    const stream = flagOf(argv, "stream"), source = flagOf(argv, "source");
    const kind = flagOf(argv, "kind") || "human";
    const type = flagOf(argv, "type") || "idea";
    if (!title || title.startsWith("--") || title.trim().length < 8 || !STREAMS.includes(stream) || !source || !KINDS.includes(kind) || !TYPES.includes(type)) {
      console.error('Usage: node mend-gate.js add "title (>=8 chars)" --stream ' + STREAMS.join("|") + ' --source "who" [--kind ' + KINDS.join("|") + '] [--type ' + TYPES.join("|") + ']');
      process.exit(2);
    }
    let id = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 48).replace(/^-+|-+$/g, "");
    if (!id || id.length < 3) { console.error("Refused: title yields no usable id — use words, not symbols."); process.exit(2); }
    let n = 2; const base = id;
    while (reg.proposals.some(p => p.id === id)) id = base.slice(0, 44) + "-" + n++;
    reg.proposals.push({
      id, date: today(),
      source: { kind, name: source },
      stream, type, title: title.trim(), status: "proposed",
      gates: { schema: true, corpus: "n/a", bench: "n/a" }, log: []
    });
    const postErrs = validate(reg);
    if (postErrs.length) { console.error("Refused: this add would corrupt the register:\n  " + postErrs.join("\n  ")); process.exit(2); }
    save(reg);
    console.log("Captured: " + id + " (proposed, " + kind + "). Back to your thread."); // the two-minute capture
    process.exit(0);
  }

  if (cmd === "queue") {
    const p = reg.proposals.find(x => x.id === argv[1]);
    if (!p) { console.error("No proposal '" + argv[1] + "'"); process.exit(2); }
    if (p.status !== "proposed") { console.error("Refused: only 'proposed' can be queued (this one is '" + p.status + "')."); process.exit(2); }
    p.status = "cold-read-pending";
    p.log = p.log || []; p.log.push({ date: today(), action: "queued" });
    save(reg);
    console.log(p.id + " -> cold-read-pending.");
    process.exit(0);
  }

  if (cmd === "fold" || cmd === "decline") {
    const id = argv[1];
    const reason = reasonOf(argv);
    const p = reg.proposals.find(x => x.id === id);
    if (!p) { console.error("No proposal '" + id + "'"); process.exit(2); }
    if (TERMINAL.includes(p.status)) { console.error("Refused: '" + id + "' is already " + p.status + ". Sorts are terminal - open a new proposal instead of rewriting history."); process.exit(2); }
    if (!reason || reason.length < 12) {
      console.error("Refused: a sort needs a written reason (>=12 chars). A " + cmd + " without a reason is exactly the uncontrolled drift this register exists to prevent.");
      process.exit(2);
    }
    if (cmd === "fold" && p.stream === "site-tools") {
      console.log("site-tools fold: running gates first...");
      const g = runGates();
      p.gates.corpus = g.corpus + " @" + today();
      p.gates.bench = g.bench + " @" + today();
      if (g.corpus !== "green" || g.bench !== "green") {
        save(reg);
        console.error("Refused: gates are red (corpus: " + g.corpus + ", bench: " + g.bench + "). Fix the detector, not the label.");
        process.exit(1);
      }
    }
    p.status = cmd === "fold" ? "folded" : "declined";
    p.log = p.log || [];
    p.log.push({ date: today(), action: p.status, reason });
    save(reg);
    console.log(id + " -> " + p.status + ". Reason recorded. Controlled drift.");
    process.exit(0);
  }

  console.error("Unknown command '" + cmd + "'. Commands: list, add, queue, fold, decline, gates");
  process.exit(2);
}
main();
