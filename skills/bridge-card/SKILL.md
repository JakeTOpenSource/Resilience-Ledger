---
name: bridge-card
description: A one minute brake to run before accepting a claim as true. Use on model output, a paper paragraph, a summary of your own work, or a claim in a thread, whenever something is about to change what you do or what you write next. Forces a restatement in the source's own terms, names load bearing words with no criteria, checks whether an analogy actually holds, and ends in accept, not yet, or a named uncertainty.
---

# bridge-card

The card itself is in `README.md` in this directory. It is written to be
copied into any assistant as a custom instruction, or filled by hand.

Six fields: SOURCE, CLAIM, OPEN TERMS, PARALLEL, HINGE, STATUS.

Two rules carry most of the weight. Restating a claim in its own words is a
translation test, not agreement. And "not yet" does not become "accept" by
rereading, only by something named changing.

Run it on one paragraph, not a whole document. If the rejecting outcomes never
fire after a week of use, the card is a rubber stamp and the fix is a different
trigger, never more fields.
