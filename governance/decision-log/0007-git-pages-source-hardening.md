# Decision 0007: Git-Pages source hardening and historical verification

**Date:** 2026-08-13

**Decision:** ACCEPT_WITH_LIMITS

**Consequence class:** C2

**Authorization evidence:** the repository owner requires append-only handling
for load-bearing files, and authorized continuing the workflow after merging
public PR6

**Cryptographic signature:** not present

## Accepted lifecycle correction

Preserve `research/atlas-snapshot-read-only/release-manifest.json` v2 byte for
byte. Preserve Decisions 0005 and 0006, governance events 000004 and 000005,
and checkpoints 000005 and 000006. They remain the accepted evidence for PR6.

Add `research/atlas-snapshot-read-only/release-history-pr6.v1.json` as a new,
immutable historical-verification profile. It pins the accepted PR6 base,
head, merge, merge-parent order, exact diff, release-manifest digest, event,
checkpoint, and release file paths. Update the verifier to read historical
bytes from the pinned Git objects. It must not compare the current worktree or
an unrelated future pull request with PR6's one-time allowlist.

This change corrects verifier lifecycle only. It does not modify the accepted
PR6 release, authorize arbitrary future changes, or weaken privacy, regular-file,
source-card, event, checkpoint, and tamper verification.

Apply the same lifecycle rule to
`governance/governance-validate.js`: the accepted 2026-08-11 production
observation names repository commit `7608ce90eb83357e7e9edddb6d0fb80c70b30369`,
so its recorded `index.html` and `sw.js` hashes must be checked against those
pinned Git objects. Future worktree edits must not rewrite or invalidate that
historical observation. The receipt and its `DEFER` decision remain unchanged.

## Accepted source hardening

Accept this bounded repository pull request's source hardening:

- expose the already-public Six-Signal method through visible navigation;
- restrict iframe navigation to an exact route allowlist and bind accessible
  titles to those allowed routes;
- extend the method's security headers to its extensionless Pages route;
- advance the service-worker cache version and include the method once in its
  offline core;
- apply the existing site-wide canonical typography baseline to the method;
- strengthen the deterministic surface harness with adversarial routing,
  header, and cache canaries.

The accepted source files are `Six-Signal-Method.html`, `_headers`, `index.html`, `sw.js`,
`governance/governance-validate.js`,
`governance/harnesses/verify-six-signal-surface.js`, the new history profile,
and the revised historical verifier. Their exact normalized SHA-256 identities
are recorded in governance event 000006 and sealed by checkpoint 000007.

Git-connected `main` auto-deploy is observed operational context. This record
authorizes the public, simplified, bounded repository pull request. A branch
push or public draft pull request may cause a public Pages preview, but this
pre-push record does not claim that a preview or deployment occurred. Production
remains untouched until the owner merges to `main`; that merge is the
consequential production action. Post-merge production identity remains
`NOT_OBSERVED` until a separate observation checks it.

## Append-only event semantics

The authorization event records `ACCEPT_WITH_LIMITS` with an empty
`correction_of` set. It accepts a new verifier profile; it does not claim that
event 000005 or its accepted PR6 byte binding was false. A `CORRECT` event
would require naming the erroneous accepted event and would contradict the
preservation boundary above.

## Limits

This decision establishes deterministic verification of historical PR6 bytes,
the repository side of the existing deployment observation, and the exact
bounded source-hardening proposal. It does not establish current deployment
identity, production equivalence, current repository health, external
witnessing, semantic truth, or a successful deployment outcome.
