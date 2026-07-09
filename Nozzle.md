# The Nozzle — built (v0.1, the λ-receipt)

*Status: shipped as `nozzle.js`, 2026-07-02. The concept study is `Nozzle-Study.md`; this is the working thing. Run `node nozzle.js demo` to see the receipt, `node nozzle.js selftest` to prove it. Zero dependencies, Node only, offline.*

## What it is, in one breath

The Delta Atlas floor moved from audit-time to **call-time**: a local gate that canonicalizes and screens every request before it reaches a model, screens every response before it reaches you, and tallies the cost on your machine. No model runs inside the gate — it is deterministic, the same input giving the same decision on any machine.

## The dial is a Lagrange multiplier (the whole point)

Governance is constrained optimization: maximize task utility U subject to floor constraints g_i(x) ≤ 0. The Lagrangian is `L = U − Σ λ_i · g_i(x)`, and the nozzle setting **is** λ. `λ_i = 0` runs wild on constraint i; `λ_i = inf` locks it down; between is the firefighter's hand on the dial. A request is admitted while its penalty `P = Σ λ_i · g_i` stays within a utility budget B, and blocked when governance cost exceeds what the task is worth.

λ's real job is **conversion**. Each constraint counts violations in its own unit — injection *hits*, PII *items*, ordering-drift *flags*, budget *overage*, an extraction *score*. λ_i is the price that converts constraint-i units into common penalty currency, so the contributions `c_i = λ_i · g_i` are comparable and summable. That is exactly what a Lagrange multiplier is: a shadow price on a constraint.

## The λ-receipt (the deliverable)

At session end the gate prints the **price of your guardrails**: per constraint, how much penalty currency it charged, its share of the total, how many requests it bound, how many blocks it caused. Then it reads complementary slackness (`λ_i · g_i = 0` at the optimum) back in plain English:

- **Constraints that never bound cost nothing — loosen them for free.** (The demo reports ordering, budget, extraction as slack.)
- **The costliest constraint is where your scarce human review goes first.** That is the metabolic veto operationalized: spend the non-resetting cost — attention — where the price is highest.

Nobody ships the price of their guardrails. This does, and the number is deterministic, so two runs of the same session produce the same receipt.

## Two modes, stated honestly

- **Mode A — local model.** Genuinely private and offline. Point a transport at your local model; nothing leaves the machine.
- **Mode B — external API.** The *local layer* is private; the gate **minimizes and screens what leaves** — egress PII/secret redaction, context minimization. It cannot make the provider blind to what you send; it can make what you send smaller and checked. **Data minimization, not invisibility.** Claiming more would be the overclaim the register exists to catch.

The gate never bundles a network call. Transports are pluggable; the default is an offline stub, so the tool runs and self-tests with no key, no network, no cost.

## The law: never a counterparty

Run it locally. Hosted as a service, the Nozzle becomes exactly the untrusted middleman it exists to remove — able to change behavior server-side, silently, inside your loop. It coheres only as seed-frame software: local, inert, downloadable, yours. Distribution topology is the ethics.

## What each constraint screens

| Constraint | Direction | g (native unit) | Method |
|---|---|---|---|
| injection | ingress | hits | structural cues (override / role-hijack / prompt-exfil / delimiter) + smuggling-Unicode presence |
| pii | egress (Mode B) | items | deterministic PII/secret shapes; matches are redacted before send |
| ordering | egress | flags | the Tracer's `analyze()` run on the response/trace — single source of truth |
| budget | ingress | overage ratio | size over a configured cap |
| extraction | session | score [0,1] | lexical diversity × volume (see below) |

**Canonicalization done right.** Rich input is reduced to canonical text — strip markup; remove *all* invisible/format Unicode (the whole `\p{Cf}` category: zero-width, bidi overrides and isolates, word joiner, invisible operators, LRM/RLM/ALM, soft hyphen, BOM, the Tags block), plus variation selectors and line/paragraph separators; then NFKC-fold homoglyph and full-width tricks — but what was stripped travels in a **typed record**, not silently discarded, so structure is kept as provenance. And the smuggling attempt is *evidence even after it is neutralized*: every invisible character removed is counted, so a keyword split by one invisible char still trips the injection score even though the split defeated the literal pattern.

