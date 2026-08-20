# Claim and reuse boundaries

This file is load-bearing. A result copied from this packet should retain the relevant boundary.

## What the checks establish

- The files match the byte lengths and SHA-256 digests in `release-manifest.json`.
- The retained JSON reports parse and remain byte-identical to the audited local outputs.
- The paper outputs passed the local structure, visual, and privacy checks recorded in `evidence/RELEASE-BUILD-RECEIPT-000004.md`. The dependency-bearing validator used for those preparation checks is not included in this zero-dependency public packet.
- The finite fixture results are exact for the frozen records, events, queries, candidate fields, equality rules, and implementations named in their reports.
- `evidence/editorial-review/PUBLIC-DISPOSITION.md` records the owner's minimized editorial decisions and the supplied private source's byte identity. It does not authenticate the reviewer attribution or promote review assertions into evidence.

## What the checks do not establish

- scientific peer review, independent replication, mathematical novelty, or publication acceptance;
- truth of source assertions, trusted time, authorship identity, causal validity, or authority;
- production safety, security, privacy compliance, legal compliance, or fitness for a particular deployment;
- a universal minimal state, universal proof canonicalizer, optimal policy, or complete literature review;
- that a probability forecast is an outcome, that one resolved case establishes calibration, or that agent agreement is evidence of external truth;
- that requested model labels in the frozen-oracle packet attest the runtime model, seed, sampling process, or independence of the responses;
- that the private editorial review is evidence, authorship, peer review, source truth, or independent validation.
- that retained-source IDs expose or reproduce the corresponding private bytes.

## Vocabulary crosswalk

- **Output**: a produced representation awaiting qualification. It is not yet an outcome.
- **Outcome**: a later qualified observation about what occurred under a declared resolution rule.
- **UNRESOLVED**: a condition result in the paper. It does not silently become PASS.
- **HOLD**: a proposed operational disposition for unresolved required conditions.
- **Frozen-oracle packet**: BP-001, whose oracle and semantic rubric were fixed before collection and withheld from responders. The legacy `evidence/blind-prompt/` path is retained for receipt continuity. The term does not imply blinded assignment or blinded assessment.
- **BLOCK**: the execution result tested for BP-001's frozen `HOLD` value. BP-001 did not itself test the paper's `UNRESOLVED -> HOLD` crosswalk.
- **Accepted state**: the projection produced by the declared reducer from accepted events under pinned policy. It is not the entire world state.

## Publication boundary

This directory is prepared for a draft pull request. A draft PR, branch, commit, or passing verifier does not authorize merge, release tagging, DOI registration, deployment, or a claim that the owner has accepted every semantic mapping.

The private editorial review and its locator remain outside the public packet.
Only the minimized owner disposition is authorized for this review surface.
Absolute local-machine paths, attachment locators, workspace-only paths, raw review
text, and private prompt responses are outside the publication boundary.
