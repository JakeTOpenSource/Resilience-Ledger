# Power-Witness Study, Phase 2 — attacking our own witness

Phase 1 asked whether GPU power draw can tell agent workloads apart. Phase 2 asks the harder
question: does that separation survive an adversary who is *trying* to look innocent? Same
discipline as Phase 1 — flat, data-dense, honest about limits. Reproducible with
`adversarial-decoy.js`, `power-probe.js --attack`, and `repeat-loop.js` in this folder.

Short version: the specific attack we built **failed to disguise a stuck loop as productive
work** — but not because the fine-grained signal is strong. That signal is weak and noisy. The
result that actually holds is the coarse one: **an agent burning power cannot fake being idle**,
and no amount of decoy compute changes that, because decoy compute only *adds* load.

## The attack

A deceptive agent that is still fundamentally looping (making no real progress) but injects
randomized decoy compute to smear its power trace's periodic rhythm — trying to drop its
periodicity from the honest loop's ~0.5–0.6 toward varied inference's ~0.38, so a "stuck" agent
reads as "erratic productive work."

**One correction that mattered.** The first-draft blueprint ran the decoy as a CPU math loop
(`Math.sin/cos/tan`). The witness measures *GPU* power — CPU work is invisible to it. That decoy
would have moved nothing and produced a false "the witness survived" result. The corrected decoy
(`adversarial-decoy.js`) is randomized *extra GPU inference* of varying size and timing: real
load on the channel we actually measure.

## Methodology

`power-probe.js --attack` adds a 4th `decoy` scenario alongside idle/varied/loop, measured in the
same session (same warm-up, same thermal state) for a fair comparison. `repeat-loop.js` then runs
loop and decoy windows repeatedly with cool-downs, logging power, temperature, and clock, to test
whether the signal is reproducible or drifts as the GPU heats up.

Hardware: one 2018-era laptop GPU (GTX 1660 Ti) with a disabled boost fan — thermally
constrained, which matters below.

**A dirty run, caught.** The first attack run was contaminated: its idle baseline read 7.8 W with
CV 0.91 and periodicity 0.92 — a clean idle is ~4 W, dead flat. Something else was using the GPU.
The analyzer now has an idle-sanity gate that refuses to trust any run where idle isn't idle; the
run was discarded and repeated clean.

## Results

**The attack did not disguise the loop.** Three controlled rounds (`repeat-loop.js`), loop and
decoy interleaved with cool-downs:

Raw trace: `runs/2026-07-05-run4-repeat.csv`.

| Round | loop (W / MHz) | loop periodicity | decoy (W / MHz) | decoy periodicity |
|---|---|---|---|---|
| 1 (51°C) | 33.6 / 1669 | 0.526 | 23.3 / 1176 | 0.391 |
| 2 (54°C) | 28.6 / 1453 | 0.297 | 24.5 / 1235 | 0.596 |
| 3 (55°C) | 28.3 / 1387 | 0.385 | 24.5 / 1217 | 0.485 |

**The periodicity channel is just noise on this hardware.** Loop periodicity swung 0.526 → 0.297
→ 0.385; decoy swung 0.391 → 0.596 → 0.485; varied (earlier runs) sits ~0.38. All three ranges
overlap. You cannot reliably tell a stuck loop from varied work — let alone a *disguised* loop —
from the trace's shape. So the attack question is moot: there is no stable periodicity signal to
defeat. The decoy never dragged its periodicity cleanly below the loop's; it just added to the
scatter.

**And the instability is visibly thermal.** Watch the loop rows: as the chip heated (51 → 55°C)
its clock throttled (1669 → 1453 → 1387 MHz) and its periodicity fell with it (0.526 → 0.297 →
0.385). The loop's "rhythm" is an artifact of stable per-call timing, and on a fanless throttling
GPU that timing is not stable. This is a fragile, hardware-dependent channel, attack or no attack.
(Consistent with the earlier scatter: loop periodicity read 0.598 in Phase 1's cool run and 0.196
in one later warm window — same code, driven by thermal state.)

**The decoy leaked while hiding.** Breaking its rhythm cost the decoy on other channels: across
both repeatability runs it ran at 23–25 W / ~1200 MHz versus the plain loop's 28–34 W / ~1400–1670
MHz, because its rhythm-breaking pauses reduce sustained load. Evasion on the periodicity axis
showed up as a lower-power, lower-clock signature.

**The coarse witness never budged.** Every decoy window drew 23–25 W against idle's ~4 W. Decoy
compute can only *add* load — it cannot make a working GPU look idle. Across every run in both
phases, idle-vs-work separated cleanly and was witnessed three ways (power, utilization, clock).
This is the result that survives.

## What this means — the red-light camera

The honest framing is a red-light camera, not a mind-reader. A red-light camera does not judge
whether you are a *good driver* — it records one objective physical fact: you were in the
intersection when the light was red. Our robust witness is the same: it does not judge whether an
agent is *safe* or *productive* — it records one objective physical fact, **the GPU was drawing
power while the agent's log claimed it was idle.** That is the violation, and like the camera it
is a physical observation checked against a declared state — the claim-vs-witness pattern the
whole project is built on.

Where the analogy stops is exactly where our data got weak: the camera does not try to infer
*why* you ran the red, and our witness cannot reliably infer *whether* an agent is stuck-looping
versus doing genuine varied work from the power trace's shape. That finer reading is the noisy
periodicity channel, and it should not be trusted. Witness the fact you can hold (power level vs
the claim), not the intent you cannot (trace shape).

## Explicit caveats

- **A handful of runs on one thermally-constrained laptop GPU.** Not a statistical study. The
  disabled boost fan adds throttling noise, especially to the fragile shape channel.
- **One attack design.** "This decoy fails" is not "no decoy can succeed." A stronger adversary —
  dominant aperiodic GPU load, adaptive timing — is untested.
- **Distinguishable is still not tamper-proof.** The coarse witness survives *this* attack because
  decoy compute only adds power. An adversary who can suppress or spoof the sensor itself (a
  compromised driver, a faked `nvidia-smi`) is a different, out-of-scope threat — and the more
  dangerous one.
- **The witness is evidence, not prevention.** Like the camera, it records a divergence after the
  fact; it does not stop the agent.

**What Phase 2 establishes:** the coarse idle-vs-work witness is robust to this decoy attack,
because decoy compute cannot fake idle. **What it does not establish:** that the fine
stuck-vs-productive distinction is usable (it isn't, on this hardware), or that a stronger attack
couldn't beat the coarse witness by going after the sensor rather than the signal.

*Rung 3, Phase 2. Independent educational research, provided as-is. Reproducible with the scripts
in this folder. Licensed CC BY 4.0. © 2026 Jake Tiller.*
