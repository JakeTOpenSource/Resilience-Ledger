#!/usr/bin/env python3
"""Independent Python replay for cross-implementation agreement."""

import argparse
import hashlib
import json
import pathlib
import re
import sys

REPO = pathlib.Path(__file__).resolve().parents[2]
EVENTS = REPO / "governance" / "ledger" / "events"
HASH = re.compile(r"^[0-9a-f]{64}$")
ALLOWED_PROJECTION = re.compile(
    r"^governance/(authority-map\.json|artifact-register\.json|external-feedback\.json|deployment-receipts/[a-z0-9._-]+\.json)$"
)


def canonical(value):
    return json.dumps(value, sort_keys=True, ensure_ascii=False, separators=(",", ":"))


def digest(value):
    return hashlib.sha256(canonical(value).encode("utf-8")).hexdigest()


def load_events():
    rows = []
    for file in sorted(EVENTS.rglob("*.json")):
        rows.append((file.relative_to(REPO).as_posix(), json.loads(file.read_text(encoding="utf-8"))))
    return rows


def validate(rows):
    errors = []
    ids = {}
    idempotency = {}
    streams = {}
    for relative, event in rows:
        if event.get("event_id") in ids:
            errors.append(f"{relative}: duplicate event_id")
        ids[event.get("event_id")] = relative
        key = event.get("idempotency_key")
        if key in idempotency:
            errors.append(f"{relative}: duplicate idempotency_key")
        idempotency[key] = relative
        payload_hash = event.get("payload_hash", "")
        if not HASH.match(payload_hash) or payload_hash != digest(event.get("payload")):
            errors.append(f"{relative}: payload_hash mismatch")
        material = {key: value for key, value in event.items() if key != "event_hash"}
        event_hash = event.get("event_hash", "")
        if not HASH.match(event_hash) or event_hash != digest(material):
            errors.append(f"{relative}: event_hash mismatch")
        streams.setdefault(event.get("stream_id"), []).append((relative, event))
    for stream, entries in streams.items():
        entries.sort(key=lambda row: (row[1].get("sequence", 0), row[1].get("event_id", "")))
        previous = ""
        for index, (relative, event) in enumerate(entries, 1):
            if event.get("sequence") != index:
                errors.append(f"{relative}: {stream} expected sequence {index}")
            if event.get("prev_event_hash") != previous:
                errors.append(f"{relative}: {stream} previous hash mismatch")
            previous = event.get("event_hash", "")
    for relative, event in rows:
        for field in ("parents", "supersedes", "correction_of"):
            for target in event.get(field, []):
                if target not in ids:
                    errors.append(f"{relative}: {field} references unknown {target}")
    return errors


def replay(rows):
    projections = {}
    owners = {}
    ordered = sorted(rows, key=lambda row: (row[1]["recorded_at"], row[1]["event_id"]))
    for relative, event in ordered:
        projection = event.get("payload", {}).get("projection")
        if not projection:
            continue
        target = projection.get("path", "")
        if not ALLOWED_PROJECTION.match(target):
            raise ValueError(f"{relative}: projection path is outside the allowlist")
        owner = owners.get(target)
        if owner and owner != event["stream_id"]:
            raise ValueError(f"{relative}: projection path has multiple owning streams")
        owners[target] = event["stream_id"]
        projections[target] = projection["record"]
    return projections


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--verify", action="store_true")
    parser.add_argument("--root", action="store_true")
    args = parser.parse_args()
    rows = load_events()
    errors = validate(rows)
    if errors:
        for error in errors:
            print(f"FAIL  {error}", file=sys.stderr)
        return 1
    try:
        projections = replay(rows)
    except ValueError as error:
        print(f"FAIL  {error}", file=sys.stderr)
        return 1
    if args.verify:
        for relative, expected in projections.items():
            actual_path = REPO / pathlib.PurePosixPath(relative)
            if not actual_path.exists():
                print(f"FAIL  {relative}: projection is missing", file=sys.stderr)
                return 1
            actual = json.loads(actual_path.read_text(encoding="utf-8"))
            if canonical(actual) != canonical(expected):
                print(f"FAIL  {relative}: projection diverges from Python replay", file=sys.stderr)
                return 1
        print(f"PASS  Python independently replayed {len(projections)} projections")
    print(digest(projections))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
