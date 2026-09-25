#!/usr/bin/env python3
"""Trace the hard values in a document back to the artifacts under one root.

Three outcomes, and the third is the interesting one:

    TRACED     the value is in a file, verbatim, or is the digest of a file
    ROUNDED    a file holds a longer value that rounds to this one
    UNDEFINED  no artifact under this root defines this value yet

UNDEFINED is a statement about the root, not about the value. The artifact may
live in another tree, may be external by design, or may not have been written.
The tool knows which root it was given and nothing else.

Standard library only.

Usage:
    python pin_check.py <document> <root> [--ext=.md,.py,.json]
"""
from __future__ import annotations

import hashlib
import re
import sys
from pathlib import Path

PATTERNS = {
    "decimal": re.compile(r"(?<![\w.])\d+\.\d{4,}(?![\w])"),
    "digest": re.compile(r"(?<![0-9a-fA-F])[0-9a-f]{12,64}(?![0-9a-fA-F])"),
    "version": re.compile(r"(?<![\w.])v?\d+\.\d+\.\d+(?![\w.])"),
    "bigint": re.compile(r"(?<![\w.,])\d{1,3}(?:,\d{3})+(?![\w.,])"),
    "count": re.compile(r"(?<![\w.,\-])\d{3,6}(?![\w.,\-\d])"),
}

DEFAULT_EXT = ".md,.py,.json,.lean,.mjs,.js,.ps1,.txt,.toml,.yml,.yaml,.cff"
SKIP_DIRS = {".git", "node_modules", "__pycache__", ".lake", ".tooling", "out", "build"}

# Documents whose purpose is to name things that are deliberately elsewhere.
OUTWARD_FACING = re.compile(r"^(source|reference|citation|bibliograph)", re.I)

# 2608.13637 is an arXiv identifier, not a measurement. A real four-digit
# measurement with four decimal places is skipped too. That is the cost.
ARXIV_SHAPED = re.compile(r"^\d{4}\.\d{4,5}$")

# A digit group sitting next to any of these is a citation identifier, not a
# measurement. Checked in a window around the match rather than by shape, so it
# also catches DOI suffixes, ISBNs, and numbers embedded in URLs.
CITATION_CONTEXT = re.compile(r"doi|isbn|issn|arxiv|https?://|www\.", re.I)
CITATION_WINDOW = 48


def corpus(root, exts, exclude):
    files = []
    for path in sorted(root.rglob("*")):
        if not path.is_file() or path.suffix.lower() not in exts:
            continue
        if any(part in SKIP_DIRS for part in path.parts):
            continue
        if exclude is not None and path.resolve() == exclude:
            continue
        try:
            files.append((path, path.read_text(encoding="utf-8", errors="replace")))
        except OSError:
            continue
    return files


def file_sizes(root):
    """byte size -> relative path, for every file in the tree."""
    sizes = {}
    for path in sorted(root.rglob("*")):
        if not path.is_file() or any(part in SKIP_DIRS for part in path.parts):
            continue
        try:
            sizes.setdefault(path.stat().st_size, str(path.relative_to(root)))
        except OSError:
            continue
    return sizes


def file_digests(root):
    """sha256 -> relative path, for every file in the tree."""
    digests = {}
    for path in sorted(root.rglob("*")):
        if not path.is_file() or any(part in SKIP_DIRS for part in path.parts):
            continue
        try:
            digests[hashlib.sha256(path.read_bytes()).hexdigest()] = str(path.relative_to(root))
        except OSError:
            continue
    return digests


def extract(text):
    found = {}
    for kind, pattern in PATTERNS.items():
        for match in pattern.finditer(text):
            token = match.group(0)
            if kind == "decimal" and ARXIV_SHAPED.match(token):
                continue
            window = text[max(0, match.start() - CITATION_WINDOW):match.end() + CITATION_WINDOW]
            if CITATION_CONTEXT.search(window):
                continue
            if kind == "bigint":
                before = text[match.start() - 1] if match.start() else " "
                after = text[match.end()] if match.end() < len(text) else " "
                if before in "([{" or after in ")]}":
                    continue
            found.setdefault(token, kind)
    return found


