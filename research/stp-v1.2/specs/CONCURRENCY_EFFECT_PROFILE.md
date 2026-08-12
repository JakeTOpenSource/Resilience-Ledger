# Concurrency, effect, and capacity profile

Status: PROPOSED; synthetic conformance packet only

## Guarantee separation

This profile refuses to collapse five different claims:

1. `DETERMINISTIC_REPLAY`: one valid ordered stream produces one projection.
2. `SCHEDULE_EQUIVALENCE`: every permitted schedule produces an equivalent
   projection under a pinned equivalence profile.
3. `INVARIANT_SAFETY`: every accepted prefix and final state satisfies every
   declared invariant.
4. `EFFECT_SAFETY`: external effects have the permitted identity, cardinality,
   order, authority, and finality.
5. `LIVENESS_FAIRNESS`: admissible work progresses within declared bounds.

Passing one claim does not imply any other claim. Finite fixtures are evidence
about the enumerated cases, not a proof of global confluence or liveness.

## Batch contract

A concurrent batch binds every delta to one subject, policy ID, policy
generation, and causal frontier. Each delta declares read, predicate-read,
write, and external-effect footprints. Missing parents, mixed policies, unknown
versions, and undeclared footprints fail closed.

For a finite batch `B`, the reference harness enumerates every permutation
`sigma` of `B` and records:

`projection_class(sigma)`, `effect_trace_class(sigma)`, every refused delta, and
every invariant check at every prefix.

The batch is `COMMUTES` only when all permutations are valid, produce one
accepted-projection class, and produce one declared effect-trace class. A pair
may commute while a triple does not. Therefore pair tests are necessary but
not sufficient.

## Effect finality

The minimum finality vocabulary is `PREPARED`, `DISPATCHED`, `OBSERVED`,
`SETTLED`, `EFFECT_UNKNOWN`, `OBSERVATION_STALE`, `OBSERVATION_CONFLICT`,
`DUPLICATE_RISK`, `REFUSED`, and `COMPENSATED`.

A timeout after dispatch becomes `EFFECT_UNKNOWN`. It does not restore the
prior world. An authority revocation after dispatch cannot erase the dispatch.
Idempotency is bounded by an explicit retention horizon. A repeated key inside
that horizon remains `DUPLICATE_SUPPRESSION_UNVERIFIED` until a qualified
deduplication receipt exists; a repeated key beyond the horizon is
`DUPLICATE_RISK`.

## Capacity recurrence

For each downstream lane `x` in `{observation, settlement, recovery}`, let:

- `B_x[k]` be queued consequence work after step `k`, in one declared unit;
- `A_x[k]` be consequence work arriving at lane `x` during the step; and
- `S_x[k]` be verified service capacity during the step.

The harness computes the exact recurrence:

`B_x[k+1] = max(0, B_x[k] + A_x[k] - S_x[k])`.

Admission is blocked when any lane exceeds its declared buffer limit. Arrival,
backlog, and service values must be finite, non-negative, shape-compatible, and
expressed in the same lane unit. No cross-unit minimum or weighted composite is
canonical. A long-run inequality between average arrival and service rates is
not treated as a finite-horizon proof, especially under bursty,
non-stationary, or adversarial arrivals.

## Non-monotone boundaries

Append-only evidence is monotone as a collection of records. Current authority,
unique winners, revocation, absence, freshness, and accepted-state projections
can be non-monotone. They may require coordination even when their input log is
append-only.

## Acceptance ceiling

The fixtures prove only that the JavaScript and Python reference
implementations return the same declared classifications for the synthetic
cases. They do not authorize live parallel effects, prove source claims, prove
termination, or accept this profile.
