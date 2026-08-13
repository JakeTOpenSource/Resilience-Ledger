# Atlas public data-sync baseline

**Contract:** `atlas-data-sync.contract.v1.json`  
**Decision:** `DEFER`  
**Scope:** public repository files only; no live deployment, private overlay, browser storage, source validity, or semantic acceptance is tested.

## What this baseline measures

`terms.enriched.json` is the repository's **declared candidate source of truth** for this inventory. That declaration is not accepted as proof that any definition, source, review label, relation, or score is correct. The companion verifier records canonical JSON/text digests and deterministic inventories so a later unregistered change fails visibly.

This baseline intentionally preserves the current disagreement. It does not select a winner or rewrite a status.

| Surface | Terms | Statuses | Sources | Relations | Compared with candidate source |
|---|---:|---|---:|---:|---|
| Candidate source | 439 | 439 reviewed | 193 | 360 | Reference only; not semantic acceptance |
| Ask | 435 | 177 reviewed, 258 candidate | 51 | 360 | 4 candidate IDs absent; 258 shared status mismatches |
| Curation dashboard | 435 | 177 reviewed, 258 candidate | 51 | 360 | Same recorded inline snapshot as Ask |
| Explore | 435 | 177 reviewed, 258 candidate | n/a | 360 | 4 candidate IDs absent; 258 shared status mismatches |
| Gap Check | 433 | 177 reviewed, 256 candidate | n/a | 353 | 6 candidate IDs absent; 256 shared status mismatches |
| Canon JSON | 214 | 188 reviewed, 26 candidate | n/a | n/a | 10 canon IDs are not current candidate-source IDs; 26 shared status mismatches |

The exact ordered identifier sets, status-mismatch sets, and full records are bound by the contract's SHA-256 fields. A digest match establishes only that this recorded public baseline has not changed under the defined canonicalization; it does not establish truth.

## Named identity gaps

The Ask, Curation dashboard, and Explore inline datasets omit:

- `groundedness-concept`
- `lexicon-concept`
- `nozzle`
- `ordering-drift`

Gap Check omits those four plus:

- `deterministic`
- `probabilistic`

The Canon JSON contains ten IDs absent from the current candidate source:

- `embedding`
- `explainability-interpretability`
- `goal`
- `loop`
- `multi-agent`
- `parameter`
- `pretraining`
- `token-tokenization`
- `weights`
- `xai`

## Boundaries

- `reviewed`, `candidate`, source support, detector findings, and STP status axes are not aliases.
- This is not a migration mechanism and it emits no state transition.
- A passing result means the repository still matches this baseline. It does **not** mean the public surfaces agree semantically, that a review occurred, or that the live Pages deployment serves these exact files.
- A failing result is a return to sort. Update the contract only alongside a documented decision that explains the intended change.

Run from repository root:

```text
node governance/harnesses/verify-atlas-data-sync.js
```
