param(
    [string]$PythonExe = "",
    [string]$NodeExe = ""
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot

if (-not $PythonExe) {
    $pythonCommand = Get-Command python -ErrorAction SilentlyContinue
    if ($pythonCommand) { $PythonExe = $pythonCommand.Source }
    else {
        $fallback = Join-Path $env:LOCALAPPDATA "Python\bin\python.exe"
        if (Test-Path -LiteralPath $fallback) { $PythonExe = $fallback }
    }
}
if (-not $NodeExe) {
    $nodeCommand = Get-Command node -ErrorAction SilentlyContinue
    if ($nodeCommand) { $NodeExe = $nodeCommand.Source }
}
if (-not $PythonExe -or -not (Test-Path -LiteralPath $PythonExe)) { throw "Python 3 executable not found" }
if (-not $NodeExe -or -not (Test-Path -LiteralPath $NodeExe)) { throw "Node.js executable not found" }

$left = Join-Path ([System.IO.Path]::GetTempPath()) ("accepted-state-python-" + [guid]::NewGuid().ToString("N") + ".json")
$right = Join-Path ([System.IO.Path]::GetTempPath()) ("accepted-state-node-" + [guid]::NewGuid().ToString("N") + ".json")
try {
    & $PythonExe (Join-Path $PSScriptRoot "verify_release.py") | Set-Content -LiteralPath $left -Encoding UTF8
    if ($LASTEXITCODE -ne 0) { throw "Python release verifier failed" }
    & $NodeExe (Join-Path $PSScriptRoot "verify-release.mjs") | Set-Content -LiteralPath $right -Encoding UTF8
    if ($LASTEXITCODE -ne 0) { throw "JavaScript release verifier failed" }

    $leftText = (Get-Content -LiteralPath $left -Raw).Trim()
    $rightText = (Get-Content -LiteralPath $right -Raw).Trim()
    if ($leftText -cne $rightText) {
        throw "Cross-language canonical report mismatch`npython=$leftText`nnode=$rightText"
    }
    $report = $leftText | ConvertFrom-Json
    Write-Output "VERIFY PASS"
    Write-Output "cross_language_parity=PASS"
    Write-Output "files=$($report.fileCount)"
    Write-Output "payload_root=$($report.payloadRoot)"
    Write-Output "manifest_sha256=$($report.manifestSha256)"
    Write-Output "status=$($report.status)"
}
finally {
    Remove-Item -LiteralPath $left,$right -Force -ErrorAction SilentlyContinue
}
