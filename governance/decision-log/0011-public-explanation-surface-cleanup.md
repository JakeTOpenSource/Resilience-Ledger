# Decision 0011: Public explanation-surface cleanup

Date: 2026-08-13
Authority: repository owner authorization for the bounded public Atlas cleanup
Decision: **ACCEPT_WITH_LIMITS**
Mode: **PREPARE_ONLY**
Consequence class: C2

## Observation

The merged Atlas repair is live, but the public home and `White-Paper.html`
still contain older explanatory copy that is not aligned with the repository's
recorded source boundaries. Examples include an unsupported novelty label, a
stale 150-primitives count, a 439-record claim applied to a 435-record
projection, absolute privacy and determinism language, an inverted
`Reset`/`Return` name, and future-edition language with no matching repository
artifact.

The v0.4 and v0.5 Resilience Ledger PDFs are historical artifacts. Their
content and layout can be assessed and bounded, but this packet does not
silently revise them.

## Accepted preparation

- Correct only the public home and maintained explanation surface.
- Separate the declared 439-record candidate source from the 435- and
  433-record public projections recorded by the data-sync baseline.
- Derive the Systems Primitives count from the pinned 160-record JSON source.
- Remove unsupported novelty, universality, certification, and absolute
  privacy or determinism claims.
- Keep Cadence and Basin cross-domain mappings explicitly bounded and linked to
  their sources.
- Use the v0.5 source term `Reset to baseline`, with `Return` only as its alias.
- Link and label the v0.4 and v0.5 PDFs as archival artifacts while preserving
  their exact bytes.
- Point self-governance language to the repository's append-only events and
  checkpoints without claiming complete historical coverage.
- Repair the explanation surfaces' basic navigation and table semantics.
- Bind the resulting source candidate to deterministic checks and exact file
  digests before presenting it for owner review.

## Limits

This decision accepts preparation of a file-digest-bound source candidate for
a public pull request. It does not accept the semantics of the 439-record
candidate inventory or any older projection, establish per-term review,
correct or endorse either archival PDF, validate every external citation,
certify accessibility, privacy, security, or offline behavior, establish live
health or production identity, authorize an agent merge, or authorize a
Cloudflare deployment. Owner merge remains required; production observation is
a separate event after any merge.
