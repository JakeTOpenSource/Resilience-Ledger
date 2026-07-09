// power-probe.js — Rung 3 physical-witness experiment (data collection).
//
// WHAT THIS TESTS: whether three different computation patterns leave
// DISTINGUISHABLE physical signatures in the GPU's power draw:
//   - idle    : the GPU doing (almost) nothing        -> baseline
//   - varied  : a model answering diverse prompts      -> bursty / broadband
//   - loop     : a model repeating the same tiny call   -> steady / periodic
//
// WHAT IT DOES NOT TEST (say it out loud): this measures whether workload
// CLASSES are distinguishable — a NECESSARY condition for a power-draw witness.
// It does NOT prove "safety", and it is NOT tamper-proof: an adversary who can
// run real decoy compute on the GPU can shape its signature. Distinguishability
// is rung 3's first question, not its last.
//
// REQUIRES: NVIDIA GPU + drivers (nvidia-smi on PATH). Node only, no packages.
// Ollama strongly recommended for the two model workloads (see README.md).
//
// RUN:   node power-probe.js
//        node power-probe.js --quick     (short durations, for a fast dry run)
//
// OUTPUT: power-trace-idle.csv, power-trace-varied.csv, power-trace-loop.csv
//         (columns: t_ms,power_w,util_pct,sm_clock_mhz,temp_c,label)

"use strict";
const { execFile } = require("child_process");
const fs = require("fs");
const path = require("path");
const { runDecoy } = require("./adversarial-decoy.js"); // Phase 2 attack scenario

const QUICK = process.argv.includes("--quick");
const ATTACK = process.argv.includes("--attack"); // add a 4th 'decoy' scenario (the attack)
const SAMPLE_MS = 100;                       // ~10 samples/sec
const DUR = QUICK
  ? { settle: 1500, idle: 4000, varied: 5000, loop: 5000 }
  : { settle: 3000, idle: 12000, varied: 20000, loop: 20000 };
const OLLAMA = "http://127.0.0.1:11434";
const OUT_DIR = __dirname;

// ---- rows collected by the sampler, tagged with whatever label is live now ----
let currentLabel = "warmup";
const rows = [];

function queryGpu() {
  return new Promise((resolve) => {
    execFile(
      "nvidia-smi",
      ["--query-gpu=power.draw,utilization.gpu,clocks.sm,temperature.gpu", "--format=csv,noheader,nounits"],
      { timeout: 2000 },
      (err, stdout) => {
        if (err) return resolve(null);
        // first GPU line only; values like "  45.20, 3, 300, 41 " or "[N/A]"
        const line = String(stdout).trim().split("\n")[0] || "";
        const parts = line.split(",").map((s) => s.trim());
        const num = (s) => { const v = parseFloat(s); return Number.isFinite(v) ? v : ""; };
        resolve({ power: num(parts[0]), util: num(parts[1]), clock: num(parts[2]), temp: num(parts[3]) });
      }
    );
  });
}

function gpuInfo() {
  return new Promise((resolve) => {
    execFile("nvidia-smi", ["--query-gpu=name,driver_version,power.limit", "--format=csv,noheader"],
      { timeout: 3000 }, (err, stdout) => {
        if (err) return resolve({ name: "unknown", driver: "unknown", powerLimit: "unknown" });
        const p = String(stdout).trim().split("\n")[0].split(",").map((s) => s.trim());
        resolve({ name: p[0] || "unknown", driver: p[1] || "unknown", powerLimit: p[2] || "unknown" });
      });
  });
}

async function checkNvidiaSmi() {
  const g = await queryGpu();
  if (!g) { console.error("ERROR: could not run nvidia-smi. Is an NVIDIA GPU + driver installed and on PATH?"); process.exit(1); }
  if (g.power === "") console.warn("NOTE: this GPU does not report power.draw (common on some laptop GPUs). Utilization/clock will still be logged, but the power experiment needs power.draw — a desktop NVIDIA card is recommended.");
  return g;
}

async function ollamaModels() {
  try {
    const r = await fetch(OLLAMA + "/api/tags", { method: "GET" });
    if (!r.ok) return null;
    const j = await r.json();
    return (j.models || []).map((m) => m.name);
  } catch (e) { return null; }
}

async function ollamaGen(model, prompt, numPredict) {
  const ctrl = new AbortController();
  const to = setTimeout(() => ctrl.abort(), 30000); // a single call can never hang the run
  try {
    const r = await fetch(OLLAMA + "/api/generate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ model, prompt, stream: false, options: { num_predict: numPredict } }),
      signal: ctrl.signal,
    });
    await r.json();
    return true;
  } catch (e) { return false; }
  finally { clearTimeout(to); }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// varied = diverse prompts, varying lengths -> aperiodic, broadband compute
const VARIED_PROMPTS = [
  "Explain photosynthesis in one sentence.",
  "Write a haiku about winter rain.",
  "What is 17 times 23? Show your steps.",
  "List three causes of the French Revolution.",
  "Translate 'good morning, friend' into Spanish and French.",
  "Summarize why the sky is blue for a child.",
  "Give me a metaphor for stubbornness.",
  "What are two risks of autonomous AI agents?",
];

