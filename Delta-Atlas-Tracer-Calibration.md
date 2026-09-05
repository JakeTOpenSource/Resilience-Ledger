# Priority Tracer — Calibration Log

Companion to `Delta-Atlas-Tracer.html` (the Candidate I ordering-drift detector) and its harness
`tracer-corpus.js`. Load-based review, not calendar-based. The corpus labels are the **Floor**:
when a case fails, the lexicon and rules change, never the label. Returns from other systems
(including the Gemini stress test below) are **divergence, not verification** — sorted on receipt,
folded or declined with a reason, in the manner of the Resilience Ledger §7.

Reproduce: `node tracer-corpus.js` from the `public/` folder (Node only, zero dependencies).
The harness loads `analyze()` directly out of the HTML, so there is no second copy to drift.

## Lexicon 0.2.0 — what changed and why

Trigger: a Gemini-powered stress test swapped the arc-flash test's "modification" for a botanical
trace using "recalibration" / "operational excursion". The tracer returned **0** ordering-drift
signals on a trace with **three** inversion steps. Reproduced locally before any change (see
`repro`), confirming the miss was real and not a description artifact.

Root cause was **overfitting to a closed word list**, not a missing word. The `rationalize` rule
hunted a fixed set of mutation nouns; a thesaurus swap walked straight through it. Adding
"recalibration" would only move the same trap one hop down the dictionary. The fix is to detect the
**shape** of the move, keeping any word list as a labeled, secondary fallback.

