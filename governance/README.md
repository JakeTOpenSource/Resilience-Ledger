# Governance records

This directory is the versioned authority and custody layer for Delta Atlas.
Its append-only [`ledger/`](ledger/) is the source of truth. The current
authority map, artifact register, feedback register, and deployment receipt
are generated projections. They record what is authoritative for a specific
scope, which evidence remains unresolved, how public and private material may
move, and what was actually observed.

These records do not turn an observation into acceptance. Evidence,
authority, execution, observation, acceptance, and outcome remain separate.

## Current records

- `authority-map.json` - scope-specific authority, public-metadata grant, and
  repository disposition.
- `artifact-register.json` - research artifact identities and unresolved pins.
- `external-feedback.json` - scoped public feedback observations whose
  validation and endorsement statuses remain independent.
- `status-vocabulary-contract.json` - the frozen legacy adapter vocabulary,
  literal STP v1.1 tokens, and explicit UNKNOWN cross-vocabulary relations.
- `data-classification.md` - public/private handling and egress rules.
- `decision-log/0001-work-packet-0-authority-freeze.md` - the owner-directed
  Work Packet 0 decision and its limits.
- `decision-log/0002-public-metadata-release-acceptance.md` - the owner's exact,
  bounded acceptance of metadata already public in repository history.
- `decision-log/0003-stp-status-vocabulary-boundary.md` - the v1/v2 namespace
  boundary and deferred semantic-migration decision.
- `decision-log/0004-stp-v1.2-public-reproduction-release.md` - the exact,
  privacy-minimized public release boundary for the executable candidate packet.
- `ledger/events/publication/000001-stp-v1-2-public-release-observed.json` - the
  post-merge observation binding the accepted manifest to public `main` and its
  passing protected-branch check, without promoting research outcome.
- `deployment-receipts/2026-08-11-current-production.json` - the historical
  read-only Cloudflare Pages observation captured on 2026-08-11. Its filename
  is retained because the sealed event owns that path; it is not a claim that
  the receipt describes current repository main.
- `governance-validate.js` - zero-dependency offline validation.
- `ledger/` - immutable events, schema, capability policy, checkpoint, replay,
  falsification mutation cases, and harnesses.

Run the gate from the repository root:

```text
node governance/governance-validate.js
node governance/harnesses/run-all.js
```

## Change rule

Do not rewrite a past observation to make it agree with a later state. Add a
new receipt or decision that links to and supersedes the old record. Never put
private content, private paths, secrets, or raw private artifact hashes in this
public directory unless an exact metadata set has a recorded owner release
decision. A scoped metadata grant never authorizes raw artifact bytes.

Page views, downloads, reactions, and positive comments are useful signals but
are not silently promoted to consent, methodological review, endorsement,
independent reproduction, or validation.
