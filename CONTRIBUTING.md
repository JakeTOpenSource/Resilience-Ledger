# Contributing

This project handles outside input the way its own tools say to: contributions arrive as **returns to be sorted**, not as patches merged on trust.

## How a return is handled

Returns from other systems are divergence, not verification. That includes output from any AI system — mine or yours. Every return (issue, pull request, stress test, new corpus case) is sorted on receipt: **folded** (accepted, often reshaped) or **declined**, and either way the reason is written into the re-derivation log, `Delta-Atlas-Tracer-Calibration.md`. If your suggestion is declined, you get the reason in writing, in the log — not silence.

## The rules

1. **The corpus is the floor.** `node tracer-corpus.js` must pass before and after any detector change. When a case fails, the fix is to change the lexicon or rules — never the label. Found a real miss? The single strongest contribution is a new labeled corpus case with the input that produced it.
2. **AI-drafted stays candidate.** Every change drafted by an AI — including the ones I draft with one — stays marked candidate until a human has done a cold read. No exceptions. That is the whole method.
3. **Structure over synonyms.** A word added to a list is a fallback and gets labeled as one. A rule that catches the *shape* of a failure is a fix. If your change is a synonym, say so up front; it will be folded as fallback, not as the tripwire.
4. **Keep the constraints.** Deterministic, client-side, zero dependencies, no model at runtime, lexicon versions displayed. A PR that adds a package or a network call will be declined no matter what it improves.
5. **Never commit `*.local.js`.** Those are private seed-frame overlays — yours or anyone's. The `.gitignore` blocks them; don't work around it.

## Practical bits

- An issue with the input text, what you expected, and what the tool did is a complete contribution by itself.
- Small pull requests, one concern each.
- Vocabulary changes go to `terms.enriched.json` (the source of truth). Several pages embed copies of that data and have to be updated together, so flag any data edit clearly — a data PR that touches only one copy will be held until the copies agree.