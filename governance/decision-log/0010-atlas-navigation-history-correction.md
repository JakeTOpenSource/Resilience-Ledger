# Decision 0010: Atlas navigation-history correction

Date: 2026-08-13
Authority: repository owner authorization for the Atlas repair program
Decision: **ACCEPT_WITH_LIMITS**
Consequence class: C2

## Observation

On the Git-connected draft preview for commit
`2a9e5f30451b1e5f3ac0c3cf86f9c4e5f96fa425`, a fresh Chrome sequence of
Home → Gap Check → Priority Tracer → Back remained on Priority Tracer. A second
Back reached Gap Check. The top-level shell wrote a `pushState` entry while the
same-origin iframe assignment also added a child browsing-context entry to the
joint session history.

## Accepted correction

- Keep the fixed same-origin route allowlist.
- Replace child-frame locations with `Location.replace` so child rendering does
  not add a second Back step.
- Preserve one top-level `pushState` for each explicit user route change.
- Reject an explicit navigation before changing the child or presentation when
  the parent history write fails.
- Preflight the child replacement surface before writing parent history. If the
  child replacement still fails after that write, leave presentation unchanged,
  request one best-effort `history.back()` recovery, and record that parent and
  child histories are not an atomic transaction.
- Keep `popstate` rendering read-only with respect to parent history.
- Replace hidden main and glossary child documents with `about:blank` before
  presenting them as cleared.
- Fail closed if the replacement surface is unavailable.
- Add an offline VM harness and ten mutation canaries across the main,
  glossary-result, and opt-in sample frames, then verify the behavior
  again in a new immutable Pages preview before any merge.

## Limits

This accepts a source correction for draft review. It does not establish the
new browser outcome until a preview built from the correction commit is
observed. It does not authorize an agent merge or production deployment, prove
every browser or installed-PWA state, add cross-origin navigation support, or
guarantee atomic recovery from a post-write child-navigation race, or certify
privacy, accessibility, security, or live health. Owner merge remains
required.
