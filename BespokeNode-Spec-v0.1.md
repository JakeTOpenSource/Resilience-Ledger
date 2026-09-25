# BespokeNode v0.1: Public Specification (candidate)

Status: v0.1 candidate, drafted 2026-09-24 by Ed (Muse), the author's AI research partner, from the author's workspace materials. Reviewed against the author's 2026-09-24 briefing before this site build used it. Two sentences were softened in that review and are marked in the editorial note at the end.
Sources: State_Delta_Architecture_3.0, Open Memo on State-Delta Architecture, BespokeNode Three-Author Combined Report (2026-09-10).
Owner decision 2026-09-24: the public names (BespokeNode, Pin-Check, OpenMirror) stay as-is. Consistency reflects the architecture.

## 1. What BespokeNode is

BespokeNode is a governance framework for agentic AI. It defines a controlled path from permission to accepted work: nothing an agent does counts until it has been defined, permitted, gated, verified, and accepted, in that order, by the right party at each step.

It is not a model. It works with existing language models, vision models, planning systems, or other agentic components. It is not a product. There is nothing to buy. It is a structural floor: the part of the system that enforces safety rules locally and deterministically, whether or not the AI cooperates.

The governing thesis, in the author's words: "Simplification is systems maintenance; the substrate is human cost." Complexity is technical debt, and the debt is always paid in human cost somewhere down the line. Simplification is not dumbing down. It is maintenance work on the system.

## 2. The problem it answers

Agentic systems degrade in predictable ways as they scale. They drift. They hallucinate. They contradict themselves. They consume increasing compute to produce decreasing reliability. The mainstream response is more: more context, more data, more retrieval, more fine-tuning. The claim this framework makes is that more information does not resolve drift. It compounds it, because every accumulated data point that cannot be verified against current reality becomes another contradiction the system must navigate without resolution.

Three patterns dominate current infrastructure, and each treats a symptom while accelerating the disease: unstructured accumulation of conflicting signals; fine-tuning that forces corrections to coexist with legacy data until boundaries blur; and soft governance that routes every safety property through the same probabilistic layer generating the unsafe behavior. That last one is not infrastructure. It is hope.

## 3. The controlled path

Every piece of agent work moves through the same lifecycle:

define the work, check readiness, the owner permits an exact scope, the agent runs inside watch limits, the output is verified, the owner approves the exact output (never just the plan), and the next accepted state mints the contract for the next phase.

No step is skippable. A generated proposal is inert until the owner permits its exact scope. A finished output is not accepted until the owner approves its exact bytes. The next phase cannot begin until the current one is accepted and its contract is minted.

## 4. The two zones

The runtime is split into two zones with different privileges.

The Dynamic Agent Layer is where fluid reasoning, language flexibility, and creative problem solving live. It runs inside a read-only, temporary sandbox that resets after each task. It has no direct authority over physical systems, financial systems, or user records.

The Deterministic Structural Floor (the Harness) is the static, non-AI software environment on local hardware. It holds the unyielding rules of the domain: mathematical invariants, physical limits, clinical thresholds, legal boundaries. It does not need network connectivity to do its job. The validation gates run here as compiled logic outside the model's token stream, so the model cannot reason its way past them through prompting.

Telemetry, software updates, and non-critical context move through the Tether, the network-dependent pipeline. Single points of failure are confined to the Tether. They are never permitted in the Harness.

## 5. The gates

Before any proposed change to system state is committed, it passes two filters, both on local hardware.

The Ontology Gate: schema validation. Does the proposed change conform to the formal rules of the domain? Are the entities valid? Are the relationships allowed?

The Semantics Gate: operational coherence. Even if the change is schema-valid, does it make sense given current physical conditions, safety thresholds, and context? A move can be valid on paper and catastrophic in practice. This gate catches that.

If either gate fails, Refusal Logic fires. This is a hard stop, not an AI decision: a deterministic, programmatic block. The proposed change is rejected, the model loses the ability to push it through, and the failure point is logged.

## 6. The five protocols

Representation Locality. Communication between components is restricted to state-deltas: small structured records saying what changed, where, and when. Raw narrative, unstructured context, and full conversation histories do not move between nodes. Long histories accumulate contradictions. Short structured deltas accumulate far fewer, and each one is small enough to gate.

The Firewall of Cognition. The reasoning engine never directly touches infrastructure. Tool calls and state changes execute in ephemeral sandboxes that self-destruct after returning a structured payload. The infrastructure never trusts the reasoning engine.

Dual-Pass Local Validation. Every proposed state-delta passes both gates before commitment. Hard programmatic boundaries cannot be argued with.

