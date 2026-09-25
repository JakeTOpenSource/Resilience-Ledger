# Release build receipt 000004

Status: `OWNER_REVIEW / PRIVATE_V4_READY_FOR_OWNER_REVIEW / PREPARED_NOT_MERGED`<br>
Recorded: `2026-08-15T16:10:20-04:00`<br>
Release: `from-model-output-to-accepted-state-0.1.0-owner-review.4`<br>
Previous receipt SHA-256: `a38b50371df75f62348f3cadebd37c766af3ba869a7cd4ae9682cf2d29e951fc`

## Scope

This append-only receipt covers the private v4 owner-review build, its exact paper
outputs, the normalized frozen-oracle terminology, the explicit Lean evidence
boundary, a clean-clone runbook and packet-local line-ending rule, a marker-blind
claim register with separate author key, and a packet-level changelog. Historical
receipts and their outputs were not rewritten.

This receipt does not authorize merge, release tagging, DOI registration,
deployment, journal acceptance, or a claim that an external reviewer reproduced the
work. The v4 files remained local and unpushed when this receipt was recorded.

## Source baseline

- Repository: `JakeTOpenSource/Resilience-Ledger`
- Branch: `agent/publish-accepted-state-owner-review`
- Prior public branch commit: `817e4265563c124dedb6675b7c44d0082c3d8085`
- Prior release receipt: `evidence/RELEASE-BUILD-RECEIPT-000003.md`, 6,977 bytes
- Prior release receipt SHA-256:
  `a38b50371df75f62348f3cadebd37c766af3ba869a7cd4ae9682cf2d29e951fc`

## Adopted corrections

1. BP-001 is named the **frozen-oracle packet**. The legacy
   `evidence/blind-prompt/` path remains only for receipt continuity. The term does
   not imply blinded assignment, blinded assessment, independent systems, or
   runtime model attestation.
2. The paper states the exact public boundary for `QueryQuotient.lean`: standalone
   source plus compile receipt, not imported by the package root, with the earlier
   local package chain and clean-room environment reconstruction still open.
3. `REPRODUCE.md` gives an offline clean-checkout procedure for Windows, macOS, and
   Linux. Packet-local `* -text` protects a re-homed packet from line-ending
   conversion. A recorded Windows test covers the prior v3 commit; it is not
   misreported as a clean-clone replay of these uncommitted v4 bytes.
4. `claims.json` contains 61 substantive marked units and a neutral four-marker
   policy without the author's marker or marker-derived ceiling. The separate
   `author-markers.json` records 22 TESTED, 5 OBSERVED, 20 PROPOSED, and 14 OPEN
   assignments. The external-review template ships empty. Explicit claim-to-source
   mappings replace keyword inference; unavailable sources remain named as
   unavailable.
5. `CHANGELOG.md` records the owner-review revision lineage. Earlier receipts remain
   append-only. The current release surface contains only the distinctly named v4
   PDF and LinkedIn companion; earlier rendered outputs remain recoverable from Git
   history and their receipts.

## Claim-register identities

| Artifact | Bytes | SHA-256 |
|---|---:|---|
| `claims.json` | 76776 | `cd0a79c07a8b41f80a7a9abe6adca7931b8ee318ff9aed0cc42af7ea249a13e9` |
| `author-markers.json` | 25193 | `d403a57ed62569efeb2ccdef61642717623506170272533f9323548eeb8fd867` |
| `reviewer-markers.template.json` | 10328 | `0a2d012439c722a3c628c6045920f1fc51ae189696b30a1bf577ee72a9d007c4` |
| `REPRODUCE.md` | 3408 | `dde7934c3a54cc2b1b1156314dbbcd22d1855cd448f0478bfa770678a8cbffcf` |
| `CHANGELOG.md` | 2014 | `27002ddfb2c569c2ec37253c91f44805e111551cf3090172ba7a8aaa5c5d6d2d` |
| `.gitattributes` | 239 | `7ccb36d6cee337107bbdd2ac846114861d66e81b803cfead82bbb8e639598a54` |
| `evidence/reproduction/WINDOWS-CLEAN-CLONE-V3.md` | 3453 | `7f5476957fad26c621a730dba01a441a17262bf6a6b3d89a3c3f1168f9c6f7c2` |

The generator and both release verifiers enforce the register shape, the separation
of author and reviewer assignments, registered source resolution, packet-file byte
identity, and the rule that TESTED or OBSERVED cannot rely only on paper context.
The generator was rerun and then passed its byte-exact `--check` mode with 61
claims.

## Paper build and visual validation

The owner-workspace builder regenerated all five SVG figures, HTML, PDF, and the
LinkedIn companion from the v4 manuscript source. The paper-specific validator
returned:

```text
PASS source: 6 files
PASS PDF: 36 pages, 20 bookmarks, 28 links
PASS tagged figures: 10 with alternate text
PASS page words: min=158 max=543
```

All 36 pages were rendered at 2.75x or 3x and inspected individually in two
independent page ranges. No clipping, overlap, broken glyph, unreadable text, lost
table row, orphan heading, footer collision, or missing page number was found.
Repeated table headers, long hashes, the Appendix B callout spanning pages 33 and
34, and the Appendix C table spanning pages 34 and 35 remained intact and readable.
Page 36 is intentionally sparse.

## Privacy and release boundary

The manuscript, PDF text layer, packet text, Lean source, JSON files, Markdown,
receipts, and verifier sources were checked for absolute user-machine paths, Codex
attachment or clipboard locators, temporary-directory locators, local network
addresses, account credentials, private-key material, replacement characters, NUL
bytes, and raw private editorial-review prose. The public packet contains generic
privacy-pattern definitions and a generic Python fallback expression, but no
resolved owner path or private attachment locator. No compiled Python cache or
temporary render is included.

Intentional public disclosures remain bounded in the manuscript: named research
assistance, owner-attested editorial assistance, Macdonald's permissioned parallel
related-work review, and the pre-software LinkedIn lineage. None is presented as
authorship, independent replication, or evidence for the paper's results.

## Pre-binding release check

Before this receipt was added, the manifest writer and separate Python and
JavaScript verifiers returned the same canonical report:

```text
VERIFY PASS
cross_language_parity=PASS
files=41
payload_root=6690ad38958ad25e3f124c36f690aae7119772606fcbf3051107b858c59f1a4d
manifest_sha256=13bb12b3abfa20b9f962c717b7bc53a233fcd4c91cbaf7657fbdf444db123465
status=PASS
```

The final manifest is regenerated after this receipt is present. The committed
`release-manifest.json` and eventual Git commit are the public byte anchors; until
then, the files remain a private owner-review candidate.

## Included output identities

| Output | Bytes | SHA-256 |
|---|---:|---|
| `paper/From-Model-Output-to-Accepted-State-Owner-Review-v4.pdf` | 978519 | `483c4f320d58213e2d3a3a03b728f21443c695909f61e0681543a20f7f040705` |
| `paper/From-Model-Output-to-Accepted-State-Owner-Review-v4-LinkedIn.md` | 109261 | `1749996fb8e1d27a159bc820d5d2317210dd1dbd04c880df37f8f00eaa36230b` |

## Interpretation ceiling

A passing packet check establishes byte consistency with the declared manifest and
the bounded structures checked by its verifiers. It does not prove manuscript
claims, source truth, reviewer or model identity, independent replication,
originality, external outcomes, authority, safety, legal compliance, or fitness for
use. Owner review of the attached v4 PDF remains required before publication.
