# Local Build Receipt 000005

Observed: `2026-08-15T14:08:28-04:00`

Status: `PASS_LOCAL_PINNED_STANDALONE_COMPILE`

Previous receipt: `evidence/BUILD-RECEIPT-000004.md`, SHA-256
`4c60d5cfc14126165576a3e3948cd2ee9ac9d526a80d8570fad37e83916fbd7c`

## Change under test

- compiled `ZeroState/QueryQuotient.lean` directly against the pinned package
  environment;
- recorded the module's query-signature, componentwise-sufficiency,
  separation, and kernel-exactness scope; and
- registered the standalone result without adding the module to the imports in
  `ZeroState.lean` or rewriting any historical receipt.

## Environment

- Lean: `4.32.1`, commit `f054605aea4b840552cca2e725580bffd1e1b704`
- Lake: `5.0.0-src+f054605`
- Mathlib repository revision: `520045ab14e26149ee970e2e617ca04b09bde5d6`
- Mathlib remote: `https://github.com/leanprover-community/mathlib4.git`
- Platform: `x86_64-w64-windows-gnu`

## Command and result

The command ran from the package root. The Git values were process-local and
allowed Lake to inspect the pinned dependency under the sandbox's different
filesystem owner. No global Git configuration changed.

```powershell
$env:GIT_CONFIG_COUNT = '1'
$env:GIT_CONFIG_KEY_0 = 'safe.directory'
$env:GIT_CONFIG_VALUE_0 = '*'
$env:ELAN_HOME = (Resolve-Path '.\.tooling\elan').Path
& '.\.tooling\elan\bin\lake.exe' env lean 'ZeroState/QueryQuotient.lean'
```

Result: exit code `0`; the command emitted no standard output or error text.

This direct invocation asks the pinned Lean executable to accept the named
source file in the package environment. It is not a package-root build, a test
count, a theorem count, a lint receipt, or independent reproduction.

## Bound packet bytes

| Path | Bytes | SHA-256 |
|---|---:|---|
| `lean-toolchain` | 25 | `8e3538e0ab5f81a3ee04927d8838c8c674e0e112838b4b3ce87ec218143276af` |
| `lakefile.lean` | 190 | `bfebf4360c894cc2640f3928378744c7d6e287ba79155bcc3525647800606e6e` |
| `lake-manifest.json` | 3132 | `8635dea4df534bd04ce49790099b044f4dd9f75127a601eeb609713bd15a4f5c` |
| `ZeroState.lean` | 157 | `185fbf707d9311058d492f9fb53911e5816b32cffeb23b02cfec00f27a5b24e0` |
| `ZeroState/QueryQuotient.lean` | 3791 | `cfbb166202ade30abc0c79287ff8c1acf216e91a863121ade923218caede9896` |
| `README.md` | 13231 | `1118018a94337451a181b4c7b77c994c958ba4fc0a7b75bfc90eedc9c107b6e0` |
| `evidence/CLAIMS.md` | 9243 | `72f64a8887a162c8191faaf577d3c1c8ba922b7aa951308f5d3ba2704db92b66` |
| `evidence/SOURCES.md` | 8220 | `21c4784814437c2cea0aed4b0b6c489768cd78aa016ba50863b8badcc27f1bf8` |
| `evidence/BUILD-RECEIPT-000004.md` | 9345 | `4c60d5cfc14126165576a3e3948cd2ee9ac9d526a80d8570fad37e83916fbd7c` |

## Bound supporting source

| Path | Bytes | SHA-256 |
|---|---:|---|
| `.lake/packages/mathlib/Mathlib/Logic/Function/Basic.lean` | 54224 | `c70040d5d18050223271ceae210f4d57b59863dcc192c85d6432c7294b0ea4d1` |

The supporting source contains the existing `Function.FactorsThrough`
definition used by the standalone module. Its identity does not establish that
the local packaging results are novel.

## Root-import and assumption checks

At the bound bytes, `ZeroState.lean` imports `Basic`, `Replay`,
`ProjectionSufficiency`, `FinitePermitMachine`, and `ReflectedBacklog`. It does
not import `QueryQuotient`. This receipt records a standalone compile and does
not alter the package-root state bound by receipt 000004.

The standalone source contains no use of `sorry`, `admit`, a custom `axiom`,
`unsafe`, or `native_decide`.

## Limits

The compiled results package a query family as a function-valued signature and
characterize sufficiency and mutual factorization through equality of induced
kernel partitions. They use Mathlib's existing factorization vocabulary. They
do not select a unique encoding, establish a storage or runtime minimum, prove
novelty, validate an external-world model, or constitute upstream Mathlib
review or acceptance.

The source and this receipt were developed with AI assistance. Human
understanding, maintainership, exact upstream source search, and Mathlib
maintainer discussion remain required before any contribution proposal.

No publication, push, pull request, challenge submission, or upstream Mathlib
submission was performed.
