---
name: pin-check
description: Check whether every precise number, digest, byte count, and version in a document still traces to an artifact under a given directory. Use before publishing, posting, or summarizing technical work that quotes figures from a repository or evidence packet, and whenever a summary and its artifact may have drifted apart. Catches values rounded in the retelling, values whose source has changed, and values with no artifact under that root.
---

# pin-check

See `README.md` in this directory for the full description. In short:

```
python skills/pin-check/pin_check.py <document> <root>
```

Reports each precise value as **traced** (verbatim in a file, or the digest or
byte size of a file), **rounded** (a file holds a longer value that rounds to
it), or **Currently Undefined** (no artifact under this root defines it).

Exit code 1 if anything is rounded or undefined.

## Before trusting a clean run

Read the `EXCLUDED as renderings` list first. If the root contains another copy
of the document, every value traces to that copy. The tool detects and excludes
files holding half the document's values or more, and prints which.

Confirm the root is the right one. For evidence pinned to a commit, export it
first with `git archive <commit> | tar -x -C <tmpdir>` rather than reading a
working tree that has moved on.

A clean result covers the values the tool can read, which are decimals with four
or more places, hex digests of twelve or more characters, dotted versions, and
bare counts. Lower-precision figures pass through unseen.
