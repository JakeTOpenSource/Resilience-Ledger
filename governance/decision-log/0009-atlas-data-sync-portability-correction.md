# Decision 0009: Atlas data-sync portability correction

Date: 2026-08-13  
Authority: repository owner authorization for the Atlas foundational repair  
Decision: **ACCEPT_WITH_LIMITS**  
Consequence class: C1

## Observation

GitHub Actions run `31718167911` rejected the v1 Atlas data-sync baseline on
Linux. The canonical SHA-256 of `Delta-Atlas-Canon.md` matched, but v1 compared
the platform-native text byte count: `39286` in the Windows CRLF worktree and
`38971` in the Linux LF checkout.

This was a portability defect in the measurement contract. It was not a
semantic corpus change and it did not establish which Atlas projection is
authoritative.

## Accepted correction

- Preserve the sealed v1 contract and verifier as historical evidence.
- Add a v2 contract that digest-binds v1 and defines both text digest and text
  length over the same CRLF-to-LF normalized UTF-8 bytes.
- Run v2 in the aggregate governance suite.
- Append a correction event and checkpoint; do not rewrite event 000007 or
  checkpoint 000008.

## Limits

This decision corrects only cross-platform reproducibility of the baseline
measurement. Data migration remains `DEFER`. The legacy `reviewed` label is not
a receipt. No definition, source, relation, score, deployment, accessibility,
privacy, performance, or live-health claim is accepted by this correction.

Owner merge remains required before the Git-connected production branch can
change.
