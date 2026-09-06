# Windows clean-clone raw-byte verification

Status: `PASS`  
Scope: full-repository checkout with Windows `core.autocrlf=true`  
Network: none; the clone used local Git transport with `--no-local`  
Source mutation: none  
Audited commit: `817e4265563c124dedb6675b7c44d0082c3d8085`  
Branch requested: `agent/publish-accepted-state-owner-review`

## Environment

- Windows NT build family: `26100`
- Windows PowerShell: `5.1.26100.9168`
- Git: `2.54.0.windows.1`
- Python: `3.14.6`
- Node.js: `24.18.0`
- Effective system Git setting: `core.autocrlf=true`
- Repository-root `.gitattributes`: `* -text`

The resolved user-profile Python path, source-repository path, and generated
temporary-clone path are intentionally omitted. None was used as evidence.

## Procedure

The executed procedure is reproduced below with machine paths replaced by bounded
placeholders.

```powershell
$auditSourcePath = "<LOCAL_SOURCE_REPOSITORY>"
$auditClonePath = Join-Path `
    ([System.IO.Path]::GetTempPath()) `
    ("accepted-state-clean-clone-" + [guid]::NewGuid().ToString("N"))

git -c core.autocrlf=true clone `
    --no-local `
    --branch agent/publish-accepted-state-owner-review `
    --single-branch `
    $auditSourcePath `
    $auditClonePath

git -C $auditClonePath rev-parse HEAD
git -C $auditClonePath config --show-origin --get core.autocrlf
git -C $auditClonePath check-attr text -- `
    research/from-model-output-to-accepted-state/README.md `
    research/from-model-output-to-accepted-state/tools/verify_release.py

$auditStatus = git -C $auditClonePath status --porcelain
if ($auditStatus) { throw "clean clone became dirty" }

powershell -NoProfile -ExecutionPolicy Bypass `
    -File (Join-Path $auditClonePath `
        "research\from-model-output-to-accepted-state\tools\verify.ps1")
```

The verifier used temporary GUID-named JSON files outside the checkout and removed
them in its `finally` block.

## Checkout observations

```text
817e4265563c124dedb6675b7c44d0082c3d8085
core.autocrlf=true
research/from-model-output-to-accepted-state/README.md: text: unset
research/from-model-output-to-accepted-state/tools/verify_release.py: text: unset
clone_status_clean
```

`text: unset` is the expected effect of the repository-root `* -text` rule. It
prevented checkout-time CRLF rewriting despite `core.autocrlf=true`.

## Complete verifier output

```text
VERIFY PASS
cross_language_parity=PASS
files=34
payload_root=c87abd3580fcaa899eec65302d8e7d1ea5de17e0ce6730c38d5f03c8c547791c
manifest_sha256=fbb878a3dc3aa6af61e69c7e49c3836ceda80589d147e54ab410861a1ede9cc9
status=PASS
```

Both implementations emitted this exact canonical report:

```json
{"fileCount":34,"manifestSha256":"fbb878a3dc3aa6af61e69c7e49c3836ceda80589d147e54ab410861a1ede9cc9","payloadRoot":"c87abd3580fcaa899eec65302d8e7d1ea5de17e0ce6730c38d5f03c8c547791c","status":"PASS"}
```

`fileCount=34` excludes the self-referential manifest. The packet contained 35
tracked regular files including that manifest.

## Interpretation ceiling

This test establishes that a full Windows checkout of the named v3 commit preserved
the packet's committed raw bytes under `core.autocrlf=true`, matched the committed
allowlist, byte lengths, SHA-256 values, and payload root, and produced identical
Python and JavaScript reports. It does not test the uncommitted v4 bytes, rebuild the
paper, reproduce excluded inputs, validate manuscript claims, or establish
independent replication.
