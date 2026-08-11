#!/usr/bin/env python3
"""Independent Python replay for cross-implementation agreement."""

import argparse
import hashlib
import heapq
import json
import pathlib
import re
import sys

REPO = pathlib.Path(__file__).resolve().parents[2]
EVENTS = REPO / "governance" / "ledger" / "events"
HASH = re.compile(r"^[0-9a-f]{64}$")
KEY = re.compile(r"^[A-Za-z0-9_.:-]+$")
MAX_SAFE_INTEGER = 9007199254740991
ALLOWED_PROJECTION = re.compile(
    r"^governance/(authority-map\.json|artifact-register\.json|external-feedback\.json|status-vocabulary-contract\.json|deployment-receipts/[a-z0-9._-]+\.json)$"
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


def validate_canonical_domain(value, trail="$", errors=None):
    if errors is None:
        errors = []
    if value is None or isinstance(value, bool):
        return errors
    if isinstance(value, str):
        if any(0xD800 <= ord(char) <= 0xDFFF for char in value):
            errors.append(f"{trail}: string contains an unpaired Unicode surrogate")
        return errors
    if isinstance(value, int):
        if abs(value) > MAX_SAFE_INTEGER:
            errors.append(f"{trail}: canonical profile permits safe integers only")
        return errors
    if isinstance(value, float):
        errors.append(f"{trail}: canonical profile permits safe integers only")
        return errors
    if isinstance(value, list):
        for index, item in enumerate(value):
            validate_canonical_domain(item, f"{trail}[{index}]", errors)
        return errors
    if isinstance(value, dict):
        for key, child in value.items():
            if not KEY.match(key):
                errors.append(f"{trail}: non-ASCII or unsupported object key {key!r}")
            validate_canonical_domain(child, f"{trail}.{key}", errors)
        return errors
    errors.append(f"{trail}: canonical profile refuses {type(value).__name__}")
    return errors


def validate(rows):
    errors = []
    ids = {}
    idempotency = {}
    streams = {}
    for relative, event in rows:
        for error in validate_canonical_domain(event):
            errors.append(f"{relative}: {error}")
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
    if not errors:
        try:
            causal_order(rows)
        except ValueError as error:
            errors.append(str(error))
    return errors


def causal_order(rows):
    by_id = {event["event_id"]: (relative, event) for relative, event in rows}
    incoming = {event_id: set() for event_id in by_id}
    outgoing = {event_id: set() for event_id in by_id}

    def edge(source, target):
        if source not in by_id or target not in by_id or source in incoming[target]:
            return
        incoming[target].add(source)
        outgoing[source].add(target)

    streams = {}
    for relative, event in rows:
        streams.setdefault(event["stream_id"], []).append((relative, event))
    for entries in streams.values():
        entries.sort(key=lambda row: (row[1]["sequence"], row[1]["event_id"]))
        for index in range(1, len(entries)):
            edge(entries[index - 1][1]["event_id"], entries[index][1]["event_id"])
    for _, event in rows:
        for field in ("parents", "supersedes", "correction_of"):
            for target in event.get(field, []):
                edge(target, event["event_id"])

    ready = []
    for event_id, (_, event) in by_id.items():
        if not incoming[event_id]:
            heapq.heappush(ready, (event["stream_id"], event["sequence"], event_id))
    ordered = []
    while ready:
        _, _, event_id = heapq.heappop(ready)
        ordered.append(by_id[event_id])
        for target in sorted(outgoing[event_id]):
            incoming[target].remove(event_id)
            if not incoming[target]:
                event = by_id[target][1]
                heapq.heappush(ready, (event["stream_id"], event["sequence"], target))
    if len(ordered) != len(rows):
        raise ValueError("causal cycle prevents deterministic replay")
    return ordered


def replay(rows):
    projections = {}
    owners = {}
    ordered = causal_order(rows)
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
