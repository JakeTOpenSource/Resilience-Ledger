# Coined Terms, Grounded — corroboration and adversarial stress test, before shipping

**Status: two terms done properly; ~24 more of the project's own coined vocabulary still queued.** This document records the method for sourcing terms this project invented itself — Resilience Ledger, Substrate Gate, and the rest of the State-Delta and Ledger operational vocabulary — where a single external citation would be dishonest, because no outside body coined them. The rule instead: ground the synthesis in the real traditions it draws from, cite those honestly, and put the reasoning through an adversarial pass that is allowed to fail it. Same discipline as `rung3-power-experiment/`: a claim is worth what it survives, not what it asserts.

The first drafts of both terms below **failed** their stress test as originally written. The corrected, narrower versions are what's actually cited in `terms.enriched.json`. The failure is recorded here rather than quietly fixed, because that is the whole point of running the test.

---

## Resilience Ledger

**First draft (failed):** the absorb / check / reset triad is a synthesis of three independent traditions — Holling's 1973 ecological resilience, Hollnagel & Woods' four cornerstones of resilience engineering, and NIST's cyber-resiliency framework — each lending one piece of the structure.

**What the adversarial pass found wrong, specifically:**

1. **The Holling citation cuts against the claim, not for it.** Holling's 1973 paper defines ecological resilience *in opposition to* "stability" (fast return to one equilibrium) — his point was that high-resilience systems often do *not* bounce back to the same state, and treated equilibrium-return as the less interesting, sometimes misleading, concept (he later named it "engineering resilience" and distinguished it from what he actually meant). The Ledger's own "resets to baseline rather than locking in a drifted state" is structurally closer to the *engineering* sense Holling was arguing against than the ecological sense he was arguing for. Citing him for legitimacy while doing the opposite of his central argument is not a soft gap — it is citing the wrong side of a real debate.
2. **The 1973 paper doesn't license the jump from population ecology to an information/audit system.** That extension is this project's own move, made silently rather than owned as an extension.
3. **The "anticipate / withstand / recover / adapt" framing is MITRE's, not NIST's** — Bodeau & Graubart, *Cyber Resiliency Engineering Framework*, MITRE, 2011 (goals stated as Anticipate / Withstand / Recover / **Evolve**). NIST SP 800-160 Vol. 2 absorbed and paraphrased it a decade later. Citing "NIST" for MITRE's idea is exactly the kind of unattributed-provenance error a project built on checking ground truth should not make.
4. **The missing-cornerstone problem is worse than first admitted.** Not one gap but three: the Ledger's three functions (absorb / check / reset) have no clean equivalent to Hollnagel's "learn," and no equivalent to MITRE's "anticipate" (forward-looking preparedness) *or* "evolve" (changing the system's own future baseline) — only "reset to a **fixed** reference" is covered. The "this audits realized, not predicted, resilience" defense legitimately excuses the missing forward-looking pieces (anticipate, learn) but does **not** excuse "evolve" — a system that only ever resets to a fixed baseline, and never lets that baseline itself adapt, is arguably failing at resilience by MITRE's own definition, not just declining to forecast the future.
5. **The "neutral center" mechanism — the one genuinely load-bearing, distinctive piece of the whole design — isn't grounded in any of the three sources cited.** Its nearest real lineage is classical control theory / cybernetic feedback (compare actual state against a reference), not ecology, not resilience engineering, not cyber-resiliency.

**What survives, and is what's actually cited:** Resilience Ledger borrows the word "resilience" and partial structure from three adjacent, real traditions, named honestly — Holling (1973) for the lineage of the word itself, with an explicit flag that the Ledger's fixed-baseline design sits closer to the "engineering resilience" sense Holling treated as secondary; MITRE's 2011 framework (not NIST) for the anticipate/withstand/recover/evolve structure, with NIST SP 800-160 Vol. 2 cited as the downstream government codification; and an explicit, owned admission that the "neutral center" scoring mechanism is this project's own uncited contribution, closer to control-theory feedback than to any resilience-engineering source. It is not a strict implementation of any of the three traditions it cites — a smaller, more honest claim than the first draft, and the one that ships.

## Substrate Gate

**First draft (failed):** Substrate Gate operationalizes the correspondence-vs-coherentism distinction in analytic epistemology, doubly grounded by current LLM "groundedness" / hallucination-detection research that draws the same line.

**What the adversarial pass found wrong, specifically:**

1. **A real category error, not a stretch.** The Stanford Encyclopedia of Philosophy carries two separate coherentism entries — "Coherentist Theories of Epistemic Justification" (the mainstream, live position most working philosophers who call themselves coherentists actually hold) and "The Coherence Theory of Truth" (a narrower, largely-superseded position). Most coherentists in the common sense hold the *justification* view while accepting a correspondence (or deflationary) theory of *truth* — so invoking generic "coherentism" as truth theory's rival is mislabeling a theory of epistemic warrant as a theory of truth.
2. **Correspondence theory is a metaphysical thesis, not a procedure**, and both sides of that 2,500-year debate already agree that checking a claim against evidence is good practice — the debate is about what "true" metaphysically consists of once you've done that. Invoking it to justify "check against ground truth" invokes a dispute that isn't actually about whether to check against ground truth.
3. **A narrower, legitimate parallel does exist** — the specific "Coherence Theory of Truth" entry's own "isolation objection" (internal coherence alone has no guaranteed link to external reality) is structurally identical to what Substrate Gate catches — but that is a precise, narrow, largely-historical position, not the mainstream sense the first draft's generic gloss implied.
4. **The LLM-groundedness parallel is real on the technical side, but the philosophical bridge was narrated after the fact.** RAG-faithfulness and groundedness-scoring research (atomic-claim decomposition checked against retrieved evidence via entailment) is accurately described, but that field does not itself invoke correspondence theory or coherentism — the philosophical framing is an outside observer's analogy, not the field's self-understanding. Calling it a "double-grounding" implied two independent traditions converged; what's actually true is one field doing an atheoretical technical thing, narrated in borrowed philosophical vocabulary it doesn't use.

