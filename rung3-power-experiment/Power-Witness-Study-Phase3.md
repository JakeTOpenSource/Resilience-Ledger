# Power-Witness Study, Phase 3 — can you trust the witness itself?

Phase 1 asked whether a GPU's power draw can *see* what an agent is doing (yes, coarsely).
Phase 2 asked whether an agent can *hide* from it (it can blur the fine detail, but it cannot
fake *working* — doing work costs power). Phase 3 asks the hardest one: **what if the agent
lies about the reading itself?** If it can fake the sensor, the whole witness collapses. This
document records what the data and the reasoning say about making the witness hard to lie to.

This is **sidecar** work — the experimental lens, not core truth (see `Architecture-Boundary.md`).
Finding 1 is reproducible with `cross-witness.js` over the traces already in `runs/`.

## Finding 1 — one witness, three needles (correcting our own language)

Phases 1 and 2 called the idle-vs-work result "triple-witnessed" — power *and* utilization
*and* clock. Step 1 tested whether those three are actually independent. Over runs 2 and 3
(219 idle, 943 work samples, all logging the three channels):

| channel | idle | work |
|---|---|---|
| power (W) | 4.3 [3.9–5.2] | 31.8 [4.1–60.2] |
| util (%) | 0.0 [0–0] | 20.7 [0–46] |
| clock (MHz) | 302 [300–360] | 1460 [300–1905] |

The channels are **coupled** — power-util 0.71, power-clock 0.89, util-clock 0.79; they rise
and fall together. And the spoof test is decisive — how many *working* samples can masquerade
as idle?

- fooling **power alone** (power < 6 W): 6 of 943 (0.6%)
- fooling **all three** (power < 6 & util < 3 & clock < 600): **the same 6** (0.6%)

Requiring all three to agree caught **nothing** power alone missed. The reason: the three
numbers are three *readouts of one thing* — GPU load — reported by **one tool** (`nvidia-smi`).
It is **one witness wearing three needles**, not three witnesses. A spoof of that tool moves all
three needles at once.

So "triple-witnessed" was too generous. The honest label is **one robust signal, read three
coupled ways from a single source.** The idle-vs-work *finding* is unchanged and still strong
(the needles agreeing keeps the signal clean). But its *independence* was overstated — and that
is the whole ballgame the moment you ask "can a liar fake it?"

This validated the ladder's own name. It is the Witness **Independence** Ladder, not the witness
*count* ladder. Multiplicity of readings is not independence of roots.

## Principle — reachability, not invisibility

What would make the witness actually hard to fake? Two candidate answers, one weak, one strong:

- **Invisibility (weak).** Hide the auditor so the attacker doesn't know to spoof it. This fails
  a determined attacker, and it fails *by design* here: the project is open-source, so the method
  is published. Do not build on obscurity.
- **Unreachability (strong).** Put the witness on a wire the attacker is not connected to. In
  circuit terms: a software agent is a signal on the *digital bus* — it can reach anything wired
  to that bus, including a software sensor (`nvidia-smi`). Their paths cross → spoofable. An
  *external* current clamp on the power rail lives in a *different physical domain*; software is
  not wired to the copper. Their paths never cross → unspoofable by that agent.

The witness worth building toward is **unreachable, not invisible.** That is what *independent
roots* means concretely: a software counter, an external hardware meter, and a cryptographic
attestation are three different domains with three different failure modes — not three fields
from one tool.

## The gate — physical plausibility as a tripwire

A second lever: real power obeys physics. Thermal mass and capacitance *smooth* transitions;
the channels stay coupled. A lazy spoof breaks physics — a value flat-lined at a suspiciously
perfect "4.0 W," an instantaneous 40 → 4 W step no capacitor allows, or power reading idle while
the clock reads boosted (a coupling violation). A **plausibility gate** trips when a reading
leaves the physically-possible envelope — a window comparator on the invariants.

Honest bounds:
- It **raises the attacker's cost** (mimic real physics, not just write a number) — but a smart
  spoofer replaying a genuine, consistent trace still passes. A higher wall, not an infinite one.
- It only bites with an **independent signal to compare against** — otherwise the attacker fakes
  everything consistently from the one source and sails through.
- Watch **false trips**: real throttling (this machine's dead fan) makes sudden clock drops that
  look spoof-like. The envelope must be tuned to legitimate hardware behavior or it locks down on
  nothing.

## The anchor — and why you already built it

In a transparent, deterministic system the set of *legitimate* behavior is fully mapped, so a
spoof is an anomaly by definition (a positive-security / negation model — you know everything it
is *not*). Add a **tamper-evident chain** and a spoof cannot be inserted without breaking a link
— and the break says *exactly where* it entered. The discontinuity is the return address.

This is not new to the project — it is already shipped at Rung 2. The hash-chained **`day-ledger`**
and **`mcp-manifest-pin`** already make tampering self-revealing: alter an entry, the chain breaks
and names the spot; a silently-changed manifest fails its pin. The physical layer's job is to earn
the *same* property.

The catch that makes it real: the trace only leads *home* if its **root is unforgeable** — a
signature or attestation the attacker cannot rewrite. A deep enough attacker who owns the whole
open pipeline rewrites the trace along with the spoof. So traceability depends on the **same
anchor** as unreachability: a root outside the attacker's reach. Transparency gives you the field
to see the anomaly; the unforgeable anchor makes the detection stick.

Two edges to keep in view:
- **Open cuts both ways.** No secrecy advantage — the attacker sees the allowlist too and can
  forge to fit it. The defender's edge is owning the reference ground-truth and holding the anchor.
- **Traceable ≠ prevented.** A one-way ticket back to the source is *attribution* — the red-light
  camera again. It proves who ran the red; it does not stop the car. Evidence, not a wall.

## What the whole Rung 3 line established

- A GPU's power *level* is a real, cheap, physical witness of **"is it working at all,"** robust
  across every run and every attack tried.
- Its *shape* (periodicity) is **noise** on real hardware — thermally driven, not a usable signal.
- The channels we logged are **one witness, not three** — coupled, single-source.
- So the coarse witness is a **single, spoofable witness**: strong as a *signal*, weak against a
  *liar*.
- Making it trustworthy needs an **independent, unforgeable root** (an external meter or a
  cryptographic attestation), reached the same three ways as everything else in this project:
  **map it** (what's legitimate), **gate it** (trip on physics violations), **anchor it** (to a
  root they can't rewrite).

## Folds into the core as concepts only (per the boundary rule)

Nothing here is cited as core truth. What the lens *taught* the core:
- the Witness Independence Ladder gains an explicit distinction — **independence of roots ≠
  multiplicity of readings**;
- **cryptographic attestation** is named as the honest top of Rung 3, with the power-witness as
  its cheap, spoofable cousin;
- the Rung-2 ledger's tamper-evidence is recognized as the *same idea* the physical layer reaches
  for — one architecture at two altitudes.

## Explicit caveats

- A handful of runs on one thermally-constrained laptop GPU; not a statistical study.
- The attestation / external-meter direction is *named and reasoned*, not built — building it needs
  trusted hardware this machine doesn't expose.
- "Distinguishable, then traceable" is still **not tamper-proof.** A root-level attacker who owns
  both the sensor and the trace remains the out-of-scope — and most dangerous — threat.

*Rung 3, Phase 3 (capstone). Independent educational research, provided as-is. Reproducible with
the scripts in this folder. Licensed CC BY 4.0. © 2026 Jake Tiller.*
