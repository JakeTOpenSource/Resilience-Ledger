# pin-check

Every precise number in a technical document came from somewhere. This checks
whether it still does.

You write a summary quoting a figure from your repository. Months later the
summary still says it and the repository says something slightly different, or
nothing. Nobody lied. The number was shortened on the way into prose, or the
artifact behind it moved, or it came from a terminal that scrolled away.

pin-check reads a document, pulls out every value precise enough that it must
have come from somewhere, and tries to find that somewhere under a directory
you name.

## Requirements

Python 3. No packages, no install, no network. It reads files and hashes them.

## Usage

```
python pin_check.py <document> <root>
python pin_check.py paper.txt ./evidence --ext=.md,.json,.py
```

`<document>` is prose: a README, a paper, a draft post, text extracted from a
PDF. `<root>` is the directory that is supposed to hold the evidence.

Exit code is 0 when everything traces and 1 when anything does not.

## What it reports

**traced** means the value appears verbatim in a file under the root.

**digest of a file** and **byte size of a file** are stronger. The value is not
merely written somewhere, it is a measured property of a file that is present.
A receipt claiming a file is 18,757 bytes is checked against the file.

**rounded** means no file holds the value as written, but one holds a longer
value that rounds to it. The figure is correct and the link is broken, because
searching the evidence for what the document says will not find it. This is the
common case and the easy one to miss.

**Currently Undefined** means no artifact under this root defines the value.
That is a statement about the root, not a verdict on the value. The artifact may
live in another tree, may be external by design, or may not be written yet.

## Example

Checking a project summary against the packet it describes:

```
document  : summary.md
root      : hodge-zeta-bridge-experiment  (12 files read, 12 hashed)
tokens    : 4
traced    : 2   (+0 digests of a file, +0 byte sizes of a file)
rounded   : 2
undefined : 0

ROUNDED. The artifact holds a longer value, so searching the tree
for what the document says will not find it.

  IN DOCUMENT      IN ARTIFACT            FILE
  0.8362504        0.8362503518           CROSS-SECTOR-NOGO.md
  0.8420473        0.8420472694           FLAT-BANK-NOGO.md
```

Nothing was fabricated. Both figures are right. Both were shortened on the way
into prose, and a reader searching the packet for either one finds nothing.

## The check that matters most

If the root contains another rendering of the same document, every value traces
to that copy and the run reports a confident clean. pin-check measures what
share of the document's values each file contains and excludes any file holding
half of them or more, saying which and by how much:

```
EXCLUDED as renderings of this document. A root holding a copy of
what it is tracing will trace every value to that copy.
   63% of tokens   release-packet/claims.json
  100% of tokens   release-packet/paper/paper-LinkedIn.md
```

The 63% file was a generated claim register nobody would think to remove by
hand. Read that list before trusting a clean result.

This check needs at least twenty values to mean anything, so it stays off for
short documents. On a four-value summary, a file that happens to mention two of
them would look like a copy.

## What it does not do

It does not check that a number is correct. A wrong number faithfully copied
into an artifact traces clean. This finds broken links, not bad math.

It does not know whether your root is the right one. Point it at a stale
directory and it will report confidently about the wrong thing. If your evidence
is pinned to a specific commit, export that commit first. `git archive <commit> |
tar -x -C <tmpdir>` does this without touching your working tree.

It only sees values precise enough to be unambiguous: decimals with four or more
places, hex digests of twelve or more characters, dotted versions, and bare
counts. A figure like `1.94` or a claim like "six of eight" passes through
untouched. A clean run covers the part it can read, not the document.

It skips files whose names begin with `source`, `reference`, `citation`, or
`bibliograph`, because a register exists to name things that are deliberately
elsewhere and checking one produces only noise.

It skips digit groups near `doi`, `isbn`, `arxiv`, or a URL, because citation
identifiers look exactly like measurements. A real measurement written next to a
DOI is skipped too. That is the cost of the rule.

Digests are matched as plain strings and as file hashes. A digest split across a
line break, as PDF text extraction often does, reads as Currently Undefined.
That is usually worth knowing about the document rather than the tool.

## Reading a clean result

A clean run means the values it could read all trace to the root you gave it. It
does not mean the document is verified, the numbers are right, or the evidence
is complete. Those are different questions and this answers none of them.
