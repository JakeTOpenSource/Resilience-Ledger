"""Generate the marker-blind claim register and separate assignment files.

The manuscript source is authoritative. Four marker examples in Table 1 define the
contract and are excluded; every other marker becomes one claim record. The reviewer
input contains claim text and registered review sources, but not the author's marker.
"""

from __future__ import annotations

import hashlib
import html
import importlib
import json
import re
import sys
from dataclasses import dataclass, field
from html.parser import HTMLParser
from pathlib import Path
from typing import Iterable


ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

A = importlib.import_module("content_a")
B = importlib.import_module("content_b")
C = importlib.import_module("content_c")

FRAGMENTS = [
    ("content_a.py", "FRONT", A.FRONT),
    ("content_a.py", "SUMMARY", A.SUMMARY),
    ("content_a.py", "CLAIMS", A.CLAIMS),
    ("content_a.py", "BOUNDARY", A.BOUNDARY),
    ("content_a.py", "LIFECYCLE", A.LIFECYCLE),
    ("content_b.py", "OBSERVATION", B.OBSERVATION),
    ("content_b.py", "REPLAY", B.REPLAY),
    ("content_b.py", "EVIDENCE", B.EVIDENCE),
    ("content_c.py", "RESULTS", C.RESULTS),
    ("content_c.py", "NEGATIVE", C.NEGATIVE),
    ("content_c.py", "BOUNDARY_SECTION", C.BOUNDARY_SECTION),
    ("content_c.py", "GUIDE", C.GUIDE),
    ("content_c.py", "BACK", C.BACK),
]

MARKERS = {"TESTED", "OBSERVED", "PROPOSED", "OPEN"}
SCHEMA = "fmota-claim-register.v1"
ASSIGNMENT_SCHEMA = "fmota-marker-assignments.v1"


def digest_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def file_record(path: str, source_id: str, *, status: str = "VERIFIED_BYTES") -> dict:
    data = (ROOT / path).read_bytes()
    return {
        "source_id": source_id,
        "kind": "packet_file",
        "path": path,
        "expected_bytes": len(data),
        "expected_sha256": digest_bytes(data),
        "access": "PUBLIC_PACKET",
        "verification_status": status,
    }


def public_blob(
    source_id: str,
    repository: str,
    commit: str,
    path: str,
    expected_bytes: int,
    expected_sha256: str,
) -> dict:
    return {
        "source_id": source_id,
        "kind": "public_git_blob",
        "repository": repository,
        "commit": commit,
        "path": path,
        "expected_bytes": expected_bytes,
        "expected_sha256": expected_sha256,
        "access": "PUBLIC_EXTERNAL",
        "verification_status": "VERIFIED_BYTES",
    }


@dataclass
class Node:
    tag: str
    attrs: dict[str, str]
    parent: "Node | None" = None
    children: list["Node | str"] = field(default_factory=list)


class TreeParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.root = Node("root", {})
        self.stack = [self.root]

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        node = Node(tag, {k: v or "" for k, v in attrs}, self.stack[-1])
        self.stack[-1].children.append(node)
        self.stack.append(node)

    def handle_startendtag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        node = Node(tag, {k: v or "" for k, v in attrs}, self.stack[-1])
        self.stack[-1].children.append(node)

    def handle_endtag(self, tag: str) -> None:
        for index in range(len(self.stack) - 1, 0, -1):
            if self.stack[index].tag == tag:
                del self.stack[index:]
                return

    def handle_data(self, data: str) -> None:
        self.stack[-1].children.append(data)


def node_text(node: Node | str, *, omit_markers: bool = False) -> str:
    if isinstance(node, str):
        return node
    classes = set(node.attrs.get("class", "").split())
    if omit_markers and node.tag == "span" and "chip" in classes:
        return ""
    return "".join(node_text(child, omit_markers=omit_markers) for child in node.children)


def normalized(text: str) -> str:
    return " ".join(html.unescape(text).split())


def walk(node: Node) -> Iterable[Node]:
    yield node
    for child in node.children:
        if isinstance(child, Node):
            yield from walk(child)


