# The State-Delta Bridge (the Mend Gate)

*Status: candidate, v0.1, 2026-07-02. A framework for mending the gap between three inflows this project actually has: AI recommendations, ledger candidates and outside returns, and the MCP ecosystem. Sovereign-zero in stance, state-delta in mechanics. Awaiting the author's cold read — which is, fittingly, entry `cold-read-state-delta-bridge` in its own register. All register dates are UTC.*

## The gap it mends

This project already sorts change well — but in three different places. Model recommendations were sorted in the calibration log. Vocabulary candidates were sorted in the term dataset. And MCP — the open-source protocol ecosystem the project wants to intertwine with — had no sorting surface at all: a counterparty's tool manifest could change under an agent silently, which is uncontrolled drift as a protocol default.

The mend is one move: **everything arriving at the project's boundary is the same object.** A Claude recommendation, a Gemini stress test, a Codex branch, a new term, a 2 a.m. spark, an MCP server's changed tool description — each is a **proposal**: a state-delta from a non-floor source, awaiting gates and a human sort. One object, one register (`proposals.json`), one gate (`mend-gate.js`), one queue.

## The lifecycle

```
source (model | human | counterparty)
   │  may ADD a proposal — never sort one   (add --kind records who)
   ▼
proposed ──(queue)──> cold-read-pending ──> folded | declined   [terminal]
                            │                     │
                            │                     reason REQUIRED, appended,
                            │                     append-only (controlled drift);
                            │                     site-tools folds run corpus+bench
                            │                     first and refuse while red
                            └─ a human reads it cold — the only sorting authority
   (every command first validates the whole register: schema, custody, reasons)
```

Four rules are enforced mechanically, not by good intentions:

