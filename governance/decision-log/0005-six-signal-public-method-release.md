# Decision 0005: Six-Signal public method and pinned snapshot card

**Date:** 2026-08-12

**Decision:** ACCEPT_WITH_LIMITS

**Consequence class:** C2

**Authorization evidence:** the authenticated repository owner directed a
public, simplified pull request that shows the project's useful method without
disclosing sensitive development material

**Cryptographic signature:** not present

## Accepted public set

The owner authorizes a protected pull request containing exactly these public
surfaces:

- `Six-Signal-Method.html`, an educational, no-input explanation;
- `_headers`, restricted to the new method and reproduction-card routes;
- the GitHub-facing discovery links in `README.md`;
- `research/atlas-snapshot-read-only/release-manifest.json` and the exact files
  it allowlists;
- `governance/harnesses/verify-six-signal-surface.js` and its registration in
  `governance/harnesses/run-all.js`;
- the packet-verification step in `.github/workflows/gates.yml`; and
- this decision plus one new append-only authorization event.

The reproduction manifest is an allowlist. Unlisted material is outside this
decision.

## Rights, attribution, and processors

The card refers only to files already public in this repository and identifies
their public repository and commit. It copies no selected source bytes and no
third-party paper text. Repository licensing and attribution remain governed by
`LICENSE.txt` and `CITATION.cff`.

Publication through GitHub pull request, Git history, and GitHub Actions can be
durable and externally processed. This decision permits that processing only
for the exact public set above. It does not authorize a Cloudflare deployment.

## Required boundary

The release contains no private repository identifier, private evaluation or
lamp result, private receipt, local path, prompt, transcript, credential,
screenshot, private analytics, or internal development journal. The package
verifier and governance privacy harness must reject boundary violations.

## Limits

This decision accepts a candidate educational method and a public byte-identity
reproduction card. It does not establish current repository or deployment
identity, semantic truth, independent reproduction, privacy certification,
calibration, live system health, acceptance of a research protocol, or
authority for any effect. The page reads no inputs and reports no status.

The existing production deployment receipt remains `DEFER`. Merge through the
protected pull-request path is allowed after checks pass; deployment requires a
separate decision and a new immutable observation. Any correction or expansion
requires a new append-only decision and manifest.
