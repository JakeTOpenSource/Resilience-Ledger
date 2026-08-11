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

Sequence establishes stream order. Cross-stream parents, supersession links,
and correction links establish causal precedence. Replay uses a stable
topological order with stream, sequence, and event identity only as the tie
breaker between concurrently ready events. Timestamps are evidence and may be
unknown; they are never ordering authority. Every event seals its payload,
full envelope, previous stream event, authority basis, evidence references,
idempotency key, and intended read/write boundary.

Schemas and capability policies are versioned immutable files. Schema v1 is a
frozen legacy adapter vocabulary and is not an alias of State Transition
Protocol v1.1. Schema v2 pins the literal STP v1.1 page 8 status tokens, while
the missing transition semantics and conformance profile remain deferred. A
new policy is added under a new versioned filename; checkpoints pin every
policy needed to authorize their event inventory.

Repository text, event-file, and policy digests normalize CRLF to LF before
hashing. This binds the committed content without making verification depend on
the checkout platform's line-ending configuration.

The event canonicalization profile permits safe integers only, ASCII object
keys, and Unicode scalar string values. This deliberately narrow domain keeps
the zero-dependency Node and Python encoders byte-equivalent; floats, oversized
integers, and unpaired Unicode surrogates are rejected instead of guessed.

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
- `governance/status-vocabulary-contract.json`

These files are useful views, not independent authorities.

## Harnesses

`node governance/harnesses/run-all.js` runs:

- Git-base append-only history enforcement;
- schema/runtime vocabulary agreement;
- envelope, hash-chain, cross-reference, and checkpoint verification;
- deterministic projection replay;
- public/private boundary scanning with leak canaries;
- role and consequence-class capability checks, including digest-pinned
  authority and recovery-reference resolution;
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
