# Instrumented Transition and Survivability Profile

Status: **PROPOSED**

Short name: ITSP

Scope: WP6 synthetic conformance packet for STP v1.2 candidate review

This profile does not accept STP v1.2, authorize a live instrument, establish a
statistical reliability claim, or permit private-data egress. It adds the
minimum executable layer needed to distinguish legal state change, observed
null, absent measurement, invasive sensing, bounded recoverability, and
resource-bounded evidence acquisition.

## 1. Dependency hardening

An instrument or survivability result is ineligible unless its input instance
passes a pinned JSON Schema Draft 2020-12 validator. The validator executes the
schema; the presence of a `$schema` declaration alone is not evidence of
conformance.

Effect traces use contiguous assigned sequence plus an explicit predecessor.
Every event is bound to one effect identity, idempotency key, policy generation,
and legal lifecycle transition. Observation before dispatch, cross-effect
observation, lifecycle regression, failed preconditions, broken sequence, and
malformed lane vectors fail closed.

Instrument fixture events additionally carry a payload digest and prior digest.
Duplicate event IDs, payload substitution, or a broken digest chain fail. The
digest algorithm is deliberately fixture-scoped while the repository's
canonical-JSON conformance gap remains open; Git-anchored checkpoints protect
declared historical prefixes. Neither mechanism proves event truth, and neither
is a substitute for a signed external witness.

Duplicate dispatch within a declared retention interval is not automatically
called deduplicated. It remains `DUPLICATE_SUPPRESSION_UNVERIFIED` until a
qualified `DEDUPE_CONFIRM` receipt is present.

## 2. Compatible state relation

For state `s`, instrument `i`, policy `P`, and finite recovery horizon `H`, the
candidate relation is:

`Compatible_P(s, i) := Legal_P(s) and Guard_i(s) and Authority_i(s) and Budget_i(s) and Observable_i(s) and Recoverable_H(s, i)`

`Recoverable_H` is required only when the policy marks the instrument or state
as consequential. Each conjunct is evaluated separately. An unresolved
conjunct makes compatibility `UNKNOWN`; it cannot be averaged away.

The state model declares legal, safe, and essential-function predicates
independently. A legal state may still be unsafe. A safe state may still lack
an essential function. A reducer must reject an event whose before/after state
pair is not an allowed instrument transition.

W3C SCXML supplies prior art for legal state configurations and defined event
transition semantics [S-WP6-04]. ITSP does not adopt SCXML executable content,
authority, or external-effect semantics.

## 3. Typed intervention instrument

Each instrument profile declares:

- stable instrument ID and version;
- subject type and allowed states;
- input/result schema references and units;
- state read set, state write set, external-effect footprint, and sensing-effect
  footprint;
- consequence class and authority requirement;
- measurement procedure, measurand, resolution, dead band, detection limit,
  response window, operating conditions, calibration reference, and domain-null
  policy;
- hard resource ceilings; and
- access class, egress permission, and maximum egress bytes.

The lifecycle is:

`PLAN -> AUTHORIZE? -> INVOKE -> COMMIT -> SENSING_EFFECT? -> OBSERVE -> SETTLE`

The optional phases are optional only when the pinned instrument profile says
they are not required. A confirmed invocation proves that the harness recorded
an invocation inside its declared trust boundary. It does not by itself prove
human intent, external effect, or state settlement.

A present observation binds the declared procedure, result schema, unit, and
calibration reference and carries separate result-validation, calibration, and
operating-condition receipts. In the synthetic harness those receipts are
fixture inputs. A live adapter must independently resolve and qualify their
evidence references; self-asserted `PASS` is not admissible live evidence.

The Joint Committee for Guides in Metrology distinguishes indication,
measurement result, calibration, resolution, discrimination threshold, and
step response time [S-WP6-02]. ITSP adapts that vocabulary to software
instruments without claiming metrological traceability to physical SI units.

## 4. Observation presence algebra

An observation has exactly one presence class:

| Presence | Required interpretation |
|---|---|
| `PRESENT / DOMAIN_VALUE` | A non-null domain value was returned. |
| `PRESENT / DOMAIN_NULL` | The domain explicitly returned null; the `value` member is present and equal to JSON `null`. |
| `PRESENT / NO_CHANGE_DETECTED` | No change was detected within a declared resolution and observation window. This is not a universal no-effect claim. |
| `ABSENT` | No result value is available; an explicit reason is required. |
| `CENSORED` | The observation window or traversal bound ended before the target event was fully resolved. |

JSON Schema distinguishes a present null from an absent property [S-WP6-01].
FHIR Observation provides cross-domain prior art for an explicit missing-value
reason [S-WP6-03]; ITSP does not adopt the clinical FHIR information model.

A "real click" therefore becomes a confirmed `INVOKE`/`COMMIT` receipt plus an
independent observation envelope. If the response domain genuinely contains
null, the result is `PRESENT / DOMAIN_NULL`. If the response never arrived, it
is `ABSENT / TIMEOUT`. If no state change was detected, it is
`PRESENT / NO_CHANGE_DETECTED` with a resolution and window.

## 5. Invasive sensing

