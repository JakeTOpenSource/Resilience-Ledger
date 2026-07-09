# The Nozzle — a play study

*Status: a thinking return, 2026-07-02 — Jake's concept, sorted and formalized by Claude. Registered as `nozzle-app-lagrangian-study` in the Mend Gate. This is sandbox thought: cream skimmed, slop named, questions sharpened. Nothing here is committed structure.*

## What survives de-buzzwording (the cream)

Run the concept through its own framing-independence test and four functions stand up:

1. **A local, deterministic gate wrapped around any model call.** The user brings their own API key; every request passes the floor going in, every response passes it coming out; everything is logged append-only on the user's machine. This is not a new invention — it is *Delta Atlas moved from audit-time to call-time*. The white paper's own "future directions" already names it (the Resilience Guard); the Nozzle is that guard grown up, assembled from parts that already exist: the Tracer engine inline, manifest pinning for tool contexts, the seed-frame overlay for private hardening, the truth-ledger pattern for the session log.
2. **A continuously adjustable governance setting** — not locked-down, not wild, but a dial. This has an exact mathematical identity (below), which is the study's best find.
3. **Canonicalization at ingress.** The "3D → 2D → text" flattening, correctly renamed: reduce every rich input (HTML, documents, Unicode) to canonical plain text before the model sees it. This kills real injection channels — invisible Unicode tags, markup smuggling, embedded instructions in formatting. The caveat the concept misses: flattening destroys structure and provenance, so the structure must travel in a parallel *typed* channel rather than being thrown away. That parallel channel has a name in this house: a state-delta.
4. **Extraction-shaped traffic detection.** Not "detecting malicious users" (below), but detecting a measurable signature: distillation scraping looks like breadth-first coverage of capability space — high volume, high topical entropy, paraphrase-dense, low task-locality. Those are statistics a deterministic gate can compute.

## The mathematics (taking the Lagrangian frame seriously)

The right formal home for the nozzle is constrained optimization, and the correspondence is exact, not poetic:

- Let U(x) be task utility over an interaction trajectory x, and let g_i(x) ≤ 0 be the floor's constraints (injection score under threshold, zero PII egress, zero ordering-drift flags, budget caps).
- The Lagrangian is **L(x, λ) = U(x) − Σ λ_i g_i(x)**.
- **The nozzle is λ** — the vector of Lagrange multipliers. λ = 0 is "run wild"; λ → ∞ is "locked down"; the firefighter's hand on the dial is choosing λ in between. This is not analogy: constrained reinforcement learning and Safe-RLHF pipelines literally tune safety this way, by dual ascent on λ.
- **Complementary slackness (λ_i · g_i = 0) is the taste principle:** you only pay governance cost where a constraint actually binds. The nozzle narrows only where fire reaches.
- **The multiplier is a price.** λ_i is exactly how much utility one unit of constraint-tightening costs. Which yields the study's most buildable novelty: the gate should *emit its multipliers* — a per-session **shadow-price receipt**: "this session's safety cost X utility on constraint Y." Nobody reports the price of their guardrails; a deterministic gate could, and the metabolic-veto economics says exactly what to do with it: spend the scarce human cold-read where λ is largest.
- **The drift dial decomposes into two real knobs.** Sampling temperature T is literally the temperature of a Gibbs distribution — the entropy of the flexible layer. λ is the binding strength of the floor. "Adjust AI drift like a radio dial" = choosing (T, λ). Two knobs, not one, and they must not be conflated: T shapes what the model proposes; λ shapes what commits.
- **Candidate E is a basin of attraction.** "The drift tolerance past which the restoring force fails and the system locks high" is, verbatim, leaving a basin of attraction around an equilibrium. Sovereign zero = the equilibrium point; Return = the restoring dynamics; the ratchet = a second, undesired attractor; hysteresis = the deadband. A Lyapunov function V(x) — e.g., a weighted violation score — makes "return to center" measurable: inside the envelope, dV/dt < 0 under the gate's corrections. Candidate E stops being prose and becomes an experiment: sweep adversarial load at fixed λ and find where dV/dt crosses zero.
- **Noether, carefully.** Where the Lagrangian is invariant under a transformation, something is conserved. The adversary's cheap transformations are known: synonym swap, voice change, clause reordering, Unicode substitution. Features invariant under those transformations are the only load-bearing detectors — which is precisely the lexicon-0.2.0 lesson (shape over synonym), now restated as method: *enumerate the adversary's symmetry group; build invariants under it; everything non-invariant is labeled fallback.* This turns the project's hardest-won design lesson into a generator of future detectors.
- The nozzle's physics is honest too, as transmission-layer imagery: a nozzle creates directed flow *by constriction* — unconstrained flow disperses; over-constriction chokes (the de Laval nozzle even has a critical throat — a sharp, nonlinear knee, not a smooth tradeoff). And the older, truer ancestor is **Watt's governor**: the original deterministic harness bolted to a powerful engine — the machine cybernetics is literally named after.

