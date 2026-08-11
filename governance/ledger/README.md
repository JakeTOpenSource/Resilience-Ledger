# Governance ledger

This is the append-only source of truth for load-bearing Delta Atlas records.
Events are immutable facts or decisions. Current authority maps, registers, and
deployment receipts are disposable projections rebuilt from those events.

The ledger separates evidence, authority, preparation, execution, observation,
acceptance, and outcome. A success in one axis never silently advances another.

## Storage rule

Each stream stores one event per file:

```text
events/<stream>/<six-digit-sequence>-<description>.json
```

After an event is accepted into the protected base branch, it is never edited,
renamed, or deleted. A mistake is handled with a new `CORRECT` event linked by
`correction_of`. A replacement decision uses `SUPERSEDE` and `supersedes`.

Sequence establishes stream order. Timestamps are evidence and may be unknown;
they are not used as a substitute for ordering. Every event seals its payload,
full envelope, previous stream event, authority basis, evidence references,
idempotency key, and intended read/write boundary.

Schemas and capability policies are versioned immutable files. A new policy is
added under a new versioned filename; checkpoints pin the policy bytes used to
authorize their event prefix.

## Projections

Run the Node replayer to verify committed projections:

```text
node governance/harnesses/replay.js --verify
```

Only an intentional ledger transition should regenerate them:

```text
node governance/harnesses/replay.js --write
```

The current generated paths are:

- `governance/authority-map.json`
- `governance/artifact-register.json`
- `governance/deployment-receipts/*.json`
- `governance/external-feedback.json`

These files are useful views, not independent authorities.

## Harnesses

`node governance/harnesses/run-all.js` runs:

- Git-base append-only history enforcement;
- envelope, hash-chain, cross-reference, and checkpoint verification;
- deterministic projection replay;
- public/private boundary scanning with leak canaries;
- role and consequence-class capability checks;
- deliberate corruption cases that the validator must reject; and
- independent Node and Python replay agreement.

Set `PYTHON` to an interpreter path when Python is not on `PATH`.

## Honest proof ceiling

The chain and checkpoint detect mutation relative to the accepted files. They
do not by themselves prove authorship or prevent a writer from replacing all
history. Protected branches, signed refs or attestations, and an independent
checkpoint witness remain required for stronger proof. The first checkpoint
therefore records its external witness as `NOT_OBSERVED`.

Private evidence never enters this public ledger as content, local paths, or
raw hashes. If a cross-boundary commitment becomes necessary, it requires a
separately approved opaque identifier or keyed commitment design.
