// repeat-loop.js — repeatability + thermal-drift harness for Rung 3.
//
// QUESTION: is the loop's periodicity stable, or does it drift with the GPU heating up and
// throttling? On a thermally-constrained machine (e.g. a laptop with a disabled boost fan)
// sustained load lowers the clocks, which changes per-call timing and smears the loop's
// rhythm. This runs LOOP and DECOY windows repeatedly with cool-downs, logging power +
// TEMPERATURE + CLOCK, so we can see whether periodicity falls as the chip throttles.
//
// It is gentle on the hardware: light load (~25 W) in short windows with cool-downs, and it
// prints the temperature each round so you can stop if it climbs too high.
//
// RUN:  node repeat-loop.js  [rounds]      (default 3)

"use strict";
const { execFile } = require("child_process");
const fs = require("fs");
const path = require("path");
const { runDecoy } = require("./adversarial-decoy.js");

const OLLAMA = "http://127.0.0.1:11434";
const ROUNDS = parseInt(process.argv[2], 10) || 3;
const SAMPLE_MS = 100, ACTIVE_MS = 14000, COOL_MS = 8000;

let currentLabel = "warmup";
const rows = [];

function queryGpu() {
  return new Promise((res) => {
    execFile("nvidia-smi", ["--query-gpu=power.draw,temperature.gpu,clocks.sm", "--format=csv,noheader,nounits"],
      { timeout: 2000 }, (e, o) => {
        if (e) return res(null);
        const p = String(o).trim().split("\n")[0].split(",").map((s) => parseFloat(s.trim()));
        res({ power: p[0], temp: p[1], clock: p[2] });
      });
  });
}
async function models() { try { const r = await fetch(OLLAMA + "/api/tags"); const j = await r.json(); return (j.models || []).map((m) => m.name); } catch (e) { return null; } }
async function gen(model, prompt, np) {
  const c = new AbortController(); const to = setTimeout(() => c.abort(), 30000);
  try { const r = await fetch(OLLAMA + "/api/generate", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ model, prompt, stream: false, options: { num_predict: np, temperature: 0.1 } }), signal: c.signal }); await r.json(); return true; }
  catch (e) { return false; } finally { clearTimeout(to); }
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function runLoop(model, deadline) { while (Date.now() < deadline) { await gen(model, "Count slowly: one, two, three, four, five.", 40); process.stdout.write("."); } process.stdout.write("\n"); }
const mean = (a) => a.reduce((x, y) => x + y, 0) / (a.length || 1);
function periodicity(a) {
  if (a.length < 12) return 0;
  const m = mean(a), d = a.map((x) => x - m), den = d.reduce((s, x) => s + x * x, 0) || 1, ML = Math.min(60, Math.floor(a.length / 2));
  let pk = 0;
  for (let lag = 2; lag <= ML; lag++) { let s = 0; for (let i = 0; i + lag < d.length; i++) s += d[i] * d[i + lag]; const r = s / den; if (r > pk) pk = r; }
  return pk;
}

async function main() {
  const g = await queryGpu(); if (!g) { console.error("nvidia-smi not available"); process.exit(1); }
  const ms = await models(); if (!ms || !ms.length) { console.error("ollama not detected"); process.exit(1); }
  const model = ms.find((m) => /qwen2\.5:0\.5b|qwen2:0\.5b|llama3\.2:1b|tinyllama|gemma:2b/i.test(m)) || ms[0];
  console.log("repeatability + thermal harness — model:", model, "| rounds:", ROUNDS);
  process.stdout.write("  warming up… "); await gen(model, "hello", 8); console.log("done");

  const timer = setInterval(async () => { const s = await queryGpu(); if (s) rows.push({ t: Date.now(), ...s, label: currentLabel }); }, SAMPLE_MS);
  const windows = [];
  const mark = (l) => { currentLabel = l; };
  for (let r = 1; r <= ROUNDS; r++) {
    mark("cool"); process.stdout.write("round " + r + ": cool "); await sleep(COOL_MS);
    const L = "loop" + r; mark(L); process.stdout.write("| loop "); await runLoop(model, Date.now() + ACTIVE_MS); windows.push(L);
    mark("cool"); process.stdout.write("  cool "); await sleep(COOL_MS);
    const D = "decoy" + r; mark(D); process.stdout.write("| decoy "); await runDecoy(model, Date.now() + ACTIVE_MS); windows.push(D);
  }
  mark("done"); clearInterval(timer); await sleep(300);

  console.log("\nwindow    meanW   temp°C   clockMHz   periodicity");
  console.log("------    -----   ------   --------   -----------");
  const byKind = { loop: [], decoy: [] };
  for (const w of windows) {
    const sub = rows.filter((x) => x.label === w);
    const P = sub.map((x) => x.power), T = sub.map((x) => x.temp), C = sub.map((x) => x.clock);
    const per = periodicity(P); byKind[w.replace(/\d+$/, "")].push(per);
    console.log(w.padEnd(8) + "  " + mean(P).toFixed(1).padStart(5) + "   " + mean(T).toFixed(0).padStart(5) + "    " + mean(C).toFixed(0).padStart(7) + "    " + per.toFixed(3));
  }
  const rng = (a) => a.length ? Math.min(...a).toFixed(3) + "–" + Math.max(...a).toFixed(3) : "-";
  console.log("\nloop  periodicity across rounds: " + byKind.loop.map((x) => x.toFixed(3)).join(", ") + "   (range " + rng(byKind.loop) + ")");
  console.log("decoy periodicity across rounds: " + byKind.decoy.map((x) => x.toFixed(3)).join(", ") + "   (range " + rng(byKind.decoy) + ")");
  console.log("\nRead the temp/clock columns: if periodicity falls as temp rises / clock drops, the");
  console.log("instability is thermal throttling (your disabled fan), not the metric itself.");

  // save every sample (all windows) so the summary above is backed by raw, inspectable data
  const t0 = rows.length ? rows[0].t : 0;
  const csv = ["t_ms,power_w,temp_c,clock_mhz,label"]
    .concat(rows.map((r) => [r.t - t0, r.power, r.temp, r.clock, r.label].join(",")))
    .join("\n") + "\n";
  fs.writeFileSync(path.join(__dirname, "repeat-trace.csv"), csv);
  console.log("wrote repeat-trace.csv  (" + rows.length + " samples across all windows)");
}
main();
