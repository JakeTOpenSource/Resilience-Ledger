# Build Receipt 000001

Status: `LOCAL_OWNER_REVIEW`

Sequence: 1

Previous receipt: `NONE`

Timestamp metadata: `2026-08-15T07:16:22-04:00`

Actor: OpenAI Codex under owner-directed local construction authority.

Action: Defined, generated, replayed, and analyzed the Generic Device Activation Fixture v1.

## Boundary

- Synthetic local benchmark only.
- Owner acceptance and release authority remain with Jake Tiller.
- No publication, deployment, external ingestion, or product claim occurred.
- Query values are model outputs. They do not establish external outcomes.

## Verification command

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\verify.ps1
```

## Exact result

```text
VERIFY PASS
generator_parity=2/2
records=151
maximum_trace_length=10
query_fields=7
candidate_fields=10
candidate_subsets_tested=1023
minimum_field_count=5
minimum_sets=1
named_projection_results=FAIL,FAIL,PASS,PASS
dataset_sha256=a2dece0b00e9659e3f50df307bd41dedc722a1c5b93b16153f616d1f2b58a179
config_sha256=7d6545f4d5cfa603b33f94ef42f747e4bf5e98631edfef30896cb5d24fb31c4d
analysis_sha256=7c550d125d383f7238ff936c7d05a3815ceb35132326253b973562fbca4b0a80
privacy_scan=PASS
utf8_scan=PASS
cache_scan=PASS
```

## Bound artifacts

| Path | Bytes | SHA-256 |
|---|---:|---|
| `.gitignore` | 25 | `6f3708a3b4b1a96332d5a85a6d0ce16a6cb62276d1365e36debc883cb4a83355` |
| `CLAIMS.md` | 2259 | `0ab8856f0f12691e039e3bdfbf019b98a525f0fed098664e488c1978f2d3cd84` |
| `config/candidate-manifest.json` | 907 | `50ba617789082531783f5bc0552de49f4a1969d4687520665a37a616230cc7e6` |
| `config/checker-v2.config.json` | 540 | `7d6545f4d5cfa603b33f94ef42f747e4bf5e98631edfef30896cb5d24fb31c4d` |
| `CONTRIBUTIONS.md` | 795 | `76c757b8c8381f6821d56d01dd5cdafb75549a9484dab3cb7c6c08049b44a17a` |
| `dataset/device-activation-v1.json` | 98769 | `a2dece0b00e9659e3f50df307bd41dedc722a1c5b93b16153f616d1f2b58a179` |
| `README.md` | 2391 | `a7358f5ba3253cf9f8c907220cdeeb9c6151825ba44a3933bdcd3720a49deb99` |
| `results/expected-analysis.json` | 2737 | `7c550d125d383f7238ff936c7d05a3815ceb35132326253b973562fbca4b0a80` |
| `SOURCES.md` | 860 | `daf91d8c75c86f68cf216739c68e57827e6fcd35fdcadeb56b13b17eac026709` |
| `SPEC.md` | 5104 | `b64d3ca52ab2750a57486018cf73483f6df31c137970e6ebae5632b2e1e990d0` |
| `src/analyze.py` | 6011 | `ec70d94c4c000e4e36c6f992b18a2c283b9c2b807d86363091a147f401c80721` |
| `src/generate.js` | 7155 | `53b71dd04782e9ae4c80465536b2303b7de7a1d7e5e054552a8527f416ea5757` |
| `src/generate.py` | 8204 | `1f217bf7565135c590264dbe7eb9076c8960887263523130268d5a55c0399477` |
| `verify.ps1` | 6822 | `d407586cdb875c2cafcdc277d4040d46de68ad584fc6dba584771b07db3f8486` |

The receipt does not bind itself. Later corrections must append a new receipt rather than modify this record.

## Result interpretation

The supplied ten-candidate search has one five-field minimum for the joint seven-query signature:

```text
backup_access_granted
history_summary
payment_credential_enrolled
phase
unlock_enrolled
```

The result is exact only for the 151 traces, seven queries, ten candidate fields, equality rules, and v1 transition semantics recorded here.

