// day-ledger-corpus.js — labeled corpus for day-ledger.js. Labels are the floor:
// when a case fails, fix the rules in day-ledger.js, never the label.
// Run: node day-ledger-corpus.js   (exit non-zero on any label failure)

"use strict";
const L = require("./day-ledger.js");
const H = require("./corpus-harness.js");

// helper: build a valid chain from bare entries, optionally sabotage afterwards
function chain(bare) {
  const out = [];
  for (const e of bare) {
    const res = L.appendEntry(out, e);
    if (res.errors) return { buildErrors: res.errors, entries: out };
    out.push(res.entry);
  }
  return { entries: out };
}
const D = "2026-07-04";
const t = m => D + "T" + m;

const CASES = [
  {
    name: "clean day: two plans, both closed with dual notes",
    build: () => chain([
      { ts: t("08:00"), kind: "plan", id: "p1", text: "draft outreach note" },
      { ts: t("08:01"), kind: "plan", id: "p2", text: "review corpus results" },
      { ts: t("17:00"), kind: "done", id: "p1", h: "went fine", a: "matched plan, no drift" },
      { ts: t("17:05"), kind: "done", id: "p2", h: "took longer", a: "scope grew; noted, not drifted" },
    ]),
    expect: { ok: true, missed: 0, violations: 0, chainOk: true },
  },
  {
    name: "open plan: a miss is honest data, not a violation",
    build: () => chain([
      { ts: t("08:00"), kind: "plan", id: "p1", text: "call the vendor" },
      { ts: t("08:01"), kind: "plan", id: "p2", text: "file the report" },
      { ts: t("17:00"), kind: "done", id: "p2", h: "filed", a: "on time" },
    ]),
    expect: { ok: true, missed: 1, violations: 0, chainOk: true },
  },
  {
    name: "missing agent note on a close: attestation violation",
    build: () => {
      const c = chain([
        { ts: t("08:00"), kind: "plan", id: "p1", text: "x" },
      ]);
      // bypass appendEntry's refusal to simulate a hand-edited file
      const bad = { ts: t("17:00"), v: L.VERSION, kind: "done", id: "p1", text: "", h: "did it", a: "", prev: c.entries[0].hash };
      bad.hash = L.hashEntry(bad);
      c.entries.push(bad);
      return c;
    },
    expect: { ok: false, missed: 0, violations: 1, chainOk: true },
  },
  {
    name: "tampered line: edited text breaks the chain",
    build: () => {
      const c = chain([
        { ts: t("08:00"), kind: "plan", id: "p1", text: "original wording" },
        { ts: t("17:00"), kind: "done", id: "p1", h: "ok", a: "ok" },
      ]);
      c.entries[0].text = "quietly rewritten wording"; // hash no longer matches
      return c;
    },
    expect: { ok: false, chainOk: false },
  },
  {
    name: "anomaly with dual notes: counted, no violation",
    build: () => chain([
      { ts: t("09:00"), kind: "anomaly", text: "deploy needed manual trigger", h: "annoying", a: "second occurrence; pattern noted" },
    ]),
    expect: { ok: true, anomalies: 1, violations: 0, chainOk: true },
  },
  {
    name: "duplicate close: closing a plan twice is a violation",
    build: () => {
      const c = chain([
        { ts: t("08:00"), kind: "plan", id: "p1", text: "x" },
        { ts: t("12:00"), kind: "done", id: "p1", h: "ok", a: "ok" },
      ]);
      const dup = { ts: t("13:00"), v: L.VERSION, kind: "done", id: "p1", text: "", h: "again", a: "again", prev: c.entries[1].hash };
      dup.hash = L.hashEntry(dup);
      c.entries.push(dup);
      return c;
    },
    expect: { ok: false, violations: 1, chainOk: true },
  },
  {
    name: "unknown reference: closing a plan that was never declared",
    build: () => {
      const c = chain([]);
      const ghost = { ts: t("12:00"), v: L.VERSION, kind: "done", id: "ghost", text: "", h: "ok", a: "ok", prev: "" };
      ghost.hash = L.hashEntry(ghost);
      c.entries.push(ghost);
      return c;
    },
    expect: { ok: false, violations: 1, chainOk: true },
  },
  {
    name: "clock going backwards: append-only time violation",
    build: () => {
      const c = chain([
        { ts: t("10:00"), kind: "plan", id: "p1", text: "x" },
      ]);
      const early = { ts: t("09:00"), v: L.VERSION, kind: "anomaly", id: "", text: "backdated", h: "n", a: "n", prev: c.entries[0].hash };
      early.hash = L.hashEntry(early);
      c.entries.push(early);
      return c;
    },
    expect: { ok: false, violations: 1, chainOk: true },
  },
];

for (const c of CASES) {
  const built = c.build();
  if (built.buildErrors) { H.fail(c.name, "corpus build refused: " + built.buildErrors.join("; ")); continue; }
  const r = L.reconcile(built.entries, D);
  const problems = [];
  if ("ok" in c.expect && r.ok !== c.expect.ok) problems.push("ok=" + r.ok + " want " + c.expect.ok);
  if ("chainOk" in c.expect && r.chainOk !== c.expect.chainOk) problems.push("chainOk=" + r.chainOk + " want " + c.expect.chainOk);
  if ("missed" in c.expect && r.missed.length !== c.expect.missed) problems.push("missed=" + r.missed.length + " want " + c.expect.missed);
  if ("violations" in c.expect && r.violations.length !== c.expect.violations) problems.push("violations=" + r.violations.length + " want " + c.expect.violations);
  if ("anomalies" in c.expect && r.anomalies !== c.expect.anomalies) problems.push("anomalies=" + r.anomalies + " want " + c.expect.anomalies);
  if (problems.length) H.fail(c.name, problems); else H.pass(c.name);
}
process.exit(H.summarize("labels"));