**What survives, and is what's actually cited:** Substrate Gate's parallel is specifically to the narrow, historical "Coherence Theory of Truth" entry and its isolation objection — not to coherentism generically — presented as an old philosophical worry that happens to rhyme with a live AI-safety practice, not as a foundation the gate's legitimacy depends on. The gate's actual legitimacy rests on whether it catches drifted claims in practice, not on either citation.

---

## What's still queued

The same treatment is owed to the rest of this project's own coined vocabulary before any of it should read as more than self-referential: `sovereign-zero`, `coherence-ledger`, and the Ledger's operational words (`tether`, `floor`, `grace`, `forgiveness`, `return`, `coherence`), plus the full State-Delta family (`friction-principle`, `system-state`, `state-delta`, `representation-locality`, `context-reset`, `dynamic-agent-layer`, `dual-pass-validation`, `semantics-gate`, `substrate-gate` *(done, above)*, `monotonicity-gate`, `semantic-drift`, `unbounded-accumulation`, `elimination-earned-confidence`, `metaphor-as-transmission`, `impedance`) — roughly 22 terms. Each deserves the same two-pass treatment: real multi-source grounding, then an adversarial pass instructed to refute it, not confirm it.

## Drafted, pending insertion — Calibrated Agent

A name for the local ledger agent architecture: a **deterministic, pre-trained, pre-harnessed agent that runs the project's own method end to end** — the model proposes, a fixed non-model layer decides. Drafted here first; it goes into `terms.enriched.json` once the glossary-verification lane is free (avoiding a collision with that work).

**Proposed function-first definition:** *An agent whose limits are fixed against a versioned reference and checked by a deterministic floor before it runs — pre-trained, pre-harnessed, verified against a known standard — so it acts within set bounds instead of being corrected mid-run. The end-to-end form of the deterministic-floor method: the model proposes, a fixed non-model layer decides.*

**Grounding (a coined synthesis, so real traditions, not a single cite):**
- **The project's own theory** (`RESILIENCE-LEDGER`): the deterministic floor, the versioned lexicon checked before a model output commits, the Nozzle's call-time gate. This is that pattern, named as an agent.
- **Lean-Agent Protocol** (`LEAN-AGENT`, arXiv 2604.01483 — *Type-Checked Compliance: Deterministic Guardrails for Agentic Systems*): a real, current academic parallel to "pre-harnessed, deterministically checked before it acts." The nearest shipping cousin.
- **Metrology** (International Vocabulary of Metrology, JCGM 200:2012): "calibration" = an operation establishing the relation between a **traceable reference standard** and an instrument's indication. This is the sense the term uses — an agent *calibrated* like an instrument, fixed and verified against a reference before use. It fits the project's whole plumb-line / neutral-reference motif.

**The trap, stated before it bites (a terminology collision worth Jake's decision):** in machine learning, "calibration" almost always means **confidence calibration** — a model's predicted probabilities matching observed frequencies (a well-forecast 70% happens 70% of the time). That is **not** what "Calibrated Agent" means here, and an ML reader will assume it does. The term uses the *metrology* sense (fixed against a reference standard), which is arguably the more fundamental one and coheres with the rest of the project — but the definition must carry that distinction explicitly, or the name will be misread. If the collision bothers you, the runners-up from the same shortlist stand ready: **Sealed Agent** (legal-metrology sealing of a verified instrument) or **Harnessed Agent** (ties directly to the shipped `harness` term).

**Proposed entry (ready to fold):**
```json
{
  "id": "calibrated-agent",
  "function_statement": "An agent whose limits are fixed against a versioned reference and checked by a deterministic floor before it runs — pre-trained, pre-harnessed, verified against a known standard — so it acts within set bounds instead of being corrected mid-run. The end-to-end form of the deterministic-floor method: the model proposes, a fixed non-model layer decides.",
  "names": { "plain": ["Calibrated Agent"], "technical": [{ "name": "Calibrated Agent", "source": "RESILIENCE-LEDGER" }] },
  "cluster": "Control & Safety",
  "purpose": "capability",
  "attributes": { "actor": "hybrid", "accountability": "human", "cost_substrate": "non-resetting", "reversibility": "reversible", "observability": "detectable" },
  "attributes_method": "derived",
  "sources": ["RESILIENCE-LEDGER", "LEAN-AGENT", "VIM-CALIBRATION"],
  "status": "candidate",
  "tier": "core"
}
```
New source to register alongside it: `VIM-CALIBRATION` — *International Vocabulary of Metrology (VIM), JCGM 200:2012*, BIPM / Joint Committee for Guides in Metrology, 2012, family `BIPM`, origin `standards`, https://www.bipm.org/documents/20126/2071204/JCGM_200_2012.pdf . (`RESILIENCE-LEDGER` and `LEAN-AGENT` already exist in the sources block.) Before it graduates from candidate, give it the same adversarial refute-pass the two terms above got.

Independent educational research, provided as-is. Licensed CC BY 4.0. © 2026 Jake Tiller.