Harness and Tether Separation. Safety-critical functions live in the local Harness. Network failures, latency, and API changes cannot compromise safety enforcement.

Context Reset After Commit. Once a state-delta is written to the Truth Ledger, the agent's temporary context is flushed. The next operation starts from verified current state, not from accumulated reasoning history. Drift cannot accumulate when working memory resets against verified state after each operation.

## 7. Safety states: HOLD versus TRIP

Two safety states, each with its own recovery path. Neither is a dead end.

HOLD means pause with a recovery path. The evidence is unresolved: something needs a human look, a recheck, or more information before work continues. The system waits in its last safe state.

TRIP means a confirmed violation with its own recovery path. Something crossed a hard boundary. Work stops, the violation is recorded, and return requires going through recovery, not around it.

The design goal is productive mitigation: safety that keeps the system doing useful work instead of tripping it dead. The electrical twin is selective coordination, where only the breaker nearest the fault trips. The BespokeNode twin is HOLD: pause the faulted branch, keep the rest running, preserve a path back.

## 8. The four invariants

These hold under every path, including HOLD and TRIP. They are not adjustable.

Spent capacity stays spent. A recovery never refunds what was used, and a retry is new work, not a continuation.

No automatic restart. Nothing resumes itself. Every restart is a new permitted scope.

Approve exact output, never just the plan. Approval of an intention is not approval of a result. The owner accepts exact bytes in a verified state.

Replay without re-running external effects. Any decision must be reviewable from the record alone. Replaying the decision never replays its consequences in the world.

## 9. The ledger and the accepted state

The Truth Ledger is the append-only local record of validated state-deltas. Once written, entries cannot be edited or erased. The audit trail is the system, not a layer bolted on afterward.

An accepted state is a typed boundary plus its receipts: the exact output, the verification record, and the owner's explicit acceptance, bound together. Anything downstream that needs the result reads the receipts, not somebody's summary of them.

Thetabase is the standing rule for cached knowledge: recheck access on every request. Do not trust the cache.

## 10. The conformance contract

Each accepted state mints the contract for the next phase. The contract states the exact scope permitted, the gates that will check it, and what acceptance requires. An agent operating under BespokeNode never works from a standing permission. It works from the current phase's contract, and the contract expires when the phase is accepted.

## 11. Return to zero

A confused agent returns to ground truth: sensors, verified state, training. It does not improvise a way forward from its own accumulated context, because accumulated context is exactly what drifts. Theta is home base: the fixed point every transformation preserves. When in doubt, zero it out.

## 12. The V=IR crosswalk

The framework crosswalks to basic circuit theory, in both directions.

V is authority: permission, scope, instruction. I is the flow of effects: tool calls, state changes, writes. R is the gate: verification, friction.

An open circuit is safe but useless, so the goal is not maximum resistance. It is tuned resistance: enough friction to grip, not so much that nothing moves. Productive current does work. Shear drag is current flowing against a brake: I squared R loss dissipates watts as heat while V does not advance. Power equals VI in both cases, so the ammeter cannot distinguish productive current from shear-drag current. That witness belongs to the accepted-state ledger, not the meter. If you only watch the meter, waste looks like work.

## 13. What this is not, and what is not yet shown

This is not a new AI model, not a product, not a silver bullet, and not finished work. The mechanisms are established computer science: distributed systems, ephemeral sandboxes, validation gates, append-only ledgers. What is offered is the synthesis, applied to agentic AI infrastructure.

Honest limits, stated plainly. The framework is a specification at v0.1. Implementation, acceptance, and independent replication are separate and pending. The probe program has validated the machinery on synthetic cases only; per the standing GT-4 receipt, there is currently no evidence about true concurrent races, scheduler preemption, power loss, crash durability, or production behavior. Nothing here should be read as proof that the framework works at scale. It should be read as a precise claim about what working would look like, built to be pressure-tested.

## Editorial note (2026-09-24 review before site build)

Two sentences in the drafted spec were softened because, as written, they stated a claim as an established fact. Both edits are recorded here so the change is visible rather than silent.

1. Section 2. Drafted: "More information does not resolve drift. It compounds it, because..." Published: "The claim this framework makes is that more information does not resolve drift. It compounds it, because..."
2. Section 6, Representation Locality. Drafted: "Short structured deltas do not." Published: "Short structured deltas accumulate far fewer, and each one is small enough to gate." Short deltas can still contradict one another; the framework's advantage is that each contradiction is small enough to be caught at a gate.

No other wording was changed.