1. **A sort needs a written reason.** `mend-gate.js fold|decline` refuses without one (whitespace doesn't count). A status change with no reason is a ratchet — the register's own validator flags it as invalid data.
2. **site-tools folds cannot commit while gates are red.** The corpus and the benchmark run before any fold in that stream commits, whatever the proposal calls itself — the type field is self-declared, so the gate doesn't trust it to decide whether gates run. The labels are the floor; the fix is never the label.
3. **Sorts are terminal.** A folded or declined proposal cannot be re-sorted, and the validator rejects a register whose log records a sort but whose status has regressed — un-sorting erases history; open a new proposal instead.
4. **The log is append-only.** Sorts add entries; nothing edits history. A reset stays distinguishable from a ratchet because the log exists.

## The three roles — and the third agent class

- **Proposer** (any model, any reviewer, the author's own momentum): may add, never sorts. The model never holds the pen on the floor.
- **Gate** (deterministic scripts): verifies what can be verified without judgment.
- **Sorter** (a human, cold): folds or declines, with the reason in writing. Human-in-the-command, in the Canon's terms.

And one class the ledger did not previously name: the **Counterparty** — an agent *outside your governance but inside your loop*. An MCP server is the pure case: it is not your external authority (it has no legitimate power to amend your references) and not your internal agent (you cannot inspect or bound it), yet it can change your agent's effective behavior unilaterally. The rule for counterparties: **their changes may not land at runtime; they land at review time, as proposals.** That is what manifest pinning does.

## The MCP intertwine — both directions

**Consuming MCP safely (the floor stays yours).** The deterministic core keeps speaking fixed contracts; the flexible layer may speak MCP; the boundary between them is pinned. `mcp-manifest-pin.js` hashes each tool's name, description, and schema at the moment a human approves them. Any later change — a reworded description, a new tool, a schema edit — trips the wire and enters this register as a proposal from a counterparty. Not an error, not an auto-accept: a return to sort. Pins live in `*.local.json` (git-ignored), because which servers you rely on is itself information worth keeping private.

**Serving MCP (the floor offered to others).** The same boundary run in reverse: Delta Atlas exposed *as* an MCP server, so anyone's agent can self-audit its traces against the Tracer locally — deterministic, no model at runtime, the same `analyze()` single source of truth. This is an open proposal in the register (`delta-atlas-as-mcp-server`), not a shipped artifact; it ships when it has gates.

**Hardening privately (the seed frame).** The public lexicon is the general floor. `tracer-overlay.local.js` (engine 0.4.0) adds your domain's invariant markers, euphemisms, and authorities locally — additive only (overlay phrases are regex-escaped and cannot remove or rewrite public phrases), version displayed in the tool so provenance stays visible, blocked by `.gitignore` so a fork can never leak it. One sharp edge, stated plainly because adversarial review found it: two overlay lists **reclassify** findings rather than add them — a phrase in `externalAuthorities` turns matching drift into amendment, and a phrase in `anchorMarkers` can grace-mask a unit entirely. Additive input, subtractive effect. Treat those two lists as floor changes: add sparingly, corpus-gate them, and cold-read every model-proposed entry twice. The hardening loop is State-Delta applied to the lexicon itself: a local model proposes phrases from your logs, the corpus gates them, you cold-read the survivors in. The overlay file stays outside any model's write path — the floor is not writable by the loop it governs, and that applies to files.

## The self-test clause

The Coherence Ledger method requires every framework to pass its own audit or be cut. This one is operated as entries in its own register: the overlay and the manifest pinner were folded through it with reasons recorded; the MCP server idea sits in it as `proposed`; this document's own cold read is in the queue. If the register cannot hold the framework's own changes, the framework has failed its own test and this file should say so and stop.

## Honest limits

- The gate verifies **structure, not wisdom**. It can prove a reason was written, not that the reason is good; it can prove the corpus is green, not that a prose proposal is true. The judgment stays human — that is the design, not a gap in it.
- The reason requirement is enforced by convention and file layout, **not cryptography**. A model with write access could fabricate a fold. Keep `proposals.json` sorts human-run; if that guarantee ever needs to be hard, the field-standard extension is maker-checker signatures, and it should enter this register as a proposal like everything else.
- Manifest pinning detects that a counterparty's contract **changed**, not that it is safe. A malicious description that never changes passes the pin forever. The pin buys review-time; the review is still yours.
- This is a single-operator design. Multi-party sorting (two humans, a community) is unmodeled — a known bud, not a hidden one.

## The artifacts

| File | Role |
|---|---|
| `proposals.json` | The register — one entry per proposal, any source, append-only log per entry. |
| `mend-gate.js` | The gate — validate, list, add (the two-minute capture), queue, fold/decline with mandatory reason, run gates. |
| `mcp-manifest-pin.js` | The counterparty tripwire — pin and check MCP tool manifests; offline selftest included. |
| `tracer-overlay.sample.js` | The seed-frame template — copy to `tracer-overlay.local.js`, harden privately. |
| `Delta-Atlas-Tracer.html` (engine 0.4.0) | Loads the overlay, displays base + overlay version, floor unchanged without it. |

## Re-derivation log

| Date | Change | Reason / cold-read note |
|------|--------|-------------------------|
| 2026-07-02 | v0.1 established: register + gate + counterparty class + both MCP directions + seed-frame overlay shipped together as one framework. Same day: adversarially verified by three independent reviewers before shipping — 8 mechanical defects fixed with reproductions (register-bricking add path, Windows spawn crash, multibyte false-drift, __proto__ hash blind spot, unreachable statuses, free un-sorting), one theory claim corrected in this document (the overlay reclassification edge, above), and one self-test failure repaired (this doc claimed its cold read was in the register before the entry existed; it exists now). | Built from the author's request to mend the gap between AI recommendations, ledger candidates, and MCP intertwining. All mechanics reuse existing project disciplines (fold/decline-with-reason, corpus-as-floor, additive private overlays); the only new theory is the Counterparty agent class, which is itself only a proposal until cold-read. The framework's first act was catching its own overclaims — which is either embarrassing or exactly the point. |
| (next) | (awaiting the author's cold read — see `cold-read` entries in the register) | |