def ancestor(node: Node, tag: str) -> Node | None:
    current = node.parent
    while current is not None:
        if current.tag == tag:
            return current
        current = current.parent
    return None


def claim_unit(marker_node: Node) -> tuple[str, Node]:
    row = ancestor(marker_node, "tr")
    if row is not None:
        return "table_row", row
    paragraph = ancestor(marker_node, "p")
    if paragraph is not None:
        return "paragraph", paragraph
    current = marker_node.parent
    while current is not None:
        if current.tag in {"div", "li", "blockquote"}:
            return "block", current
        current = current.parent
    raise ValueError("claim marker has no supported parent unit")


def is_table_one_example(marker_node: Node) -> bool:
    table = ancestor(marker_node, "table")
    if table is None:
        return False
    captions = [n for n in walk(table) if n.tag == "caption"]
    return any(normalized(node_text(n)).startswith("Table 1.") for n in captions)


CEILINGS = {
    "TESTED": "Exact only within the registered artifact, fixture, command, or derivation; no external validity unless separately stated.",
    "OBSERVED": "Observed in the named run or artifact only; no causal or general claim.",
    "PROPOSED": "Design, definition, or protocol proposal only; not implementation or outcome evidence.",
    "OPEN": "Unresolved; it cannot support acceptance, equivalence, or a positive operational claim.",
}


