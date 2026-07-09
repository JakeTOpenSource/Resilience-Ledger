// power-analyze.js — Rung 3 physical-witness experiment (analysis).
//
// Reads the CSVs written by power-probe.js and answers ONE question, honestly:
// do the three workload classes (idle / varied / loop) separate in the power trace?
//
// It reports three features per scenario and a plain verdict. It does NOT train a
// classifier and does NOT claim tamper-proofness — this is n=1 exploratory evidence
// about DISTINGUISHABILITY, the first question rung 3 has to answer.
//
// RUN:  node power-analyze.js

"use strict";
const fs = require("fs");
const path = require("path");

function load(label) {
  const file = path.join(__dirname, "power-trace-" + label + ".csv");
  if (!fs.existsSync(file)) return null;
  const lines = fs.readFileSync(file, "utf8").trim().split("\n").slice(1);
  const power = [], util = [];
  for (const ln of lines) {
    const c = ln.split(",");
    const p = parseFloat(c[1]), u = parseFloat(c[2]);
    if (Number.isFinite(p)) power.push(p);
    if (Number.isFinite(u)) util.push(u);
  }
  return { label, power, util, n: power.length };
}

const mean = (a) => a.reduce((x, y) => x + y, 0) / (a.length || 1);
const std = (a) => { const m = mean(a); return Math.sqrt(mean(a.map((x) => (x - m) ** 2))); };

// periodicity strength: peak of the normalized autocorrelation over lags 2..maxLag.
// a steady, repetitive cadence (a loop) keeps correlating with itself -> higher peak.
// bursty, varied compute decorrelates fast -> lower peak. Range ~0..1.
function periodicity(a) {
  if (a.length < 12) return 0;
  const m = mean(a);
  const d = a.map((x) => x - m);
  const denom = d.reduce((s, x) => s + x * x, 0) || 1;
  const maxLag = Math.min(60, Math.floor(a.length / 2));
  let peak = 0;
  for (let lag = 2; lag <= maxLag; lag++) {
    let s = 0;
    for (let i = 0; i + lag < d.length; i++) s += d[i] * d[i + lag];
    const r = s / denom;
    if (r > peak) peak = r;
  }
  return peak;
}

function fmt(x, d) { return Number.isFinite(x) ? x.toFixed(d) : "n/a"; }

