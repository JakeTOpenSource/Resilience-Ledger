# Skills & Methods Register

Portable export. This file is self-contained: move it into a separate project folder and it carries everything you need to develop these into formal skills later. It captures the reusable methods ("the gold") that emerged while building the Agentic AI Governance glossary, separated from that project's subject matter so each method stands on its own.

Each entry is written so it could later be formalized as a Cowork skill (a SKILL.md). Status reflects how ready it is: **proven** (used end-to-end here, works), **drafted** (used partially), **concept** (articulated, not yet built as a repeatable tool).

Nothing here is subject-locked to AI governance. Every method generalizes to other domains.

---

## 1. Function-First Terminology Crosswalk
**Status:** proven

**What it does:** Builds a glossary where each term is defined by what it *does* (a one-line function statement), grouped by *purpose* rather than alphabety, and linked to other terms by shared function. Kills the "dictionary" failure mode where definitions describe what a thing *is* but never why it matters.

**Trigger:** "build a glossary / ontology / terminology map," "explain these terms to non-technical users," "make a crosswalk."

**Inputs:** a raw list of terms (any domain). **Outputs:** a function-clustered glossary + a crosswalk table mapping terms to a small set of purposes.

**Why it generalizes:** the function-first move works for legal, medical, financial, or any jargon-heavy field. The cluster set changes; the method does not.

---

## 2. Sovereign-Zero Translator
**Status:** drafted (design + data model complete; query layer pending)

**What it does:** Translates between two vocabularies (e.g. plain-English ↔ NIST/MIT/OWASP technical) by calibrating *both* against a neutral function-center, so neither vocabulary is treated as the source of truth. Prevents "contextual mismatch" where a translation silently imports one side's framing.

**Trigger:** "translate between technical and non-technical," "two teams use different words for the same thing," "align our terminology with a standard without losing our own."

**Inputs:** two term sets + a function-center definition. **Outputs:** alias links (`alias_of`) that bind different names to one shared function.

**Why it generalizes:** any field with competing dialects (clinical vs patient language, engineering vs sales, regulator vs operator).

---

## 3. Shepherd → Define → Type → Attribute Pipeline
**Status:** proven (the core engine of this whole project)

**What it does:** A staged pipeline that turns a raw term dump into a structured, auditable knowledge base:
1. **Shepherd** — ingest raw terms as `stub` records, de-duplicated, each tagged with abbreviated provenance family codes (NIST, OWASP, ARXIV, etc.).
2. **Define** — write function statements, assign cluster + purpose, graduate stub → candidate, family by family.
3. **Type** — upgrade associative links into a controlled relation vocabulary (`enables`, `requires`, `mitigates`, `instance_of`, etc.) with direction + evidence.
4. **Attribute** — fill domain-specific attributes via a rule engine, with hand-curated overrides.
5. **Gate** — a deterministic validation check runs on every write.

**Trigger:** "organize this messy term list into something structured," "build a knowledge base / data model from these notes."

**Inputs:** raw terms + optional provenance map. **Outputs:** a single validated JSON source of truth.

**Reusable code assets in this project:** `shepherd.py`, `define_pass*.py`, `type_related.py`, `attr_pass.py`.

---

## 4. Candidate-Register / Validation-Gate Discipline
**Status:** proven

**What it does:** A responsibility discipline for AI-assisted data work. Three rules: (a) every record is `candidate` until a human verifies it, never auto-certified; (b) a deterministic validation gate runs on every write and fails loudly; (c) every value is tagged with how it was produced (`preset` / `curated` / `derived`) so a human reviewer knows exactly what to trust. Abbreviated provenance via source-family codes keeps it efficient.

**Trigger:** any "organize my data responsibly," "I need this auditable," "don't let the AI just make things up" task.

**Why it generalizes:** this is the backbone of doing AI data work you can defend. Domain-independent.

---

## 5. Cold-Read Review
**Status:** proven

