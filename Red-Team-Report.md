# Red Team Report: Agentic AI Governance Glossary and Map

Version 0.1 · 2026-06-29 · Open research draft
Companion to `Agentic-AI-Governance-Glossary.md` and `Agentic-AI-Governance-Map.html`

## Purpose

This is an adversarial review of the project's two artifacts: the plain-language glossary and the interactive 3D map. It follows the Resilience Ledger's method: find the weak points, fix what can be fixed, and keep the rest visible as a standing feature rather than hiding it. The aim is not to claim the work is safe, but to convert quiet, invisible failure modes into known, marked ones.

A note on stance, in keeping with the project's humility: a red team report is most useful when it is harder on the work that flatters us than on the work that challenges us. The findings below are deliberately tougher on the parts that felt finished.

## Method

Three lenses, applied in order:

1. **Artifact / technical.** Will the map actually load and behave for a real user, on a real machine, offline, or in a constrained viewer?
2. **Content / epistemic.** Where can the glossary mislead, age, or quietly encode a bias?
3. **Adversarial / governance.** How could either artifact be misused, misread, or cited to justify a bad decision?

Severity is rated Low / Medium / High by plausibility times harm. Status is one of: Reinforced (fixed in the shipped build), Mitigated (reduced and documented), Open (recommended, not yet done), or Accepted (acknowledged, low priority).

## A. Artifact and technical findings (the map)

| ID | Vulnerability | Vector and impact | Severity | Status |
|----|---------------|-------------------|----------|--------|
| A1 | Hard dependency on a remote 3D library | If the Three.js CDN is blocked or offline, the page renders blank with no explanation | High | Reinforced |
| A2 | No WebGL / restricted viewer | Embedded or locked-down viewers without WebGL show nothing | High | Reinforced |
| A3 | Silent failure | When something breaks, the user cannot tell what or why | Medium | Reinforced |
| A4 | Injected-text rendering | Term text is written into the page as HTML; untrusted content could inject markup | Low | Reinforced |
| A5 | Visual overload | Detail-mode label flooding and full-graph chain illumination obscured the data | Medium | Reinforced |
| A6 | Scale ceiling | Per-frame edge-color rebuilds and O(n) labels are fine at ~96 nodes, not at thousands | Low | Accepted |
| A7 | Accessibility | Meaning is carried by color alone; no keyboard navigation; motion is not reduced for sensitive users | Medium | Open |

How A1 to A5 were reinforced in the shipped build:

- **A1 / A2 / offline.** The map now loads the library through a resilient loader that tries a local `three.min.js` first, then three independent CDNs. If all fail, or if WebGL is unavailable, it falls back to a clean 2D layered view that always renders the same data. Dropping a `three.min.js` next to the file makes it fully offline and self-contained, which is the shippable form.
- **A3.** A persistent on-screen notice bar plus a global error handler surface any failure in plain words instead of failing silently.
- **A4.** All term text injected into the info panel and fallback view is HTML-escaped.
- **A5.** Labels are gated to anchors plus hover and selection; the chain illumination is capped to a two-hop neighborhood and lights only the chain-of-custody tree edges, with everything else pushed to near-black; floor view isolates a single layer.

Recommended next (A6, A7):

- A7 is the most worthwhile open item. Add a colorblind-safe palette check, respect the `prefers-reduced-motion` setting to soften the chain animation, and add keyboard navigation (tab between terms, arrow keys to ride floors). This matters because the project's audience explicitly includes non-technical newcomers, some of whom will rely on assistive technology.
- A6 only becomes real if the glossary grows past a few hundred terms. If it does, switch edge coloring to a shader attribute updated on selection rather than rebuilt each frame.

## B. Content and epistemic findings (the glossary)

| ID | Vulnerability | Vector and impact | Severity | Status |
|----|---------------|-------------------|----------|--------|
| B1 | Source currency / drift | Definitions are tied to 2026 sources; the field moves fast and entries will age | Medium | Mitigated |
| B2 | Selection is a stance | Choosing which ~96 terms matter is itself an editorial and governance judgment | Medium | Mitigated |
| B3 | Simplification error | Plain language trades precision for access; nuance is lost | Medium | Mitigated |
| B4 | Crosswalk subjectivity | Mapping terms to Ledger functions is interpretive, not a verified fact | Low | Mitigated |
| B5 | Semi-formal terms | "Ontology gate" and MCP are defined by function, not by a single canonical source | Low | Mitigated |
| B6 | Framing bias | Leans on US and institutional sources (NIST, NSA/CISA, OWASP, Stanford) | Medium | Open |
| B7 | Citation integrity | Readers may not know which definitions are sourced versus synthesized | Low | Reinforced |

