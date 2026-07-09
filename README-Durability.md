# Durability — the thirty-year floor

*Status: a return from a model (Claude), 2026-07-02, delivered via a fork — divergence, not verification. Registered as `readme-durability-the-thirty-year-floor-audit-ar` in `proposals.json`, awaiting the author's cold read. Nothing here amends the structure; every move below is a candidate to fold, reshape, or decline with reason.*

`README-Portability.md` answers "does it run on any machine today?" This note asks the same question with the clock run forward: **if someone finds this folder in 2056, does it still open, still run, and still mean what it meant?** Durability is portability across time, and the audit method is the project's own: list the counterparties, find the parts that assume no failure, and press there.

## What already survives — the design law is an archival strategy

The project's non-bending constraints, written for governance reasons, turn out to be the exact properties archivists ask for:

- **Self-contained HTML** is the most backward-compatible executable format in computing; a 1996 page still opens today. Plain JavaScript over versioned JSON has no build step to rot and no package registry to disappear.
- **No service at evaluation time** means there is no server whose shutdown ends the tools. The distribution model already names this: the floor is inert matter, not a service. Inert matter keeps.
- **The theory travels with the tools.** The Ledger PDFs, the Canon, and the method docs are in the same folder as the instruments they explain. A future reader gets the meaning, not just the mechanism.
- **CC BY 4.0** makes every future copy legal. Licenses outlive accounts.

None of that was luck twice: deterministic, client-side, zero-dependency was chosen so no model or vendor owns the meaning. The same choice means no vendor owns the *survival*.

## The counterparties that will not last thirty years

Every entry below is an agent outside this project's governance but inside its loop — the Counterparty class, applied to time. Their changes must not be able to end the project silently.

| Counterparty | What it holds today | Failure mode | The move |
|---|---|---|---|
| Cloudflare Pages (`resilience-eval-ai.pages.dev`) | Primary address, install-as-app, offline cache | Free tiers and domains are decade-scale at best | Mirrors, and an address-independent way to cite the work (below) |
| GitHub | The repository, the ZIP download path, the citation button | Longer-lived, still one company | Independent archival copy (below) |
| cdnjs CDN | `three.min.js` for the 3D map | Already handled: local file first, 2D fallback always | **This is the pattern to copy** — every other dependency should fail as gracefully |
| Node.js | The CLI, corpus, bench, gates | The engines are plain JS; the `node` binary's form in 2056 is unknowable | The browser pages are the durable interface; the scripts must stay trivial to re-host on whatever runs JS then |
| The service worker (`sw.js`) | Offline install | PWA APIs churn faster than HTML; the most rot-prone file in the folder | Acceptable loss: the pages work without it, by design — say so here so nobody mistakes its death for the project's |
| The author | The only sorting authority in the Mend Gate | The single-sorter ceiling, already named in `Nine-Seams.md` — as a durability problem, not just a governance one | A written succession rule (below) |

One internal seam belongs in this table even though it is not a counterparty: the CLI extracts `analyze()` out of `Delta-Atlas-Tracer.html` by splitting on script tags, so the page and the pipeline can never disagree. That is the right dependency direction — but it is a *contract*, and contracts get broken by people who do not know they exist. This paragraph exists so a future editor knows: the corpus gate is what catches you if you break it.

## The moves, cheapest first

Each is a separate proposal for the register; none is folded by appearing here.

1. **Cut a release: a tarball plus a SHA-256 manifest of every file.** This is `mcp-manifest-pin.js` applied to the project itself — the floor at a moment in time, pinned by hash, verifiable by anyone holding a copy against anyone else's copy. Publishing future updates stays the same three commands; a release just names the states worth keeping forever.
2. **Software Heritage.** A public, independent, purpose-built archive of source code; a save request is one URL, no account. It survives GitHub, and it is the only entry on this list whose entire mission is the thirty-year question.
3. **A DOI via Zenodo.** `CITATION.cff` already exists; Zenodo turns a release into a citable, permanent identifier that outlives every domain in this folder. Cited work gets found; found work gets copied; copies are durability.
4. **The GitHub Pages mirror** — already written up as the optional step 14 of `PUBLISHING.md`. Promote it from optional to done: two free homes, different failure modes.
5. **Decide the `three.min.js` question once.** It is MIT-licensed and r128 is frozen; committing one vendored copy would end the last CDN dependency. The `.gitignore` currently blocks it deliberately to keep the folder lean — a real tradeoff, one cold read, either answer recorded.
6. **Write the succession rule while it is cheap.** CC BY means anyone may fork, but the register's *authority* does not transfer by license. One paragraph in `CONTRIBUTING.md` — what a reader in 2056 (or a collaborator next year) should do if the sorter has gone silent: which artifacts are the floor (the corpus, the labels, the logs), and that a new register starts rather than the old one being rewritten. The append-only rule, applied to the project's own custody.

## Honest limits

- This note is a model return: divergence, not verification. It may be wrong about which parts rot first; the table is falsifiable on purpose.
- The archives are counterparties too. Software Heritage and Zenodo can end. The mitigation is plurality — several homes with unrelated failure modes — never trust in any one of them.
- Bits surviving is not meaning surviving. The Canon and the white paper carry the exact vocabulary; the convention of handing them to any reader (human or model) before it writes about this project is itself load-bearing for 2056, and it costs one line in a README to keep.
- Durability work is the most seductive kind of scope creep, because it never says no to itself. The register decides how much of this happens, and when. That is the design.

## Re-derivation log

| Date | Change | Reason / cold-read note |
|------|--------|-------------------------|
| 2026-07-02 | v0.1 drafted as a return, via fork, registered alongside a CI-gates proposal (`ci-gates-workflow-corpus-bench-register-pin-self`). | Prompted by a reader's question: what happens if this should still work in thirty years? The audit reuses the project's own method — counterparty table, graceful-failure pattern, moves as proposals. The author sorts. |
| (next) | (awaiting the author's cold read) | |