function run() {
  const idle = load("idle"), varied = load("varied"), loop = load("loop"), decoy = load("decoy");
  console.log("=== Rung 3 power-trace analysis ===\n");

  const rowsPresent = [idle, varied, loop, decoy].filter(Boolean);
  if (!rowsPresent.length) { console.error("No power-trace-*.csv files found. Run: node power-probe.js"); process.exit(1); }

  const feats = {};
  console.log("scenario   n     mean W    std W     CV      periodicity");
  console.log("--------   ---   -------   ------   ------   -----------");
  for (const r of rowsPresent) {
    const m = mean(r.power), s = std(r.power), cv = s / (m || 1), per = periodicity(r.power), um = mean(r.util);
    feats[r.label] = { m, s, cv, per, um, n: r.n };
    console.log(
      r.label.padEnd(9) + "  " + String(r.n).padEnd(4) + "  " +
      fmt(m, 2).padStart(7) + "   " + fmt(s, 2).padStart(6) + "   " +
      fmt(cv, 3).padStart(6) + "   " + fmt(per, 3).padStart(6)
    );
  }
  console.log("");

  // sanity gate: a clean idle is ~4 W and dead flat. If it isn't, the GPU was NOT idle
  // (background video, a call, a game), which contaminates EVERY scenario. Refuse to trust it.
  const idleClean = feats.idle && feats.idle.m <= 8 && feats.idle.cv <= 0.25;
  if (feats.idle && !idleClean) {
    console.log("!! BASELINE CONTAMINATED — the 'idle' scenario was not actually idle");
    console.log("   (mean " + fmt(feats.idle.m, 1) + "W, CV " + fmt(feats.idle.cv, 2) + ", periodicity " + fmt(feats.idle.per, 2) +
      "; a clean idle is ~4W, CV<0.1, no rhythm).");
    console.log("   Something else was using the GPU. Close GPU-heavy apps (browser video, calls, games)");
    console.log("   and re-run. Every comparison from this run is unreliable and should be discarded.\n");
  }

  if (!feats.idle || !feats.varied || !feats.loop) {
    console.log("VERDICT: INCOMPLETE — need all three scenarios (idle, varied, loop).");
    console.log("If only idle recorded, install Ollama + a model and re-run power-probe.js (see README).");
    process.exit(0);
  }

  // Honest, transparent decision rule. Two separations must hold with a real margin:
  //  (1) idle is clearly the lowest-power state (baseline separates from work), and
  //  (2) loop is more self-similar than varied (higher periodicity OR steadier / lower CV).
  const idleSeparates = feats.idle.m < feats.varied.m - 2 && feats.idle.m < feats.loop.m - 2;
  const loopMorePeriodic = feats.loop.per > feats.varied.per + 0.10;
  const loopSteadier = feats.loop.cv < feats.varied.cv * 0.75;
  const loopVsVaried = loopMorePeriodic || loopSteadier;

  console.log("checks:");
  console.log("  idle is clearly lowest power (baseline separates): " + (idleSeparates ? "YES" : "no") +
    "   (idle " + fmt(feats.idle.m, 1) + "W vs varied " + fmt(feats.varied.m, 1) + "W / loop " + fmt(feats.loop.m, 1) + "W)");
  console.log("  loop more periodic than varied:                    " + (loopMorePeriodic ? "YES" : "no") +
    "   (loop " + fmt(feats.loop.per, 2) + " vs varied " + fmt(feats.varied.per, 2) + ")");
  console.log("  loop steadier than varied (lower CV):              " + (loopSteadier ? "YES" : "no") +
    "   (loop CV " + fmt(feats.loop.cv, 2) + " vs varied CV " + fmt(feats.varied.cv, 2) + ")");
  console.log("");

  if (idleSeparates && loopVsVaried) {
    console.log("VERDICT: SEPARABLE — the three workload classes leave distinguishable power signatures.");
    console.log("  This is the necessary first condition for a power-draw witness. It is NOT proof of");
    console.log("  tamper-resistance: an adversary running real decoy compute can still shape the signal.");
  } else {
    console.log("VERDICT: INCONCLUSIVE — the classes did not clearly separate on this hardware/run.");
    console.log("  Honest negative-ish result. Worth trying: a longer run (drop --quick), a heavier model,");
    console.log("  or sampling faster. If it stays inconclusive, that itself is a finding worth publishing:");
    console.log("  consumer-grade power draw may be too coarse to witness these classes.");
  }
  if (feats.decoy && !idleClean) {
    console.log("\n=== ATTACK ASSESSMENT: SKIPPED — baseline contaminated (see warning above). Re-run clean. ===");
  } else if (feats.decoy) {
    console.log("\n=== ATTACK ASSESSMENT (Phase 2: decoy vs honest loop) ===");
    const lowered = feats.decoy.per < feats.loop.per - 0.05;
    const reachedVaried = feats.decoy.per <= feats.varied.per + 0.05;
    console.log("  periodicity:  loop " + fmt(feats.loop.per, 3) + "  ->  decoy " + fmt(feats.decoy.per, 3) +
      "   (varied baseline " + fmt(feats.varied.per, 3) + ")");
    console.log("    " + (lowered ? "decoy LOWERED periodicity" : "decoy did NOT lower periodicity") +
      (reachedVaried ? " and reached the varied baseline — the periodicity channel is DEFEATED." : " but stayed above varied — periodicity partly held."));
    const stillWorking = feats.decoy.m > feats.idle.m + 5 && feats.decoy.um > feats.idle.um + 3;
    console.log("  still-working: decoy mean " + fmt(feats.decoy.m, 1) + "W / util " + fmt(feats.decoy.um, 1) +
      "%   vs idle " + fmt(feats.idle.m, 1) + "W / " + fmt(feats.idle.um, 1) + "%");
    console.log("    " + (stillWorking ? "decoy CANNOT hide that it is working — the idle-vs-work witness SURVIVES." : "decoy fell toward idle — unexpected; inspect."));
    console.log("  reading: decoy compute can smear the single periodicity channel, but it only ADDS");
    console.log("  power/util, so 'is it working at all' stays witnessed. The robust witness is power-vs-claimed-work.");
  }
  console.log("\n(n=1 exploratory. Paste this whole output back to continue.)");
}

run();
