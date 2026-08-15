# Claim and reuse boundaries

This file is load-bearing. A result copied from this packet should retain the relevant boundary.

## What the checks establish

- The files match the byte lengths and SHA-256 digests in `release-manifest.json`.
- The retained JSON reports parse and remain byte-identical to the audited local outputs.
- The paper outputs passed the local structure checks recorded in `evidence/RELEASE-BUILD-RECEIPT-000001.md`. The dependency-bearing validator used for that preparation check is not included in this zero-dependency public packet.
- The finite fixture results are exact for the frozen records, events, queries, candidate fields, equality rules, and implementations named in their reports.

## What the checks do not establish

- scientific peer review, independent replication, mathematical novelty, or publication acceptance;
- truth of source assertions, trusted time, authorship identity, causal validity, or authority;
- production safety, security, privacy compliance, legal compliance, or fitness for a particular deployment;
- a universal minimal state, universal proof canonicalizer, optimal policy, or complete literature review;
- that a probability forecast is an outcome, that one resolved case establishes calibration, or that agent agreement is evidence of external truth;
- that requested model labels in the blind-prompt packet attest the runtime model, seed, sampling process, or independence of the responses.

## Vocabulary crosswalk

- **Output**: a produced representation awaiting qualification. It is not yet an outcome.
- **Outcome**: a later qualified observation about what occurred under a declared resolution rule.
- **UNRESOLVED**: a condition result in the paper. It does not silently become PASS.
- **HOLD**: a proposed operational disposition for unresolved required conditions.
- **BLOCK**: the execution result tested for the blind prompt's frozen `HOLD` value. The blind test did not itself test the paper's `UNRESOLVED -> HOLD` crosswalk.
- **Accepted state**: the projection produced by the declared reducer from accepted events under pinned policy. It is not the entire world state.

## Publication boundary

This directory is prepared for a draft pull request. A draft PR, branch, commit, or passing verifier does not authorize merge, release tagging, DOI registration, deployment, or a claim that the owner has accepted every semantic mapping.
