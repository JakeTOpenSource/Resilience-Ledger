# White Paper v0.1 — sort notes (return from DeepSeek, cold-read against the artifacts)

*2026-07-02. The draft's claims were checked against the Ledger PDF, the Canon, the shipped code, and the calibration log. Fold/decline per item; the author sorts. Register entry: `revise-white-paper-v0-1-deepseek-draft-fix-six-o`.*

## Fold — right and keep

- Overall structure (abstract / related work / architecture / novelty / operations / limitations / future). Venue-shaped and honest in outline.
- §5 Operational characteristics: all four claims (determinism, portability, privacy, transparency) are accurate as shipped.
- §6 Limitations: genuinely honest — heuristics-not-semantics, evadability, in-house corpus, not-professional-advice. Keep every word.
- §2's positioning of the work in the static-analysis / linting lineage: correct and modest.
- The three chosen novelty claims (§4.1–4.3) are the right three. The *details* under two of them need repair (below).
- §7 futures: the runtime Resilience Guard, scaffold generation, and the community corpus exchange all cohere with the roadmap (the corpus exchange matches the register's community direction; the Guard is the MCP-server proposal wearing a different coat).
- "Planted at the input layer... while incoherence is still cheap to fix" — keep this sentence; it is the elevator pitch.

## Decline / correct — claim by claim

1. **§3.1 all three functions are off-reference.** Paper: Absorb = "accept information and update internal representation." Ledger: Absorb = *take survivable error and deform without ending anything* — a buffer for cost, not an intake. Paper's Check drops the two load-bearing properties: the reference is *external and held still*, and scrutiny is *direction-symmetric* (as hard on confirmation as contradiction). Paper's Reset drops the append-only record that makes a valid intervention distinguishable from damage. The paper turned a specific structure into a generic perceive-evaluate-reset loop — genericization is how frameworks lose exactly what made them non-obvious.
2. **§3.1 all three drifts are off-reference.** Content drift is *a claim leaving the reference*, not constraint-softening across versions. Thermal drift is *the evaluator degrading under sustained load* — the judge, above all the human — not output "temperature" rising; the human-recovery keystone (Candidates C and G) hangs on the correct definition. Ordering drift is *the priority between functions inverting — Purpose rising above Check while every claim still passes*; citation-after-action is one symptom the rationalize rule sees, not the definition, and the Tracer's actual mechanics (anchor extraction, justification-landing-on-reference, agent resolution) go unmentioned.
3. **§3.1 "a neutral centre that cannot be corrupted by any input."** The Ledger explicitly refuses this: the center is *unowned and returned-to, not objective*; the human is tainted by non-resetting load by definition; "unfakeable is the bar that gets you killed." The v0.2.1 log entry records a prior model making this exact misread — the "untainted observer" collision — and the v0.3 entry predicted it would recur ("two passes misreading it the same way predicts a third"). This draft is the predicted third pass. The log called it.
4. **§4.3 "the guarantee that overlays can only be additive."** Falsified by adversarial review on 2026-07-02, before this draft arrived: entries in `externalAuthorities` and `anchorMarkers` reclassify findings (drift → amended/held) — additive input, subtractive effect. State the corrected form: additive-and-regex-escaped with two named reclassification surfaces, warned and corpus-gated. Publishing the falsified form would be manufactured coherence with a citation.
5. **§3.4 "proves that the sovereign zero has not drifted without record"** — the register's own honest-limits section says convention-not-cryptography. Correct claim: makes unrecorded drift *costly and visible*, not impossible.
6. **§3.4 "labeled corpus... human-verified drift labels"** — overstated; the corpus is 11 author-written cases of single provenance (a flagged calibration gap). §6 already says this honestly; make §3.4 match §6.
7. **§4.1 "without clear precedent"** — hedge and invite refutation ("we are not aware of prior art operationalizing...; we invite counterexamples"). Deception-trace analysis exists in the alignment literature; the defensible novelty is the *conjunction*: deterministic, client-side, corpus-calibrated, versioned-lexicon, with amendment-vs-drift agent resolution. Claim the conjunction.
8. **§8 "released into the public domain"** — legally wrong. CC BY 4.0 is a license, not public domain (that is CC0). Say "released under a permissive attribution license (CC BY 4.0)."
9. **Small accuracy passes:** Framework Audit — the method doc names eight dimensions but the shipped tool scores seven differently-composed ones (Skills register entry #16 logs this doc/tool drift; either reconcile first or state it); CLI exists for the Tracer, not all tools; "every change triggers a calibration log entry" → vocabulary changes log to the dataset's curation notes, detector changes to the calibration log; a Related Work section needs a references list (citation-shaped prose without a bibliography is what the Ledger declined from Grok).

## Add — the paper's best evidence is missing

- **The numbers.** Linear ~56 ms/MB on punctuated logs; the super-quadratic 110 s pathological case fixed to 41 ms with bounded windows; P/R 1.00 on a corpus that includes held-out novel-domain cases and false-positive bait; reproducible via `tracer-bench.js`. A deterministic-governance paper with no measurements undersells its own method.
- **The adversarial-verification story.** Three independent reviewers, eight reproduced defects fixed, one theory claim falsified and corrected in public — this is the self-auditing claim *demonstrated*, and it is the paper's strongest credibility asset precisely because it is a confessed break with a visible seam.
- **Manifest pinning and the Counterparty class.** Arguably the most externally novel contribution (a deterministic answer to silent MCP contract drift) and it is absent from the draft entirely.
- **An AI-assistance disclosure.** A governance paper about drift, drafted with a model, should say so — and note that the draft itself entered the project as a return and was sorted through the register. In this project that is not a confession; it is the method demonstrated in the paper's own production.

## The meta-finding worth logging

The draft's definitional errors are *content drift in the paper's own account of drift*: the definitions left the reference while still sounding right, because the drafting model was never handed the reference. This is the exact failure the Canon exists to prevent ("load this file first; use these exact terms"). Corrective for v0.2: regenerate or revise with the Ledger PDF, the Canon, and State-Delta-Bridge.md in the drafting context, then cold-read against source. The tools' first real publication cycle has already produced their own best case study.
