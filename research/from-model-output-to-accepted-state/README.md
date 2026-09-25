# From Model Output to Accepted State

Status: **OWNER-REVIEW DRAFT**<br>
Release packet: `0.1.0-owner-review.4`<br>
Recorded: 2026-08-15

This packet publishes a bounded draft, its readable outputs, the authored manuscript and figure source, minimized local evidence reports, and offline integrity checks. The dependency-bearing assembly helper remains outside this zero-dependency public boundary. This is a review surface, not a claim of publication acceptance, independent replication, production safety, or deployment authority.

## Start here

1. Read [`paper/From-Model-Output-to-Accepted-State-Owner-Review-v4.pdf`](paper/From-Model-Output-to-Accepted-State-Owner-Review-v4.pdf).
2. Read [`BOUNDARIES.md`](BOUNDARIES.md) before reusing a result.
3. Follow [`REPRODUCE.md`](REPRODUCE.md) for a clean-clone check.
4. Run the packet verifier:

   ```powershell
   powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\verify.ps1
   ```

The verifier is offline. It checks the release allowlist, raw byte lengths, SHA-256 digests, payload root, UTF-8 boundaries, JSON syntax, Python syntax, PDF signature, and selected privacy and credential patterns. The JavaScript and Python implementations must return identical canonical reports.

The packet adds no package dependency or runtime network call. The owner workspace used Chrome and pypdf to render and inspect the retained PDF, but those optional build dependencies and their helper scripts are deliberately outside this public release boundary. The authored content, figures, styles, rendered outputs, evidence reports, and raw-byte verification floor are included.

## What is in the packet

| Path | Function |
|---|---|
| `paper/` | Tagged owner-review PDF and a LinkedIn-safe Markdown rendering. |
| `content_*.py`, `figures.py`, `style.py`, `figures/` | Authored manuscript, figure source, rendered SVG figures, and print style. |
| `evidence/device-activation/` | Frozen finite query-sufficiency result and its original local receipt. |
| `evidence/transition-stable-quotient/` | Frozen future-stability refinement result and its original local receipt. |
| `evidence/blind-prompt/` | Legacy receipt-stable locator for the frozen-oracle packet prompt and aggregate-only public summary. Raw responses, quote-bearing reports, per-response digests, and owner-private mappings are excluded. |
| `evidence/editorial-review/` | Public minimized owner disposition of a private editorial review. The raw review and private locator are excluded. |
| `evidence/lean-query-quotient/` | Exact standalone Lean source and append-only pinned compile receipt. The module is not imported by the package root and is not an upstream Mathlib contribution. |
| `release-manifest.json` | Complete raw-byte allowlist for every packet file except the manifest itself. |
| `claims.json`, `author-markers.json`, `reviewer-markers.template.json` | Marker-blind claims, the separate author key, and a reviewer template for demotion test 6. |
| `REPRODUCE.md`, `CHANGELOG.md` | Clean-clone verification and append-only owner-review revision lineage. |
| `tools/` | Deterministic manifest writer plus separate Python and JavaScript verifiers derived from one release contract. |

## Bounded results

- The paper separates candidate output, authorized action, observation, acceptance, and later outcome rather than treating them as one status.
- In one synthetic 151-trace device fixture, all 1,023 nonempty subsets of ten declared candidate fields were checked for seven declared queries. Exactly one five-field subset was minimum by field count within that frozen model. It is not a universal device state or bit minimum.
- In the same finite model, the full seven-query signature was already transition-stable at 33 classes. Removing `nextPermittedActions` produced 18 static classes that refined to the same 33 classes after one round. This is a local Moore/Myhill-Nerode-style result, not new automata theory.
- Three frozen response configurations reproduced 27 of 27 exact answer fields in BP-001, the frozen-oracle packet. Six semantic functions were unambiguously unanimous; other semantic mappings remain bounded or unresolved as stated in the paper. Requested model labels were metadata, not runtime identity attestation.

## Editorial review disposition

[`evidence/editorial-review/PUBLIC-DISPOSITION.md`](evidence/editorial-review/PUBLIC-DISPOSITION.md)
binds one private owner-supplied editorial review by byte count and SHA-256 and
publishes only the owner's minimized dispositions. The reviewer attribution is
owner-attested, not runtime-authenticated. The review is editorial assistance,
not evidence, authorship, peer review, source truth, or independent validation.

## Related-work credit

With his permission, Jake Macdonald's OpenGoldenRatio (OGR) v0.1 is cited as parallel related work. Macdonald reviewed the bounded comparison and helped clarify the distinction between STP's governed path from candidate output to accepted state and OGR's containment of actor or agent relations. He contributed no code, data, experiments, or authorship to this release. See [`RELATED-WORK.md`](RELATED-WORK.md).

## Reuse

The packet is licensed under CC BY 4.0. Cite the exact version or commit you used, keep the status and limitations attached to extracted results, and identify modifications. A passing integrity check establishes byte consistency with this manifest; it does not establish that a claim is true or authorized for a new context.

The release contains no absolute local-machine path, Codex attachment locator,
workspace-only `work/...` locator, raw prompt response, private review text, account
credential, email address, phone number, or local network address. Retained private
inputs are identified only by bounded source IDs and digests.

See repository for full list of sources and contributions.
