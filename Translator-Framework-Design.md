# The Sovereign-Zero Translator: Framework and Data-Model Design

Version 0.1 · 2026-06-29 · Open research draft
Blueprint for evolving the glossary and 3D map into a non-technical to technical translator, calibrated against a function-first neutral center, grounded in verifiable sources.

## 1. Thesis

Build a translator that moves a person between plain language and technical AI-governance vocabulary (NIST, MIT, NSA/CISA, OWASP) without either vocabulary capturing the meaning. The fixed reference both sides translate through is the sovereign zero: the function a term performs, stated as behavior, independent of its name. Names are aliases collected in a crosswalk; the function is the center they are measured from.

The product is not a dictionary and not a chatbot wrapper. It is an instrument that, given a plain-language description or a technical term, returns the calibrated counterpart plus the evidence for the mapping, and shows where the field's sources agree, diverge, or only appear to agree.

What it can do: surface candidate translations and patterns, and flag divergence. What it does not claim: to certify truth. Ground truth stays verified by a human in contact with reality. The tool makes contextual mismatch visible and expensive to ignore.

## 2. The sovereign-zero calibration principle

Every term enters the system by its function, not its label. Two rules follow:

1. A term is confirmed by a self-test ("does something in the system do this?"), not by accepting its name. Plain and technical names that pass the same self-test become two entries in one translation row. Apparent disagreement between vocabularies is fake divergence and collapses into a row. What remains is real divergence, the only kind worth testing.
2. No vocabulary is the origin. Plain language is not "dumbed down" technical, and technical is not "correct" plain. Both are projections from the function. This is the calibration that keeps the translator neutral and prevents either side from drifting into the other's bias.

## 3. Enriched data model

The current model (name, cluster, purpose, plain, does, related) is the seed. The enriched model adds typing, direction, attributes, and provenance. Three record types: Term, Relation, Source.

### 3.1 Term (node)

```
Term {
  id
  function_statement     // the sovereign zero: what it does, as a checkable behavior
  names {
    plain []             // everyday aliases
    technical []         // NIST / MIT / NSA-CISA / OWASP names, each tagged with its source id
  }
  cluster                // floor: Foundations ... Oversight (a view, not the identity)
  purpose                // Ledger function: Absorb / Check / Reset / Center / Capability / Risk
  attributes {
    actor                // human | ai | hybrid | org   (who performs the function)
    accountability       // human | ai | org | shared | undefined (who answers when it acts or fails)
    cost_substrate       // resetting (machine) | non-resetting (human) | mixed  (Metabolic Veto)
    reversibility        // reversible | partial | irreversible
    observability        // detectable | latent | silent  (can its drift be seen?)
  }
  sources []             // source ids grounding this term and its names
  confidence             // derived from source count and independence, not asserted
  status                 // candidate | reviewed | contested
}
```

The four human/AI attributes are deliberate. Actor and accountability answer "where do humans and AI meet at this term." Cost_substrate encodes the Ledger asymmetry: the human is the only node whose costs do not reset, so any function whose failure lands on the non-resetting substrate is a place where human and AI coherence is load-bearing. Observability tells you whether a mismatch here would even be visible, which is where silent drift hides.

### 3.2 Relation (edge)

```
Relation {
  source_term, target_term
  type                   // enables | requires | mitigates | detects | causes |
                         // checks | governs | instance_of | alias_of | handoff
  directed               // true for most; alias_of is symmetric
  strength               // weak | asserted | strong
  evidence []            // source ids that assert this relation
  note
}
```

Two relation types carry the project's weight. `alias_of` is the translator itself: it links a plain name to a technical name through the shared function (the sovereign-zero row). `handoff` marks where control passes between human and AI; the set of handoff edges is the literal map of how humans and AI cohere across the floors.

### 3.3 Source (evidence registry)

```
Source {
  id, title, publisher, year, url
  family                 // NIST | MIT | Stanford | NSA-CISA | OWASP | other
  origin_independence    // a tag for Candidate-A weighting: which sources share lineage
}
```

