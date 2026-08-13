# Pinned Snapshot Card

This is a small public example of a larger rule: **bind an evaluation to exact
source bytes before interpreting those bytes**.

The card selects seven files that were already public in this repository at
commit `9802e5460248c69d2b08049182a36994f9a660e0`. For each file it records:

- the repository-relative path;
- the Git blob object ID;
- the SHA-256 digest of the raw Git blob bytes; and
- the raw byte length.

No selected source bytes are copied into this package. The verifier obtains
them from the named commit already present in the local Git object database.
It performs no network request.

## Why this exists

A changing repository and a deployed website are different things. “The file
I can see now” is not a stable input. A pinned snapshot makes the input
repeatable while keeping the distinction explicit:

- **pinned** means the card names immutable Git objects;
- **read-only** means verification does not change source or accepted state;
- **non-live** means the card says nothing about current production; and
- **UNKNOWN** remains the result when evidence needed for a later question is
  absent. A missing observation is not a measured null.

This package does not publish a private evaluation of these files. It publishes
only a reproduction card and the mechanics needed to falsify the recorded byte
identities.

## Reproduce

From the repository root, with Node.js and Git available:

```text
node research/atlas-snapshot-read-only/tools/verify-release.mjs
```

The verifier checks the package allowlist, privacy boundary, card structure,
seven Git object IDs, seven SHA-256 digests, and seven byte lengths. It fails
closed on an unlisted package file, altered package byte, missing Git object,
duplicate selected path, or source-byte mismatch.

The broader public repository checks remain:

```text
node governance/governance-validate.js
node governance/harnesses/run-all.js
```

## Six signals, not one score

The companion `Six-Signal-Method.html` explains why an implementation should
keep Calibration, Consequence, Evidence, Integrity, Privacy, and Activity
separate. This card establishes only a narrow **integrity input**: the selected
public bytes match their recorded identities. It does not output any of the six
signals.

## Claim ceiling

Passing the verifier establishes only that the named public Git objects can be
found locally and match the byte identities recorded here. It does **not**
establish:

- that the files are current or equivalent to a deployment;
- that their statements are true, accepted, authoritative, or complete;
- that a private analysis was independently reproduced;
- privacy, safety, calibration, correctness, or live system health; or
- permission to deploy, mutate, publish additional data, or perform an action.

The card is `PROPOSED_REPRODUCTION_CARD`. The repository's existing production
receipt remains separate and unresolved; this package does not change it.
