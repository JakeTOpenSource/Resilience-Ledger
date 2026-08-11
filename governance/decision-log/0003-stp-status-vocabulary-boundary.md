# Decision 0003: STP status vocabulary boundary

**Date:** 2026-08-11

**Decision:** DEFER semantic aliases; pin literal STP v1.1 status tokens for v2

**Consequence class:** C2

**Authorization evidence:** the repository owner directed repair of the
verified vocabulary and deterministic-replay blockers

**Cryptographic signature:** not present

## Observation

Ledger event schema v1 uses the seven State Transition Protocol axis names but
substitutes a different value system. For example, v1 uses `VERIFIED`,
`AUTHORIZED`, `PASS`, `OBSERVED`, and `ACCEPT`; STP v1.1 page 8 uses
`SUPPORTED`, `APPROVED`, `READY`, `MATCHED`, and `ACCEPTED` on the corresponding
axes. The attached Calibration Ledger is a different candidate artifact and has
another status model.

## Decision

1. Existing schema v1 events remain immutable and valid only as
   `delta-atlas-legacy-adapter-v1` records.
2. No v1 status token is declared an alias of an STP or Calibration Ledger
   token.
3. Schema v2 pins the literal STP v1.1 page 8 status tokens under the namespace
   `stp-v1.1-status-axes`.
4. Literal token reuse does not supply the missing entry predicates, transition
   rules, precedence, timing, or conformance profile. Those semantics remain
   unresolved and the migration decision remains `DEFER`.
5. Presentation code must qualify every status by axis and vocabulary. It may
   not coerce a v1 `PASS`-like value into an STP value.

## Acceptance boundary

This decision accepts a versioned type boundary, not semantic equivalence and
not protocol conformance. A future mapping may use only `ALIAS`, `OVERLAP`,
`RELATED`, `CONTESTED`, or `UNKNOWN`; `ALIAS` requires a scoped signature and
behavioral equivalence proof.
