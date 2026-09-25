# Delta Atlas

**Simplification is systems maintenance; the substrate is human cost.**

Delta Atlas is the public record of one researcher's theory of agentic AI governance and the instruments built from it, shown end to end: the claim, the architecture, the skills you can run today, and the receipts, including what has not been proven.

Created by Jake Tiller through AI-assisted development. Every claim on the site carries its status. Nothing is called golden without the owner's explicit word.

[Open the site](https://resilience-eval-ai.pages.dev/) · [State-Delta Architecture](https://resilience-eval-ai.pages.dev/Delta-Atlas-Architecture.html) · [Receipts and evidence](https://resilience-eval-ai.pages.dev/index.html#Delta-Atlas-Evidence.html) · [Library](https://resilience-eval-ai.pages.dev/index.html#Delta-Atlas-Library.html)

## Three things you can use today

| | What it is | Run it now | Receipt |
|---|---|---|---|
| **BespokeNode** | A governance framework for agentic AI. Nothing an agent does counts until it has been defined, permitted, gated, verified and accepted, in that order. Two safety states, HOLD and TRIP. Four invariants. | [pilot-001](https://github.com/JakeTOpenSource/parallel-advisor-pilot-001), the first clause run through the framework end to end, MIT licensed. The [proposal register](State-Delta-Bridge.md) in this repository applies the same discipline to the site's own changes. | Minted gold by owner decision 2026-09-23. [Public specification v0.1](BespokeNode-Spec-v0.1.md) is a candidate. |
| **Pin-Check** | Trace every precise number, digest, byte count and version in a document back to an artifact under a root you name. Each value is traced, rounded, or currently undefined. | `python skills/pin-check/pin_check.py <document> <root>`. Python 3, standard library, no network. [README](skills/pin-check/README.md). | Run against this repository before each publication; the [calibration log](Delta-Atlas-Tracer-Calibration.md) records it. |
| **OpenMirror** | A method for turning a metaphor into policy one correspondence at a time. A one-to-one analogy mirror, verified joint by joint. | The [Bridge Card](skills/bridge-card/README.md): six fields, one minute, ends in accept, not yet, or a named uncertainty. | The [V=IR crosswalk](https://resilience-eval-ai.pages.dev/Delta-Atlas-Architecture.html#crosswalk). The author reports red-teaming it against a first draft; those notes are unpublished. A crosswalk with a stated claim frame, not a validated law. |

## The architecture

[Delta-Atlas-Architecture.html](Delta-Atlas-Architecture.html) walks the state-delta architecture top to bottom in plain English: the controlled path, the roles, the two zones, the gates, the five protocols, HOLD versus TRIP, the four invariants, the ledger and the accepted state, the conformance contract, return to zero, the cost ladder, and the V=IR crosswalk. Its source is [BespokeNode-Spec-v0.1.md](BespokeNode-Spec-v0.1.md), with the earlier [State-Delta-Bridge.md](State-Delta-Bridge.md) kept as history.

## What is proven, and what is not

Proven, on synthetic cases: the probe machinery works end to end; an audit leg with an opposing brief catches errors in the advisor's own record, not just the executor's; the mechanism probes detect their targets.

Not proven: anything about real substrates (true concurrency, scheduler preemption, power loss, crash durability, production behavior); the V=IR mapping and the simplification thesis as laws rather than crosswalks; independent replication of any of it. The [receipts page](Delta-Atlas-Evidence.html) lists work in progress by status only.

## The instruments

Deterministic browser tools built along the way. Fixed rules and versioned word lists, no model at runtime. They read structure, not meaning. A clean result does not certify correctness or safety.

| Page | What it does |
|---|---|
| `Delta-Atlas-GapCheck.html` | Gap Check: paste a plan or policy; it looks for recognized risk and safeguard phrases and reports a risk named with no control present. |
| `Delta-Atlas-Tracer.html` | Priority Tracer: paste an agent action log; it highlights wording about a goal climbing over a rule or a check being bypassed. |
| `Coherence-Audit.html` | Framework Audit: scores each part of a plan on coherence and resilience dimensions. |
| `Delta-Atlas-ContinuityAudit.html` | Continuity Audit: a five-question work-handover check, plus the same engines pointed at an operations manual. |
| `Delta-Atlas-Quick.html` | Quick Check: guided input for Gap Check or Framework Audit. |
| `Agentic-AI-Governance-Chat.html`, `Agentic-AI-Governance-Query.html` | Ask and Explore: a function-first glossary of agentic AI governance, with sources. |
| `Delta-Atlas-Primitives.html` | Systems Primitives: recurring cross-domain structures. |
| [`Six-Signal-Method.html`](Six-Signal-Method.html) | Six-Signal Method: separates Calibration, Consequence, Evidence, Integrity, Privacy and Activity without inventing a status. |
| `Delta-Atlas-Basin.html`, `Delta-Atlas-Cadence.html`, `Delta-Atlas-Field.html` | Simulations and an experiment, each bounded by its stated claim ceiling. |
| `evaluate.html` | A guided technical review. |

The full list, grouped by function, is on the [Library page](Delta-Atlas-Library.html).

## Inspect the engineering

| Question | Artifact |
|---|---|
| Does the detector retain its expected behavior? | [Tracer corpus](tracer-corpus.js), [Gap Check corpus](gapcheck-corpus.js), and [calibration history](Delta-Atlas-Tracer-Calibration.md). |
| Can the same detector run in a pipeline? | [CLI](delta-atlas-cli.js), with JSON output and explicit exit codes. |
| How are decisions and corrections retained? | [Governance ledger](governance/ledger/README.md), append-only events, and Node/Python projection checks. |
| How are the site's own changes governed? | [Proposal register](proposals.json) and its [gate](mend-gate.js). Sorts need a written reason and are terminal. |
| How are external contract changes noticed? | [MCP manifest pin](mcp-manifest-pin.js), an offline hash-based comparison tool. |
| What is actually checked in CI? | [Repository workflow](.github/workflows/gates.yml), with pinned runtime versions and named checks. |
| Do the public pinned snapshots still verify? | [`research/atlas-snapshot-read-only/`](research/atlas-snapshot-read-only/) and its release verifier. |

## Run locally

The detector checks require Node.js and no package installation.

```text
git clone https://github.com/JakeTOpenSource/Resilience-Ledger.git
cd Resilience-Ledger
node tracer-corpus.js
node gapcheck-corpus.js
node continuity-audit-corpus.js
node governance/harnesses/run-all.js
```

Run the CLI against a local file:

```text
node delta-atlas-cli.js trace mytrace.txt --json
node delta-atlas-cli.js gapcheck myplan.txt --json
```

Exit codes are `0` for no flags, `1` for flags, and `2` for a usage or load error. These are detector outcomes, not safety certificates.

Run Pin-Check on any page against the repository. This is the exact command behind the recorded clean run; the `--ext` flag brings stylesheets and pages into scope, which the tool does not read by default:

```text
python skills/pin-check/pin_check.py index.html . --ext=.md,.py,.json,.js,.mjs,.txt,.yml,.yaml,.cff,.css,.html
```

For the browser tools, download the repository and open `index.html` or a tool page. [README-Portability.md](README-Portability.md) explains file-access restrictions, optional assets, offline caching, and which views need more. The [governance documentation](governance/README.md) and [STP reproduction instructions](research/stp-v1.2/README.md) cover their additional checks and prerequisites.

## Design constraints

- **Deterministic core.** Scoring is plain JavaScript over versioned data, not model output. Labeled corpora pin exact behavior for the checked code and data.
- **Client-side analysis.** No account, API key, or model call is required. Atlas does not place submitted text in request URLs or send it to a model or API. The hosted site still makes ordinary page requests and Cloudflare may collect page-performance and visit telemetry; the home page discloses that boundary.
- **No LLM at runtime.** AI was used to draft content, and everything AI-drafted is marked candidate until a human verifies it. No model runs when you use the tools.
- **Versioned lexicons.** Every token list a detector uses carries a version number, displayed openly in the UI.
- **Agency matters.** A limit revised by a named external authority is an amendment. A limit an agent revises on itself is drift. The detectors keep those apart and say which they saw.

## Data status: visible disagreement

The declared candidate input, [terms.enriched.json](terms.enriched.json), contains **439 terms**, all carrying a stored `reviewed` label. That label is not a receipt proving who reviewed a definition, when, against which exact source, or whether it is semantically correct.

Ask, Explore, and the Curation dashboard retain **435-term projections: 177 reviewed and 258 candidate**. Gap Check retains 433 terms. These are different snapshots, not interchangeable counts of verified knowledge.

The [data-sync baseline](governance/contracts/atlas-data-sync-baseline.md) records missing IDs, status mismatches, source differences, and the smaller Canon projection. Its current decision is `DEFER`. A passing baseline check preserves that recorded disagreement; it does not reconcile or accept the content.

## Related projects

| Project | What to review |
|---|---|
| [pilot-001](https://github.com/JakeTOpenSource/parallel-advisor-pilot-001) | The parallel advisor system: sealed expectations, blind two-track execution, independent audit, public receipts. Minted gold 2026-09-23. |
| [Clutch](https://github.com/JakeTOpenSource/clutch-skill) | A separate human-approved task-routing protocol, canonical skill, deterministic reducers, adversarial fixtures, and release package. Version 0.4.0-rc.1 is a research preview in `PREPARE_ONLY`; publication does not activate routing. |
| [The Stable](https://github.com/JakeTOpenSource/the-stable) | Agent-calibration instruments, recorded plans, replay tools, and retained failed hypotheses. [Start with its findings](https://github.com/JakeTOpenSource/the-stable/blob/main/FINDINGS.md). |
| [The Crosswalk](https://github.com/JakeTOpenSource/the-crosswalk) | Static decision aids for deciding whether to code, learn, direct AI, or hire. |
| [typed-refusal-harness](https://github.com/JakeTOpenSource/typed-refusal-harness) | Aggregate experiment counts and an attribution audit. The original model harness is not published there. |

GroundingHarness and AI-Governance-Ledger are historical project names; this repository is the current home.

## License

Content is licensed CC BY 4.0. Skills under `skills/` are free to copy, adapt and share. pilot-001 is MIT licensed in its own repository.