| # | Change | Reason / cold-read note |
|---|--------|-------------------------|
| 1 | **`reframeRef` rule (new).** Flags "re-evaluate / reinterpret the *syntax / meaning / intent / scope*" of a reference. | Catches the purest ordering drift — purpose re-reading the rule to mean something softer (botanical step 9). There was no rule for it at all. Structural: keys on the re-interpretation move, not a noun. |
| 2 | **Anchor-aware detection (new, two-pass `analyze`).** Pass 1 extracts the terms of any invariant the trace *itself* declares; pass 2 flags an override/change verb landing on one of those terms. | This is §1 *Check* done properly: test later steps against the reference the trace laid down, not against generic vocabulary. Robust to domain words ("stomatal closure" is caught because step 2 declared it). Inert when no invariant is declared, so it cannot invent false positives on unanchored traces. |
| 3 | **`rationalize` rewritten** to a structural half (`justify… a ⟨any word⟩ of the ⟨reference⟩`, hyphen-aware) plus a **versioned** euphemism half. | Gemini's "abstract the target noun" suggestion — folded, done as a phrase macro-structure. The euphemism list is explicitly the *fallback*, not the tripwire. |
| 4 | **`goaljust` widened** with `sustain / preserve / maximize` alongside the existing `maintain / protect`. | Same class of goal-pursuit verb; not domain-specific. (Deliberately did **not** add "biomass" — that is the test's vocabulary, and step 11 is already caught by the generic verb. Overfit rejected.) |
| 5 | **Lexicon version surfaced in the UI** and the honest-limit note rewritten to say plainly that the euphemism list is a versioned fallback and any finite list is one hop from evasion. | The framework requires openly displayed versioned token lists, and honesty about the tool's edge is itself part of the defense. |

## Gemini return, sorted on receipt

- **"Abstract the target noun."** *Folded* (change #3 structural half). Correct and function-first.
- **"Expand the synonym list."** *Declined as the primary fix; folded only as a labeled fallback.*
  Cold-read note: a synonym dictionary as the load-bearing detector is the same overfitting failure
  it diagnoses, moved up one level — counting-vocabulary thinking. Treating it as the tripwire would
  be **ordering drift in the calibration process itself**: Purpose (ship a passing test) outranking
  Check (no finite list is complete). Logged to keep that line visible, per the v0.5 watch note.

## Baseline → result

| | Lexicon 0.1 (as received) | Lexicon 0.2.0 |
|---|---|---|
| Botanical trace (3 inversion steps) | 0 / 3 caught | **3 / 3** |
| Electrical-uptime drift example | 4 caught | 4 caught (no regression) |
| Clean examples | 0 false positives | 0 false positives |
| Held-out corpus (8 cases, 3 novel domains + FP-bait) | — | **Precision 1.00, Recall 1.00** |

The novel-domain cases matter most: "harmonization" (finance) and "override of the dose ceiling"
(medical) use words/domains absent from the lexicon and are caught **structurally**, which is the
evidence that the fix is a shape detector and not a memorized answer to the botanical trace.

## Lexicon 0.3.0 — merge of inversion-detector.js agent resolution

`inversion-detector.js` (the separate Framework-Audit engine, not previously wired into any page) was
calibrated as a donor. Its own defects, confirmed by probe, are catalogued below; its one capability
the Tracer lacked — **agent resolution** — was ported in (with the passive bug fixed).

**inversion-detector.js v0.1 defects found (documented; the standalone file is not yet patched):**

1. **3-char anchor drop.** `w.length > 3` in `extractAnchors`, R1, and R3 silently drops `cap`, `gap`,
   `kpi`, `sla`. The lexicon lists `"cap"` as a boundary noun it can never match. Its self-test only
   "passes" because those sentences carry longer co-occurring terms (`requests`, `spending`, `limits`).
2. **Nominalizations missing** from the mutation list (`recalibration`, `revision`, `suspension`) —
   only verb inflections. (The Tracer's `\w+`-stem euphemisms already cover these, so no port needed.)
3. **Agent resolution short-circuits on passive voice.** `resolveAgent` returns `"unnamed"` on any
   passive pattern *before* checking `by <external authority>`, so "the cap is adjusted by the board"
   is misread as drift. **Fixed in the port** (external check, including passive `by`, runs first).

**Ported into the Tracer (0.3.0):**

| Change | Reason |
|--------|--------|
| `EXTAUTH` / `INTAGENT` lexicons + `resolveAgent()` | The Ledger's "fixed relative to the plan, mutable above it." A mutation by a named external authority (board, regulator, reviewer) is legitimate **amendment**, not drift; the loop amending itself is drift. The Tracer previously had no agent model and would flag "the review board revised the ceiling" as drift. |
| New **amended** category (metric + section) | Third outcome alongside held / drift, so a legitimate amendment is neither hidden nor accused. Agent-sensitivity applies only to mutation rules (`override`, `rationalize`, `anchorMut`) — a priority inversion or reframe is drift no matter who says it. |
| `BMUT` verbs (`raise / increase / extend / expand`) | Boundary-mutation verbs the Tracer lacked (donor had them). Kept out of the bare goal-justify rule to avoid flagging benign "increase capacity"; only fire with a constraint noun or an anchored term present. |
| `anchorMutation` made whole-unit | Passive voice puts the anchored term before the verb ("the limit was raised by the regulator"); the after-verb-only scan missed it. Overlap now checked across the unit; verb position still returned for agent resolution. |

Corpus extended to 11 cases (added external-active, external-passive, and internal-self-amend);
**precision 1.00, recall 1.00**. The two external cases land in `amended`; the internal one stays `drift`.

## Honest limits (unchanged in kind)

Still a syntactic tripwire, not a containment proof. It reads grammar, not meaning; a human cold
read remains the detector of last resort (Ledger §4). Known edges the corpus does **not** yet close:
a novel override *verb* on an anchored term with no justification clause (e.g. "throttle the coolant
below nominal") can still slip the structural checks — a documented miss, not a hidden one. That is
the next case to add when a real trace produces it. Candidate I stays **open**: this detector catches
more planted inversions than before, but "caught more on this corpus" is not "closes I."

## Re-derivation log

| Date | Change | Reason / cold-read note |
|------|--------|-------------------------|
| 2026-07-01 | Lexicon 0.1 → 0.2.0. Added `reframeRef` and anchor-aware detection; rewrote `rationalize` (structural + versioned fallback); widened `goaljust`; surfaced lexicon version. Corpus + harness established. | First calibration pass, driven by a Gemini stress-test return (divergence, not verification). Corpus green at P/R 1.00 over 8 cases incl. 3 novel domains. Structure unchanged; the detector is still a tripwire, Candidate I still open. |
| 2026-07-01 | Lexicon 0.2.0 → 0.3.0. Merged agent resolution from inversion-detector.js (donor calibrated; its passive+external bug fixed in the port). New `amended` category distinguishes external-authority amendment from self-amendment drift; added `BMUT` verbs; `anchorMutation` made whole-unit for passive voice. | Folds the Ledger's "fixed relative to the plan, mutable above it" into the Tracer. Corpus extended to 11 cases, P/R 1.00. Still three functions, still a tripwire; Candidate I remains open. inversion-detector.js standalone defects catalogued but not yet patched. |
| 2026-07-02 | Pre-launch vocabulary + packaging pass. Term gap analysis over terms.enriched.json (433 entries): the glossary could not define its own tools' words — "ordering drift" used on 4 pages incl. index, zero entries for the Ledger's three drifts, invariant, anchor, amendment, tripwire; even §2-cited field families (error budget, rollback) absent. 33 candidates proposed (`Delta-Atlas-Term-Candidates.md` + `term-candidates-v1.json`), all Amber, none auto-merged. CLI added (`delta-atlas-cli.js`, exit-code contract for CI). Optional trace-format note added to the Tracer page. Found: Canon.md (v1.8, "443/188") is stale vs terms.enriched.json (v1.9, 433/178) — regenerate before public share. | Second external return (Gemini) sorted on receipt, divergence not verification: (1) log schema — folded as an optional convention, declined as a requirement (a load-bearing format spec is a recipe for traces that pass); (2) relational constraint engine for Gap Check — valid, deferred with a spec: flag any state-changing action with no validation/approval step attached in the same or adjacent unit, deterministic, no new machinery; (3) CLI packaging — folded; (4) "graduate all candidates to 100% verified so compliance officers can trust completely" — DECLINED in its stated form. Verification is earned per-term by human cold read against sources, not granted to hit a percentage; a 100%-green badge produced by relabeling would be manufactured coherence, and "trust completely" is the bar the Ledger explicitly refuses ("unfakeable is the bar that gets you killed"). The Amber/Green split IS the trust mechanism. The kernel kept: continue graduating terms through the existing review path, visibly. |
| 2026-07-02 | Definition coherence pass (dataset 2.0). Explore page relation renderer fixed: incoming relations dangled ("Human-in-the-Command same as" — no object); each incoming phrase now completes with "this term". 18 function statements rewritten function-first: self-restating product names (huggingface, weightsbiases, hbm), acronym stubs (proximal, gru), the identical chroma/milvus/weaviate trio differentiated, and pure is-statements (cognitive, latent, engine, entropy, catalog, etc.). Applied to terms.enriched.json AND all 4 pages embedding DATA copies (Chat, GroundTruth, Query, GapCheck), so no embedded copy drifts from canonical. `tolerance` demoted reviewed→candidate: the rewrite is AI-drafted, and by the project's own legend Amber means AI-drafted pending review. | Author-directed pass (screenshot of Explore page showed the dangling relation and the circular HuggingFace definition). Verified: zero identical-definition groups remain; all modified pages' scripts parse; browser DOM check confirms complete relation phrasing and new definitions render, no console errors. Note for next pass: embedded DATA copies in 4+ pages are a standing sync hazard — worth a build step or a sync-check script; and 11 name-echo entries remain by design (name used inside a content-adding sentence, e.g. autonomy, ground-truth). All 18 rewrites await cold read. |
| 2026-07-02 | Scale limits measured; engine 0.3.1. Benchmark: normal one-step-per-line logs are LINEAR (~56 ms/MB; 32 MB in 1.8 s, 365k units) — "big files melt the JavaScript" is false for punctuated logs. Pathological unpunctuated input (minified JSON, single-line traces) confirmed SUPER-QUADRATIC from regex backtracking: 10 KB=0.2 s, 80 KB=110 s — a real denial-of-audit vector (an agent could evade tracing by never emitting a period). Fixed with bounded 1200-char unit windows: 80 KB now 41 ms (~2700x), corpus stays green 11/11. Honest cost, stated in-code: a phrase straddling a window edge can be missed on unpunctuated input. | Gemini's "melt" claim sorted by measurement, not argument: one form true (and fixed), one form false. Numbers over adjectives. |
| 2026-07-02 | Query engine (Chat/index ask panel): comparative queries now resolve each side independently and FAIL DETERMINISTICALLY — a side with no node reports "missing coordinate (no node in the graph); the graph will not guess", with closest terms shown but labeled "suggestions, not matches". Fixed the singular()-stem artifact ("probabilistic → probabilitie") via RAWFORM display mapping. Added 'deterministic' and 'probabilistic' as first-class candidate terms (dataset 2.1: 435 terms, 360 relations) with 7 sparse typed relations; declined the returned suggestion to wire ALL Control & Safety terms to one node and ALL failure modes to the other — blanket edges of correlated origin are manufactured structure, exactly what provenance-weighting exists to resist. index.html banner recomputed from live data (was stale "443/188"; now 435/177/51). New relation objects carry minimal shape (source/type/target/strength) — enrich signals/directed metadata on fold. Verified live: bridge answer for the original failing query, deterministic miss report for two absent terms, real-word typo suggestions, zero console errors. | Third Gemini return sorted on receipt: add-baseline-terms folded (sparse), fail-deterministic folded (verdict first, suggestions kept for the newcomer audience), multi-entity-extraction diagnosis partially declined — the splitter existed; the actual gaps were per-side resolution, the missing nodes, and silent misses. |
| 2026-07-02 | Sovereign-zero audit of the project and its operator. Git history established (2 commits — the project is no longer one disk failure from erasure). Skills register extended 8 → 17 from artifact evidence (each entry carries its calibration next step; two of those steps audit this log itself: the benchmark is now checked in as tracer-bench.js with regression budgets, and inversion-detector.js's disposition is flagged as unsettled). Publishing kit added (README, CONTRIBUTING, CITATION.cff, PUBLISHING, hardened .gitignore). PWA verdict: installable as-is; sw.js v69 fixes three silent offline failures (Framework Audit page absent from precache; hero search dead offline due to exact-URL cache matching; undefined responses); index gains install instructions — iOS users previously had no cue at all. Operator-Protocol.md drafted (candidate). | The operator's own past chats were unreachable (Cowork-era; missing coordinate, reported not guessed) — the shipped artifacts served as the durable record, which is itself the method working. All AI-drafted additions await cold read. GitHub username still missing; push blocked on that one coordinate. |
| 2026-07-02 | The Mend Gate shipped (see State-Delta-Bridge.md): one register (proposals.json, 15 entries) + gate runner (mend-gate.js) for every proposed change from any source; mcp-manifest-pin.js (counterparty tripwire, offline selftest incl. pagination); seed-frame overlay live — engine 0.4.0, xt() extender, additive regex-escaped phrases, --overlay in CLI and corpus, base corpus green unchanged, smoke test proves a private phrase catches only with the overlay and provenance displays as "base + overlay". Before shipping, three adversarial reviewers reproduced 8 mechanical defects (all fixed: register-bricking add, Windows npx spawn crash exiting as false "drift", multibyte chunk-boundary false-drift, __proto__ canonicalization blind spot, hash omitting title/outputSchema/annotations, unreachable "gated" status, free un-sorting, whitespace reasons) and falsified one theory claim: the overlay is NOT "never able to weaken the floor" — externalAuthorities and anchorMarkers entries reclassify findings (drift→amended/held), i.e. additive input with subtractive effect. Claim corrected in the doc and the sample file now warns on both lists. | The verification pass was the framework's first live run: its own overclaims were the first returns sorted through it. Candidate I discipline held — nothing auto-accepted, every fix reproduced before applied, gates green after (corpus 11/11, bench in budget, selftest green, register valid). |
| 2026-07-02 | Gap Check structural bug fixed (author cold-read finding: the run button did nothing on real input, only the example "worked"). Root cause: `Delta-Atlas-GapCheck.html` embeds a BESPOKE dataset (shape `{id,name,cluster,purpose,status,acct,def,aliases}`), NOT a copy of terms.enriched — but the 2026-07-02 baseline-terms pass assumed all `const DATA=` copies were the same shape and injected `deterministic`/`probabilistic` with the terms.enriched shape (no `aliases`), so `detect()` threw `t.aliases is not iterable` before any output, killing every manual run. Fix: removed the 2 malformed terms + 18 stray `function_statement` fields from GapCheck's data (now 433 native-shape terms), added a defensive `if(!Array.isArray(t.aliases)) continue` guard so no single bad row can brick the tool again, and added Ctrl/Cmd+Enter to run. Verified live: manual run and example both render, zero console errors. sw v73. | Direct field evidence for the `embedded-copy-sync-check` proposal — and it sharpens the spec: the sync-check must be SHAPE-AWARE, because GapCheck's embedded data is a different schema, not a drifted copy. The author's cold read caught what the gates could not: no corpus covers the GapCheck UI path. Candidate corpus case for that tool is now warranted. |
| (next) | (awaiting a trace that produces a new documented miss, or a human cold read) | |

## 2026-09-05: Gap Check cancellation and Framework Audit advice

An observed Gap Check miss counted `Human review was never implemented` as oversight through the everyday-language bridge route. The alias route already checked cancellation. Both routes now apply the same finite preceding/following windows, while risk terms remain exempt. Seven added cases cover cancellation, positive review, a later valid occurrence, and risk preservation. Against the original engine the expanded corpus passed 10/12; with the repair it passes 12/12. Continuity Audit retains 18/18.

Framework Audit's built-in strong plan includes a test-failure merge gate. Its advice previously told the reader to soften absolute language. The replacement asks the reader to check scope, preserve explicit testable requirements, and qualify promises that cannot be checked. Three new advice cases bring the corpus to 6/6, compared with 4/6 against the old advice. The existing strong/weak/typical scores remain 92/38/73; this does not recalibrate the scorer.

The repository introduction and technical review page now expose these implementations, reproduction commands, and the difference between stored review labels and review receipts. Service-worker cache v88 accompanies this repair. Older observations and receipts remain unchanged. This is an owner-authorized, AI-assisted repair; authorization to publish does not stand in for an independent human cold read. The proposal remains in the cold-read queue. These finite cases establish the specified regressions only, not general semantic accuracy or safety.

## 2026-09-05: Task-first navigation

The owner separately approved a navigation-only simplification: Tools, Evidence and Library with visible Search, and three primary tasks for plans, agent traces and operating procedures. Framework Audit remains secondary. References, simulations, experiments and curation remain accessible through the Library; existing URLs, datasets and shared engines are retained. The homepage keeps a concise research question, the 439/435 snapshot disagreement, and privacy/offline boundaries.

Cache v89 adds the two indexes and Continuity Audit to the declared core. Current surface checks follow the approved organization, while historical source identities remain checked against their original recording commit. This changes presentation and reachability, not dataset acceptance or the meaning of old receipts. Browser checks include narrow-layout navigation, one-step Back and glossary retrieval. No measured productivity improvement is claimed. Artwork changes and any future data removal remain separate decisions.