Notes:

- B1 is handled by an explicit review cadence and a Limitations section in the glossary, not by pretending the entries are timeless. The honest boundary is that a definition is current as of its sources, not permanently true.
- B6 is the most important open content item. The remedy is not to remove the existing sources but to add governance traditions from other regions and from civil-society and academic critics, so the map of "who is accountable" is not implicitly one jurisdiction's map. This is flagged for a v0.2 pass.
- B7 is reinforced already: entries that lean on a source are tagged inline, and unmarked entries are stated to be plain-language syntheses.

## C. Adversarial and governance findings (misuse)

| ID | Vulnerability | Vector and impact | Severity | Status |
|----|---------------|-------------------|----------|--------|
| C1 | False authority | The glossary is cited to wave through a bad practice ("it says this is fine") | Medium | Mitigated |
| C2 | Manufactured convergence | Sources that look independent but share an origin inflate confidence | Medium | Open |
| C3 | Illusion of understanding | Knowing a term's definition is mistaken for understanding its risk | Medium | Mitigated |
| C4 | Dual-use vocabulary | The glossary teaches attack terms (prompt injection, jailbreak) | Low | Accepted |
| C5 | Map misread | Color, edges, or the chain are read as causation or endorsement | Low | Mitigated |

Notes:

- C1: the strongest defense is framing. The glossary defines what terms mean and what they do; it does not certify that any practice is safe or compliant. That distinction is stated in the Limitations section so a citation of the glossary cannot honestly be read as approval.
- C2 maps directly to the Ledger's Candidate A. The current sources are reputable but overlap (US government and US academia). The reinforcement is a reading discipline: weight agreement by how independent the sources truly are, and verify against primary documents rather than counting how many secondary summaries agree. This is recommended, not yet built into the artifacts.
- C3 is the subtlest risk given the audience. A newcomer can finish the glossary feeling fluent and act with false confidence in a high-stakes setting. The mitigation is the repeated, honest framing that this is orientation, not authority, and that real decisions need primary sources and human judgment.
- C5: the map's chain of custody shows that terms are related, not that one causes or endorses another. The legend and this report make that explicit; a one-line on-canvas disclaimer is a cheap further reinforcement (Open).

## The honest limit

Integrity cannot be made unfakeable, and this report does not claim otherwise. A glossary can be quoted out of context, a definition can be outrun by the field, and a clean diagram can lend false confidence. What the project can do, and has tried to do, is make those failure modes expensive and visible rather than cheap and silent: load failures announce themselves, simplifications are labeled, the selection is owned as a choice, and the limits are kept on the page. That is the achievable bar. Claiming more would be the kind of overconfidence this review exists to catch.

## Re-derivation log

Load-based review, not calendar-based. Review whenever an artifact is used for a real decision, and after any change that alters structure or a definition, whichever comes first. The review asks one cold question: does each claim still hold against current primary sources and against a hostile reading? Log what changed and why.

| Date | Change | Reason / cold-read note |
|------|--------|-------------------------|
| 2026-06-29 | v0.1 report established. Findings A1 to A5 and B7 marked Reinforced; B1 to B5, C1, C3, C5 Mitigated; A6, B6, C2 Open; C4 Accepted. | First adversarial pass over both artifacts. The technical hardening was done during the build; the content and governance items are newly catalogued here. No claim of completeness. |
| (next) | (awaiting use against a real decision, or a v0.2 content pass) | |

## Priority queue for the next pass

1. Accessibility (A7): colorblind-safe palette, reduced-motion, keyboard navigation. Highest leverage for the stated audience.
2. Framing breadth (B6): add non-US and non-institutional governance perspectives.
3. Provenance discipline (C2): note source-independence weighting in the glossary's method.
4. On-canvas disclaimer (C5) and a scale path (A6) if the term set grows.
