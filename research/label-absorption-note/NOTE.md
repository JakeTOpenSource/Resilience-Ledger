# Label Absorption in Self-Applied Status Systems

**A finite measurement across four experiments**

Jake Tiller, 20 August 2026
Status: `LOCAL_RESEARCH_NOTE` / not peer reviewed / no external replication

---

## Summary

Many current proposals ask a language model to attach a status label to its own output: a confidence tier, a gate verdict, an evidence class. The labels are supposed to make the output auditable.

One person designed the instruments, wrote the topics, planted the defects, pre-registered the predictions, and graded the outcomes. No second labeller touched a unit. That is the largest limit on everything below.

Four experiments measured which labels a model actually uses when it applies them to work it just produced. Across two different label systems, two task types, and 118 labelled slots (6 + 8 + 8 + 96), three results held:

1. The two most-used statuses absorbed 75 to 100 percent of assignments.
2. The strongest rejecting statuses fired between 0 and 2 percent of the time. `OVERLAP` fired zero times in the 22 slots where it was available (6 + 8 + 8, the three versions of instrument A). `REJECT` and `SPLIT` fired zero times in 96.
3. Making one label harder to use did not move traffic to the correct label. It moved traffic to the next-cheapest adjacent label.

The third result is the useful one. A label system does not degrade uniformly. It degrades toward whichever option is cheapest to justify, and repairing one option relocates the problem rather than removing it.

---

## Why this matters

If a status is never assigned, it is not a control. It is documentation of an intention. A reader who sees five available statuses assumes the labeller considered five options, when in practice two were live and three were decorative.

This is testable cheaply. Whether it is commonly tested is not something this note checked, and no literature search was done. **OPEN**

---

## Method

**Instrument A**, a semantic exploration skill, asks a model to examine a topic through metaphorical lenses and assign each lens one of five statuses: `OVERLAP`, `RELATED`, `UNKNOWN`, `CONTESTED`, `NO INCREMENT`. Three successive versions were tested. Version 1.1 added a written firing test to each status. Version 1.1.1 additionally required the rejecting status to be evaluated first, and required the permissive status to name an actionable decision.

**Instrument B**, a three-gate text pipeline, asks a model to segment a paragraph into claim units and pass each through semantic, ontological, and metaphorical gates, each emitting one of four statuses.

Every run used the same model family. Topics were fixed across instrument versions so that only the instrument changed. Predictions were pre-registered in writing before each round.

**Instrument A topics.** One topic where lenses genuinely apply, a claim that neurons firing in all-or-nothing spikes makes the brain a digital computer. Two topics that state their own answer, a deploy script hardcoding forward slashes and a printer jamming on cardstock above its rated weight. The second class exists so that the rejecting statuses have something correct to fire on.

**Instrument B input.** One paragraph containing seven planted defects: two category assertions without criteria, two images with no stated relation, one analogy that starts as a relation and leaks into attributes, one undefined metric, and one plain factual claim that should pass. Three independent runs.

---

## Results

### Instrument A, version 1.0

| Status | Count |
|---|---:|
| RELATED | 4 |
| CONTESTED | 1 |
| UNKNOWN | 1 |
| OVERLAP | 0 |
| NO INCREMENT | 0 |

Six slots, three of five statuses used. On the topic that states its own answer, all three lenses were labelled `RELATED` and the disposition recorded that no lens was misleading. `NO INCREMENT` was the correct label for every lens in that run and was not used once. **TESTED**

### Instrument A, version 1.1, firing tests added

| Status | Count |
|---|---:|
| RELATED | 7 |
| NO INCREMENT | 1 |
| OVERLAP | 0 |
| UNKNOWN | 0 |
| CONTESTED | 0 |

Eight slots, two of five statuses used. Adding a written firing test to every status moved `NO INCREMENT` from zero to one. It also collapsed label diversity from three distinct statuses to two, because the tests made four statuses harder to reach while leaving the permissive one unchanged. **TESTED**

### Instrument A, version 1.1.1, rejecting status tested first

| Status | Count |
|---|---:|
| CONTESTED | 4 |
| NO INCREMENT | 2 |
| RELATED | 1 |
| UNKNOWN | 1 |
| OVERLAP | 0 |

Eight slots, four of five statuses used, same three topics as version 1.1. `RELATED` fell from seven to one. `NO INCREMENT` rose from one to two. `CONTESTED` rose from zero to four. **TESTED**

