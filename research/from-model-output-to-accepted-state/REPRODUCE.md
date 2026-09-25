# Reproduce the release integrity check

This procedure verifies the exact bytes of this owner-review packet. It does not
rebuild the PDF, reproduce excluded inputs, independently replicate an experiment,
or establish the truth, novelty, authorship, authority, safety, or fitness of a
claim.

## Requirements

- Git
- Python 3
- Node.js

No package installation or runtime network access is required after cloning.

## Obtain a clean checkout

Use the exact release commit or tag identified by the repository release or pull
request.

```sh
git clone https://github.com/JakeTOpenSource/Resilience-Ledger.git
cd Resilience-Ledger
git checkout --detach <release-commit-or-tag>
git status --porcelain=v1
cd research/from-model-output-to-accepted-state
```

`git status --porcelain=v1` must print nothing. The repository-root and packet-local
`.gitattributes` files disable line-ending conversion so byte comparisons do not
produce a false failure on Windows. Do not remove that rule when re-homing the
packet.

## Windows

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\verify.ps1
```

A successful result reports `VERIFY PASS`, cross-language parity, the checked file
count, payload root, manifest SHA-256, and `status=PASS`.

## macOS or Linux

```sh
python3 -B tools/update_claim_register.py --check || exit 1
python_report="$(python3 tools/verify_release.py)" || exit 1
node_report="$(node tools/verify-release.mjs)" || exit 1

if [ "$python_report" != "$node_report" ]; then
  printf '%s\n' "Cross-language canonical report mismatch" >&2
  exit 1
fi

printf '%s\n' "$python_report"
```

If Python 3 is installed as `python`, substitute that executable name.

## Claim-marker reassignment

For demotion test 6, give an external reviewer only:

- `claims.json`, which embeds the neutral four-marker policy;
- `reviewer-markers.template.json`;
- the packet files named by accessible `sources` records in `claims.json`; and
- any public external source the reviewer retrieves and verifies against its
  registered identity: commit and tree for a tree record, or commit, path, byte
  length, and SHA-256 for a blob record.

Copy `reviewer-markers.template.json` outside the checkout before filling it; editing
the packet copy correctly breaks its byte manifest and clean-worktree check. Withhold
`author-markers.json`, `content_a.py`, `content_b.py`, `content_c.py`, the PDF, and
the LinkedIn companion until the reviewer seals the assignments. A retained or
unavailable source stays unavailable and must be recorded that way; it may not be
silently treated as reviewed. The separation is a procedural blind, not
cryptographic secrecy after publication. After the reviewer seals assignments,
compare by `claim_id`: a mismatch is `CONTESTED/HOLD`, a missing assignment is
`INCOMPLETE`, and neither result can auto-promote a claim.

## Boundaries

Do not redirect verifier output into this packet: an added file correctly causes an
allowlist failure. Do not run `tools/update_manifest.py` as a verification step; it
rewrites the manifest and is a maintainer-only release operation. Do not run
`tools/update_claim_register.py` during verification; use its `--check` option.

After verification, `git status --porcelain=v1` should still print nothing. A pass
establishes consistency with the committed manifest and checkout. The Git commit or
release tag is the external identity anchor.
