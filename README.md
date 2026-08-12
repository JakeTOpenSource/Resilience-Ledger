# Delta Atlas

Plain-language tools for auditing coherence: in the vocabulary of agentic AI, in frameworks and plans, and in agent decision traces. Built on the Resilience Ledger method. Everything runs on your own machine, free, with no account and no model behind it.

**Live site:** https://resilience-eval-ai.pages.dev/

## Why it's public

This is shared openly to get cold reads. If you find a flaw, a missing case, or a place where the structure doesn't hold without the momentum that produced it, that's exactly the feedback wanted. Poke holes in it.

## What this is

Three things in one folder:

1. **A function-first glossary** of the language used in agentic AI and its governance. Every term is defined by what it *does*, not where it falls in an alphabet, grouped by purpose and linked to other terms by shared function. Each term carries its sources and a status — **candidate** (AI-drafted, awaiting verification) or **reviewed** (human-verified). The home page shows the current counts.
2. **Audit instruments.** Gap Check reads a plan for missing governance. Framework Audit scores any framework on eight coherence and resilience dimensions. The Priority Tracer reads an agent trace for ordering drift — the moment purpose starts bending the rule it answers to.
3. **The method docs** that produced all of it, including the calibration log that records every change to the detectors and why. The theory underneath is the Resilience Ledger: three functions (Absorb, Check, Reset) measured from one neutral center, and three drifts (content, thermal, ordering).

## Design constraints

These are the rules the whole project is built on. They don't bend.

- **Deterministic.** Same input, same answer, on any machine, every time. Scoring is plain JavaScript over versioned data, not model output.
- **100% client-side.** No account, no API key, no network call at evaluation time. Text you paste into a tool never leaves your machine.
- **No LLM at runtime.** AI was used to draft content — and everything AI-drafted is marked candidate until a human verifies it — but no model runs when you use the tools.
- **Versioned lexicons.** Every token list a detector uses carries a version number, displayed openly in the UI. When a lexicon changes, the calibration log records what changed and why.
- **Agency matters.** A limit revised by a named external authority is an amendment. A limit an agent revises on itself is drift. The detectors keep those apart and say which they saw.

## The tools

| Page | What it does |
|---|---|
| `index.html` | Home. Search the glossary and open everything else. |
| `Delta-Atlas-Start.html` | Start here — the 2-minute guide. |
| `Delta-Atlas-Quick.html` | Quick check — a read in about a minute. |
| `Agentic-AI-Governance-Chat.html` | Ask — type a question, get a sourced plain-language answer. Deterministic retrieval, not a chatbot. |
| `Agentic-AI-Governance-Query.html` | Explore — browse and filter the full vocabulary and its connections. |
| `Agentic-AI-Governance-GroundTruth.html` | Curation dashboard — how well-sourced each term is, and why. |
| `Agentic-AI-Governance-Map.html` | Map — layered view of the vocabulary. The 3D view needs a local `three.min.js`; without it, it falls back to 2D on its own. |
| `Agentic-AI-Governance-Reflections.html` | 2D layered view, fully self-contained. |
| `Delta-Atlas-GapCheck.html` | Gap Check — paste a plan or policy; it reads for missing governance. |
| `Coherence-Audit.html` | Framework Audit — scores a framework's parts on eight coherence and resilience dimensions. |
| `Delta-Atlas-Tracer.html` | Priority Tracer — reads an agent trace or decision log for ordering drift. Lexicon version shown in the tool. |
| `Delta-Atlas-Primitives.html` | Systems Primitives — the recurring structures underneath. |
| `Delta-Atlas-Field.html` | The Field — an instrument view. |
| `evaluate.html` | For evaluators — a 10-minute guided review with specific questions. |
| `Delta-Atlas-Verify.html` | Verification checklist — check off candidate terms whose definition and sources read right, export the batch, then run `verify-terms.js` to apply it. No bulk-check: one human judgment per term. |
| `Delta-Atlas-ContinuityAudit.html` | Continuity Audit — Gap Check's and Framework Audit's engines, pointed at an operations manual instead of an AI policy: a **resilience** reading (can the goal survive a key person out, a vendor failing, an emergency), risks with no stated control, and single points of failure with no documented backup. Supports a private, gitignored overlay (`continuity-overlay.local.js`) for one organization's real procedures. |