Coherence is then defined honestly: a mapping is strong not because many summaries repeat it, but because independent-origin sources converge on it. Correlated sources collapse to one. This is the ground-truth pillar made mechanical.

## 4. Ground truth as the load-bearing pillar

Operating rules, carried from the Resilience Ledger:

1. Every Term and Relation must cite at least one Source. Uncited assertions are `status: candidate` and rendered as such, never as fact.
2. Confidence is computed from provenance independence, not authored. Convergence counts only in proportion to how independent the converging sources are.
3. Divergence is surfaced, not hidden. Where sources disagree on a mapping, the tool shows the disagreement as a feature.
4. A human cold-read is the only path from `candidate` to `reviewed`. The machine proposes; the human in contact with reality disposes.
5. Equilibrium is not truth. The graph can be perfectly self-consistent and still wrong. The Source layer is what keeps it honest.

## 5. Scaling without drift

The failure mode at scale is silent drift: the vocabulary, the mappings, or the editorial hand slips while every local entry still looks fine. Defenses, structural not heroic:

1. Controlled vocabularies. Relation `type`, `purpose`, and the attribute enums are closed sets. New values require a logged decision, not an ad-hoc string.
2. Schema versioning. The data model carries a version; migrations are explicit and dated.
3. Validation gate. A build step refuses to publish if any Term lacks a function_statement or a Source, any Relation has an unknown type, or any alias_of lacks a shared function. Deterministic, the model cannot talk its way past it.
4. Append-only re-derivation log. Every structural change is dated with its reason, the only sanctioned way the structure moves (the map and red-team report already use this; the data inherits it).
5. Separation of identity from view. A term's identity is its function plus names plus sources. Cluster/floor and 3D position are views over that, regenerable, so re-organizing the display never mutates the meaning. This is what lets the model scale to hundreds of terms without the floors becoming the thing that drifts.

## 6. Translator and reflection mechanics

- Non-narrative query: ask by structure, not prose. Examples the enriched model enables: "plain phrasings whose function maps to a NIST Check whose accountability is human and whose drift is silent," or "all handoff points on the Failure Modes floor." These are filters over typed attributes and relations, not keyword search.
- 3D to 2D reflection: the 3D stack is for exploration and pattern-spotting; the 2D reflections are for reading the pattern once seen. Planned reflections: an alias crosswalk table (plain vs technical, per function), a floor-by-floor relation heatmap, and a handoff matrix (human rows, AI columns) that makes AI-human coherence legible at a glance.
- Chat front-end (later): a thin layer that turns a plain sentence into a structured query, returns the calibrated technical term(s) with sources and confidence, and names the divergence if the field disagrees. The graph is the reasoning surface; the chat is the doorway.

## 7. Roadmap

1. Phase A (now): this design, plus migrate the existing 96 terms into the enriched Term schema with function_statements and at least one Source each. Mark everything `candidate`.
2. Phase B: author typed, directed Relations with evidence, starting with `alias_of` (the translator core) and `handoff` (the human-AI map). Add the validation gate.
3. Phase C: build the 2D reflections (crosswalk table, handoff matrix, heatmap) driven by the enriched data; wire them to the 3D map.
4. Phase D: non-narrative query layer over the typed data.
5. Phase E: chat doorway and divergence reporting.

Each phase ends with a cold-read review before its candidates can be promoted.

## 8. Carried risks (from the red-team)

- Authored, not discovered: until Phase B grounds relations in sources, patterns reflect the author. Mitigation: Source-first discipline and the validation gate.
- Signal dilution: a single dense component makes everything cohere with everything. Mitigation: typed/weighted relations and reflections that filter by type.
- Over-claiming ground truth: the strongest risk to the project's integrity. Mitigation: the `candidate / reviewed / contested` status on every record, shown in the UI, and human cold-read as the only promoter.
- Framing bias: US and institutional sources dominate. Mitigation: the Source registry's `family` and independence tags make the imbalance visible and correctable.
