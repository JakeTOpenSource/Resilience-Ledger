# STP v1.2 candidate: public reproduction packet

**Protocol status:** PROPOSED

**Release status:** OWNER-AUTHORIZED, ACCEPT_WITH_LIMITS

This is a deliberately minimized, public, executable slice of the State
Transition Protocol v1.2 research. It makes the current instrumented-transition,
bounded-survivability, concurrency, effect-finality, and resource-economy
claims reproducible without publishing private research inputs or development
history.

It is not the complete STP v1.2 draft. It does not supersede STP v1.1, authorize
a live tool, prove that an external event occurred, establish statistical
reliability, or claim unbounded safety or liveness.

## What is here

- `specs/` contains the proposed behavior and claim ceilings.
- `schemas/` contains pinned JSON Schema Draft 2020-12 contracts.
- `fixtures/` contains invented, synthetic cases only.
- `tools/` contains independent JavaScript and Python reducers plus validators.
- `sources.json` identifies the public primary sources used by this packet.
- `release-manifest.json` is the exact public file allowlist and digest set.

No local paths, prompts, transcripts, credentials, private source code, private
artifact bytes, private artifact digests, or private repository identifiers are
part of this packet.

## Reproduce the result

Requirements: Node.js 22.17.1 and Python 3.12.10. From this directory:

```text
npm ci
npm test
```

The test fails unless all of these conditions hold:

1. every fixture and embedded instrument/event instance satisfies its pinned
   schema;
2. JavaScript and Python return byte-equivalent canonical result projections;
3. every expected synthetic classification matches;
4. deliberate schema-invalid mutations are rejected;
5. the release directory contains exactly the manifest allowlist;
6. every normalized file digest matches the manifest; and
7. the public-boundary scanner finds no forbidden path or credential pattern.

## Neutral result model

The packet does not ask a model to infer a confidence number. It evaluates
declared state and function predicates and returns typed `PASS`, `FAIL`, or
`UNKNOWN` results with stable reason codes. Measurement presence, calibration,
operating conditions, authority, recovery, privacy, and resource eligibility
remain separate inputs. An unresolved input is not averaged into a score.

This is neutral only in that the reducer does not use model belief or a hidden
weighting function. The declared schemas, policies, fixtures, bounds, and
measurements still encode human choices and must be reviewed for each use.

## Claim ceiling

Passing the packet establishes only that the two reference implementations
agree on the enumerated synthetic cases under the committed schemas and
fixtures. It does not establish source truth, live calibration, independent
reproduction by another party, physical safety, semantic completeness,
statistical reliability, or fitness for a consequential deployment.

The repository governance ledger records the publication decision and the
manifest identity. Corrections must be additive; an accepted public record is
not silently rewritten.

## License

The repository's CC BY 4.0 license applies. Cite the repository and identify
changes when adapting this packet.
