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
TEXT_SUFFIXES = {".cff", ".html", ".json", ".lean", ".md", ".mjs", ".ps1", ".py", ".svg", ".txt"}
PRIVATE_PATTERNS = {
    "absolute Windows user path": r"[A-Za-z]:[\\/](?:Users|Documents|Downloads|AppData)[\\/]",
    "absolute Unix user path": r"/(?:Users|home)/[^/\s]+/",
    "Codex private locator": r"(?:\.codex[\\/]|codex-remote-attachments|codex-clipboard-)",
    "workspace-only locator": r"(?:work/<wbr>|work/(?:device-activation|transition-stable|probabilistic-audit|mathlib-zero-state))",
    "local network locator": r"(?:localhost|127\.0\.0\.1)",
    "email address": r"\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b",
    "private key material": r"-----BEGIN [A-Z ]*PRIVATE KEY-----",
}


def fail(message: str) -> None:
    raise SystemExit(f"VERIFY FAIL: {message}")


def digest(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def actual_files() -> list[str]:
    caches = [
        path.relative_to(ROOT).as_posix()
        for path in ROOT.rglob("*")
        if path.is_file() and ("__pycache__" in path.parts or path.suffix.lower() in {".pyc", ".pyo"})
    ]
    if caches:
        fail(f"compiled Python cache present: {sorted(caches)!r}")
    return sorted(
        path.relative_to(ROOT).as_posix()
        for path in ROOT.rglob("*")
        if path.is_file()
        and path != MANIFEST
        and ".tmp" not in path.parts
        and "__pycache__" not in path.parts
    )


def verify_claim_register(manifest: dict) -> None:
    claims_path = ROOT / "claims.json"
    author_path = ROOT / "author-markers.json"
    reviewer_path = ROOT / "reviewer-markers.template.json"
    try:
        register = json.loads(claims_path.read_text(encoding="utf-8"))
        author = json.loads(author_path.read_text(encoding="utf-8"))
        reviewer = json.loads(reviewer_path.read_text(encoding="utf-8"))
    except Exception as error:
        fail(f"claim register unreadable: {error}")

    if register.get("schema_version") != "fmota-claim-register.v1":
        fail("unknown claim-register schema")
    if register.get("status") != "OWNER_REVIEW":
        fail("claim-register status mismatch")
    expected_output = "paper/From-Model-Output-to-Accepted-State-Owner-Review-v4.pdf"
    if register.get("paper_output_path") != expected_output:
        fail("claim-register paper output mismatch")
    output_record = manifest.get("files", {}).get(expected_output)
    if not isinstance(output_record, dict) or output_record.get("role") != "paper-output":
        fail("claim-register paper output is not manifest-bound")
    source_hashes = register.get("paper_source_sha256")
    if not isinstance(source_hashes, dict):
        fail("claim-register paper source map missing")
    for source_name in ("content_a.py", "content_b.py", "content_c.py"):
        if source_hashes.get(source_name) != digest((ROOT / source_name).read_bytes()):
            fail(f"claim-register paper source mismatch: {source_name}")

    marker_names = {"TESTED", "OBSERVED", "PROPOSED", "OPEN"}
    expected_policy = {
        "TESTED": {
            "meaning": "Exact behavior over a named finite corpus, reproducible by a stated command.",
            "never_means": "That the behavior generalizes past that corpus.",
        },
        "OBSERVED": {
            "meaning": "A bounded inspection of a named surface at a recorded time.",
            "never_means": "That the surface still looks that way, or that other surfaces match.",
        },
        "PROPOSED": {
            "meaning": "Specified or reasoned beyond the tested artifact boundary. It may have a partial fixture, but the marked claim itself is not established.",
            "never_means": "Implemented behavior. Do not cite it as a result.",
        },
        "OPEN": {
            "meaning": "I do not know, and I say where the evidence stops.",
            "never_means": "That the question is unimportant.",
        },
    }
    if register.get("marker_policy", {}).get("definitions") != expected_policy:
        fail("claim-register marker policy mismatch")

    sources = register.get("sources")
    claims = register.get("claims")
    if not isinstance(sources, list) or not isinstance(claims, list) or len(claims) != 62:
        fail("claim-register collection mismatch")
    source_ids = [source.get("source_id") for source in sources if isinstance(source, dict)]
    if len(source_ids) != len(set(source_ids)) or None in source_ids:
        fail("claim-register source IDs are not unique")
    source_by_id = {source["source_id"]: source for source in sources}
    for source_id, source in source_by_id.items():
        kind = source.get("kind")
        status = source.get("verification_status")
        if kind == "packet_file":
            relative = source.get("path")
            if not isinstance(relative, str) or not relative or ".." in Path(relative).parts or Path(relative).is_absolute():
                fail(f"unsafe packet source path: {source_id}")
            source_path = ROOT / relative
            if relative not in manifest.get("files", {}) or not source_path.is_file():
                fail(f"unbound packet source: {source_id}")
            data = source_path.read_bytes()
            if source.get("expected_bytes") != len(data) or source.get("expected_sha256") != digest(data):
                fail(f"packet source identity mismatch: {source_id}")
        elif kind == "public_git_blob":
            if not re.fullmatch(r"[0-9a-f]{40}", str(source.get("commit", ""))):
                fail(f"invalid public commit: {source_id}")
            if not isinstance(source.get("path"), str) or not source["path"]:
                fail(f"missing public path: {source_id}")
            if not isinstance(source.get("expected_bytes"), int) or source["expected_bytes"] <= 0:
                fail(f"invalid public byte count: {source_id}")
            if not re.fullmatch(r"[0-9a-f]{64}", str(source.get("expected_sha256", ""))):
                fail(f"invalid public digest: {source_id}")
        elif kind == "public_git_tree":
            if not re.fullmatch(r"[0-9a-f]{40}", str(source.get("commit", ""))) or not re.fullmatch(r"[0-9a-f]{40}", str(source.get("tree", ""))):
                fail(f"invalid public tree identity: {source_id}")
        elif kind == "retained_digest":
            if not isinstance(source.get("expected_bytes"), int) or source["expected_bytes"] <= 0:
                fail(f"invalid retained byte count: {source_id}")
            if not re.fullmatch(r"[0-9a-f]{64}", str(source.get("expected_sha256", ""))):
                fail(f"invalid retained digest: {source_id}")
        elif kind == "paper_context":
            if status != "NOT_EVIDENCE":
                fail("paper context was promoted to evidence")
        else:
            fail(f"unknown claim source kind: {source_id}")

    expected_ids = [claim.get("claim_id") if isinstance(claim, dict) else None for claim in claims]
    if any(not isinstance(cid, str) or not re.fullmatch(r"FMOTA-V4-CLM-\d{3}", cid) for cid in expected_ids):
        fail("malformed claim ID")
    if len(set(expected_ids)) != len(expected_ids):
        fail("duplicate claim IDs")
    claim_ids: list[str] = []
    for claim in claims:
        if not isinstance(claim, dict):
            fail("claim record is not an object")
        claim_id = claim.get("claim_id")
        claim_text = claim.get("claim_text")
        expected_claim_fields = {
            "claim_id", "section", "scope", "fragment", "claim_text",
            "claim_text_sha256", "review_source_ids", "review_questions",
        }
        if set(claim) != expected_claim_fields:
            fail(f"claim field mismatch: {claim_id}")
        if not isinstance(claim_id, str) or not isinstance(claim_text, str):
            fail("claim record identity missing")
        if "marker" in claim or "ceiling" in claim:
            fail(f"author-marker leakage in marker-blind record: {claim_id}")
        if claim.get("claim_text_sha256") != digest(claim_text.encode("utf-8")):
            fail(f"claim text digest mismatch: {claim_id}")
        review_ids = claim.get("review_source_ids")
        if not isinstance(review_ids, list) or not review_ids or len(review_ids) != len(set(review_ids)) or any(item not in source_ids for item in review_ids):
            fail(f"unregistered review source: {claim_id}")
        claim_ids.append(claim_id)
    if claim_ids != expected_ids:
        fail("claim IDs are incomplete or out of order")

    register_sha = digest(claims_path.read_bytes())
    for assignment_set, role in ((author, "AUTHOR_KEY"), (reviewer, "EXTERNAL_REVIEW")):
        if assignment_set.get("schema_version") != "fmota-marker-assignments.v1":
            fail(f"unknown marker-assignment schema: {role}")
        if assignment_set.get("assignment_role") != role:
            fail(f"marker-assignment role mismatch: {role}")
        if assignment_set.get("claim_register_sha256") != register_sha:
            fail(f"marker-assignment register digest mismatch: {role}")
        assignments = assignment_set.get("assignments")
        if not isinstance(assignments, list) or [item.get("claim_id") for item in assignments] != expected_ids:
            fail(f"marker assignments are incomplete or out of order: {role}")
        for item in assignments:
            if role == "AUTHOR_KEY":
                if set(item) != {"claim_id", "marker", "ceiling", "rationale", "relied_on_source_ids", "unavailable_source_ids"}:
                    fail(f"author assignment field mismatch: {item.get('claim_id')}")
                if item.get("marker") not in marker_names or not isinstance(item.get("ceiling"), str) or not item["ceiling"]:
                    fail(f"invalid author assignment: {item.get('claim_id')}")
                claim = claims[expected_ids.index(item["claim_id"])]
                relied = item.get("relied_on_source_ids")
                unavailable = item.get("unavailable_source_ids")
                if not isinstance(relied, list) or not isinstance(unavailable, list):
                    fail(f"invalid author evidence arrays: {item.get('claim_id')}")
                if any(source_id not in claim["review_source_ids"] for source_id in relied):
                    fail(f"author relied on unregistered claim source: {item.get('claim_id')}")
                if any(source_id not in relied for source_id in unavailable):
                    fail(f"author unavailable source is not relied on: {item.get('claim_id')}")
                if item["marker"] in {"TESTED", "OBSERVED"} and not any(
                    source_by_id[source_id]["verification_status"] != "NOT_EVIDENCE"
                    for source_id in relied
                ):
                    fail(f"result claim lacks evidence: {item.get('claim_id')}")
            else:
                if set(item) != {"claim_id", "marker", "rationale", "relied_on_source_ids", "unavailable_source_ids"}:
                    fail(f"reviewer assignment field mismatch: {item.get('claim_id')}")
                if item.get("marker") is not None or item.get("rationale") != "" or item.get("relied_on_source_ids") != [] or item.get("unavailable_source_ids") != []:
                    fail(f"reviewer template is not blank: {item.get('claim_id')}")


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

        if path.suffix.lower() in TEXT_SUFFIXES or path.name in {"LICENSE", "requirements.txt", ".gitattributes", ".gitignore"}:
            try:
                text = data.decode("utf-8")
            except UnicodeDecodeError as error:
                fail(f"invalid UTF-8 in {relative}: {error}")
            if "\ufffd" in text or "\x00" in text:
                fail(f"invalid text scalar in {relative}")
            if relative not in {"tools/verify_release.py", "tools/verify-release.mjs"}:
                for label, pattern in PRIVATE_PATTERNS.items():
                    if re.search(pattern, text, flags=re.I):
                        fail(f"{label} in {relative}")
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

    verify_claim_register(manifest)

    report = {
        "fileCount": len(actual),
        "manifestSha256": digest(manifest_bytes),
        "payloadRoot": payload_root,
        "status": "PASS",
    }
    sys.stdout.write(json.dumps(report, ensure_ascii=False, separators=(",", ":"), sort_keys=True) + "\n")


if __name__ == "__main__":
    main()
