# Fork Return Notes — a cold read of Delta Atlas from the outside

*Status: a return, 2026-07-02 — divergence, not verification. Proposed by the fork's operator (BigBirdReturns); drafted with a model (Claude), so per this project's own rule every claim below is **candidate** until the author's cold read. Nothing here amends anything. Fold, reshape, or decline with reason, per the house method. The two concrete proposals this fork carries are already in `proposals.json` as `readme-durability-the-thirty-year-floor-audit-ar` and `ci-gates-workflow-corpus-bench-register-pin-self`.*

## What this fork is, and is not

This branch is your tree, bit for bit, plus three additions: `README-Durability.md`, a CI workflow that runs your existing gates, and this note. Each addition is one commit, deliberately rebase-able or cherry-pick-able in isolation, and each entered through the Mend Gate before it became a file — the proposer never sorts.

What it is not: a restructure. An earlier automated pass (the codex branch your register already holds as `sort-codex-branch`) reorganized the folder into `src/`, `docs/`, `public/` and added a Python test harness. We read your design constraints and backed it out of this fork entirely: it added a second language to a "Node and nothing else" project, moved the double-clickable HTML out of the root, and split "three things in one folder" into eight directories. The flat folder is not clutter; it is the deployment topology — the floor as inert matter. A fork that "cleans up" your layout breaks your project law while smiling. This one doesn't.

## What was actually run, not just read

Claims about your work below are tested, in the spirit of your own proof-strip discipline:

- `node tracer-corpus.js` → CORPUS GREEN (P/R 1.00), locally and on a fresh GitHub Actions runner.
- `node tracer-bench.js` → BENCH GREEN, both regimes in budget, ~1.6 s.
- `node mend-gate.js` → register validates; two proposals added through the CLI by a stranger with no instructions beyond your docs. The front door works.
- `node mcp-manifest-pin.js selftest` → SELFTEST GREEN, drift correctly detected.

One meta-finding worth logging: the codex pass shipped tests that referenced `*.local.js` fixture files — which your `.gitignore` bans by law — so its "all tests pass" was true only inside its own sandbox and false on every fresh checkout. An agent confidently reporting green against state nobody else can verify is the exact drift this project exists to catch. Your rules caught a machine that had read them and still broke them. That is the strongest field evidence your method has produced to date, and it happened by accident.

## The read — what holds

- **The discipline stack is real and it compounds.** Corpus as floor, labels never fixed to pass, bench as complexity tripwire, append-only register with mandatory reasons, terminal sorts, pinned counterparties. Each alone is hygiene; together they are a working single-operator implementation of verifiable human-governed change.
- **The corpus is a conformance surface, whether you named it that or not.** A stranger can fork this project, change the lexicon, and mechanically prove their continuation valid — corpus green or corpus red, no author required. Most solo projects have nothing like this.
- **The design constraints are accidentally an archival strategy.** Deterministic, client-side, zero-dependency, no service at evaluation time — chosen so no model owns the meaning; the identical choice means no vendor owns the survival. Self-contained HTML over versioned JSON is close to the most durable executable format in computing.
- **The honest-limits sections are the most valuable prose in the repo.** They are a self-written roadmap: single-sorter ceiling, convention-not-cryptography, corpus provenance, the under-operationalized center. Projects that know where they are weak get to choose where they grow.

## The read — what's thin

Where an entry already exists in your register, it's named; nothing here is news to your own logs.

1. **Embedded data copies can drift from the source of truth** (`embedded-copy-sync-check`, already registered). The strongest of your own pending proposals, in our read — silent divergence between `terms.enriched.json` and the copies baked into pages is the one defect class your current gates cannot see.
2. **The canon is two versions stale** (`canon-regeneration`, already registered).
3. **Doc/tool drift on Framework Audit** — the method doc says eight dimensions, the shipped tool scores seven differently-composed ones (your Skills register #16 logs this). Reconcile or state it; the white paper is blocked on it either way.
4. **The CLI extracts `analyze()` from the Tracer HTML by string-splitting.** Right dependency direction — page and pipeline can never disagree — but it is an undocumented contract, and contracts get broken by editors who don't know they exist. One comment in the HTML and one line in the README would seal it. (The corpus gate catches a break after the fact; the comment prevents it before.)
5. **No pinned states.** No tags, no releases, no hash manifest. A future holder of three divergent copies has no way to know which one is yours. This is durability move #1 and the cheapest real gap.
6. **The succession gap.** Your repo knows it doesn't know — `State-Delta-Bridge.md` calls multi-party sorting "a known bud," `Nine-Seams.md` names the single-sorter ceiling and its flip condition. But knowing the gap is not an answer: the tools continue fine without you; the register — the thing that makes this project yours — has no legitimate next entry. An append-only register can *record* a transfer of authority; it cannot *authorize* one after the authority is gone, and any claimant's entry is, by your own definitions, self-amendment. The rule only works written in advance, by the living hand. It costs one paragraph in `CONTRIBUTING.md`. Details and the other five moves: `README-Durability.md`.

## Where it's pointed (your words, read back)

The trajectory is already written in your own honest-limits sections: from private discipline toward public infrastructure. Community corpus cases (provenance-diverse calibration). The MCP server (`delta-atlas-as-mcp-server`, registered, ships when it has gates). The white paper, whose strongest credibility asset — a falsified claim corrected in public before publication — is sitting unused. And the flip condition you named yourself: the day someone else relies on Delta Atlas output for a real decision, maker-checker stops being a footnote.

## Full disclosure: the fork operator builds the thing your limits point at

You should know who is holding this pen. The fork's operator builds AXM — a protocol for compiling knowledge into signed, tamper-evident, offline-verifiable shards (post-quantum signatures, Merkle evidence, a frozen verifier contract, an independent second verifier built from spec and vectors alone). Different starting point, same convictions: deterministic over generated, local over hosted, the model as anonymous compile-time labor, the human as the authority.

The two projects meet at a seam neither designed:

- **Your register is convention-not-cryptography, by your own confession, and your own doc names the fix:** "if that guarantee ever needs to be hard, the field-standard extension is maker-checker signatures." AXM is that field standard with a toolchain: fold/decline entries signed by keys, sorting authority carried in a trust store, the succession designation itself a signed, timestamped artifact a reader in 2056 can verify without meeting either of us.
- **AXM has the opposite gap:** it makes claims tamper-evident but is deliberately agnostic about whether a claim deserved committing. A shard of confident nonsense verifies flawlessly forever. Delta Atlas is the missing upstream question — what is fit to enter evidence, who held the pen, drift or amendment.
- Honestly labeled: crypto proves *a key* signed *these bytes* *before this time*. It cannot manufacture legitimacy — it shrinks what must be taken on faith from "every copy of the history" to "one short key list." That is the whole claim, and it is enough to be worth having.

Per your own Counterparty rule, this lands at review time, as a proposal, never at runtime: nothing in this fork wires the two projects together, and the one automated attempt to do so is exactly the branch we backed out. If any of it interests you, the moves in ascending cost: (1) nothing — take the durability commits, ignore the rest, the CC BY credit line stays yours everywhere; (2) a signed snapshot of `proposals.json` as a shard — your register gains independent tamper-evidence, changes nothing about how you work; (3) maker-checker when your own tripwire fires; (4) a Delta Atlas spoke that you own and we consume. Decline-with-reason is a perfectly good outcome for all four; it's how your register says no, and the reason would be worth reading.

## Sort instructions

Everything above is one return from one fork, drafted with a model, cold-read by nobody yet. The two mechanical proposals are in the register; the opinions are only as good as they survive your read. The fix is never the label.
