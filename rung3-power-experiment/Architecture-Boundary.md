# Architecture Boundary — the core and the lens

Delta Atlas has two layers, and keeping them apart is what keeps the project honest.
This document draws the line and states the one rule that must never bend. It exists so that
every future session — human or model — can tell in one read what belongs where.

## Two layers

**The core — Delta Atlas.** Deterministic, client-side, reproducible on any machine with no
special hardware: the function-first glossary, Gap Check, the Priority Tracer, the
Framework/Coherence Audit, the Continuity Audit, the day-ledger, and the MCP manifest pin. Every
claim here can fail a test today and be re-run identically tomorrow. This is what ships, and
what people are asked to trust.

**The lens — the physical-audit sidecar.** Experimental, hardware-bound, empirical: the Rung 3
power-witness work in this folder, and anything that watches a *running* system from the
outside through power, timing, electromagnetic, or acoustic telemetry. It observes; it does not
compute a fixed answer. Its results carry uncertainty and depend on the hardware they were
taken on. It is a separate, parallel layer — it may live in an auxiliary app and need never
ship on the main site.

## The one-line test

For anything new, ask: **can it fail a deterministic test today, on any machine, with no
special hardware?**

- **Yes** → it belongs in the **core**.
- **No** — it needs a GPU, a sensor, a running target, or it produces a noisy distribution →
  it belongs in the **sidecar**.

That single question settles it without re-litigating the boundary each time.

## The cardinal rule

**The lens observes. It is never cited as core truth.**

Nothing measured by the sidecar may be stated in the core's voice — the glossary, the white
paper, the tools — as established fact. The sidecar can *inform* the core (it already reshaped
how the project talks about physical witnesses), but a measurement is not a definition, and an
n-small experiment on one laptop is not a law. Wherever a sidecar finding is referenced in the
core, it is marked experimental, with its bounds attached.

## Separate ≠ superior

Isolating the lens makes it **safe**, not **strong**. External physical observation is
*coarser* than reading an artifact directly, not sharper — Phase 2 proved this: the fine
"shape" channel was statistical noise, and only coarse working-vs-idle was robust. The
separation exists to *contain* the lens's drift, not to elevate its authority. The lens sits on
Rung 3 of the Witness Independence Ladder and carries every caveat it earned:

- **distinguishable ≠ tamper-proof** — a decoy workload or a spoofed sensor can defeat it;
- only **"is it working at all"** is robust; finer readings are hardware-dependent and noisy;
- every result is one machine, one moment, until independently repeated.

## Why this matters

The drifty, exciting, physics-borrowing ideas belong in the lens *precisely because* they can
be wrong there without harming the core. The core stays deterministic and shippable; the lens
is free to explore and fail. If the two ever blur, the whole project inherits the lens's
uncertainty and loses the one thing that makes the core worth trusting. Keeping this line sharp
is not bureaucracy — it is the most important structural decision in the project.

*Independent educational research, provided as-is. Licensed CC BY 4.0. © 2026 Jake Tiller.*