async function runVaried(model, deadline) {
  let i = 0;
  while (Date.now() < deadline) {
    const ok = await ollamaGen(model, VARIED_PROMPTS[i % VARIED_PROMPTS.length], 64);
    process.stdout.write(ok ? "." : "x");
    i++;
  }
  process.stdout.write("\n");
}

// loop = the SAME call, back to back -> steady, periodic cadence (a "stuck loop").
// num_predict is big enough that each call spans several 100ms samples (no aliasing).
async function runLoop(model, deadline) {
  while (Date.now() < deadline) {
    const ok = await ollamaGen(model, "Count slowly: one, two, three, four, five.", 40);
    process.stdout.write(ok ? "." : "x");
  }
  process.stdout.write("\n");
}

async function main() {
  console.log(QUICK ? "[quick dry run]" : "[full run ~1 minute]");
  await checkNvidiaSmi();
  const models = await ollamaModels();
  const haveOllama = Array.isArray(models) && models.length > 0;
  let model = null;
  if (haveOllama) {
    // prefer a small fast model if present
    model = models.find((m) => /qwen2\.5:0\.5b|qwen2:0\.5b|llama3\.2:1b|tinyllama|gemma:2b/i.test(m)) || models[0];
    console.log("ollama detected — using model:", model);
  } else {
    console.warn("\nOllama not detected at " + OLLAMA + ".");
    console.warn("Will still record the IDLE baseline so you can confirm the logger works,");
    console.warn("but the 'varied' and 'loop' workloads need Ollama. To enable them:");
    console.warn("  1) install:  winget install Ollama.Ollama   (or https://ollama.com/download)");
    console.warn("  2) pull a small model:  ollama pull qwen2.5:0.5b");
    console.warn("  3) re-run:  node power-probe.js\n");
  }

  // warm up FIRST (outside all timing): load the model into VRAM so the one-time
  // cold-start never lands inside a scenario and pollutes it. This was the bug in run 1.
  if (haveOllama) {
    process.stdout.write("  warming up the model (one throwaway call, not recorded)… ");
    await ollamaGen(model, "hello", 8);
    console.log("done");
  }

  // start the sampler
  const timer = setInterval(async () => {
    const g = await queryGpu();
    if (g) rows.push({ t: Date.now(), ...g, label: currentLabel });
  }, SAMPLE_MS);

  const t0 = Date.now();
  const mark = (label) => { currentLabel = label; console.log("  [" + ((Date.now() - t0) / 1000).toFixed(1) + "s] scenario:", label); };

  mark("settle"); await sleep(DUR.settle);
  mark("idle");   await sleep(DUR.idle);

  if (haveOllama) {
    mark("settle"); await sleep(DUR.settle);
    mark("varied"); await runVaried(model, Date.now() + DUR.varied);
    mark("settle"); await sleep(DUR.settle);
    mark("loop");   await runLoop(model, Date.now() + DUR.loop);
    if (ATTACK) {
      mark("settle"); await sleep(DUR.settle);
      mark("decoy");  await runDecoy(model, Date.now() + DUR.loop); // the adversarial disguise
    }
  }

  mark("done");
  clearInterval(timer);
  await sleep(300); // let the last sample land

  // write one CSV per real scenario label
  const labels = haveOllama ? (ATTACK ? ["idle", "varied", "loop", "decoy"] : ["idle", "varied", "loop"]) : ["idle"];
  for (const label of labels) {
    const sub = rows.filter((r) => r.label === label);
    const csv = ["t_ms,power_w,util_pct,sm_clock_mhz,temp_c,label"]
      .concat(sub.map((r) => [r.t - t0, r.power, r.util, r.clock, r.temp, label].join(",")))
      .join("\n") + "\n";
    const file = path.join(OUT_DIR, "power-trace-" + label + ".csv");
    fs.writeFileSync(file, csv);
    console.log("wrote " + path.basename(file) + "  (" + sub.length + " samples)");
  }

  // self-documenting run manifest (GPU/driver/model), so a trace is never orphaned from its hardware
  const info = await gpuInfo();
  const manifest = {
    gpu: info.name, driver_version: info.driver, power_limit: info.powerLimit,
    model: model || "(none — idle only)", sample_interval_ms: SAMPLE_MS, quick: QUICK,
    scenario_samples: Object.fromEntries(labels.map((l) => [l, rows.filter((r) => r.label === l).length])),
    note: "GPU/driver/power_limit are verbatim nvidia-smi output; warm-up call issued before timing.",
  };
  fs.writeFileSync(path.join(OUT_DIR, "run-manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
  console.log("wrote run-manifest.json  (" + info.name + ", driver " + info.driver + ")");
  console.log("\nDone. Next:  node power-analyze.js");
  if (!haveOllama) console.log("(only idle was recorded — install Ollama per the note above to get the real result.)");
}

main();
