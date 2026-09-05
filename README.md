# Delta Atlas

**Deterministic tools and evidence records for AI-assisted work.** Delta Atlas reads plans, frameworks, and agent traces for structural weaknesses, then makes the rules and recorded results available for inspection.

Created by Jake Tiller through AI-assisted development. The project combines working JavaScript tools, labeled tests, documented corrections, and proposed research. Its value can be assessed from those artifacts.

[Open the tools](https://resilience-eval-ai.pages.dev/) · [Two-minute guide](https://resilience-eval-ai.pages.dev/Delta-Atlas-Start.html) · [Guided technical review](https://resilience-eval-ai.pages.dev/evaluate.html)

## Start with one example

[Gap Check](https://resilience-eval-ai.pages.dev/Delta-Atlas-GapCheck.html) reads a plan for missing controls. It uses versioned rules in the browser, without a model call or account.

Inspect the [shared detector](lexicon-engine.js), its [labeled cases](gapcheck-corpus.js), and the [Continuity Audit cases](continuity-audit-corpus.js) that exercise the same engine in another domain. The [coherence scorer](coherence-score-engine.js) is also shared across tools rather than copied into each page.

The detectors use finite word and structural rules. Their output points to text worth reviewing; a clean result does not establish meaning, correctness, or safety.

## Inspect the engineering

| Question | Artifact |
|---|---|
| Does the detector retain its expected behavior? | [Tracer corpus](tracer-corpus.js), [Gap Check corpus](gapcheck-corpus.js), and [calibration history](Delta-Atlas-Tracer-Calibration.md). |
| Can the same detector run in a pipeline? | [CLI](delta-atlas-cli.js), with JSON output and explicit exit codes. |
| How are decisions and corrections retained? | [Governance ledger](governance/ledger/README.md), append-only events, and Node/Python projection checks. |
| How are external contract changes noticed? | [MCP manifest pin](mcp-manifest-pin.js), an offline hash-based comparison tool. |
| What is actually checked in CI? | [Repository workflow](.github/workflows/gates.yml), with pinned runtime versions and named checks. |

## Run locally

The basic detector checks require Node.js and no package installation.

```text
git clone https://github.com/JakeTOpenSource/Resilience-Ledger.git
cd Resilience-Ledger
node tracer-corpus.js
node gapcheck-corpus.js
node continuity-audit-corpus.js
```

Run the CLI against a local file:

```text
node delta-atlas-cli.js trace mytrace.txt --json
node delta-atlas-cli.js gapcheck myplan.txt --json
```

Exit codes are `0` for no flags, `1` for flags, and `2` for a usage or load error. These are detector outcomes, not safety certificates.

For the browser tools, download the repository and open `index.html` or a tool page. [README-Portability.md](README-Portability.md) explains file-access restrictions, optional assets, offline caching, and which views need more. The [governance documentation](governance/README.md) and [STP reproduction instructions](research/stp-v1.2/README.md) cover their additional checks and prerequisites.

## Data status: visible disagreement

The declared candidate input, [terms.enriched.json](terms.enriched.json), contains **439 terms**, all carrying a stored `reviewed` label. That label is not a receipt proving who reviewed a definition, when, against which exact source, or whether it is semantically correct.

Ask, Explore, and the Curation dashboard retain **435-term projections: 177 reviewed and 258 candidate**. Gap Check retains 433 terms. These are different snapshots, not interchangeable counts of verified knowledge.

The [data-sync baseline](governance/contracts/atlas-data-sync-baseline.md) records missing IDs, status mismatches, source differences, and the smaller Canon projection. Its current decision is `DEFER`. A passing baseline check preserves that recorded disagreement; it does not reconcile or accept the content.

## Related projects

| Project | What to review |
|---|---|
| [Clutch](https://github.com/JakeTOpenSource/clutch-skill) | A separate human-approved task-routing protocol, canonical skill, deterministic reducers, adversarial fixtures, and release package. Version 0.4.0-rc.1 is a research preview in `PREPARE_ONLY`; publication does not activate routing. |
| [The Stable](https://github.com/JakeTOpenSource/the-stable) | Agent-calibration instruments, recorded plans, replay tools, and retained failed hypotheses. [Start with its findings](https://github.com/JakeTOpenSource/the-stable/blob/main/FINDINGS.md). |
| [The Crosswalk](https://github.com/JakeTOpenSource/the-crosswalk) | Static decision aids for deciding whether to code, learn, direct AI, or hire. |
| [typed-refusal-harness](https://github.com/JakeTOpenSource/typed-refusal-harness) | Aggregate experiment counts and an attribution audit. The original model harness is not published there. |

GroundingHarness and AI-Governance-Ledger are historical project names; this repository is the current home.

## Research and evidence boundaries

The [STP v1.2 packet](research/stp-v1.2/README.md) is proposed research containing public sources, schemas, synthetic fixtures, and JavaScript/Python reducers. Agreement on its enumerated cases does not establish live calibration or general reliability.

The paper *From Model Output to Accepted State* remains in owner review: [PR #15 contains the v4 candidate](https://github.com/JakeTOpenSource/Resilience-Ledger/pull/15), and [PR #14 retains v3](https://github.com/JakeTOpenSource/Resilience-Ledger/pull/14). Neither is merged. Passing a release verifier checks the stated artifacts; it is not peer review or acceptance of every claim.

The [power-witness studies](rung3-power-experiment/README.md) are an experimental side project. Power telemetry can characterize activity under a defined measurement setup; it does not establish useful work, authorship, or truth.

For the method, read [White-Paper.html](White-Paper.html), [Coherence-Ledger-Method.md](Coherence-Ledger-Method.md), and the [recorded adversarial review](Red-Team-Report.md). Sources and borrowed ideas remain attributed in the relevant documents.

[`Six-Signal-Method.html`](Six-Signal-Method.html) explains six evidence categories and what each can establish. The pinned, read-only snapshot packet in [`research/atlas-snapshot-read-only/`](research/atlas-snapshot-read-only/) preserves a dated observation; it is not a live system assessment.

## Privacy and operation

The analysis tools run locally in the browser and do not send submitted tool text to a model or API. The hosted site still makes ordinary page requests, and Cloudflare may collect visit and page-performance telemetry.

Local overlay filenames are ignored by default. This reduces accidental inclusion of untracked files; it does not prevent forced adds, previously tracked files, or renamed copies. Review the staged diff before publishing. See [README-Portability.md](README-Portability.md) for the operating boundaries.

Repository checks do not establish which exact files a live deployment is currently serving. Deployment receipts are dated observations with their own evidence boundaries.

## License and credit

The content, data, tools, and documentation in this repository are **CC BY 4.0**, as stated in [LICENSE.txt](LICENSE.txt). Credit Jake Tiller and Delta Atlas / Resilience Ledger, link to the license, and indicate changes. [CITATION.cff](CITATION.cff) supplies citation metadata.

This is independent educational research, with no affiliation with or endorsement by the organizations it cites. AI assistance is part of the development history; the code, sources, tests, limitations, and recorded corrections are the basis for review.