The data underneath: `terms.enriched.json` is the single source of truth for the vocabulary. `Delta-Atlas-Canon.md` and `delta-atlas-canon.json` are generated from it. `primitives.json` feeds the Primitives page.

## Shared engines (the reuse-upstream layer)

Gap Check, Framework Audit, and the Continuity Audit are three different questions asked of the same two engines, not three copies of the same code:

- **`lexicon-engine.js`** — the deterministic detection core: NEG-guarded substring matching, the everyday-phrasing bridge crosswalk, "risk named with no control present," and a generalized "if this group of terms is present and that group is absent, that's a gap" check. Gap Check supplies its AI-governance knowledge base; the Continuity Audit supplies an operations-domain one. Same engine, same negation-guard fix, both places, forever — not two lexicons that can quietly drift apart.
- **`coherence-score-engine.js`** — the eight-dimension-style scorer behind Framework Audit: does each part of a plan say what to do, can you tell if it worked, is it plain language, does it serve the goal, does it say what happens on failure. A consumer can add its own dimension (the Continuity Audit adds "institutional continuity" — does a procedure rest on one person with no documented backup) without forking the whole scorer.
- **`corpus-harness.js`** — the shared PASS/FAIL/exit-code presentation layer every labeled corpus in this project prints through. Each corpus keeps its own comparison logic (Tracer's precision/recall stays Tracer's own, deliberately not forced through this); this only unifies the parts that were pure duplication.

Both HTML tools load their engine via a plain `<script src="…engine.js">` tag (not an ES module — those get blocked by CORS on `file://`, so a double-clicked page still works with no server). Each engine is wrapped in an IIFE and exposes exactly one namespaced global (`LexiconEngine`, `CoherenceScoreEngine`), so a page's own local `analyze(text)` wrapper never collides with the shared one.

## Quick start

Three ways, easiest first.

**1. Use the live site.** https://resilience-eval-ai.pages.dev/ — nothing to install, no sign-in.

**2. Install it as an app.** Open the live site in Chrome or Edge and click **Install app** in the top bar (or the install icon in the address bar). After that it works offline, like any installed app.

