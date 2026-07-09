// surrogate-test.js — is the periodicity signal real, or an artifact of the metric's
// noise floor? Deterministic (seeded) so anyone gets the same null band on the same data.
//
// Method: the periodicity score is max autocorrelation over lags 2..60. On random data
// that max is NOT zero (it's a max over 59 chances), so we need a null. We permute each
// power series 2000 times (destroying all temporal order but keeping the value distribution),
// recompute periodicity each time, and ask: how often does chance reach the real value?
//
// Also reports a robust low-tail floor (5th percentile, and fraction of samples < 6 W)
// instead of the raw min, which is one noise-sensitive sample.
//
// RUN:  node surrogate-test.js

"use strict";
const fs = require("fs");
const path = require("path");
const RUNS = path.join(__dirname, "runs");
const PREFIX = process.argv[2] || "2026-07-05-run2-"; // pass a run prefix to test another run

function load(f) {
  const file = path.join(RUNS, PREFIX + f + ".csv");
  if (!fs.existsSync(file)) return null;
  const L = fs.readFileSync(file, "utf8").trim().split("\n").slice(1);
  const p = [];
  for (const ln of L) { const v = parseFloat(ln.split(",")[1]); if (Number.isFinite(v)) p.push(v); }
  return p;
}
const SCENARIOS = ["idle", "varied", "loop", "decoy"];
const mean = (a) => a.reduce((x, y) => x + y, 0) / a.length;
function periodicity(a) {
  const m = mean(a), d = a.map((x) => x - m);
  const den = d.reduce((s, x) => s + x * x, 0) || 1;
  const ML = Math.min(60, Math.floor(a.length / 2));
  let pk = 0;
  for (let lag = 2; lag <= ML; lag++) {
    let s = 0; for (let i = 0; i + lag < d.length; i++) s += d[i] * d[i + lag];
    const r = s / den; if (r > pk) pk = r;
  }
  return pk;
}
// deterministic PRNG (LCG) so the null band is identical on every run
let _seed = 1234567;
function rnd() { _seed = (_seed * 1103515245 + 12345) & 0x7fffffff; return _seed / 0x7fffffff; }
function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function pctile(sorted, q) { return sorted[Math.min(sorted.length - 1, Math.floor(q * sorted.length))]; }

const N = 2000;
console.log("=== periodicity vs permutation null (" + N + " shuffles, seeded) ===\n");
console.log("scenario  real     null95   null99   nullmax  p(null>=real)  verdict");
console.log("--------  -----    ------   ------   -------  -------------  -------");
for (const f of SCENARIOS) {
  const a = load(f); if (!a) continue;
  const real = periodicity(a);
  const nulls = [];
  for (let k = 0; k < N; k++) nulls.push(periodicity(shuffle(a)));
  nulls.sort((x, y) => x - y);
  const p = nulls.filter((x) => x >= real).length / N;
  const verdict = p < 0.01 ? "real (p<0.01)" : p < 0.05 ? "weak (p<0.05)" : "~noise";
  console.log(
    f.padEnd(8) + "  " + real.toFixed(3) + "    " + pctile(nulls, 0.95).toFixed(3) + "    " +
    pctile(nulls, 0.99).toFixed(3) + "    " + nulls[nulls.length - 1].toFixed(3) + "    " +
    p.toFixed(4).padStart(9) + "      " + verdict
  );
}

console.log("\n=== robust low-tail floor (does the workload ever return to idle?) ===");
console.log("scenario  5th-pctile W   frac < 6 W");
console.log("--------  ------------   ----------");
for (const f of SCENARIOS) {
  const raw = load(f); if (!raw) continue;
  const a = raw.slice().sort((x, y) => x - y);
  const p5 = pctile(a, 0.05), below6 = a.filter((x) => x < 6).length / a.length;
  console.log(f.padEnd(8) + "  " + p5.toFixed(2).padStart(10) + "   " + (below6 * 100).toFixed(1).padStart(8) + "%");
}
