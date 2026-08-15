"""Verify the owner-review release from raw bytes, without network access."""

from __future__ import annotations

import ast
import hashlib
import json
import re
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
MANIFEST = ROOT / "release-manifest.json"
TEXT_SUFFIXES = {".cff", ".html", ".json", ".md", ".mjs", ".ps1", ".py", ".svg", ".txt"}


def fail(message: str) -> None:
    raise SystemExit(f"VERIFY FAIL: {message}")


def digest(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def actual_files() -> list[str]:
    return sorted(
        path.relative_to(ROOT).as_posix()
        for path in ROOT.rglob("*")
        if path.is_file()
        and path != MANIFEST
        and ".tmp" not in path.parts
        and "__pycache__" not in path.parts
    )


def main() -> None:
    try:
        manifest_bytes = MANIFEST.read_bytes()
        manifest = json.loads(manifest_bytes.decode("utf-8"))
    except Exception as error:
        fail(f"manifest unreadable: {error}")

    if manifest.get("schema") != "accepted-state-owner-review-release.v1":
        fail("unknown manifest schema")
    if manifest.get("hash_basis") != "SHA-256 of raw file bytes":
        fail("unknown hash basis")

    expected = sorted(manifest.get("files", {}).keys())
    actual = actual_files()
    if actual != expected:
        fail(f"allowlist mismatch actual={actual!r} expected={expected!r}")

    root_material = bytearray()
    for relative in actual:
        path = ROOT / relative
        data = path.read_bytes()
        record = manifest["files"][relative]
        file_digest = digest(data)
        if record.get("bytes") != len(data) or record.get("sha256") != file_digest:
            fail(f"byte identity mismatch: {relative}")
        if record.get("status") != "OWNER_REVIEW":
            fail(f"unexpected file status: {relative}")
        if not isinstance(record.get("role"), str) or not record["role"]:
            fail(f"missing role: {relative}")
        root_material.extend(f"{relative}\0{file_digest}\0{len(data)}\n".encode("utf-8"))

        if path.suffix.lower() in TEXT_SUFFIXES or path.name in {"LICENSE", "requirements.txt"}:
            try:
                text = data.decode("utf-8")
            except UnicodeDecodeError as error:
                fail(f"invalid UTF-8 in {relative}: {error}")
            if "\ufffd" in text or "\x00" in text:
                fail(f"invalid text scalar in {relative}")
            if re.search(r"[A-Za-z]:[\\/](?:Users|Documents|Downloads|AppData)[\\/]", text):
                fail(f"absolute local path in {relative}")
            if re.search(r"(?:gh[opsu]_|github_pat_)[A-Za-z0-9_]{20,}", text):
                fail(f"credential-like token in {relative}")
            if path.suffix.lower() == ".json":
                try:
                    json.loads(text)
                except Exception as error:
                    fail(f"invalid JSON in {relative}: {error}")
            if path.suffix.lower() == ".py":
                try:
                    ast.parse(text, filename=relative)
                except SyntaxError as error:
                    fail(f"invalid Python in {relative}: {error}")
        elif path.suffix.lower() == ".pdf" and not data.startswith(b"%PDF-"):
            fail(f"invalid PDF signature: {relative}")

    payload_root = digest(bytes(root_material))
    if payload_root != manifest.get("payload_root"):
        fail("payload root mismatch")

    report = {
        "fileCount": len(actual),
        "manifestSha256": digest(manifest_bytes),
        "payloadRoot": payload_root,
        "status": "PASS",
    }
    sys.stdout.write(json.dumps(report, ensure_ascii=False, separators=(",", ":"), sort_keys=True) + "\n")


if __name__ == "__main__":
    main()