**3. Download it and run it offline.** On GitHub, click the green **Code** button, then **Download ZIP**. Unzip anywhere and double-click `index.html` — or any tool page directly. Every page is self-contained; copy the folder to a USB stick and it still works. The exact offline guarantees, and the one optional dependency (the 3D map's library), are in `README-Portability.md`.

## The scripts (Node, zero dependencies)

The detector scripts pull the `analyze()` engine straight out of `Delta-Atlas-Tracer.html`, so the command line and the web page can never disagree: one source of truth, no copy to drift. You need Node.js installed and nothing else — no packages.

Besides the calibration harness and CLI below: `tracer-bench.js` keeps the engine's measured scale limits reproducible and fails loudly if a complexity regression gets in; `mend-gate.js` runs the proposal register (every proposed change to this project, from any source, sorted fold/decline with a written reason — see `State-Delta-Bridge.md`); `mcp-manifest-pin.js` pins an MCP server's tool manifest by hash so a counterparty's silent contract change becomes a visible return to sort (`node mcp-manifest-pin.js selftest` proves it offline); and `ivy-gen.js` regrows the decorative ivy on the home page (`node ivy-gen.js` rewrites the vines in `index.html`; seeded and deterministic, same output every run, and it exits non-zero if a leaf detaches from its stem or a vine end would dangle visibly mid-page — the same rule as everything else here: structure checked, not eyeballed). `ask-corpus.js` pins the Ask engine (loads its `answer()` from the HTML and asserts real terms resolve while fragment-collisions like "sandbagging"→"Bagging" fall back to honest closest-matches instead of a confident wrong answer). `verify-terms.js` applies a human-checked batch from `Delta-Atlas-Verify.html`: `node verify-terms.js apply verified-batch.json` flips exactly those ids from candidate to reviewed, refusing anything unknown or already non-candidate (`--dry-run` to preview; `selftest` proves the logic on synthetic data first).

Newest floor slice: `day-ledger.js` is an append-only, hash-chained daily ledger with dual attestation — every closing entry must carry both a human note and an agent note — plus a deterministic end-of-day reconciliation of what was planned versus what got done (`node day-ledger.js reconcile ledger.jsonl 2026-07-04`). Editing any past line breaks the chain loudly. `day-ledger-corpus.js` pins its rules with labeled cases. `day.js` is the capture wrapper for daily use — `node day plan p1 "draft the note"`, `node day done p1`, `node day close` — it stamps the time, prompts for both notes, and never asks you to type JSON; `node day week` reports the week's streak against its pre-registered pass line.

`Coined-Terms-Grounding.md` does the same adversarial-cold-read treatment for the glossary's own house-coined vocabulary (Resilience Ledger, Substrate Gate, and the rest of the State-Delta family) — a single external citation for a term this project invented itself would be dishonest, so instead each one is grounded in the real traditions it draws from, and a fresh reader is set loose to try to refute the synthesis before it ships. The first drafts of both finished terms failed their own stress test; the corrected, narrower versions are what's actually cited in `terms.enriched.json`, and the failure is recorded rather than quietly fixed.

**Calibration harness** — proves the detector still earns its labels:

```
cd path\to\this\folder
node tracer-corpus.js
```

It runs the labeled corpus, prints PASS/FAIL per case plus precision and recall, and exits non-zero if any label fails. The labels are the floor: when a case fails, the fix is to change the lexicon or rules in the HTML — never the label.

**CLI** — run the checks from a pipeline, or from an agent on its own output. Two commands, same shape: `trace` (ordering drift in a reasoning or decision log) and `gapcheck` (unhandled risks and ungoverned autonomy in a plan or policy). Both take a file or `-` for stdin, print a human report by default, and emit machine-readable JSON with `--json`:

```
node delta-atlas-cli.js trace    mytrace.txt --json   ordering drift in a decision log
node delta-atlas-cli.js gapcheck myplan.txt --json   unhandled risks in a plan or policy
type myplan.txt | node delta-atlas-cli.js gapcheck -  pipe from stdin (cat on Mac/Linux)
```

Exit codes: `0` clean, `1` flags found, `2` usage or load error. A zero exit is not a safety guarantee — the engines read structure, not meaning. A human (or the agent's human) still confirms anything that matters. See `llms.txt` for the agent-facing entry point.

## Authority, research custody, and privacy

The append-only event ledger, generated authority map, research artifact and
feedback registers, recorded production receipt, and public/private handling
floor live in [`governance/`](governance/). Run
`node governance/governance-validate.js` and
`node governance/harnesses/run-all.js` to check those records offline. The
second gate independently replays projections in Node and Python and requires
the resulting roots to agree.

The recorded authority state deliberately leaves two things unresolved rather
than guessing: the exact Calibration Ledger v8 artifact pinned by State
Transition Protocol v1.1, and the commit that produced the current Cloudflare
Pages deployment. A provider-reported successful deployment is not accepted as
equivalent to repository `main` until an independent manifest comparison holds.
The Cloudflare receipt is a historical observation from 2026-08-11, not a
moving statement about current `main`. The status-vocabulary contract keeps
the original ledger enum as a frozen legacy adapter and does not claim it is
semantically equivalent to the State Transition Protocol vocabulary.

### STP v1.2 public reproduction packet

[`research/stp-v1.2/`](research/stp-v1.2/) is an owner-authorized,
privacy-minimized candidate packet for instrumented transitions, explicit null
versus absence, invasive sensing receipts, bounded survivability, concurrency,
effect finality, and resource-economical evidence acquisition. It contains
only public sources, schemas, synthetic fixtures, and independent JavaScript
and Python reducers. Its exact files are sealed by a release manifest and the
governance ledger.

The packet remains proposed research. A passing run proves agreement on its
enumerated synthetic cases; it does not prove live calibration, external event
truth, statistical reliability, unbounded safety, or protocol acceptance.

## The seed frame: download it and harden it privately

The public lexicon here is deliberately the general floor. If you run these detectors on real work, the strongest move is to take the folder and harden it privately: add your own domain's invariants, euphemisms, and corpus cases in a private overlay, so nobody can read your tripwires from the public repo.

The convention: private overlays live in files ending `.local.js` (for example `tracer-overlay.local.js`) next to the tools, and private corpus cases stay in your copy. The `.gitignore` in this repo blocks `*.local.js` and `*.local.json`, so a public fork can never leak a private lexicon — or the manifest pins that reveal which servers you rely on — by accident. **Never commit `*.local.*`.**

The overlay is live as of engine 0.4.0: copy `tracer-overlay.sample.js` to `tracer-overlay.local.js` and fill in your domain's phrases. The Tracer page loads it automatically; the CLI and corpus take `--overlay <file>`. Overlays are additive only — they can extend the public floor, never weaken it — and the tool displays "base + private overlay" so provenance stays visible in every report. If a rule you write turns out to be structural — it catches the shape of a failure, not your domain's words — send that part back. Keep the words that describe your systems to yourself.

## Honest limits

- The detectors score by word- and structure-level heuristics. They flag likely weakness; they do not understand meaning. Treat output as a pointer to where to look, not a verdict. The judgment stays human.
- Any finite word list is one hop from evasion. The structural rules are the load-bearing part; the euphemism lists are a labeled, versioned fallback. Known misses are written down in the calibration log instead of hidden.
- Glossary entries are AI-drafted and stay marked **candidate** until a human verifies them. Read candidates as drafts.
- Returns from other systems are divergence, not verification. When another AI or an outside reviewer says the tools pass, that is a data point to be sorted, not a confirmation. How returns are sorted is in `CONTRIBUTING.md`.
- This is independent educational research. It is not legal, compliance, or professional advice, and it is not affiliated with or endorsed by any organization it cites. See `LICENSE.txt`.

## The story

This started as a glossary built around one question — what does this term actually *do*? — and the same move kept applying one level up: from terms, to frameworks, to the traces agents leave behind, to this project's own process. The docs below are the journey, kept in the open, mistakes included:

- `White-Paper.html` — the living plain-English legend: what every tool does, the exact ledger meanings, and how the project governs itself. Start here; hand it to any AI model before it writes about this project.
- `Coherence-Ledger-Method.md` — the audit method, including the self-test it has to pass.
- `Delta-Atlas-Tracer-Calibration.md` — the re-derivation log: every lexicon change, the reason, and each outside return folded or declined in writing (including the stress test that broke lexicon 0.1 with a thesaurus swap).
- `Red-Team-Report.md` — an adversarial review of the project's own artifacts, deliberately harder on the parts that felt finished.
- `Skills-Method-Register.md` — the reusable methods that emerged, separated from the subject matter.
- `Translator-Framework-Design.md` — the sovereign-zero translator design.
- `README-Portability.md` — exactly what runs offline and why.
- `Resilience Ledger v0 5.pdf` — the theory underneath all of it. (`Resilience Ledger v0 4.pdf` is kept as history; the re-derivation log inside the paper records what changed between them and why.)
- `experiments` — pre-registered drift experiments. Drift Experiment 01 commits its four possible readings *before* the run, so the result can't be reinterpreted after the fact. Status: designed, awaiting its run.

## License and credit

Everything here — the content, the data, the tools, the docs — is **CC BY 4.0** (see `LICENSE.txt`). Use it, copy it, adapt it, build on it, even commercially. The one condition is credit. A line like this covers it:

> "Delta Atlas / Resilience Ledger" by Jake Tiller — CC BY 4.0 — https://resilience-eval-ai.pages.dev/

...and say if you changed it. For formal citation there is a `CITATION.cff` in this repo; GitHub shows it as a "Cite this repository" button.

The project itself is not for sale, by design. The license permits others to build on it, including commercially, because openness is the point — but this work exists as a public good, and credit is the only currency it asks for.
