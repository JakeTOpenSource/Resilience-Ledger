# Operator Protocol — running the operator by the same ledger as the system

*Part of Delta Atlas. Status: candidate, v0.1, 2026-07-02. The author applies his own framework to himself here; edit freely — this document expects to be revised, that is what the log at the bottom is for.*

The Resilience Ledger says protection calibrates to the slowest-recovering substrate in the loop, and that substrate is the human. This document is that calibration, written down. It applies the same three functions the tools check for — Absorb, Check, Return — to the person operating them. Nothing in it is medical advice; it is workflow design using the project's own published mechanics.

One framing choice, stated openly: a mind that pattern-matches across distant domains — botany to hydraulics to finance to psalms — is the engine that built this project's witness layer. The same wiring that generates ten sparks an hour is what found ordering drift hiding in a greenhouse trace. The protocol below is not for suppressing that engine. It is a harness for it, in this project's exact sense of the word: the structure that turns raw capability into governed work — direct it, bound it, and never trust it to also be the brake.

## Absorb — the register takes the spark, the session keeps the thread

- **One open thread per session.** The session has one declared goal (see Check). Everything else that lights up mid-session — and it will — goes to the candidate register, not into action.
- **The two-minute capture.** New idea → one line in the register (name + what it does + why it might matter) → back to the thread. The register is the buffer that deforms so the session doesn't snap. An idea written down is absorbed, not lost; an idea chased is a thread broken.
- **Grace for the miss.** Some sessions the thread breaks anyway. That is survivable error, not failure — log where it broke and stop. Brittleness would be pretending it didn't happen.

## Check — the floor for the operator

- **Declare the session invariant.** First line of every session, before anything else: one sentence stating what this session is for. That sentence is the session's reference anchor — later choices get checked against it, and it does not get quietly reinterpreted mid-session ("re-evaluating the intent" of your own goal at hour two is ordering drift with your own name on it).
- **Direction-symmetric self-review.** The idea you love gets scrutinized exactly as hard as the one you're skeptical of. The unscrutinized direction is the unlocked door, and for a builder the unscrutinized direction is always the favorite idea.
- **Returns are divergence — including your own hot ones.** A late-night insight is a return from a system running hot. Sort it on receipt like any other: log it, sleep, cold-read it before it enters structure. The ledger already refused to let a model's enthusiasm fold candidates; extend the same refusal to your own.
- **The corpus is the floor, always.** When a tool fails a labeled case, the tool changes. When your plan fails contact with reality, the plan changes. Labels and reality do not get edited to preserve momentum.

## Return — reset to a known center, don't ratchet

- **Close every session with a log entry.** Three lines: what changed, why, the single next step. This is the re-derivation log doing for your memory what it does for the structure — the session's verified result is committed, the residue is dropped. Context Reset After Commit, applied to the operator.
- **Open every session from the log, not from recall.** The next session starts by reading the last entry — not by re-deriving state from memory under load. Carry less, not more.
- **Watch for the ratchet.** The failure mode where every session leaves the project a little more sprawled and nothing ever returns to baseline. If three consecutive log entries say "started X" and none say "closed X," the system is locking high. The fix is mechanical: the next session's declared invariant is *close one open thread*.

## The metabolic veto, operationalized

The ledger's Candidate G: the human is the only node whose costs do not reset by committing and forgetting. So the veto is not a mood, it is a rule with triggers:

- **Stop on degraded read.** The v0.5 log notes high-consequence sessions run hottest, when the read on your own output is least reliable. When you notice re-reading the same paragraph, or the flag-everything/flag-nothing swing — that is thermal drift in the evaluator. Grounding does not fix it; only recovery does. Stop is mechanical, not optional.
- **Off-channel cooldown.** Recovery the channel can't reach: no screens, no project. The adversary (including the friendly adversary of your own momentum) cannot deny you a walk.
- **High-consequence changes wait a day.** Anything that alters structure — a sealed claim, a public release, a deletion — gets its cold read after sleep. The 6-session review cadence already exists; this is its per-decision form.

## Working with AI models at zero budget

The architecture is already right and already yours: **models propose, deterministic gates verify, the human cold-reads.** Keep three habits:

1. **The model never holds the pen on the floor.** Lexicons, corpora, labels, and this protocol live outside any model's write path. A model return that says "relabel the floor" gets sorted like the Gemini returns were: fold the kernel, decline the inversion, log the reason.
2. **Sessions are cheaper than marathons** — for the tooling and for the operator. Small sessions, each with one invariant, each closed with a log line, beat one heroic sprint on every axis this project measures.
3. **Let the harness remember.** This tool keeps persistent memory and a task list across sessions; the re-derivation logs live in the repo. Outsource continuity to structure, spend the wetware on the pattern-matching only it can do.

## Sovereign zero, for a person

The neutral center is not having no preferences. It is holding the check as hard on what flatters you as on what challenges you, and returning to that center after every excursion instead of locking wherever the last enthusiasm ended. Equilibrium is not truth — you can be perfectly settled around a falsehood — and confidence is not orientation. The center is unowned and returned-to. That is the whole discipline; everything above is just its schedule.

## Re-derivation log

| Date | Change | Reason / cold-read note |
|------|--------|-------------------------|
| 2026-07-02 | v0.1 established: three functions mapped to operator practice; metabolic veto given mechanical triggers; zero-budget AI loop stated. | Drafted by the project's AI collaborator from the author's own published mechanics (Ledger §3–§4, Canon operating principles); awaiting the author's cold read and first week of contact with reality. |
| (next) | (after one week of use: which rule was never followed? That rule is wrong — fix the rule, not the operator.) | |