**Extraction signature (absolute breadth, filler-resistant).** Distillation scraping touches many distinct topics at volume; focused heavy use recycles a small vocabulary. The score is **absolute distinct-vocabulary count × volume** — deliberately *not* a ratio, because a ratio (type-token) is crushed by appending identical filler to every request, while repeated filler adds no new distinct tokens and cannot lower an absolute count. Pre-registered readings (committed before the run, per Drift Experiment 01): broad+voluminous trips; focused heavy use does not; filler-padding a broad scrape still trips; low volume (< 6) scores zero. **Documented co-score:** a legitimate broad-curiosity power user has high distinct vocabulary too and scores like a scraper — so extraction is **advisory**: at the default λ/budget it raises the price but does not block alone. Do not gate on it.

## Overlays (seed frame)

Define `globalThis.NOZZLE_OVERLAY = { injection:[...], pii:[...] }` in a `*.local.js` and load with `--overlay` (the lexicons rebuild after the overlay loads, so the flag genuinely takes effect). Unlike the Tracer's authority overlay — which can *reclassify* and therefore suppress — Nozzle overlays are **purely additive in the blocking direction**: they can only add screens, never remove one. There is no subtractive-effect trap; a private overlay can only tighten. A malformed overlay pattern is dropped, not fatal — a bad regex cannot take the gate down.

## Honest limits (in force)

- Screens read structure and shapes, not meaning. A block is a deterministic decision on the text as written, not a judgement of intent — the gate screens **conduct, not souls**. It will miss an attack phrased in a shape it was not taught (base64/rot13 payloads, other languages, novel phrasings); the structural rules are load-bearing, the pattern lists are a versioned, overlay-extendable fallback.
- **It does not detect malicious intent.** It detects extraction-shaped *traffic* and injection-shaped *text*. A slow, distributed scrape under the volume floor is a documented miss, and a legitimate broad-curiosity user co-scores with a scraper (why extraction is advisory, not gating) — both named, not hidden.
- Mode B cannot hide your data from the provider. Only Mode A is truly private. Response-side PII screening runs in **both** modes (it protects your own screen, not the wire).
- PII/secret patterns are deterministic shapes; they catch shapes, not every secret, and can over-redact shape-alike strings (long digit runs, chained identifiers) — deliberately conservative for egress. Redaction reduces egress; it does not guarantee zero leakage.
- The dial is a policy tool, not a safety proof. λ sets a price; it does not certify the model is safe at any setting.

## Verify

`node nozzle.js selftest` — 25 labeled cases, the floor: clean admits, injection blocks, the dial (λ=0 admits what λ=high blocks), invisible-Unicode smuggling scored after neutralization (word joiner and variation selector), egress redaction incl. chained emails and over-length card runs, complementary-slackness on a clean session, extraction separating scraping from focused use and resisting filler-padding, **but-for block causation** (an injection block does not blame the PII guardrail), the Inf-lock named costliest at price 0, a working private overlay that drops malformed patterns, the ordering constraint wired to the Tracer, egress decisions counted separately from ingress, and lambda validation. A failing case changes the code, never the label.

## Re-derivation log

| Date | Change | Reason / cold-read note |
|------|--------|-------------------------|
| 2026-07-02 | v0.1 → v0.1.1. Lagrangian gate + λ-receipt built from the study, then hardened by a three-way adversarial review (math / security / doc-vs-code) that reproduced every finding before it was fixed. Math core was declared **sound and unrefuted** (P = Σλg, admit-iff-P≤budget, Inf·0 guard, determinism). Fixed: receipt block-attribution → but-for causation; Inf-lock booked with blocks so it can be named costliest; response decisions counted separately from ingress; canonicalization broadened from ~4 codepoints to the full `\p{Cf}` set + variation selectors + separators (one invisible char could previously bypass the injection screen *and* dodge the smuggle score); the `--overlay` flag was a no-op (lexicons built before it loaded) — now rebuilt after; injection overlay compiled unescaped could crash the module — now dropped safely; two PII leaks (chained emails, over-length card runs); extraction switched from type-token ratio (crushed by filler-padding) to absolute distinct-vocabulary (filler-resistant); createNozzle now validates λ instead of leaking NaN. | The build's own extraction metric was the study's cream corrected twice: first normalized-entropy measured evenness (fixed to diversity), then diversity-as-a-ratio was filler-evadable (fixed to absolute count). Two rounds of "the honest breadth signal" before it held — logged because the correction is the method. Awaiting the author's cold read. |
| (next) | (a real trace that produces a documented miss, or the author's cold read) | |