EXPLICIT_CLAIM_SOURCES: dict[int, list[str]] = {
    1: ["EV-PAPER-CONTEXT"],
    2: ["EV-PUBLIC-STP-COMMIT"],
    3: ["EV-DEVICE-ANALYSIS", "EV-DEVICE-RECEIPT", "EV-TRANSITION-REPORT", "EV-TRANSITION-RECEIPT", "EV-BP-PROMPT", "EV-BP-SUMMARY", "EV-BP-EVALUATOR", "EV-BP-RECEIPT", "EV-PUBLIC-STP-COMMIT"],
    4: ["EV-RL-LEDGER-LIB", "EV-RL-REPLAY-PY", "EV-RL-VERIFY-REPLAYERS", "EV-RL-GATE", "EV-RL-ATLAS-DATA-CONTRACT", "EV-RL-ATLAS-RUNTIME-CONTRACT", "EV-RL-OBSERVATION-000001"],
    5: ["EV-PUBLIC-STP-COMMIT"],
    6: ["EV-PAPER-CONTEXT"],
    7: ["EV-PAPER-CONTEXT"],
    8: ["EV-BP-PROMPT", "EV-BP-SUMMARY", "EV-PAPER-CONTEXT"],
    9: ["EV-RL-TREE-275D", "EV-PAPER-CONTEXT"],
    10: ["EV-PAPER-CONTEXT"],
    11: ["EV-PUBLIC-STP-COMMIT"],
    12: ["EV-PAPER-CONTEXT"],
    13: ["EV-PAPER-CONTEXT"],
    14: ["EV-PUBLIC-STP-COMMIT", "EV-PAPER-CONTEXT"],
    15: ["EV-PAPER-CONTEXT"],
    16: ["EV-PUBLIC-STP-COMMIT"],
    17: ["EV-PAPER-CONTEXT"],
    18: ["EV-PAPER-CONTEXT"],
    19: ["EV-RL-LEDGER-LIB", "EV-RL-REPLAY-PY", "EV-RL-VERIFY-REPLAYERS"],
    20: ["EV-RL-LEDGER-LIB", "EV-RL-REPLAY-PY", "EV-RL-VERIFY-REPLAYERS", "EV-RL-CI-GATES"],
    21: ["EV-PUBLIC-STP-COMMIT"],
    22: ["EV-PUBLIC-STP-COMMIT"],
    23: ["EV-RL-LEDGER-LIB", "EV-RL-REPLAY-PY", "EV-RL-VERIFY-REPLAYERS"],
    24: ["EV-PAPER-CONTEXT"],
    25: ["EV-PAPER-CONTEXT"],
    26: ["EV-PAPER-CONTEXT"],
    27: ["EV-RL-GATE"],
    28: ["EV-RL-LEDGER-LIB", "EV-RL-REPLAY-PY", "EV-RL-VERIFY-REPLAYERS", "EV-PAPER-CONTEXT"],
    29: ["EV-PUBLIC-STP-COMMIT"],
    30: ["EV-RL-LEDGER-LIB", "EV-RL-REPLAY-PY", "EV-RL-VERIFY-REPLAYERS"],
    31: ["EV-PAPER-CONTEXT"],
    32: ["EV-PAPER-CONTEXT"],
    33: ["EV-PAPER-CONTEXT"],
    34: ["EV-PAPER-CONTEXT"],
    35: ["EV-PAPER-CONTEXT"],
    36: ["EV-PAPER-CONTEXT"],
    37: ["EV-PAPER-CONTEXT"],
    38: ["EV-RL-GATE", "EV-PAPER-CONTEXT"],
    39: ["EV-DEVICE-ANALYSIS", "EV-DEVICE-RECEIPT", "EV-TRANSITION-REPORT", "EV-TRANSITION-RECEIPT", "EV-BP-PROMPT", "EV-BP-SUMMARY", "EV-BP-EVALUATOR", "EV-BP-RECEIPT", "EV-PAPER-CONTEXT"],
    40: ["EV-RL-GATE"],
    41: ["EV-RL-ATLAS-DATA-CONTRACT", "EV-RL-ATLAS-RUNTIME-CONTRACT", "EV-RL-GATE"],
    42: ["EV-RL-OBSERVATION-000001"],
    43: ["EV-RL-OBSERVATION-000002"],
    44: ["EV-RL-OBSERVATION-000003", "EV-RL-CHECKPOINT-000013"],
    45: ["EV-RL-OBSERVATION-000003", "EV-RL-CHECKPOINT-000013"],
    46: ["EV-BP-PROMPT", "EV-BP-SUMMARY", "EV-BP-EVALUATOR", "EV-BP-RECEIPT"],
    47: ["EV-BP-PROMPT", "EV-BP-SUMMARY", "EV-BP-EVALUATOR", "EV-BP-RECEIPT"],
    48: ["EV-RL-OBSERVATION-000001", "EV-RL-GATE"],
    49: ["EV-RL-OBSERVATION-000001", "EV-RL-OBSERVATION-000002", "EV-RL-TREE-275D"],
    50: ["EV-TYPED-REFUSAL-ARMS", "EV-TYPED-REFUSAL-STATS"],
    51: ["EV-TYPED-REFUSAL-ARMS", "EV-TYPED-REFUSAL-STATS", "EV-TYPED-REFUSAL-TREE", "EV-TYPED-REFUSAL-CORPUS"],
    52: ["EV-STABLE-PREREGISTRATION", "EV-STABLE-DECISION-LOGS", "EV-STABLE-CELLS"],
    53: ["EV-STABLE-REPLAY", "EV-STABLE-CELLS", "EV-STABLE-GATE"],
    54: ["EV-PAPER-CONTEXT"],
    55: ["EV-PUBLIC-STP-COMMIT", "EV-PAPER-CONTEXT"],
    56: ["EV-PUBLIC-STP-COMMIT", "EV-PAPER-CONTEXT"],
    57: ["EV-PAPER-CONTEXT"],
    58: ["EV-PAPER-CONTEXT"],
    59: ["EV-PUBLIC-STP-COMMIT", "EV-PAPER-CONTEXT"],
    60: ["EV-LEAN-QUERY-SOURCE", "EV-LEAN-QUERY-RECEIPT"],
    61: ["EV-WINDOWS-CLEAN-CLONE-V3", "EV-REPRODUCE-RUNBOOK", "EV-PACKET-EOL-RULE"],
    62: ["EV-PAPER-CONTEXT"],
}


def explicit_source_ids(claim_number: int) -> list[str]:
    try:
        return list(EXPLICIT_CLAIM_SOURCES[claim_number])
    except KeyError as error:
        raise SystemExit(f"missing explicit source map for claim {claim_number:03d}") from error


