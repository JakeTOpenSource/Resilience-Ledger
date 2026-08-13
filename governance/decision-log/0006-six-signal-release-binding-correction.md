# Decision 0006: Correct the Six-Signal release binding

**Date:** 2026-08-12

**Decision:** CORRECT

**Consequence class:** C2

**Authorization evidence:** Decision 0005 authorized an exact public set, and
the pre-publication red team found that the first verifier bound only the
three-file reproduction-card package while the educational page, headers,
README discovery text, and verification hooks remained token-checked but not
byte-bound

**Cryptographic signature:** not present

## Correction

Preserve Decision 0005, authorization event 000004, and checkpoint 000005 as
append-only evidence of the rejected first binding. They are not silently
rewritten.

The owner accepts `research/atlas-snapshot-read-only/release-manifest.json` v2
as the corrected payload allowlist. It binds the exact normalized bytes of:

- the educational Six-Signal page and route-scoped headers;
- the README discovery surface;
- the public card, explanation, and verifier;
- the governance harness and its registration; and
- the CI verification step.

The manifest itself is bound by correction event 000005. Checkpoint 000006
seals that event and the unchanged prior history. The verifier must recompute
both bindings, enforce the complete claim ceiling, reject package symlinks and
unlisted entries, compare the entire pull-request delta with the nine payload
files plus the seven authorized manifest/governance records, and prove
in-memory tamper canaries for the page, headers, and README.

## Boundaries unchanged

This is an integrity correction, not a broader publication decision. All
privacy exclusions, rights and processor limits, claim ceilings, protected-PR
requirements, and the prohibition on Cloudflare deployment in Decision 0005
remain in force.

The correction does not establish current repository or deployment identity,
semantic truth, independent reproduction, privacy certification, calibration,
live system health, protocol acceptance, or authority for an effect. The
existing production receipt remains `DEFER`.
