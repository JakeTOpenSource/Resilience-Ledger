# Build Receipt 000001

## Identity

- Packet: `transition-stable-quotient`
- Receipt status: `OWNER_REVIEW`
- Recorded at UTC: `2026-08-15T12:15:47Z`
- Receipt policy: append-only
- Release authority: not granted
- Publication status: not published

This receipt binds the shareable packet files listed below. It excludes itself to avoid a self-referential digest. It does not authorize publication, execution against a real device, or generalization beyond the frozen finite model.

## Source boundary

The executable experiment reads one source outside this packet:

| Source | Bytes | SHA-256 | Role |
| --- | ---: | --- | --- |
| `../device-activation-fixture/dataset/device-activation-v1.json` | 98,769 | `a2dece0b00e9659e3f50df307bd41dedc722a1c5b93b16153f616d1f2b58a179` | Frozen synthetic trace-prefix dataset |

The packet cites Moore and Hopcroft as established prior work in `SOURCES.md`. This receipt does not attest to downloaded copies of those publications. It attests only to the local bytes listed here and to the verifier result below.

## Runtime identity

| Runtime | Version |
| --- | --- |
| Windows PowerShell | `5.1.26100.9168` |
| Python | `3.14.6` |
| Node.js | `v24.18.0` |

## Verification command

Direct script invocation was blocked by the host Windows PowerShell execution policy before the verifier ran. The packet was then executed with a process-scoped policy bypass:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\work\transition-stable-quotient\verify.ps1
```

Exit code: `0`

Exact standard output:

```text
VERIFY PASS
python_javascript_canonical_parity=PASS
frozen_report_match=PASS
records=151
events=10
full_classes=33_to_33
reduced_classes=18_to_33
stable_partition_equal=PASS
invalid_input_fail_closed=PASS
synthetic_two_round_refinement=PASS
report_sha256=1b0e78adcac732561a0263ef2704d53b397597c502f81e88a0999a37232df183
```

Standard error was empty.

## Bound file manifest

The canonical manifest is ordered by the UTF-8 byte sequence of the slash-normalized relative path. Each line is:

```text
relative-path<TAB>byte-count<TAB>sha256<LF>
```

| Relative path | Bytes | SHA-256 |
| --- | ---: | --- |
| `CLAIMS.md` | 1,201 | `73c8317e76397e78f85b34f04c406cd917101819596aa82e76d8731e4d483834` |
| `CONTRIBUTIONS.md` | 644 | `309f61f100d263743c4e5a6f3b0dcc62ef4dfd48d662dbfcef7df87d18fdd49d` |
| `README.md` | 1,360 | `5b3747d7aa42afbf24078a30e64023c4c11c668aca53561cb6616e8b53b890c2` |
| `RESULTS.md` | 1,912 | `317e831756ac587d40f63444ee75b5d6ac7b3e78eccd474329a55a4c854f7704` |
| `results/expected-report.json` | 2,627 | `1b0e78adcac732561a0263ef2704d53b397597c502f81e88a0999a37232df183` |
| `SOURCES.md` | 968 | `51aef6af90b28432553b935163d3798759dea1c127247f0b64b36108269ba628` |
| `SPEC.md` | 2,384 | `2af1ff0ebb801229da8956a90d6ee38fc11a8ca2fe80fb5c8838676d557c3897` |
| `src/analyze.js` | 10,174 | `f1dddef27258568e0d401f8be2bdb68b0b74df1bd04bc5cba7f99234fef91273` |
| `src/analyze.py` | 10,777 | `535b8eaa0cea669bb0e6ef6eb13adcd61b0ad23b41bdf39d7e4dc983eb5b7602` |
| `verify.ps1` | 8,548 | `b781799ee714159f661717d86e772708f7831ea1bb4c607286175c1b0765a7bd` |

Canonical packet manifest SHA-256:

```text
ae54e6bbba4cd6c3f1eedee8cd1f97c7cc9fc97e54f2dfab53c666331d71e513
```

## Accepted interpretation

The verifier establishes local replay of the frozen finite experiment. It establishes Python and JavaScript canonical parity, equality with the frozen report, declared class counts, stable-partition equality, fail-closed invalid input, and a two-round synthetic refinement case.

The receipt does not establish a new automata theorem, real-device behavior, legal authority, operational safety, global representation minimality, open-system completeness, or external replication.

## Owner review gate

The packet is technically verified and remains in `OWNER_REVIEW`. Owner acceptance, public-release approval, and any downstream claim promotion must be recorded separately. Absence of a failed check is not publication authority.
