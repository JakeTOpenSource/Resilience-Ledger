# Power-Witness Study — can a GPU's power trace tell agent workloads apart?

This document records a single, small experiment and what it does and does not show. It is
Phase 1 of the Rung 3 (physical-witness) work. Everything here is reproducible with the
scripts in this folder (`power-probe.js`, `power-analyze.js`, `surrogate-test.js`); the raw
traces and a hardware manifest are in `runs/`. It went through a three-lens adversarial review,
and several of the first draft's claims did not survive it — those corrections are kept in
place below rather than quietly removed.

## The hypothesis

Can raw, consumer-grade GPU power draw (watts, sampled ~10×/second) tell distinct
autonomous-agent workloads apart — idle, varied inference, and a stuck repeating loop — using
nothing but `nvidia-smi`, with no model instrumentation and no special hardware?

This is the necessary first question for a physical witness (Rung 3 of the Witness Independence
Ladder). If the classes do not separate at all, there is nothing to build on. It is not the
question "is this tamper-proof" — that is Phase 2, and harder.

## Methodology & corrections

One local NVIDIA GeForce GTX 1660 Ti (driver `610.47`, power.limit reported `[N/A]` — both
verbatim from `nvidia-smi`, logged in `runs/2026-07-05-run2-manifest.json`), Ollama running
`qwen2.5:0.5b`. `power-probe.js` samples `nvidia-smi power.draw` (plus utilization and clock)
every 100 ms while driving three scenarios back to back: idle (~12 s, no GPU work), varied
(~20 s, diverse prompts, 64 tokens each), loop (~20 s, the same prompt repeated, standing in
for a stuck agent). The idle window is shorter than the other two — noted here because it
gives idle fewer samples (109 vs ~186) and a slightly higher metric noise floor.

**The first run was contaminated, and the failure is worth recording.** Two harness bugs, not
hardware faults:

1. **Cold-load contamination.** The model's one-time load into VRAM landed inside the `varied`
   scenario and blocked it, so that trace was mostly loading-and-waiting, not inference.
   (The specific figures — window ~129 s, ~1,288 samples, false-low ~5.5 W — are from run 1's
   analyzer printout; its raw trace was overwritten, see below, so they cannot be recomputed.)
   Fix: a throwaway warm-up call *before* timing begins, so the cold-start is never recorded.
2. **Sampling aliasing on the loop.** The loop call was 6 tokens — each finished faster than
   the 100 ms sampling interval could resolve, so its repetition was invisible. Fix: lengthen
   the loop call to 40 tokens so each iteration spans several samples.

**Data-loss disclosure:** the corrected run (run 2) reused the same output filenames and
overwrote run 1's raw traces. Two summary numbers survive from run 1's printout (idle 4.26 W,
loop 13.65 W). They are shown only for transparency and are **not** independent corroboration:
run 1's loop was the aliased 6-token version, and its lower loop mean (13.65 W vs run 2's
36.65 W) simply reflects that 6-token calls do far less GPU work per sample. Runs are now
archived under `runs/` with dated names, and the probe writes a `run-manifest.json`, so this
cannot recur.

The decision rule in `power-analyze.js` was pre-specified during the run-1 debugging cycle
(it predates run 2's data — file timestamps confirm), but it was authored by us, not
independently pre-registered, and its thresholds are ours.

## The local dataset (run 2, corrected)

All values recomputed directly from the archived raw CSVs in `runs/`.

| Scenario | n | Mean W | CV | 5th-pctile W | Periodicity | GPU util | SM clock |
|---|---|---|---|---|---|---|---|
| Idle | 109 | 4.25 | 0.036 | 4.01 | 0.329 † | 0.0% | 302 MHz |
| Varied inference | 186 | 45.25 | 0.287 | 30.07 | 0.383 | 25.1% | 1857 MHz |
| Stuck loop | 187 | 36.65 | 0.324 | 22.26 | 0.598 | 20.2% | 1661 MHz |

† Idle's periodicity is a metric artifact, not rhythm: on a near-constant signal the
autocorrelation peak still returns ~0.3. See the surrogate test below.

**Is the periodicity signal real?** The periodicity score is the max autocorrelation over 59
lags, which is non-zero even on noise. `surrogate-test.js` permutes each series 2,000 times
(seeded, so the null band is identical on every run) to get a null:

| Scenario | Periodicity | null 99th | null max | p(null ≥ real) | reading |
|---|---|---|---|---|---|
| Idle | 0.329 | 0.294 | 0.344 | 0.0030 | near the floor — barely above noise |
| Varied | 0.383 | 0.239 | 0.262 | 0.0000 | real, modest |
| Loop | 0.598 | 0.243 | 0.305 | 0.0000 | real, strong (≈2× varied's margin over its null) |

So the loop's autocorrelation is genuinely above chance and clearly stronger than varied's;
idle's is essentially the noise floor. Periodicity isolates the **loop**; it does not cleanly
rank idle vs varied.

**What separates, and how strongly:**

- **Idle vs. any work — robust, and witnessed three independent ways.** Mean power is 8.6–10.7×
  higher under load (this is a mean; a single varied reading touches 4.1 W, so instantaneous
  traces overlap — but robustly only 1.6% of varied and 0% of loop samples fall below 6 W, and
  the 5th-percentile power under load is 22–30 W). The same split shows in **GPU utilization**
  (idle a flat 0.0% vs 20–25%) and **SM clock** (idle parked at 302 MHz vs 1660–1857 MHz). To
  fake "idle" while computing, an adversary would have to suppress power, utilization, and
  clock at once, and each only rises when work is added. This is the load-bearing result.
- **Loop vs. varied — one channel only.** The only signal that separates them is periodicity
  (0.598 vs 0.383, both real per the surrogate test). The rule's "steadier" arm did **not**
  fire — loop's CV (0.324) is actually higher than varied's (0.287). The raised-floor idea from
  the first draft did **not** survive a robust statistic — varied's 5th-percentile power
  (30 W) is higher than loop's (22 W), so the floor does not distinguish them. Utilization and
  clock overlap. Loop-vs-varied therefore rests on a single, attackable number.

**Verdict, split by confidence:** idle-vs-work is **robustly separable** (three channels, large
margins). Loop-vs-varied is **suggestively separable on periodicity alone** — statistically
real in this one run, but single-channel, which is exactly the surface Phase 2 will attack.

## Explicit caveats

- **n = 1 run** (the per-scenario sample counts in the tables are within that single run). One
  machine, one moment, no repetition, no cross-machine check.
- **One consumer GPU** (GTX 1660 Ti) and **one lightweight model** (qwen2.5:0.5b, which only
  drives the card to ~20–25% util). Larger models, batched serving, or a busy shared GPU may
  blur the classes or raise the floors.
- **Distinguishable is not tamper-proof — the structural limit.** This shows the workloads look
  different when run *honestly*. It says nothing about an adversary who runs real decoy compute
  to shape the signal. A stuck loop that injects strategic chaotic filler to depress its own
  periodicity is exactly the attack this does not defend against — and since loop-vs-varied
  rests on periodicity alone, that is where the ceiling is. Phase 2 tests it directly.

**What this establishes:** on ordinary hardware, honest workloads separate in the power trace —
robustly for idle-vs-work, on a single channel for loop-vs-varied. **What it does not
establish:** that either separation survives an adversary. That is the next experiment.

*Rung 3, Phase 1. Independent educational research, provided as-is. Reproducible with the
scripts in this folder. Licensed CC BY 4.0. © 2026 Jake Tiller.*