## What does not survive (the slop, named kindly)

- **"Completely private... without trusting the host provider."** False as stated for external APIs: whatever crosses the wire, the provider sees. The honest split is two modes. Mode A, local open-source model: genuinely private, fully offline — the seed frame already points here. Mode B, external API: the *local layer* is private and the gate *minimizes and verifies what leaves* (redaction, context minimization, egress screening) — data minimization, not invisibility. Claiming more would be the exact overclaim the register exists to catch.
- **"Identifies when users are being malicious, disingenuous."** Intent is not deterministically detectable and pretending otherwise builds a mind-reader that fails as a censor. What is detectable is *behavior shape* (extraction-signature traffic, probe sequences). Screen conduct, not souls — and by the mirror principle the gate must be direction-symmetric: it screens inbound poison and outbound leakage with the same rigor, on versioned public lexicons plus private overlays.
- **The monetization claim.** Frontier labs monetize fine. The honest kernel: enterprises struggle to *adopt* unpredictable outputs; a deterministic boundary is what makes a probabilistic core procurable. The nozzle is an adoption device, not a revenue engine — and this project is not-for-sale by design anyway.
- **One structural warning that is really a law: the nozzle must never become the counterparty.** Hosted as a service, it would be exactly the untrusted middle-man it exists to remove. It only coheres as seed-frame software — local, inert, downloadable, yours. Distribution topology is the ethics; that was Seam 7, and it binds here with full force.

## The questions not yet asked

1. What is the unit of drift at the gate? (Candidate D operationalized: violations per thousand turns at fixed λ — a frequency, exactly as the Ledger guessed.)
2. Where is the choke point? Sweep λ against a fixed task suite and plot utility: the prediction is a knee, not a smooth slope. Find it before recommending any dial setting.
3. Is the recovery envelope measurable without driving the human to failure? (Candidates E + H: measure dV/dt on the machine substrate; extrapolate with stated error bars; never validate on the human.)
4. What does the shadow-price receipt look like as UI? (λ per constraint per session, displayed like lexicon versions are — governance observability nobody ships.)
5. What is the minimal deterministic statistic that separates extraction-shaped traffic from heavy legitimate use — and what are its pre-registered failure readings? (Write the four outcomes before running, like Drift Experiment 01.)
6. Which of the gate's checks are invariant under the adversary's known transformations, and which are fallback? (The Noether audit — apply it to the existing Tracer lexicon first.)
7. What must the nozzle refuse to be? A hosted service, an intent judge, a silent gate. Write the refusals into the spec before the features.

## Housekeeping on the metaphors (kept, labeled)

The torpedo image is historically real and apt: the Pearl Harbor Type 91s were fitted with cheap wooden fins so a powerful weapon could run in a shallow harbor it was never designed for — a removable, deterministic attachment adapting a payload to a constrained environment. That is the nozzle in one sentence. Kept in the metaphor layer, never load-bearing, per §5 rules — alongside the firefighter, the radio dial (impedance matching: maximum transfer at matched resistance, not zero, not infinite), and the governor.

## Verdict

The cream: **runtime assembly of the existing floor (the Guard), the dial as Lagrange multipliers with a shadow-price receipt, canonicalization-plus-typed-channel at ingress, extraction-signature detection with pre-registered outcomes, and the Noether restatement of shape-over-synonym.** The slop: absolute privacy through a third party, intent detection, and monetization framing. Build order when its turn comes: nozzle-v0 as a zero-dep local proxy composing tracer engine + manifest pins + overlay + session ledger — a few hundred lines, every part already on the shelf. It waits in the register like everything else.

| Date | Change | Reason / cold-read note |
|------|--------|-------------------------|
| 2026-07-02 | v0.1 of the study. | Play requested by the author; sorted with the house method. Awaiting his cold read; the λ-receipt and the Noether audit are the two ideas most worth keeping if only two survive. |