def main():
    if len(sys.argv) < 3:
        print(__doc__)
        return 2
    doc_path, root = Path(sys.argv[1]), Path(sys.argv[2])
    exts = set(DEFAULT_EXT.split(","))
    for arg in sys.argv[3:]:
        if arg.startswith("--ext="):
            exts = set(arg.split("=", 1)[1].split(","))

    if not doc_path.exists() or not root.is_dir():
        print("document or root not found")
        return 2

    if OUTWARD_FACING.match(doc_path.stem):
        print(doc_path.name + " is an outward-facing register.")
        print("Its job is to name artifacts that live outside this tree, so every")
        print("entry would read as undefined here. Skipping rather than reporting noise.")
        return 0

    text = doc_path.read_text(encoding="utf-8", errors="replace")
    tokens = extract(text)
    files = corpus(root, exts, doc_path.resolve())
    digests = file_digests(root)
    sizes = file_sizes(root)

    # Share is meaningless on a handful of tokens: a document that merely
    # discusses two of four values would read as a copy. Require enough tokens
    # for the proportion to mean something.
    MIN_TOKENS_FOR_COPY_CHECK = 20
    if len(tokens) >= MIN_TOKENS_FOR_COPY_CHECK:
        renderings = []
        kept = []
        for path, body in files:
            share = sum(1 for t in tokens if t in body) / len(tokens)
            (renderings if share >= 0.5 else kept).append((path, body, share))
        if renderings:
            print("EXCLUDED as renderings of this document. A root holding a copy of")
            print("what it is tracing will trace every value to that copy.")
            for path, _, share in renderings:
                print("  %3d%% of tokens   %s" % (round(share * 100), path.relative_to(root)))
            print()
            files = [(p, b) for p, b, _ in kept]

    corpus_decimals = [
        (value, path)
        for path, body in files
        for value in PATTERNS["decimal"].findall(body)
    ]

    def rounds_from(token):
        if "." not in token:
            return None
        places = len(token.split(".", 1)[1])
        try:
            target = float(token)
        except ValueError:
            return None
        for value, path in corpus_decimals:
            if len(value) <= len(token):
                continue
            try:
                if round(float(value), places) == target:
                    return value, path
            except ValueError:
                continue
        return None

    traced, is_digest_of, is_size_of, rounded, undefined = [], [], [], [], []

    for token, kind in sorted(tokens.items()):
        if token in digests:
            is_digest_of.append((token, digests[token]))
            continue
        if kind == "count" and int(token) in sizes:
            is_size_of.append((token, sizes[int(token)]))
            continue
        hits = [p for p, body in files if token in body]
        if hits:
            traced.append((token, str(hits[0].relative_to(root))))
            continue
        source = rounds_from(token)
        if source:
            rounded.append((token, source[0], str(source[1].relative_to(root))))
        else:
            undefined.append((token, kind))

    print("document  : " + doc_path.name)
    print("root      : %s  (%d files read, %d hashed)" % (root.name, len(files), len(digests)))
    print("tokens    : %d" % len(tokens))
    print("traced    : %d   (+%d digests of a file, +%d byte sizes of a file)"
          % (len(traced), len(is_digest_of), len(is_size_of)))
    print("rounded   : %d" % len(rounded))
    print("undefined : %d" % len(undefined))

    if is_digest_of:
        print("\nDIGEST OF A FILE IN THIS TREE. The strongest trace available.")
        for token, where in is_digest_of:
            print("  %s...  %s" % (token[:16], where))
    if rounded:
        print("\nROUNDED. The artifact holds a longer value, so searching the tree")
        print("for what the document says will not find it.")
        print("\n  %-16s %-22s FILE" % ("IN DOCUMENT", "IN ARTIFACT"))
        for token, value, where in rounded:
            print("  %-16s %-22s %s" % (token, value, where))
    if undefined:
        print("\nCURRENTLY UNDEFINED under this root. The value may be defined")
        print("elsewhere, may be external by design, or may not be written yet.")
        print("\n  %-28s KIND" % "TOKEN")
        for token, kind in undefined:
            print("  %-28s %s" % (token, kind))
    print()
    return 1 if (rounded or undefined) else 0


if __name__ == "__main__":
    raise SystemExit(main())
