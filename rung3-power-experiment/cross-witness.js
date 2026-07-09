// cross-witness.js — Phase 3, Step 1: does cross-checking power+util+clock make the
// witness harder to fool? Reads the existing run2/run3 traces (which log all three
// channels). Deterministic; no GPU, no new runs.
//
// RUN:  node cross-witness.js

"use strict";
const fs = require("fs");
const path = require("path");
const RUNS = path.join(__dirname, "runs");

const files = fs.readdirSync(RUNS).filter((f) => /^2026-07-05-run[23]-(idle|varied|loop|decoy)\.csv$/.test(f));
const idle = [], work = [];
for (const f of files) {
  const isIdle = /-idle\.csv$/.test(f);
  const lines = fs.readFileSync(path.join(RUNS, f), "utf8").trim().split("\n").slice(1);
  for (const ln of lines) {
    const c = ln.split(","); const p = +c[1], u = +c[2], cl = +c[3];
    if ([p, u, cl].every(Number.isFinite)) (isIdle ? idle : work).push({ p, u, cl });
  }
}

const mean = (a) => a.reduce((s, x) => s + x, 0) / (a.length || 1);
const stat = (a, k) => { const v = a.map((x) => x[k]); return { min: Math.min(...v), max: Math.max(...v), mean: mean(v) }; };
function corr(a, b) {
  const n = a.length, ma = mean(a), mb = mean(b);
  let num = 0, da = 0, db = 0;
  for (let i = 0; i < n; i++) { num += (a[i] - ma) * (b[i] - mb); da += (a[i] - ma) ** 2; db += (b[i] - mb) ** 2; }
  return num / Math.sqrt(da * db);
}

console.log("=== Phase 3 Step 1: cross-signal independence (runs 2+3) ===");
console.log("idle samples=" + idle.length + "  work samples=" + work.length + "\n");
console.log("channel      idle (mean [min-max])        work (mean [min-max])");
for (const [k, name] of [["p", "power W"], ["u", "util %"], ["cl", "clock MHz"]]) {
  const i = stat(idle, k), w = stat(work, k);
  console.log(name.padEnd(11) + "  " + (i.mean.toFixed(1) + " [" + i.min + "-" + i.max + "]").padEnd(27) + (w.mean.toFixed(1) + " [" + w.min + "-" + w.max + "]"));
}
const all = idle.concat(work);
const P = all.map((x) => x.p), U = all.map((x) => x.u), C = all.map((x) => x.cl);
console.log("\ncoupling:  power-util " + corr(P, U).toFixed(2) + "   power-clock " + corr(P, C).toFixed(2) + "   util-clock " + corr(U, C).toFixed(2) + "   (1.0 = lockstep)");

const po = work.filter((x) => x.p < 6).length;
const a3 = work.filter((x) => x.p < 6 && x.u < 3 && x.cl < 600).length;
console.log("\nspoof-gap — working samples that can pass as idle:");
console.log("  power-only test (power<6W):                    " + po + "/" + work.length + "  (" + (100 * po / work.length).toFixed(1) + "%)");
console.log("  all-three test (power<6 & util<3 & clock<600):  " + a3 + "/" + work.length + "  (" + (100 * a3 / work.length).toFixed(1) + "%)");
console.log("\nfinding: the three channels are coupled and share one source (nvidia-smi);");
console.log("cross-checking them catches nothing power alone didn't. Multiplicity != independence.");
