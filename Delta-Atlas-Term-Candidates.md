# Delta Atlas — Term Candidate Register v1

*33 candidate terms proposed for `terms.enriched.json` · 2026-07-02 · all status **Candidate (Amber)** pending the author's cold read. Nothing here is merged automatically: folding a term is controlled drift — done on purpose, with the reason recorded in the Curation Log.*

**How to use this document.** Browse the six job clusters to see what each group of terms does for drift control; scan the crosswalk table at the end to look one up. Every term is defined by its **function** (what it does), carries a **field-standard family** (the names other disciplines already use for the same function — this is what makes the vocabulary cross-domain), and lists **related existing entries** so it lands in the relations graph rather than floating.

**Why these terms and not others.** Two evidence-based sources, no free additions:
1. **Coherence debt** — words the site's own pages and tools already use that the glossary does not define. A vocabulary that cannot define its own tools' output fails its own framing-independence test. (Verified by scan: e.g. "ordering drift" appears on 4 pages including the index, with no entry; the Ledger's three drifts have zero entries; the drift family is 3 terms in a 433-term glossary whose thesis is drift control.)
2. **Bridge terms** — the field-standard name a practitioner from another domain would search for first. Several are already cited in Resilience Ledger §2 as field families (error budget, rollback, checkpoint) yet have no glossary entry. A crosswalk with missing far-side names is a bridge with missing planks.

**Clusters note (method):** these six clusters are job-phrased *sub-purposes for drift control*; each maps onto one of the glossary's existing six clusters (merge target shown per term), so folding is mechanical and no parallel taxonomy is created.

**Priority.** The ★ 12 highest-leverage terms are marked; fold those first if folding incrementally.

---

## Cluster A — Name the drift precisely
*Job: give each distinct way of drifting its own name, so "drift" stops being one mushy word.* → merge target: **Failure Modes & Risks**

- ★ **Ordering Drift** — Names the failure where the goal quietly outranks the check: every individual claim still passes while the priority between them inverts. *Family:* deceptive alignment, goal misgeneralization. *Related:* deceptive-alignment, goal-misalignment, reward-hacking. *Evidence:* used on Tracer, GapCheck, index, Canon — undefined.
- ★ **Content Drift** — Names a claim leaving the reference while the checker still works; the easy drift, caught by comparing against a floor held still. *Family:* hallucination, factual inconsistency. *Related:* floor, ground-truth, hallucination.
- ★ **Thermal Drift** — Names the evaluator itself degrading under sustained load, so signal-from-noise discrimination erodes while every individual check still runs. *Family:* alert fatigue, vigilance decrement (human factors). *Related:* human-in-the-loop, rate-limiting.
- ★ **Controlled Drift** — Marks a definition or rule changed on purpose with the reason recorded, keeping tuning distinguishable from decay. *Family:* change management, semantic versioning. *Related:* delta, truth-ledger.
- ★ **Uncontrolled Drift** — Marks meaning sliding without anyone choosing it, until answers start contradicting each other. *Family:* configuration drift, scope creep. *Related:* semantic-drift, unbounded-accumulation.
- **Normalization of Deviance** — Converts repeated small breaches into the new normal until the exception is the rule and nobody decided that. *Family:* safety engineering (Vaughan, *The Challenger Launch Decision*). *Related:* uncontrolled-drift, excessive-agency. ★
- **Configuration Drift** — Names live system state departing silently from its declared baseline; operations' own word for uncontrolled drift, so DevOps readers land on home ground. *Family:* infrastructure-as-code, GitOps reconciliation. *Related:* uncontrolled-drift, state.
- **Goodhart's Law** — Warns that a measure made into a target stops measuring, as optimization satisfies the metric instead of the goal. *Family:* economics (Goodhart, Strathern). *Related:* reward-hacking, evaluation-benchmark.

## Cluster B — Hold the reference still
*Job: state what must not move, in a form a checker can enforce.* → merge target: **Control & Safety**

- ★ **Invariant** — States a property that must hold in every state of the system, so a checker can refuse any change that would break it. *Family:* formal methods (assertion, safety property, design-by-contract pre/postconditions). *Related:* deterministic-constraint, structural-floor, guardrail. *Evidence:* the Tracer literally keys on "assert baseline invariant" — undefined.
- ★ **Reference Anchor** — Pins the concrete terms of a declared constraint so later steps are checked against the rule the plan itself laid down, not against generic vocabulary. *Family:* contract terms, precondition. *Related:* invariant, floor. *Evidence:* Tracer 0.2.0's load-bearing mechanism.
- **Escape Hatch** — Flags a boundary that carries its own dissolving condition ("unless the mission requires"), indexing the limit to the very thing it limits. *Family:* exception clause, carve-out, waiver (legal). *Related:* ordering-drift, guardrail.
- **Setpoint** — Fixes the reference value a control loop keeps returning to, giving "baseline" and "center" a control-engineering home. *Family:* control theory (thermostat). *Related:* floor, return.

## Cluster C — Change the rules without cheating
*Job: give legitimate amendment one sanctioned path, so rule change and rule breach stop looking alike.* → merge target: **Oversight & Governance**

- ★ **Amendment** — Changes a rule through an authority above the plan, leaving the rule fixed relative to the plan but mutable above it. *Family:* change control, constitutional amendment. *Related:* external-authority, governance. *Evidence:* now a Tracer output category — undefined.
- ★ **External Authority** — Identifies who may legitimately amend a reference: an empowered agent outside the loop the rule governs. *Family:* regulator, review board, IRB. *Related:* amendment, human-in-the-command, oversight.
- **Change Control** — Routes every rule change through propose → independent review → record, so amendment has one auditable path. *Family:* ITIL change management, change advisory board. *Related:* amendment, audit-trail.
- **Segregation of Duties** — Splits proposing from approving so no actor validates their own change. *Family:* SOX/compliance (SoD). *Related:* external-authority, dual-pass-local-validation, firewall-of-cognition.
- **Four-Eyes Principle** — Requires a second, independent person to approve before a consequential change commits. *Family:* maker-checker (banking). *Related:* human-in-the-loop, mandate-gate.

## Cluster D — Catch the quiet breach
*Job: detect the move that never says "override."* → merge target: **Control & Safety**

- ★ **Syntactic Tripwire** — Detects the language shape of a breach deterministically and cheaply, while stating plainly it will miss phrasings it was never taught. *Family:* IDS signature, tripwire (security). *Related:* priority-tracer, refusal-logic. *Evidence:* the Tracer's self-description — undefined.
- ★ **Lexical Evasion** — Defeats a word-list check by renaming the move — same inversion, new synonym — which is why structural checks, not dictionaries, must carry the load. *Family:* euphemism treadmill, obfuscation. *Related:* syntactic-tripwire, jailbreak. *Evidence:* the exact failure the 0.2.0 calibration fixed.
- **Priority Tracer** — Audits a reasoning trace for the moment purpose is used to override, skip, or reinterpret a rule that should have held — and credits where it held. *Family:* trace audit, chain-of-thought review. *Related:* ordering-drift, coherence-ledger, resilience-ledger.
- **Circular Baseline** — Flags validation against an internal echo: the system checking itself with itself, mistaking balance for truth. *Family:* self-attestation; model collapse (training on own output). *Related:* ground-truth, sybil-resistance, provenance.
- **Canary** — Exposes a change to a small sacrificial slice first, so failure announces itself before it spreads. *Family:* canary deployment; the coal-mine original. *Related:* scoping, sandboxing, syntactic-tripwire.
- ★ **Tamper-Evident** — Guarantees alteration leaves a visible mark even where it cannot be prevented; the achievable bar — costly and impossible to fake silently. *Family:* seals, signed logs. *Related:* truth-ledger, monotonicity-gate, attestation. *Evidence:* the Ledger's own stated bar (v0.4 closing note) — unnamed in the glossary.

## Cluster E — Absorb, recover, return
*Job: survive the hit and get back to a known origin, instead of locking in whatever state the failure left.* → merge target: **Control & Safety**

- **Error Budget** — Pre-agrees how much failure is survivable, so shocks are absorbed by design instead of by breached limits. *Family:* SRE, SLOs (Google SRE Book). *Related:* buffer, grace, graceful-degradation. *Evidence:* named in Ledger §2 as an Absorb family — no entry.
- **Rollback** — Returns the system to the last known-good state, making recovery an action rather than a hope. *Family:* checkpoint/restore, undo. *Related:* return, kill-switch-circuit-breaker. *Evidence:* named in Ledger §2 as a Return family — no entry.
- **Ratchet** — Names the failure where every intervention locks in: the system can move but never return, so drift compounds one-way. Contrast the monotonicity gate, where append-only history is the *defense*; a ratchet is append-only *state*. *Family:* irreversibility, one-way door. *Related:* return, rollback, monotonicity-gate.
- **Fail-Closed** — Blocks by default when the check itself fails, trading availability for safety; fail-open trades the other way, and the choice should be explicit. *Family:* fail-safe / fail-secure. *Related:* refusal-logic, deterministic-constraint.
- **Hysteresis** — Builds a deliberate tolerance band so the loop corrects real departures without chattering at every wobble — the engineering handle for a nonzero optimal drift setting. *Family:* deadband, Schmitt trigger (control engineering). *Related:* friction-principle, impedance. *Evidence:* gives Ledger Candidates D/E a field anchor.
- **Alert Fatigue** — Erodes response capacity through detector volume itself, so more alarms produce less safety; thermal drift's clinical name. *Family:* SOC operations, medical alarm management. *Related:* thermal-drift, rate-limiting.

## Cluster F — Keep the method honest
*Job: make the project's own process auditable by the same standard it applies to others.* → merge target: **Oversight & Governance**

- ★ **Cold Read** — Reviews an artifact without the momentum that produced it, asking "does it hold?" from outside the session that built it. *Family:* fresh-eyes review, independent verification. *Related:* red-teaming, auditing. *Evidence:* the Canon's own status note says "JT cold-read" — undefined.
- **Re-derivation Log** — Records every sanctioned change with date and reason, making a reset distinguishable from a ratchet. *Family:* architecture decision record, changelog. *Related:* truth-ledger, audit-trail, controlled-drift.
- **Crosswalk** — Translates local names into shared functions so two systems can discover they agree before arguing about words. *Family:* ontology mapping, terminology alignment. *Related:* sovereign-zero, coherence.
- **Witness** — Reads the same structure from one domain's vantage, mapping spoke-to-hub so domains stay comparable without wiring to each other. *Family:* domain reading, analogical model (illustration, never load-bearing). *Related:* metaphor-as-transmission-layer, crosswalk.

---

## Crosswalk table

| Term | Function (what it does) | Job cluster | Merge target | Field family | ★ |
|---|---|---|---|---|---|
| Ordering Drift | Goal quietly outranks the check while every claim passes | Name the drift | Failure Modes | deceptive alignment | ★ |
| Content Drift | A claim leaves the reference; caught by a held-still floor | Name the drift | Failure Modes | hallucination | ★ |
| Thermal Drift | The evaluator degrades under load while checks still run | Name the drift | Failure Modes | alert fatigue | ★ |
| Controlled Drift | Deliberate change with reason recorded; tuning, not decay | Name the drift | Failure Modes | change management | ★ |
| Uncontrolled Drift | Meaning slides without anyone choosing it | Name the drift | Failure Modes | config drift, scope creep | ★ |
| Normalization of Deviance | Repeated small breaches become the new normal | Name the drift | Failure Modes | safety engineering | ★ |
| Configuration Drift | Live state silently departs its declared baseline | Name the drift | Failure Modes | IaC / GitOps | |
| Goodhart's Law | A measure made a target stops measuring | Name the drift | Failure Modes | economics | |
| Invariant | States what must hold in every state, enforceably | Hold the reference | Control & Safety | formal methods | ★ |
| Reference Anchor | Pins a declared constraint's terms for later checking | Hold the reference | Control & Safety | precondition | ★ |
| Escape Hatch | A boundary carrying its own dissolving condition | Hold the reference | Control & Safety | carve-out (legal) | |
| Setpoint | The value a control loop keeps returning to | Hold the reference | Control & Safety | control theory | |
| Amendment | Rule changed by authority above the plan | Change without cheating | Oversight | change control | ★ |
| External Authority | Who may legitimately amend the reference | Change without cheating | Oversight | regulator, IRB | ★ |
| Change Control | One auditable path: propose → review → record | Change without cheating | Oversight | ITIL | |
| Segregation of Duties | No actor validates their own change | Change without cheating | Oversight | SOX compliance | |
| Four-Eyes Principle | Independent second approval before commit | Change without cheating | Oversight | maker-checker | |
| Syntactic Tripwire | Flags the language shape of a breach, cheaply and honestly | Catch the quiet breach | Control & Safety | IDS signature | ★ |
| Lexical Evasion | Defeats word-lists by renaming the same move | Catch the quiet breach | Failure Modes | euphemism treadmill | ★ |
| Priority Tracer | Audits traces for purpose overriding the reference | Catch the quiet breach | Control & Safety | trace audit | |
| Circular Baseline | Validation against an internal echo | Catch the quiet breach | Failure Modes | self-attestation | |
| Canary | Small sacrificial exposure that fails first, visibly | Catch the quiet breach | Control & Safety | canary deployment | |
| Tamper-Evident | Alteration cannot be prevented but cannot be silent | Catch the quiet breach | Control & Safety | seals, signed logs | ★ |
| Error Budget | Pre-agreed survivable failure; absorbs by design | Absorb & return | Control & Safety | SRE | |
| Rollback | Return to last known-good state, as an action | Absorb & return | Control & Safety | checkpoint/restore | |
| Ratchet | Interventions lock in; system can move but never return | Absorb & return | Failure Modes | one-way door | |
| Fail-Closed | Gate blocks by default when the check itself fails | Absorb & return | Control & Safety | fail-safe | |
| Hysteresis | Tolerance band: correct real departures, ignore wobble | Absorb & return | Control & Safety | deadband | |
| Alert Fatigue | Detector volume erodes the responder | Absorb & return | Failure Modes | SOC / medical | |
| Cold Read | Review without the momentum that produced the work | Keep the method honest | Oversight | fresh-eyes review | ★ |
| Re-derivation Log | Every sanctioned change dated, with reason | Keep the method honest | Oversight | ADR, changelog | |
| Crosswalk | Local names translated into shared functions | Keep the method honest | Oversight | ontology mapping | |
| Witness | One domain's reading of the shared structure | Keep the method honest | Oversight | analogical model | |

## Self-check

- **Function statements:** all 33 rewritten around verbs; two early drafts ("Invariant is a property…", "Canary is a deployment strategy…") had slipped into dictionary mode and were rewritten. If a term here still reads as an "is," flag it before folding.
- **Coverage:** 33 entries in clusters = 33 rows in the table; every term has a merge target in the existing six clusters and at least one related existing entry, so nothing lands orphaned in the relations graph.
- **Discipline note:** this register was capped deliberately. The Ledger's v0.5 note — a return that says "add many things" when the log says "measure one thing" is itself the pull to watch — applies to term registers too. Everything here traces to used-but-undefined evidence or a §2-cited field family; speculative vocabulary was left out.
