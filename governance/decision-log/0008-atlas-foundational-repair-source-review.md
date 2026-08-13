# Decision 0008: Atlas foundational repair source review

**Date:** 2026-08-13

**Decision:** ACCEPT_WITH_LIMITS

**Consequence class:** C2

**Authorization evidence:** the authenticated repository owner approved the
bounded repair workflow, private evidence capture, implementation and testing,
and creation of a minimized public draft pull request

**Cryptographic signature:** not present

## Accepted source-review candidate

Accept commit `46a798fd104bdda0db1e2f219805a9ebf73a8c48`, tree
`467aff1b158ce865ca3d452cc514f03ed4952790`, as the exact source candidate for
public pull-request review. The candidate is derived from merge
`ee9a04b61950601f761912c8c9dd86761a77abf6`; its exact 31-path diff is recorded
in `governance/releases/atlas-foundational-repair.v1.json`.

The candidate:

- exposes current vocabulary-projection disagreements without deciding which
  meaning or review label is correct;
- adds a read-only candidate materializer with no write mode;
- replaces absolute privacy, review, truth, and offline claims with tested
  boundaries;
- keeps glossary input out of request URLs and uses a same-origin, typed,
  in-memory iframe handoff;
- bounds browser storage with types, expiry, one-use handling, caps, and a
  visible clearing control;
- changes the Continuity overlay from optional JavaScript execution to explicit
  data-only file selection and escapes hostile display fields;
- makes the service-worker core fail closed on a missing required asset;
- adds semantic landmarks, native controls, route history, route-preserving
  Share behavior, and an opt-in sample after the primary task; and
- adds primary-source mappings and deterministic data, runtime, home, security,
  and regression checks to CI.

The final red team found a local-overlay DOM-injection path. That path was fixed
before this decision: hostile markup is escaped before the finding render sink,
and the real parser and engine now exercise the attack in the runtime harness.

## Deliberate non-migration

The candidate does not rewrite the 433-, 435-, 439-, or 443-record vocabulary
projections into one silently chosen dataset. Source identity, inclusion,
status, field, and Canon selection policy remain a separate owner decision.
The legacy `reviewed` token remains a repository label, not a receipt or an STP
acceptance state.

## Evidence and limits

The repository governance suite, deterministic corpora, independent
JavaScript/Python replay, theme gate, STP v1.2 reproduction packet, local
browser navigation/query checks, privacy scan, and three independent focused
red-team reviews passed on the recorded candidate.

Performance metrics remain `NOT_OBSERVED` because the required trace-capable
tool was unavailable. Source checks do not prove Cloudflare preview behavior,
production identity, global edge convergence, an installed service-worker
cache, universal accessibility, privacy certification, semantic truth, or live
system health.

This decision authorizes a public draft pull request for review. It does not
authorize an agent to merge it. The configured production branch is `main`, so
owner merge remains the consequential production action and requires a
separate post-merge deployment observation.