def source_registry() -> list[dict]:
    return [
        public_blob(
            "EV-PUBLIC-STP-COMMIT", "JakeTOpenSource/Resilience-Ledger",
            "275d0b3e7474ef58456c82a042163567cd12122f",
            "research/stp-v1.2/release-manifest.json", 3613,
            "2f95ed233a20060d1cbca3fae555410732242b26d9fb08afe482bc3390077704",
        ),
        {
            "source_id": "EV-RL-TREE-275D",
            "kind": "public_git_tree",
            "repository": "JakeTOpenSource/Resilience-Ledger",
            "commit": "275d0b3e7474ef58456c82a042163567cd12122f",
            "tree": "ed1342684125e9165f27fdc6d9702b102665b324",
            "access": "PUBLIC_EXTERNAL",
            "verification_status": "VERIFIED_BYTES",
        },
        public_blob(
            "EV-RL-GATE", "JakeTOpenSource/Resilience-Ledger",
            "275d0b3e7474ef58456c82a042163567cd12122f",
            "governance/harnesses/run-all.js", 925,
            "2725275449ea6bd25d460e328885dcf11685af2854582fef2db8aa61f6f33a96",
        ),
        public_blob(
            "EV-RL-LEDGER-LIB", "JakeTOpenSource/Resilience-Ledger",
            "275d0b3e7474ef58456c82a042163567cd12122f",
            "governance/ledger/lib.js", 18577,
            "8e824d144f5416fc969ab49f13639325c4a5cfc32970a006e3732181b9c68ac8",
        ),
        public_blob(
            "EV-RL-REPLAY-PY", "JakeTOpenSource/Resilience-Ledger",
            "275d0b3e7474ef58456c82a042163567cd12122f",
            "governance/harnesses/replay.py", 7946,
            "db6fdd073034e0c2173af0d65dca6c3db3e73cd4841f25bbc3fbb91aee069279",
        ),
        public_blob(
            "EV-RL-VERIFY-REPLAYERS", "JakeTOpenSource/Resilience-Ledger",
            "275d0b3e7474ef58456c82a042163567cd12122f",
            "governance/harnesses/verify-replayers.js", 1854,
            "7e63495fe344b007b221061c73c8b70dbf536e924db1ce9da9a7d14426da6b49",
        ),
        public_blob(
            "EV-RL-CI-GATES", "JakeTOpenSource/Resilience-Ledger",
            "275d0b3e7474ef58456c82a042163567cd12122f",
            ".github/workflows/gates.yml", 2914,
            "066c58b7841bb0363ed28bb9196f568a0de82f663b891cb8ae6ce6d22d579723",
        ),
        public_blob(
            "EV-RL-ATLAS-DATA-CONTRACT", "JakeTOpenSource/Resilience-Ledger",
            "275d0b3e7474ef58456c82a042163567cd12122f",
            "governance/contracts/atlas-data-sync.contract.v2.json", 10165,
            "7366c7042ec2e40a501fe091f9367eb5e8e8449763b69afadf29762864d58263",
        ),
        public_blob(
            "EV-RL-ATLAS-RUNTIME-CONTRACT", "JakeTOpenSource/Resilience-Ledger",
            "275d0b3e7474ef58456c82a042163567cd12122f",
            "governance/contracts/atlas-runtime-contract.v1.json", 2558,
            "7cd8c2a89f6df20995789f066643240a4cbcbc3ca67d2dc1cc4c71129b22ffd5",
        ),
        public_blob(
            "EV-RL-OBSERVATION-000001", "JakeTOpenSource/Resilience-Ledger",
            "275d0b3e7474ef58456c82a042163567cd12122f",
            "governance/ledger/events/deployment/000001-wp0-production-observation.json", 6252,
            "34bde4ec2eb4d1bfb70b8d44df6439cb295bd1dc1293df0ae47490193ad3fa97",
        ),
        public_blob(
            "EV-RL-OBSERVATION-000002", "JakeTOpenSource/Resilience-Ledger",
            "275d0b3e7474ef58456c82a042163567cd12122f",
            "governance/ledger/events/deployment/000002-public-explanation-production-observed.json", 10952,
            "4917a927727e3b0cc03cd057100a698ccc18e51751f69dd33f5bed14344fa24f",
        ),
        public_blob(
            "EV-RL-OBSERVATION-000003", "JakeTOpenSource/Resilience-Ledger",
            "5f9cc145763bc51b183e93b4f7059b25aa6ee2ca",
            "governance/ledger/events/deployment/000003-service-worker-drift-closed.json", 4782,
            "f03960cb1927a2c89fa5b9e98bd9cdf0cdd977c6b45fe19937346264251158e4",
        ),
        public_blob(
            "EV-RL-CHECKPOINT-000013", "JakeTOpenSource/Resilience-Ledger",
            "5f9cc145763bc51b183e93b4f7059b25aa6ee2ca",
            "governance/ledger/checkpoints/checkpoint-000013.json", 4922,
            "17a2bf4ee223dcbd55bdf22dd66aebac95c6c3273d958fb0a15f4608917fcbb2",
        ),
        file_record("evidence/device-activation/expected-analysis.json", "EV-DEVICE-ANALYSIS"),
        file_record("evidence/device-activation/BUILD-RECEIPT-000001.md", "EV-DEVICE-RECEIPT"),
        file_record("evidence/transition-stable-quotient/expected-report.json", "EV-TRANSITION-REPORT"),
        file_record("evidence/transition-stable-quotient/BUILD-RECEIPT-000001.md", "EV-TRANSITION-RECEIPT"),
        file_record("evidence/blind-prompt/PROMPT.md", "EV-BP-PROMPT"),
        file_record("evidence/blind-prompt/PUBLIC-SUMMARY.md", "EV-BP-SUMMARY"),
        {
            "source_id": "EV-BP-EVALUATOR",
            "kind": "retained_digest",
            "retained_source_id": "BP-EVALUATOR-001",
            "expected_bytes": 20945,
            "expected_sha256": "de2c28735762a153602fc6e4bb777520c2aa3c687837e3f64b6277c459d67fe9",
            "access": "RETAINED_RESTRICTED",
            "verification_status": "DECLARED_ONLY",
        },
        {
            "source_id": "EV-BP-RECEIPT",
            "kind": "retained_digest",
            "retained_source_id": "BP-RECEIPT-001",
            "expected_bytes": 4488,
            "expected_sha256": "537e8cc13e8425e53304dd22637df6d186efa4df0be0f910a747b5f78632c815",
            "access": "RETAINED_RESTRICTED",
            "verification_status": "DECLARED_ONLY",
        },
        file_record("evidence/lean-query-quotient/QueryQuotient.lean", "EV-LEAN-QUERY-SOURCE"),
        file_record("evidence/lean-query-quotient/BUILD-RECEIPT-000005.md", "EV-LEAN-QUERY-RECEIPT"),
        public_blob(
            "EV-TYPED-REFUSAL-ARMS", "JakeTOpenSource/typed-refusal-harness",
            "721a824c9f735d3972d720b41685469a1020fa91", "data/arms.json", 4937,
            "504ca00f4286f25ee80ebe4cc9aacb2a05326b66c45602e40113117bbb40389b",
        ),
        public_blob(
            "EV-TYPED-REFUSAL-STATS", "JakeTOpenSource/typed-refusal-harness",
            "721a824c9f735d3972d720b41685469a1020fa91", "data/stats.py", 5364,
            "8ecd41b40b7b75eaaa93ee0caa017e764182a3e0aee0a6f1beda7aa86277c802",
        ),
        {
            "source_id": "EV-TYPED-REFUSAL-TREE",
            "kind": "public_git_tree",
            "repository": "JakeTOpenSource/typed-refusal-harness",
            "commit": "721a824c9f735d3972d720b41685469a1020fa91",
            "tree": "ae82fa57c0b34bb2166424128d2537822e53bc26",
            "access": "PUBLIC_EXTERNAL",
            "verification_status": "VERIFIED_BYTES",
        },
        {
            "source_id": "EV-TYPED-REFUSAL-CORPUS",
            "kind": "retained_digest",
            "retained_source_id": "TR-CORPUS-TITLE-29",
            "expected_bytes": 11666245,
            "expected_sha256": "188ab1c50a46f0dd2ff32aaa5f65c759a07710e052d297644b1a8f6b58ff413d",
            "access": "RETAINED_RESTRICTED",
            "verification_status": "UNAVAILABLE",
        },
        public_blob(
            "EV-STABLE-PREREGISTRATION", "JakeTOpenSource/the-stable",
            "77408db59cad3f968ac9ba5a0c0c6689a90e80d4",
            "experiments/replication-2026-07-17/PREREGISTRATION.md", 7602,
            "eff780cff6a4522370af2f00d01a7dc121ab143677f805cbdc865620dad7820b",
        ),
        public_blob(
            "EV-STABLE-DECISION-LOGS", "JakeTOpenSource/the-stable",
            "77408db59cad3f968ac9ba5a0c0c6689a90e80d4",
            "experiments/replication-2026-07-17/decision-logs.json", 144527,
            "9fb48b2c0a837f91581c5faf5a043126348b6f86e64bf2383182f65978ffdca6",
        ),
        public_blob(
            "EV-STABLE-REPLAY", "JakeTOpenSource/the-stable",
            "77408db59cad3f968ac9ba5a0c0c6689a90e80d4",
            "bridge/replay-replication.js", 5373,
            "2fd2afa0b90395194b3165e19c580c4af626dfae7f54cb44193b1c326d25ebb0",
        ),
        public_blob(
            "EV-STABLE-CELLS", "JakeTOpenSource/the-stable",
            "77408db59cad3f968ac9ba5a0c0c6689a90e80d4",
            "bridge/replication-cells.json", 8097,
            "326b544a425daf07fe38790d58ee1dfdba825536bec84e7f81a3c46b187e2939",
        ),
        public_blob(
            "EV-STABLE-GATE", "JakeTOpenSource/the-stable",
            "77408db59cad3f968ac9ba5a0c0c6689a90e80d4", "stable-gate.js", 15250,
            "7ab31a6cd8daa969a61230cb545db30c27b8cf80820150b07bc7328c5e16a9a2",
        ),
        file_record(
            "evidence/reproduction/WINDOWS-CLEAN-CLONE-V3.md",
            "EV-WINDOWS-CLEAN-CLONE-V3",
        ),
        file_record("REPRODUCE.md", "EV-REPRODUCE-RUNBOOK"),
        file_record(".gitattributes", "EV-PACKET-EOL-RULE"),
        {
            "source_id": "EV-PAPER-CONTEXT",
            "kind": "paper_context",
            "access": "PUBLIC_PACKET",
            "verification_status": "NOT_EVIDENCE",
        },
    ]


