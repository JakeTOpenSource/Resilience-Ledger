# Decision 0001: Work Packet 0 authority freeze

**Date:** 2026-08-11

**Decision:** ACCEPT_WITH_LIMITS

**Consequence class:** C1 for repository records; C2 for future publication or production changes

**Authorization evidence:** the authenticated repository owner directed Codex to proceed with Work Packet 0

**Cryptographic signature:** not present

## Proposal

Turn the read-only Delta Atlas audit into a versioned authority map, artifact
register, private/public handling policy, and current production receipt before
reorganizing files or adding agent orchestration.

## Observed evidence

- `JakeTOpenSource/Resilience-Ledger` contains the public Delta Atlas source and
  its deterministic tools.
- `JakeTOpenSource/Resilience-Ledger-archive` is private and older at the
  inspected head. It contains no private-only paths at that head, but shared
  files and history differ.
- The current Cloudflare Pages project has no connected Git source. Its latest
  production deployment reports an ad hoc trigger and an empty commit hash.
  That deployment completed about ten minutes before the current `main` commit
  was created, so the current commit cannot be its recorded source.
- The live deployment returned all 102 deployable public paths, but
  `index.html` and `sw.js` differ semantically from repository main.
- The protocol asserts a Calibration Ledger v8 SHA-256 that does not match the
  attached ledger. A bounded exact-hash search of 452 files found no match and
  produced no read errors.

## Decisions

1. `JakeTOpenSource/Resilience-Ledger@main` is the canonical source for the
   intended public Delta Atlas site.
2. The current Cloudflare deployment is an observed runtime state, not source
   authority and not accepted as equivalent to main while drift remains.
3. State Transition Protocol v1.1 is accepted with limits as the transition
   method for subsequent work.
4. The Calibration Ledger v8 pin is DEFERRED and UNVERIFIED. No candidate file
   is silently substituted for it.
5. The private archive is frozen and non-authoritative. It is neither deleted
   nor used for active development until a new owner decision defines its
   retention purpose.
6. The data-classification policy in this directory is the operational privacy
   floor. Contractual, legal, retention, and jurisdiction requirements remain
   UNKNOWN.
7. Agents and CI are adapters, not authorities. Production write access is not
   granted by this decision.

## Limits

- This decision does not deploy, publish the attached research artifacts,
  change repository visibility, alter branch protection, or delete history.
- Owner direction is recorded but not cryptographically signed.
- It does not resolve who produced the 74 historical Pages deployments.
- It does not establish L2 or L3 conformance.

## Supersession triggers

Create a linked decision when any of the following occurs:

- the exact pinned ledger artifact is found;
- the protocol release pin is amended;
- the production deployment is reconciled with a commit manifest;
- the private archive receives a retention/disposal decision;
- contractual data-processing requirements are established;
- another repository or account is proposed as authoritative.
