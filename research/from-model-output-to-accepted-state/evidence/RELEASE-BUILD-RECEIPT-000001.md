# Release build receipt 000001

Status: `OWNER_REVIEW / PREPARED_NOT_MERGED`<br>
Recorded: 2026-08-15<br>
Release: `from-model-output-to-accepted-state-0.1.0-owner-review.1`

## Scope

This receipt covers the minimized public packet in `research/from-model-output-to-accepted-state/`. It records local preparation and verification. It does not authorize merge, release tagging, DOI registration, deployment, or a change from owner-review draft to accepted publication.

Excluded from the packet: raw model transcripts, private semantic maps, private correspondence, screenshots, absolute local-machine paths, credentials, caches, unrelated repository files, and any artifact not named by `release-manifest.json`. Relative project locators retained inside the manuscript are evidence references, not local-machine paths.

## Source baseline

- Repository: `JakeTOpenSource/Resilience-Ledger`
- Base branch: `origin/main`
- Base commit: `5f9cc14` (`Merge pull request #13 from JakeTOpenSource/receipt/close-sw-drift`)
- Working branch: `agent/publish-accepted-state-owner-review`

## Tooling

- Python `3.14.6`
- Node.js `24.18.0`
- Git `2.54.0.windows.1`
- pypdf `6.14.2`

## Pre-binding checks

The release manifest was first generated before this receipt was added, then checked by separate Python and JavaScript implementations.

```text
VERIFY PASS
cross_language_parity=PASS
files=32
payload_root=5bba3bfd4fea9bd7c5bc8f261503affba5a25d9a9d9699cd15ae301060244348
manifest_sha256=8a35757fd5ca14b5ec2b69c6f28bd7f385392f6a2feec49091f16095f075a1e0
status=PASS
```

The paper-specific validator returned:

```text
PASS source: 6 files
PASS PDF: 34 pages, 19 bookmarks, 28 links
PASS tagged figures: 10 with alternate text
PASS page words: min=270 max=527
```

The final manifest is regenerated after this receipt is present. The committed `release-manifest.json` and Git commit are the final byte anchor; rerun `tools/verify.ps1` to verify that final state.

## Included output identities

| Output | Bytes | SHA-256 |
|---|---:|---|
| `paper/From-Model-Output-to-Accepted-State-Owner-Review.pdf` | 949907 | `1707ffab851bc963a2874a6303c1e2d2aa5c9db2e262343d921f9d7df839b4ca` |
| `paper/From-Model-Output-to-Accepted-State-Owner-Review-LinkedIn.md` | 103786 | `e4152d92a02893eb855b78d1ec48e2f836cff25c24c2a09e0b0ba9712c9465a6` |

## Interpretation ceiling

A passing release check proves that the checked files match the committed manifest and declared packet structure. It does not prove the manuscript's claims, the truth of its sources, independent replication, novelty, external-world outcomes, authority, or fitness for use. The evidence reports retain their original local receipts and narrower ceilings.