def generate() -> tuple[dict, dict, dict]:
    source_hashes = {
        name: digest_bytes((ROOT / name).read_bytes())
        for name in ("content_a.py", "content_b.py", "content_c.py")
    }
    claims: list[dict] = []
    author: list[dict] = []
    sources = source_registry()
    source_by_id = {source["source_id"]: source for source in sources}
    section = "Front matter"

    for source_path, fragment_name, markup in FRAGMENTS:
        parser = TreeParser()
        parser.feed(markup)
        for node in walk(parser.root):
            if node.tag in {"h1", "h2", "h3", "h4"}:
                heading = normalized(node_text(node))
                if heading:
                    section = heading
            if node.tag != "span" or "chip" not in node.attrs.get("class", "").split():
                continue
            marker = normalized(node_text(node))
            if marker not in MARKERS:
                continue
            if is_table_one_example(node):
                continue
            scope, unit = claim_unit(node)
            text = normalized(node_text(unit, omit_markers=True))
            anchor = node.attrs.get("data-claim")
            if not anchor:
                raise SystemExit(
                    f"claim marker without data-claim anchor in {fragment_name}: {marker}"
                )
            claim_id = f"FMOTA-V4-CLM-{anchor}"
            if any(existing["claim_id"] == claim_id for existing in claims):
                raise SystemExit(f"duplicate data-claim anchor {anchor}")
            review_source_ids = explicit_source_ids(int(anchor))
            unknown_sources = [source_id for source_id in review_source_ids if source_id not in source_by_id]
            if unknown_sources:
                raise SystemExit(f"unregistered explicit sources for {claim_id}: {unknown_sources}")
            relied_on_source_ids = [
                source_id for source_id in review_source_ids
                if source_by_id[source_id]["verification_status"] != "NOT_EVIDENCE"
            ]
            unavailable_source_ids = [
                source_id for source_id in relied_on_source_ids
                if source_by_id[source_id]["verification_status"] in {"DECLARED_ONLY", "UNAVAILABLE"}
            ]
            claims.append(
                {
                    "claim_id": claim_id,
                    "section": section,
                    "scope": scope,
                    "fragment": fragment_name,
                    "claim_text": text,
                    "claim_text_sha256": digest_bytes(text.encode("utf-8")),
                    "review_source_ids": review_source_ids,
                    "review_questions": [
                        "Which one Table 1 marker is supported by the registered and available material?",
                        "What is the strongest reading the registered material actually supports?",
                    ],
                }
            )
            author.append(
                {
                    "claim_id": claim_id,
                    "marker": marker,
                    "ceiling": CEILINGS[marker],
                    "rationale": "See the marked manuscript unit and its registered review sources.",
                    "relied_on_source_ids": relied_on_source_ids,
                    "unavailable_source_ids": unavailable_source_ids,
                }
            )

    if len(claims) != 62:
        raise SystemExit(f"expected 62 substantive claims, found {len(claims)}")

    register = {
        "schema_version": SCHEMA,
        "status": "OWNER_REVIEW",
        "paper_output_path": "paper/From-Model-Output-to-Accepted-State-Owner-Review-v4.pdf",
        "paper_source_sha256": source_hashes,
        "marker_policy": {
            "source_path": "content_a.py",
            "source_sha256": source_hashes["content_a.py"],
            "section": "2 / Table 1",
            "definitions": {
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
            },
        },
        "blinding_protocol": (
            "Give claims.json, registered accessible sources, and "
            "reviewer-markers.template.json to the reviewer before exposing the "
            "marked manuscript or author-markers.json. This is procedural blinding, "
            "not cryptographic secrecy after publication."
        ),
        "comparison_rule": (
            "Compare by claim_id only. Equal markers agree. Any mismatch is "
            "MATERIAL_DISAGREEMENT and places the claim in CONTESTED/HOLD until "
            "owner adjudication; missing assignments are INCOMPLETE. Never auto-promote."
        ),
        "sources": sources,
        "claims": claims,
    }
    register_bytes = (json.dumps(register, ensure_ascii=True, indent=2) + "\n").encode("utf-8")
    register_sha = digest_bytes(register_bytes)
    author_key = {
        "schema_version": ASSIGNMENT_SCHEMA,
        "claim_register_sha256": register_sha,
        "assignment_role": "AUTHOR_KEY",
        "assignment_set_id": "author-v4",
        "assignments": author,
    }
    reviewer = {
        "schema_version": ASSIGNMENT_SCHEMA,
        "claim_register_sha256": register_sha,
        "assignment_role": "EXTERNAL_REVIEW",
        "assignment_set_id": "replace-with-reviewer-id",
        "assignments": [
            {
                "claim_id": claim["claim_id"],
                "marker": None,
                "rationale": "",
                "relied_on_source_ids": [],
                "unavailable_source_ids": [],
            }
            for claim in claims
        ],
    }
    return register, author_key, reviewer


def encoded(value: dict) -> bytes:
    return (json.dumps(value, ensure_ascii=True, indent=2) + "\n").encode("utf-8")


def main() -> None:
    check_only = "--check" in sys.argv[1:]
    register, author_key, reviewer = generate()
    outputs = {
        "claims.json": register,
        "author-markers.json": author_key,
        "reviewer-markers.template.json": reviewer,
    }
    mismatches: list[str] = []
    for name, value in outputs.items():
        path = ROOT / name
        data = encoded(value)
        if check_only:
            if not path.exists() or path.read_bytes() != data:
                mismatches.append(name)
        else:
            path.write_bytes(data)
    if mismatches:
        raise SystemExit("claim-register mismatch: " + ", ".join(mismatches))
    mode = "CHECK" if check_only else "WRITE"
    print(f"CLAIM REGISTER {mode} PASS claims=61")


if __name__ == "__main__":
    main()