Sensing is not presumed passive. Any instrument with a non-empty
`sensing_effect_footprint` must emit a `SENSING_EFFECT` receipt or bind its
observation to a qualified sensing-effect receipt. Missing self-effect evidence
is `FAIL / SENSING_EFFECT_UNRECORDED`.

In the fixture profile, the receipt is hash-chained into the same instrument
stream, repeats the exact declared footprint, and the observation references
that receipt's event ID. An arbitrary, foreign, missing, or footprint-mismatched
reference fails. `RECORDED` means the harness recorded the claimed effect
envelope; it does not prove the physical effect occurred.

Resolution and discrimination threshold can depend on noise and friction
[S-WP6-02]. Consequently, an apparent null or no-change result outside rated
operating conditions is `UNKNOWN`, not evidence of no effect.

## 6. Deterministic bounded survivability

The ordinary reliability or survival function is probabilistic:

`S(t) = Pr(T > t)`

It requires a declared population or stochastic model and correct handling of
censored data [S-WP6-06]. ITSP does not estimate `S(t)` from fixture success.

For a finite state model, declared disturbance alphabet `D`, causal fallback
policy `kappa`, and horizon `H`, the candidate deterministic claim is:

`Survive_H(s_0) := for every admissible disturbance trace d in D^H, every traversed state is legal and safe, every required essential function remains available, and the terminal state is in the declared recovery target set.`

Results are:

- `PASS / SURVIVAL_PROVEN_BOUNDED`: exhaustive traversal succeeded inside the
  exact finite model, horizon, controller, disturbance set, and bounds;
- `FAIL / SURVIVAL_FALSIFIED`: a counterexample reached an unsafe state or lost
  an essential function; or
- `UNKNOWN`: the model is invalid, recovery is not established, or a traversal
  ceiling was reached.

NASA runtime-assurance work supports separating an advanced function from a
monitor, switching logic, and fallback [existing source
`urn:delta-atlas:source:nasa-runtime-assurance-2024`]. It does not establish an
ITSP survivability proof. TLA+ TLC provides established explicit-state
safety/liveness tooling for a later formalization stage [S-WP6-05].

## 7. Resource-bounded evidence acquisition

Tool use is eligible only when a required check lacks fresh decisive evidence:

`Needed(q) := Required(q) and not FreshDecisiveEvidence(q)`

`Eligible(i, q, s) := Measures(i, q) and Compatible_P(s, i) and Authorized(i) and Cost(i) <= Budget`

The canonical cost is a vector, not a weighted health score:

`C(i) = (irreversibility, egress_bytes, invasiveness, external_tool_calls, local_tool_calls, bytes_read, token_ceiling, wall_time_ms)`

The fixture policy uses the displayed lexicographic order. A deployment may
pin another order, but it must not silently change it. When evidence is already
decisive, the result is `EVIDENCE_ALREADY_DECISIVE` and no instrument is
selected. When no eligible instrument fits the hard budget, the check remains
`UNKNOWN / RESOURCE_BOUND`.

Each candidate also requires instrument-specific guard, authority,
observability, and recoverability assessments. Consequence-class permission is
only a coarse ceiling. A consequential instrument with unresolved recovery is
not selected, and an egress/resource declaration that contradicts the privacy
profile makes the instrument contract invalid.

Tokens and tool calls are execution resources only. They do not affect neutral
confidence, truth, conformance, or calibration.

## 8. Capacity correction

Each downstream lane now has its own observed arrival series:

`B_x[k+1] = max(0, B_x[k] + A_x[k] - S_x[k])`

`A_x`, `B_x`, and `S_x` must use the same unit within lane `x`. Array lengths,
finite non-negative values, and declared buffers are validated before the
recurrence runs. Observation, settlement, and recovery remain separate; one
lane cannot hide another.

## 9. Conformance and claim ceiling

JavaScript and Python independently evaluate the same synthetic cases. The
packet includes present null, absent response, bounded no-change, invasive
sensing, incompatible state, bounded recovery, counterexample, traversal
exhaustion, no-tool-needed, least-cost local selection, resource exhaustion,
unauthorized invasiveness, payload tampering, duplicate IDs, forged sensing
references, unresolved operating conditions and recovery, undefined control,
undeclared effects, subject mismatch, and contradictory egress declarations.

These fixtures prove only reference-implementation agreement for enumerated
synthetic records. They do not prove a live instrument is calibrated, a human
performed an action, every disturbance is modeled, statistical reliability,
unbounded liveness, physical safety, or semantic truth.

## Source identifiers

- `[S-WP6-01]` `urn:delta-atlas:source:json-schema-null-required-2020-12`
- `[S-WP6-02]` `urn:delta-atlas:source:jcgm-vim3-measurement-2012`
- `[S-WP6-03]` `urn:delta-atlas:source:hl7-fhir-r4-observation-2019`
- `[S-WP6-04]` `urn:delta-atlas:source:w3c-scxml-1.0-2015`
- `[S-WP6-05]` `urn:delta-atlas:source:tla-tools-state-exploration-2022`
- `[S-WP6-06]` `urn:delta-atlas:source:nist-reliability-survival-censoring`
- `[S-WP6-07]` `urn:delta-atlas:source:ajv-8.20.0`