Most of the traffic displaced from `RELATED` did not move to the rejecting status the change was designed to promote. It moved to `CONTESTED`, whose test asks only that two interpretations be stated, and which two interpretations almost always can be.

### Instrument B, three gates, three runs

| Status | Count | Share |
|---|---:|---:|
| PASS | 54 | 56% |
| OPEN_TYPE | 24 | 25% |
| HOLD | 8 | 8% |
| BARE_METAPHOR | 6 | 6% |
| CATEGORY_STRETCH | 2 | 2% |
| DRIFT | 2 | 2% |
| SPLIT | 0 | 0% |
| REJECT | 0 | 0% |

Ninety-six assignments, six of eight distinct statuses used. `PASS` and `OPEN_TYPE` together took 78 of 96, or 81 percent. `CATEGORY_STRETCH` and `DRIFT` appeared in one run of three and were absent from the other two. **TESTED**

Of six planted defects, four were caught by at least one run. Both planted category assertions were labelled `OPEN_TYPE` by all three runs, which reports that a term is undefined rather than that a claim overreaches. That is the softer adjacent option, and it is also true, which is what makes it attractive. **TESTED**

---

## The three findings

**Absorption.** The two most-used statuses took 75 to 100 percent of assignments in every run. **TESTED**

**A floor on rejection.** Statuses that assert a claim is defective, rather than merely underspecified, fired between 0 and 2 percent. `OVERLAP` fired zero times across 22 slots and three instrument versions. `REJECT` and `SPLIT` fired zero times across 96. **TESTED**

**Neighbour migration.** Hardening the permissive status did not move traffic to the rejecting status. It moved traffic to the next-cheapest adjacent status. **TESTED** for the observed shift, **PROPOSED** for the mechanism.

Version 1.1.1 changed three things at once, so the shift of traffic to `CONTESTED` is TESTED and which change caused it is PROPOSED.

The proposed mechanism is that a labeller under a written test does not search for the correct label. It searches for the nearest label whose test it can satisfy in writing, and adjacency in that search is set by how easy the test is to satisfy rather than by semantic distance.

---

## An unexpected secondary result

Segmentation was not reproducible. The same paragraph produced 14, 8, and 10 claim units across three runs of instrument B.

Any design that stores labelled units in a shared, append-only, cross-referenced store requires those units to be comparable between runs. Where the segmentation step varies by nearly a factor of two on identical input, no stable identity exists to link or deduplicate against, and everything downstream inherits the variance. **TESTED**

---

## What this does not establish

The sample is small. Six, eight, eight, and ninety-six labelled slots. No claim here is a rate estimate for any population.

One model family was used throughout. Nothing here separates a property of labelling from a property of that family.

The instruments, the topics, the planted defects, and the pre-registered predictions were all authored by one person, who also graded the outcomes. No second labeller reviewed any unit. The single-operator threat is the largest limit on this note and it is not mitigated.

The ninety-six assignments in instrument B are not independent units, because segmentation varied between runs. They are three whole-paragraph passes reported at assignment granularity.

Nothing here shows that a label system cannot be made to work. It shows that two specific systems, unmodified and then modified twice, concentrated their assignments in the least committal options available.

The neighbour-migration mechanism is a proposal consistent with one observed shift under a compound intervention. Version 1.1.1 changed three things at once: it hardened the permissive status, it reordered evaluation, and it required the rejecting status to be considered first. The shift to `CONTESTED` is measured. The attribution to any one of those three changes is not. **OPEN**

---

## What would demote these claims

1. **Run it on another model family.** If the floor on rejecting statuses disappears, the finding is about one family and not about self-applied labels.
2. **Have a second person label the same units.** If a human labeller shows the same concentration, the effect is about the label system. If not, it is about the model.
3. **Isolate the version 1.1.1 intervention.** Change one thing at a time and see which produces the shift to the adjacent status.
4. **Give the rejecting statuses a mechanical test.** A status whose firing condition is computable rather than judged is the obvious control condition and was not run here.

---

## Reproduction

Each round used a pre-registered prediction, a fixed rubric, and a stated decision rule written before the runs. The instrument text, the topics, the planted-defect key, and the raw model outputs are retained.

The cheapest replication is the null topic. Give any labelling instrument a subject that states its own answer, and count how often the instrument says so.

---

## Disclosure

Generative AI systems were used as research, coding, and drafting tools throughout, and produced every labelled output measured here. Their outputs were treated as the object of measurement, never as evidence about themselves. The design, the pre-registrations, the grading, and responsibility for this note are the author's.