**What it does:** Instead of dumping a whole AI-generated dataset for review, it heuristically flags the records most likely to be wrong (e.g. where a rule-engine default contradicts the term's nature) and produces a short, prioritized human-review list grouped by failure pattern. Turns "review 400 rows" into "look at these 50, in 3 buckets."

**Trigger:** "check this AI-generated data," "QA this dataset," "what's likely wrong here."

**Inputs:** a dataset with method/provenance tags. **Outputs:** a ranked review list with the suspected error pattern named.

---

## 6. Red-Team-as-Feature
**Status:** proven

**What it does:** Adversarial review where the *weaknesses become the visible, focal feature* of the deliverable rather than being hidden. Produces a limitations / threat-model section and a re-derivation log, so the artifact's honesty is part of its value.

**Trigger:** "red team this," "what are the weaknesses," "make this honest / defensible."

**Reusable asset:** `Red-Team-Report.md` structure (technical / epistemic / governance findings, each with severity + status + reinforcement).

---

## 7. Truncation-Resistant Build Pipeline
**Status:** proven (technical method)

**What it does:** Builds large single-file HTML deliverables by assembling small part-files via shell instead of one big file write (which silently truncates past a size cap). Adds a multi-source CDN loader + offline 2D fallback so the artifact is genuinely shippable to another machine.

**Trigger:** building any large self-contained HTML/interactive artifact.

**Why it generalizes:** purely technical, applies to any big generated-file task.

---

## 8. 3D-to-2D Reflection Mapping
**Status:** drafted

**What it does:** Represents one structured model two ways from a single JSON source of truth: a 3D layered map (for spatial / multimodal pattern matching) and a flat 2D companion (for reading and search). Patterns you can see but can't name in one view often surface in the other.

**Trigger:** "visualize this model," "I want to see the structure," "multimodal pattern matching."

**Reusable assets:** the map build pipeline + the 2D reflections generator.

---

---

## 9. Divergence-Sort Protocol (Fold / Decline-with-Reason)
**Status:** proven (next: archive the raw returns verbatim beside each sorted entry, so fold/decline decisions can be re-audited against source text)

**What it does:** Triages every external return — AI or human review — item by item on receipt: fold it, decline it with a written reason, or defer it with a spec. Treats agreement as divergence to test, never as verification, and logs declines as visibly as folds so refusals leave the same audit trail as acceptances.

**Trigger:** a model or reviewer sent back feedback — what do we take and what do we refuse?

**Why it generalizes:** any workflow that consumes external review, in any domain. The sort categories do not care what the feedback is about.

**Evidence:** Resilience Ledger §7 — five rounds sorted; v0.2.1 records four returned points and folds none; v0.5 keeps Grok's priority tracer but declines its structural expansion with the reason written out ("a return that says add many things when the log says measure one thing is itself the pull to watch"). `Delta-Atlas-Tracer-Calibration.md` — three Gemini returns sorted: "graduate all candidates to 100% verified" declined as manufactured coherence, blanket graph wiring declined as correlated-origin edges, CLI packaging and fail-deterministic folded and shipped.

---

## 10. Corpus-as-Floor Calibration Loop
**Status:** proven (next: source at least one labeled case from a real trace with independent provenance — all 11 current labels share one origin)

**What it does:** Holds a labeled test corpus fixed as the immovable reference while tuning a detector: when a case fails, the rules and lexicon change, never the label. The corpus deliberately carries held-out novel-domain cases and false-positive bait, so a fix has to generalize instead of memorizing the failing example.

**Trigger:** the detector / classifier missed something — fix it without breaking what already works.

**Inputs:** a labeled corpus + the detector under tune. **Outputs:** a new versioned lexicon/rule set with precision and recall held across the whole corpus.

**Evidence:** `tracer-corpus.js` — header states "THE LABELS ARE THE FLOOR" and loads `analyze()` straight out of `Delta-Atlas-Tracer.html` so there is no second copy to drift; corpus includes novel finance ("harmonization") and medical ("dose ceiling") cases plus FP-bait. `Delta-Atlas-Tracer-Calibration.md` — miss reproduced before any change, corpus grown 8 → 11 cases, P/R 1.00 held across lexicon 0.2.0 and 0.3.0.

---

## 11. Structural-Move Detection (Shape over Synonym)
**Status:** proven (next: port the principle to a second detector — the deferred Gap Check relational-constraint engine already has its one-line spec)

**What it does:** Designs detectors that key on the grammatical shape of a move — e.g. a justification verb landing a change on a reference term the trace itself declared — instead of finite word lists. Any vocabulary list gets demoted to a versioned, openly labeled fallback, acknowledged as one hop from evasion.

**Trigger:** a pattern-matcher keeps getting evaded by rewording, or someone proposes "just add more synonyms."

**Why it generalizes:** shape-over-synonym applies to any text detector facing adversarial rewording — moderation, compliance, fraud language. The grammar of the move outlives the vocabulary.

**Evidence:** `Delta-Atlas-Tracer-Calibration.md`, lexicon 0.2.0 — a thesaurus swap ("recalibration") walked through the word-list rule; root cause diagnosed as "overfitting to a closed word list, not a missing word"; fixed with the reframeRef rule plus two-pass anchor-aware `analyze()`. Novel-domain catches at P/R 1.00 prove shape, not memorization; adding "biomass" was explicitly rejected as overfit; the lexicon version is surfaced in the UI.

---

## 12. Adjective-to-Number Conversion
**Status:** proven (next: check the benchmark harness into the public folder — the numbers are logged but the measurement is not yet reproducible)

**What it does:** Converts a qualitative performance or risk claim into measured, regime-separated numbers before accepting or declining it — a claim can be true in one input regime and false in another — then states the fix's residual cost in the same numeric terms.

**Trigger:** someone asserts "too slow / doesn't scale / melts / fine" with no number attached.

**Why it generalizes:** works on any performance, cost, or risk adjective in any stack. Nothing in the move is specific to JavaScript or regex.

**Evidence:** `Delta-Atlas-Tracer-Calibration.md`, "Scale limits measured" (2026-07-02) — Gemini's "big files melt the JavaScript" split into two verdicts: linear ~56 ms/MB on punctuated logs (claim false) and super-quadratic 110 s on 80 KB unpunctuated input from regex backtracking (claim true, a real denial-of-audit vector); fixed with bounded 1200-char windows to 41 ms (~2700x), window-edge miss cost stated in-code, corpus holding 11/11. Cold-read note: "Numbers over adjectives."

---

## 13. Deterministic Miss Reporting
**Status:** proven (next: inventory remaining silent-degradation paths and surface one at runtime — the bounded-window edge miss currently lives only in a code comment)

**What it does:** Makes absence a first-class output. When an engine lacks the data to answer, it reports the miss verbatim ("missing coordinate (no node in the graph); the graph will not guess") and labels any nearest-neighbor output "suggestions, not matches." Never silently substitutes a plausible answer.

**Trigger:** a tool returns a plausible-looking answer when the true answer is "I do not have that."

**Evidence:** `Delta-Atlas-Tracer-Calibration.md`, query-engine entry (2026-07-02) — comparative queries resolve each side independently and fail deterministically; verified live with two absent terms and real-word typo suggestions, zero console errors. Same move at artifact level in `Red-Team-Report.md` findings A1–A3: silent blank-page failure replaced by a persistent notice bar plus a global error handler that surfaces failures in plain words.

---

## 14. Donor-Calibration Merge
**Status:** proven (next: settle the donor's disposition — patch-and-publish `inversion-detector.js` or log its formal retirement, so the buggy standalone cannot be re-adopted)

**What it does:** Merges capability from a second implementation by treating it as a calibrated donor: probe and catalogue its defects first, port only the one capability the target lacks, fix the donor's bug inside the port, and record what was deliberately not ported and why.

**Trigger:** a second or older implementation has a capability we need — merge it in.

**Why it generalizes:** probe-first, port-one-thing works for any code merge, library adoption, or legacy consolidation. The catalogue of what was *not* taken is the part everyone else skips.

**Evidence:** `Delta-Atlas-Tracer-Calibration.md`, lexicon 0.3.0 — `inversion-detector.js` probed as donor, three defects confirmed and catalogued (3-char anchor drop silently losing "cap/gap/kpi/sla"; missing nominalizations; passive-voice short-circuit misreading "adjusted by the board" as drift); only agent resolution ported, with the passive bug fixed in the port; the nominalization port declined with reason. Corpus extended to 11 cases, P/R 1.00, new "amended" category added.

---

## 15. Embedded-Copy Sync Audit
**Status:** drafted (next: write the deterministic sync-check — hash the canonical dataset, compare every embedded copy and version line, fail loudly. Run today it flags `Delta-Atlas-Canon.md`, still v1.8 / "443 terms... 188 human-reviewed" against dataset 2.1 / 435 terms)

**What it does:** Hunts uncontrolled drift between a canonical dataset and every embedded or generated copy of it across artifacts, patches all copies in the same pass, and recomputes derived displays (banners, counts) from live data instead of hand-updating them.

**Trigger:** the same data lives in more than one file, or a displayed count disagrees with the dataset.

**Evidence:** `Delta-Atlas-Tracer-Calibration.md` (2026-07-02) — 18 definition rewrites applied to `terms.enriched.json` *and* all four pages embedding DATA copies (Chat, GroundTruth, Query, GapCheck) "so no embedded copy drifts from canonical"; stale Canon caught ("443/188" vs data 433/178); `index.html` banner recomputed from live data. The log names the hazard itself: "embedded DATA copies in 4+ pages are a standing sync hazard — worth a build step or a sync-check script."

---

## 16. Slop-Ratio Framework Audit
**Status:** drafted (next: reconcile tool with method, then run one logged audit of a real external framework. The doc names 8 dimensions; `Coherence-Audit.html` scores 7 differently-composed ones, lacks the framing-independence test the doc calls "the sharpest slop detector of the set," and omits agency and coherence from its rollup weighting — the method and its tool have drifted from each other, the exact failure class the method audits for)

**What it does:** Scores every part of a framework or plan on function-first dimensions (does it act, can it be tested, is it grounded, does it serve the goal, does it survive de-buzzwording, who acts, what happens on failure), rolls up a structural-integrity profile plus a "slop share," and aims red-team pressure at the lowest bars first. Carries a self-test clause: the method must pass its own audit or be cut.

**Trigger:** is this plan / framework / policy sound, or does it just sound sound?

**Reusable assets:** `Coherence-Ledger-Method.md` (the articulated method) + `Coherence-Audit.html` (the heuristic scoring tool, currently drifted from the doc).

**Evidence:** `Coherence-Ledger-Method.md` — complete articulated method: eight dimensions, scoring, self-test, red-team usage, honest limits; companion tool `Coherence-Audit.html` exists and scores parts heuristically. No logged end-to-end audit of a real external framework appears in any artifact read.

---

## 17. Load-Based Review Cadence (Slowest-Substrate Scheduling)
**Status:** drafted (next: execute the first pure review — no "reviewed, holds" entry exists anywhere; every log entry so far rides on a change. Run it at the next 6-session floor and log the outcome, whichever it is)

**What it does:** Schedules reviews by accumulated load, not calendar: every N working sessions, or immediately after any structural change or real-decision use, whichever comes first. Asks one cold question — does the structure still hold without the momentum that produced it? — and logs "reviewed, holds" even when nothing changed, because silence in the log is indistinguishable from drift. Calibrates the cadence to the slowest-recovering substrate — the human — since high-consequence sessions run hottest, exactly when self-read is least reliable.

**Trigger:** "how often should we review this?" — setting review policy for any living document or system.

**Why it generalizes:** any living document, codebase, or policy under intermittent maintenance. The load triggers rename per domain; the rule does not.

**Evidence:** Resilience Ledger §7 — cadence set in v0.3 (6 sessions or after structural change, with the reasoning written out); adopted with a different load trigger in `Red-Team-Report.md` ("review whenever an artifact is used for a real decision") and in the `Delta-Atlas-Tracer-Calibration.md` header ("load-based review, not calendar-based"). Rationale grounded in Ledger §3/§4 and Candidate G: recovery rates do not scale across substrates.

---

**Priority to formalize next:** **#9 (Divergence-Sort Protocol)** and **#12 (Adjective-to-Number Conversion)**. Both are proven, both fire on the most common cross-domain moments — a review comes back; a claim arrives without a number — and neither depends on the Tracer, the glossary, or any file in this project to work.

---

## How to develop these further
- The fastest path to a formal skill: pick one **proven** entry, point the `skill-creator` at its description + the named code assets, and let it scaffold a SKILL.md.
- Strongest candidates to formalize first: **#3 (the pipeline)** and **#4 (the discipline)** — they are the most transferable and least subject-locked.
- This register is a living document. Re-run a cold read on any future chat to mine new methods into it.
