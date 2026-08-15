"""Write the deterministic raw-byte release manifest.

The manifest excludes itself to avoid self-reference. Every other regular file
under the release root is included, including receipts and verifier source.
"""

from __future__ import annotations

import hashlib
import json
import mimetypes
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
MANIFEST = ROOT / "release-manifest.json"


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def role(path: str) -> str:
    if path.startswith("paper/"):
        return "paper-output"
    if path.startswith("evidence/"):
        return "bounded-evidence"
    if path.startswith("tools/"):
        return "verification-tool"
    if path.startswith("figures/") or path in {
        "content_a.py", "content_b.py", "content_c.py", "figures.py", "style.py"
    }:
        return "paper-source"
    return "release-documentation"


def media_type(path: Path) -> str:
    overrides = {
        ".md": "text/markdown",
        ".py": "text/x-python",
        ".mjs": "text/javascript",
        ".ps1": "text/plain",
        ".cff": "application/yaml",
        ".svg": "image/svg+xml",
    }
    return overrides.get(path.suffix.lower()) or mimetypes.guess_type(path.name)[0] or "application/octet-stream"


def main() -> None:
    entries: dict[str, dict[str, object]] = {}
    candidates = {
        path.relative_to(ROOT).as_posix(): path
        for path in ROOT.rglob("*")
        if path.is_file()
        and path != MANIFEST
        and ".tmp" not in path.parts
        and "__pycache__" not in path.parts
    }
    for relative in sorted(candidates):
        path = candidates[relative]
        data = path.read_bytes()
        entries[relative] = {
            "bytes": len(data),
            "media_type": media_type(path),
            "role": role(relative),
            "sha256": sha256(data),
            "status": "OWNER_REVIEW",
        }

    root_material = "".join(
        f"{path}\0{record['sha256']}\0{record['bytes']}\n"
        for path, record in entries.items()
    ).encode("utf-8")
    manifest = {
        "schema": "accepted-state-owner-review-release.v1",
        "release_id": "from-model-output-to-accepted-state-0.1.0-owner-review.1",
        "status": "OWNER_REVIEW",
        "recorded_date": "2026-08-15",
        "hash_basis": "SHA-256 of raw file bytes",
        "excludes": ["release-manifest.json self-reference", ".tmp", "__pycache__"],
        "payload_root": sha256(root_material),
        "files": entries,
    }
    MANIFEST.write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2, sort_keys=False) + "\n",
        encoding="utf-8",
        newline="\n",
    )
    print(f"manifest files={len(entries)} payload_root={manifest['payload_root']}")


if __name__ == "__main__":
    main()
