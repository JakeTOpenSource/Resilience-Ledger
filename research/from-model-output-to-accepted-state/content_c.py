"""Paper body, part C: results, negative results, boundary, guide, back matter."""

RESULTS = r"""
<h2 class="break"><span class="num">8</span>Methods and artifact scope</h2>

<h3>8.1 Evidence units and pinned sources</h3>

<p>This paper is a bounded artifact audit and a single-project case study. The
primary implementation evidence is pinned to commit
<span class="digest">275d0b3e7474ef58456c82a042163567cd12122f</span> of the public
Resilience Ledger repository. I reran its public gate on Node 24.18.0 and Python
3.14.6. Continuous integration declares Node 22.17.1 and Python 3.12.10. The same
recorded projection root was produced by separate JavaScript and Python
implementations derived from one specification and fixture corpus. This is
cross-language replay parity, not clean-room or external replication.</p>

<p>The protocol suites use finite event files, policies, fixtures, and rejection
mutations as their units. Their results are exact only for those bytes and that
code. Deployment observations use paths or routes sampled at named times. Interface
checks establish source or rendering structure and make no claim about reader
comprehension. These evidence families are reported separately because their
denominators are not interchangeable.</p>

<p>The Typed Refusal reanalysis uses a hand-decomposed claim as its unit. Its archive
reports twelve frozen questions and three runs per P0 through P4 arm, plus a separate
larger-model control, but publishes only pooled arm totals. The exact model version,
generating prompts, answers, run-level data, question-level data, corpus bytes, and
preregistration record are absent. Wilson intervals and Fisher exact tests were
recomputed from <code>data/arms.json</code> by <code>data/stats.py</code>; they are
exploratory claim-level summaries under a working independence assumption. The
claims are clustered within questions and runs, so those intervals and p values do
not establish arm-level precision or significance.</p>

<p>The 2026-07-17 replication declares 36 sessions, of which 30 were scored after six
final-block sessions were truncated. Its registration record and decision logs are
public at commit <span class="digest">77408db59cad3f968ac9ba5a0c0c6689a90e80d4</span>
of <code>JakeTOpenSource/the-stable</code>, and its recorded cells were replayed
offline. The inspected public history does not independently establish that the
registration file predates data collection, so I treat it as a committed
registration record rather than verified prospective registration. The Typed
Refusal aggregates are pinned separately at commit
<span class="digest">721a824c9f735d3972d720b41685469a1020fa91</span> of
<code>JakeTOpenSource/typed-refusal-harness</code>. No external evaluator selected,
ran, or scored these experiments, and no qualified instrument or live consequential
adapter was evaluated.</p>

<h3>8.2 Finite activation, quotient, and blind-prompt packets</h3>

<p>Three local owner-review packets test the newer mathematical layer. The Generic
Device Activation Fixture enumerates 151 synthetic trace prefixes of length at most
ten. It evaluates seven declared queries against ten candidate representation
fields, exhaustively checks all 1,023 nonempty candidate subsets, and retains a
collision witness whenever a representation merges records whose query answers
differ. Separate Python and JavaScript generators produce the same frozen dataset;
the exhaustive subset analysis is then performed in Python. The result is exact
only for those traces, queries, fields, and transition rules.</p>

<p>The transition-stable quotient packet uses the same 151 records and ten declared
events. Each state-event pair is either enabled, advancing to its child trace, or
refused, remaining at the current trace. This gives 1,510 finite transitions. A
partition begins from a declared query signature and repeatedly splits any class
whose members differ in event status or successor class. Separate Python and
JavaScript analyzers produce byte-identical canonical reports. This is a finite
application of established sequential-machine refinement [43-45], not a new
minimization theorem.</p>

<p>The blind packet froze one prompt, one response schema, a nine-group oracle, and
a twelve-function semantic rubric before three responses were evaluated. The
responses were requested under <code>gpt-5.6-sol/high</code>,
<code>gpt-5.6-sol/low</code>, and <code>gpt-5.6-terra/high</code> configurations.
Those labels are request metadata because the retained responses contain no runtime
model attestation, model-build digest, seed, or sampling parameters. The agents saw
the prompt and schema, not the oracle or rubric. Exact fields were compared with the
frozen oracle. Semantic recurrence was mapped separately and required a verbatim
quote from the corresponding response. That map remains
<code>DRAFT_OWNER_REVIEW</code>.</p>

<p>The packets share an operator, orchestration platform, prompt, response schema,
and likely model ancestry. Agreement is therefore a bounded output-recovery result,
not independent validation. The expected activation analysis, quotient report, and
blind report are pinned locally by digests <span class="digest">7c550d125d38</span>,
<span class="digest">1b0e78adcac7</span>, and
<span class="digest">de2c28735762</span>. Appendix C gives the full values and
paths. <span class="chip chip-tested">TESTED</span></p>

<h3>8.3 Related work boundary</h3>

<p>The design joins established lines of work rather than treating their components
as new. Causal ordering and state-machine replication [2, 6], event sourcing and
transaction or compensation boundaries [3-5], runtime assurance [7], metrology
and conformity assessment [8, 9, 11], and reproducibility, estimands, and causal
inference [10, 12, 13] provide the main technical background. Canonicalization,
transparent logs, provenance, and software supply-chain records inform the evidence
identity boundary [15-20]. Accessibility, assurance-case, status-condition, and
interchange specifications inform the reporting surface [18, 27, 31-34].</p>

<p>Proper scoring and empirical forecast calibration supply the probabilistic lane
[39-41]. Performative prediction supplies the warning that a decision can change
the distribution it is later scored against [42]. Sequential-machine equivalence
and partition refinement supply the finite transition-stable construction [43-45].
Convex and vector optimization supply the distinction between a Pareto frontier and
a policy-selected point [46]. Robust convex optimization supplies the
worst-case-over-a-declared-uncertainty-set pattern [48]. Mathlib's pinned
<code>Function.FactorsThrough</code> definition supplies the formal vocabulary for
query-relative sufficiency [47]. These are established sources used to express the
proposal; none validates the case study.</p>

<p>Privacy, security, financial, medical-device, and AI-governance sources are used
as domain constraints or comparison points [14, 21-26, 28-30]. They do not
establish compliance. The transformer, biological-mechanics, and side-channel
sources supply limited architecture or measurement context [1, 35, 36], not
validation of this protocol.</p>

<p>Hamilton-Zero makes one scientific boundary concrete. Its architecture
analytically preserves a variational upper bound, while the authors warn that a
finite-sample Monte Carlo estimate can appear below the true ground-state energy
because of estimator noise or mixing bias [38]. A guarantee on the represented
state therefore does not automatically attach to the sampled estimate or the
published comparison. This is a domain example, not validation of this protocol.</p>

<p class="tnote">With his permission, Jake Macdonald's OpenGoldenRatio (OGR) v0.1
is cited as parallel related work [37]. After reviewing this draft, Macdonald
helped sharpen the comparison: STP follows governed transformation from candidate
output toward accepted state, while OGR centers containment and governed relations
among actors or agents. His contribution here was review and clarification of that
comparison. He did not contribute code, data, experiments, or authorship, and OGR
is not evidence that STP works.</p>

<h2><span class="num">9</span>Results</h2>

<p>Five result families are kept apart because their denominators and their meaning
differ. Protocol conformance yields exact finite outputs. Agent behavior yields
bounded empirical observations. Interface work yields structural conformance and no
comprehension claim. Live operations yield bounded observations at named times.
Finite mathematical packets yield exact local results over declared traces, query
sets, candidate fields, transition semantics, and prompt-oracle comparisons.</p>

<h3>9.1 The gate</h3>

<p>One command runs the public suite. It executes sixteen scripts and prints
thirty-four numbered holds across twelve named suites, with every denominator equal
to its numerator.</p>

<table>
<caption><b>Table 6.</b> Public gate composition at commit
<span class="digest">275d0b3e7474</span>, from <code>node governance/harnesses/run-all.js</code>.</caption>
<thead><tr><th style="width:52%">Suite</th><th class="num">Holds</th><th>What the strongest hold in it establishes</th></tr></thead>
<tbody>
<tr><td>Ledger falsification</td><td class="num">10</td><td>Ten mutations of the event history are rejected</td></tr>
<tr><td>Governance chain</td><td class="num">5</td><td>16 event files, 6 stream chains, 12 checkpoints bind</td></tr>
<tr><td>Authority falsification</td><td class="num">4</td><td>Four forged authority paths are rejected</td></tr>
<tr><td>Cross-language replay parity</td><td class="num">3</td><td>JavaScript and Python implementations derived from one specification and fixture corpus produce the same root</td></tr>
<tr><td>Append-only history</td><td class="num">2</td><td>Git comparison permits additions only</td></tr>
<tr><td>Privacy boundary</td><td class="num">2</td><td>85 records scanned, 3 synthetic leak canaries caught</td></tr>
<tr><td>Atlas data sync</td><td class="num">2</td><td>Six projections match baseline, 4 mutations rejected</td></tr>
<tr><td>Six-signal public surface</td><td class="num">2</td><td>Six conditions render with non-color cues</td></tr>
<tr><td>Schema contract</td><td class="num">1</td><td>Schemas, validators, and envelopes agree</td></tr>
<tr><td>Atlas data materialization</td><td class="num">1</td><td>Three profiles replay, three malformed inputs rejected</td></tr>
<tr><td>Atlas foundational repair</td><td class="num">1</td><td>The repaired foundation still holds</td></tr>
<tr><td>Authority</td><td class="num">1</td><td>The authority profile evaluates its seven conditions</td></tr>
<tr class="total"><td>Twelve suites</td><td class="num">34</td><td>All holding at this commit</td></tr>
</tbody></table>

<p class="tnote">Four of the sixteen scripts print a named pass with no numbered
hold: the replay driver, the runtime check, the home surface check, and the public
explanation check. Their results are therefore invisible in the total of 34. The
number understates coverage and should not be read as the count of everything
checked. <span class="chip chip-tested">TESTED</span></p>

<h3>9.2 One source, six incompatible views</h3>

<p>The candidate source holds 439 terms and labels every one of them reviewed. Six
public projections were measured against it. The count drift was the least of it.</p>

<table>
<caption><b>Table 7.</b> Projection drift against the 439-term candidate source.
<b>Identical</b> counts shared records matching on every field. <b>Status differs</b>
counts shared records whose review status disagrees.</caption>
<thead><tr>
<th style="width:27%">Projection</th><th class="num">Terms</th><th class="num">Shared</th>
<th class="num">Identical</th><th class="num">Absent</th><th class="num">Extra</th><th class="num">Status differs</th></tr></thead>
<tbody>
<tr><td>ask-inline-data</td><td class="num">435</td><td class="num">435</td><td class="num">0</td><td class="num">4</td><td class="num">0</td><td class="num">258</td></tr>
<tr><td>ground-truth-inline-data</td><td class="num">435</td><td class="num">435</td><td class="num">0</td><td class="num">4</td><td class="num">0</td><td class="num">258</td></tr>
<tr><td>explore-inline-data</td><td class="num">435</td><td class="num">435</td><td class="num">125</td><td class="num">4</td><td class="num">0</td><td class="num">258</td></tr>
<tr><td>gap-check-inline-data</td><td class="num">433</td><td class="num">433</td><td class="num">0</td><td class="num">6</td><td class="num">0</td><td class="num">256</td></tr>
<tr><td>canon-json-projection</td><td class="num">214</td><td class="num">204</td><td class="num">0</td><td class="num">235</td><td class="num">10</td><td class="num">26</td></tr>
<tr><td>canon-markdown</td><td colspan="6">text document: pins a canonical text digest only, with no per-term comparison</td></tr>
</tbody></table>

<p>Three findings matter more than the counts. First, the source calls all 439 terms
reviewed while three projections report 258 candidate and 177 reviewed, so the
authoritative label was contradicted by every consumer. Second, in four of the five
comparable projections not one shared record matched on every field. Third, the
canon projection contains ten identifiers with no counterpart in the source at all,
which is divergent provenance rather than staleness.</p>

<p>The repair did not declare one file true. It registered a candidate source,
measured every projection against it, stored the mismatch sets by digest, and added
mutation tests. Historical regeneration stayed impossible for some consumers because
their selection rules were never recorded. The 439-term source remains a candidate
inventory, and no check here validates a single definition.
<span class="chip chip-tested">TESTED</span></p>

<h3>9.3 Source, deployment, and live bytes</h3>

<p>The project once shipped by manual upload, which left the relation between
repository and production unclear. The first recorded reconciliation compared every
deployable path.</p>

<table>
<caption><b>Table 8.</b> Production observation
<span class="digest">34bde4ec2eb4</span>, recorded 2026-08-11.</caption>
<thead><tr><th style="width:52%">Measure</th><th class="num">Value</th><th>Reading</th></tr></thead>
<tbody>
<tr><td>Deployable paths checked</td><td class="num">102</td><td>the declared set</td></tr>
<tr><td>Returned HTTP 200</td><td class="num">102</td><td>all reachable</td></tr>
<tr><td>Missing</td><td class="num">0</td><td></td></tr>
<tr><td>Semantic matches</td><td class="num">100</td><td></td></tr>
<tr><td>Semantic mismatches</td><td class="num">2</td><td><code>index.html</code> and <code>sw.js</code></td></tr>
<tr><td>Line-ending-only differences</td><td class="num">1</td><td><code>CITATION.cff</code></td></tr>
</tbody></table>

<p>The two mismatches were left unresolved rather than rounded away. Production
served a homepage without the deferral script the repository carried, and a service
worker naming cache <code>aaig-v84</code> where the repository named
<code>aaig-v85</code>. The receipt also records that the reported source commit was
an empty string, and that the deployment completed roughly ten minutes before the
then-current main commit existed, so that commit could not have been its source.
The event decision was <code>DEFER</code>. <span class="chip chip-observed">OBSERVED</span></p>

<p>A later Git-connected deployment linked provider record to merged source with an
exact commit relationship, and sampled two live routes. Both returned 200. Both
differed from committed bytes by exactly one declared 214-byte analytics insertion
with zero source bytes removed, which is why raw byte identity is recorded as
mismatched and the transform relationship as matched. Both routes recorded no
content security policy header. That receipt explicitly declines to establish global
edge convergence, installed cache state, accessibility, privacy, security, semantic
truth, durability, or any future state. <span class="chip chip-observed">OBSERVED</span></p>

<p>The service-worker drift from the first receipt stayed open for two cache
generations. A third receipt now closes it: production served bytes identical to the
committed file, with both naming cache <code>aaig-v87</code>. Closing it required
publishing a checkpoint, and the projection root was unchanged at
<span class="digest">22852b5a3025</span>, because an observation with no effect must
not advance accepted state. <span class="chip chip-observed">OBSERVED</span></p>

<p class="tnote">The closure is bounded and the receipt says so. It records that the
<code>aaig-v85</code> and <code>aaig-v86</code> generations were never observed in
production and cannot be reconstructed, that one edge was sampled, and that installed
client caches were not inspected. The process failure is the part worth keeping: an
unresolved finding aged out of view for two versions because nothing scheduled its
re-observation. The protocol recorded the gap faithfully and did not close it for me.
<span class="chip chip-open">OPEN</span></p>

<h3>9.4 Finite representations and blind output recovery</h3>

<table>
<caption><b>Table 9.</b> One layer in plain language, formal language, finite result,
and claim ceiling. Every result is local to the retained owner-review packet.</caption>
<thead><tr><th style="width:19%">Plain statement</th><th style="width:23%">Formal object</th>
<th style="width:30%">Finite result</th><th>Claim ceiling</th></tr></thead>
<tbody>
<tr><td>A forecast is not permission.</td>
<td><code>execute = 1</code> only if <code>g = PASS</code>, for every
<code>p</code>.</td>
<td>All three blind responses returned <code>BLOCK</code> when the gate was held.</td>
<td>Exact prompt-oracle agreement, not operational enforcement.</td></tr>
<tr><td>In the frozen objective, coupling the report to its reward moves the optimum.</td>
<td><code>argmin E[(p-Y)^2] = 1/2</code>; adding <code>(1/2)p</code> gives
<code>p* = 1/4</code>.</td>
<td>All three responses recovered both frozen values.</td>
<td>A synthetic algebraic counterexample, not real-world calibration.</td></tr>
<tr><td>Current state is sufficient only for named questions.</td>
<td><code>r(x)=r(y)</code> implies <code>sigma_Q(x)=sigma_Q(y)</code>.</td>
<td>Across 151 traces and seven queries, all 1,023 nonempty subsets of ten fields
were checked. One five-field set was sufficient. It realized 47 tuples for 33 query
classes.</td>
<td>Set-minimal within ten supplied fields, not globally minimal. The 47 tuples
overrefine the exact 33-class query quotient.</td></tr>
<tr><td>A useful summary must also survive permitted next steps.</td>
<td><code>x equiv_Q y</code> only when every permitted continuation preserves equal
query answers.</td>
<td>The full seven-query partition stayed <code>33 to 33</code>. Removing
<code>nextPermittedActions</code> began at 18 classes and refined to the same 33-class
partition in one round.</td>
<td>Exact for one finite graph, ten events, and declared refusal semantics.</td></tr>
<tr><td>Several actions can remain equally admissible without being equal.</td>
<td>Keep every nondominated risk vector until policy supplies a preference rule.</td>
<td>All three responses retained <code>A, B, C</code> as Pareto-minimal and refused
to invent a unique action.</td>
<td>Agreement on the frozen example, not a universal risk policy.</td></tr>
</tbody></table>

<p>The blind evaluator made 27 exact comparisons: nine frozen result groups across
three requested configurations. All 27 matched the oracle, all three response shapes
passed, and the exact answer vectors matched pairwise. The exact layer includes the
gate, the two forecast optima, historical insufficiency, the Pareto set, absence of
a unique action, the unresolved pending state, the encoding distinction, and the
five-step record order. <span class="chip chip-tested">TESTED</span></p>

<p>The semantic layer is deliberately weaker. Its quote links pass deterministic
existence checks, but the function-to-quote judgment remains
<code>DRAFT_OWNER_REVIEW</code>. Six functions have unambiguous unanimous quote
support: gate and forecast separation, freezing before resolution, append-only
resolution, cohort calibration, typed unresolved state, and preservation of a
Pareto frontier without hidden scalarization. The owner-review map also marks
forecast scoring, F04, present in all three responses. One mapped quote says to
score the frozen forecast after resolution without naming a declared scoring rule,
so strict F04 unanimity remains unresolved and is not promoted to the six-function
count. F04 still has direct scoring-rule support in two responses. Query-relative
projection and behavioral quotienting also recurred in two of three responses, so
functions F01 through F09 each have quote support in at least two. Deterministic
replay audit, explicit separation of belief scoring from action optimization, and
the general claim ceiling, F10 through F12, were absent from all three. Agreement
is therefore signal about recoverable output structure, not evidence that the
responses supplied the complete architecture.
<span class="chip chip-open">OPEN</span></p>

<p>The model labels are retained exactly as requested but not promoted to runtime
identity. The runs share material common causes, including the prompt, schema,
orchestration platform, and possible training or system dependencies. No result in
this subsection is described as independent replication, human understanding,
truth, novelty, safety, or forecast calibration.</p>
"""

NEGATIVE = r"""
<h2><span class="num">10</span>The results that went against me</h2>

<p>These are the most informative findings in the project. Each one narrowed a claim
I had already made.</p>

<h3>10.1 A receipt that contradicts itself</h3>

<p>The first deployment receipt reports its status twice. The envelope records
<code>evidence: VERIFIED</code> and <code>authority: UNVERIFIED</code>. The payload
record inside the same file reports <code>evidence: PASS</code> and
<code>authority: PASS_WITH_LIMITS</code>. Five other axes agree. Two do not, and
they disagree about whether authority was established.</p>

<p>The schema contract gate passes this file. It validates each object against its
own schema and never cross-checks the two. So a receipt can be internally
inconsistent on the question of whether anything was authorized, and a green gate
will not notice. This is exactly the projection drift the design warns about,
occurring inside a single artifact of the system that names it.
<span class="chip chip-tested">TESTED</span></p>

<p>A second instance sits beside it. The two deployment receipts use different status
vocabularies. The first is schema 1.0.0 with no declared vocabulary and pass-and-fail
values. The second is schema 2.0.0 declaring <code>stp-v1.1-status-axes</code> with
values such as <code>SUPPORTED</code>, <code>APPLIED</code>, and <code>MATCHED</code>.
No mapping between them exists in the repository, so the two production observations
in one stream cannot be compared axis by axis. <span class="chip chip-open">OPEN</span></p>

<h3>10.2 A larger-model control recorded fewer unsupported claims than every eligible structured arm</h3>

<p>The Typed Refusal archive reports unsupported-claim aggregates across five arms
of increasing structure, against a corpus of United States Code Title 29 identified
by digest <span class="digest">188ab1c50a46</span>. A sixth arm, an off-model
control, was a larger model given the corpus and no structure at all. The corpus
bytes and original runs are not in the public archive.</p>

<table>
<caption><b>Table 10.</b> Typed Refusal Harness. Rates are unsupported claims per 100
hand-decomposed claims. Wilson intervals and two-tailed Fisher exact tests against
P0 are exploratory claim-level summaries under a working independence assumption;
question and run clustering could not be modeled from the published aggregate.</caption>
<thead><tr><th style="width:9%">Arm</th><th style="width:31%">Structure added</th>
<th class="num">Unsupported</th><th class="num">Claims</th><th class="num">Rate</th>
<th style="width:14%">95% CI</th><th class="num">Exploratory p vs P0</th></tr></thead>
<tbody>
<tr><td>P0</td><td>corpus only, no index, no tool</td><td class="num">20</td><td class="num">90</td><td class="num">22.2</td><td>14.9-31.8</td><td class="num">baseline</td></tr>
<tr><td>P1</td><td>hash-verified snapshot, single-unit pull</td><td class="num">5</td><td class="num">87</td><td class="num">5.7</td><td>2.5-12.8</td><td class="num">0.0021</td></tr>
<tr><td>P2</td><td>typed rejections as final answers</td><td class="num">6</td><td class="num">105</td><td class="num">5.7</td><td>2.6-11.9</td><td class="num">0.0012</td></tr>
<tr><td>P3</td><td>byte receipt required per quotation</td><td class="num">9</td><td class="num">100</td><td class="num">9.0</td><td>4.8-16.2</td><td class="num">0.0148</td></tr>
<tr><td>P4</td><td>frozen answers with inline receipts</td><td class="num">0</td><td class="num">99</td><td class="num">0.0</td><td>0.0-3.7</td><td class="num">excluded</td></tr>
<tr class="total"><td>Control</td><td>larger model, corpus only, no structure</td><td class="num">0</td><td class="num">151</td><td class="num">0.0</td><td>0.0-2.5</td><td class="num">not tested</td></tr>
</tbody></table>

<p>At the claim level, the archived aggregates yield p = 0.0021 for P1, p = 0.0012
for P2, and p = 0.0148 for P3 against P0. No decision threshold was registered, and
the independence assumption is not supported by the clustered design, so these
values are not treated as confirmatory or as arm-level significance tests. P4's
zero count is descriptive only. Its answers were supplied by construction, and one
of its three runs ignored the cards, so the arm is excluded from accuracy claims.</p>

<p>The larger-model control recorded zero unsupported claims out of 151, matching
the excluded P4 count and recording fewer than each eligible structured arm, P1
through P3. Exploratory claim-level Fisher comparisons yield p = 0.0061 against P1,
p = 0.0044 against P2, and p = 0.0002 against P3. Because model identity and
scaffolding changed together, these comparisons do not identify a causal effect.
Within the published aggregate, replacing the model coincided with a lower
unsupported-claim count than any eligible scaffold around the weaker model, while
P1 through P3 each remained below that weaker model's P0 baseline.
<span class="chip chip-observed">OBSERVED</span></p>

<div class="callout stop">
<h4>What this experiment does not support</h4>
<p>The generating prompts, the per-run answers, the corpus file, and the
preregistration artifact are all absent from the repository. The repository states
that six predictions were registered before any arm ran and that three were
falsified, and exactly one of the six is quoted anywhere, partially. I could
recompute the published aggregate from <code>arms.json</code> and
<code>stats.py</code>. I could not reproduce a single original run. No significance
criterion was preregistered, so every p value here is post-hoc. The archive also
does not publish the question-level or run-level counts needed for a
cluster-preserving permutation, bootstrap, or multilevel analysis.
<span class="chip chip-open">OPEN</span></p>
</div>

<h3>10.3 A committed registration record and a replication that denied its own doctrine</h3>

<p>A separate experiment is described by its repository as preregistered. The pinned
repository contains a registration file naming three criteria and decision logs for
a test of the claim that live per-probe feedback eliminates the premature nulls that
committed plans produce. The design was two rounds by three models by three
replicates by two arms, for 36 sessions. The inspected public history does not
independently prove that the registration file predates those sessions.</p>

<table>
<caption><b>Table 11.</b> Replication of 2026-07-17. Verdict: doctrine denied.
Token counts are block totals of output tokens over six sessions per cell group.</caption>
<thead><tr><th style="width:24%">Model</th><th class="num">One-shot</th><th class="num">Iterative</th>
<th class="num">Ratio</th><th>Scored result</th></tr></thead>
<tbody>
<tr><td>claude-opus-4-8</td><td class="num">5,567</td><td class="num">35,152</td><td class="num">6.3&times;</td><td>6/6 clean one-shot; 1 premature null iterative</td></tr>
<tr><td>claude-sonnet-5</td><td class="num">15,673</td><td class="num">48,800</td><td class="num">3.1&times;</td><td>12/12 scored as calibrated under the experiment rubric</td></tr>
<tr><td>claude-haiku-4-5</td><td class="num">38,809</td><td class="num">41,399</td><td class="num">1.1&times;</td><td>3 clean, 3 premature one-shot; iterative arm lost</td></tr>
</tbody></table>

<p>Recorded criterion (a) was satisfied, though not by the model that motivated the
doctrine. Recorded criterion (b) failed, and that failure denied the doctrine: one opus iterative
session produced a genuine premature null, skipping the domain floor extreme after
seven matching probes sat in front of it. The recorded bar was zero
counterexamples, and one is enough.</p>

<p>Recorded criterion (c) could not be evaluated at all. All six haiku iterative sessions were
truncated mid-play by a session limit, so 30 of 36 sessions were scored. The
repository record acknowledges the confound rather than hiding it: models ran in
sequential blocks with haiku last, so budget exhaustion clusters on the final block.
That is missing data with a known mechanism, recorded as missing.
<span class="chip chip-observed">OBSERVED</span></p>

<p>Two things survived. Sonnet was scored as calibrated under that experiment's
rubric in 12 of 12 sessions across both arms, which the document itself downgrades
to a rubric-specific signal rather than a capability benchmark. That label is not
empirical forecast calibration as defined in section 5 and is not a
protocol-calibrated predicate. And all four valid premature nulls fell on the same round, with zero on
the other across its 15 valid sessions, which points to a blind-spot family that
crosses models and that per-probe feedback did not close.</p>

<p>The replay of all 36 recorded cells runs offline through the published harness,
asserts twelve checks, and is wired into the repository gate. It reproduces the
denied verdict from the recorded artifacts; it does not reproduce the original model
sessions or constitute independent validation.
<span class="chip chip-tested">TESTED</span></p>

<h3>10.4 Smaller corrections</h3>
<ul>
<li>Absolute privacy language on the public site exceeded what the tests covered.
The page said nothing leaves while the host loaded analytics. The claim was split
into local input analysis and aggregate page telemetry.</li>
<li>The offline cache list omitted JavaScript that cached tools required, so a fresh
offline profile could hold a page without the code to run it. The list was closed
over its dependencies and installation became fail-closed.</li>
<li>A data-only overlay still carried HTML through the parser into a rendering sink.
Escaping plus a full parser-to-sink test closed the demonstrated path.</li>
<li>The privacy scanner reports 85 records. The tree holds 87 files of the scanned
types, and the harness hard-codes two self-exemptions. The number is correct and
the exemptions are worth stating.</li>
<li>The home surface check confirms the string <code>160 recorded cross-domain
primitives</code> appears in the page. The data file does contain 160 entries, but
the check is a string match, not a cross-count, and would pass if both drifted
together.</li>
</ul>

<figure>
  {FIG5}
  <figcaption><b>Figure 5.</b> The repair pattern used in the corrections reported
  above. In these cases, the missing step was a regression gate.</figcaption>
</figure>
"""

BOUNDARY_SECTION = r"""
<h2><span class="num">11</span>What this does not establish</h2>

<p>Stated once, in full, so that no section has to hedge itself.</p>

<p>Nothing here establishes that a recorded event was true. A false sensor produces
a well-formed receipt. A valid credential holder makes a bad decision. Two programs
agree because they share one mistake. Comparison against a previously trusted digest
reveals a byte difference without showing the earlier bytes described reality.</p>

<p>Nothing here establishes causation, lawful authority, regulatory compliance,
statistical reliability, general safety, or independent validation. The reducers
share a specification and may share its errors. Most fixtures are synthetic. Most
witnesses are not organizationally independent. There is no live authority service
with independently managed keys, trusted time, revocation, and atomic single-use
consumption. There is no durable non-equivocating log for a threat model that
includes full history replacement. There is no general proof of liveness, fairness,
concurrency safety, or survivability. There is no preregistered human study, and no
external replication of the architecture.</p>

<p>The case study is one project's repair history, produced by one person, largely
in one computing environment, on data and interfaces that changed while the work
proceeded. It may not transfer.</p>

<p>The activation and quotient results are exhaustive only inside a synthetic
finite model. Their minima depend on the supplied candidate fields and declared
queries. Their stable partition depends on the 151 trace prefixes, ten events,
enabled-or-refused transition rule, and finite continuation graph. They establish
no fact about an iPhone, another device, an open environment, an unmodeled event, or
a richer query. A five-field sufficient representation is not the unique data
structure for the behavior, and its 47 realized tuples are not the exact 33-class
behavioral quotient.</p>

<p>The blind prompt is a three-response output-recovery check, not a model benchmark.
Requested model labels are unattested metadata. The runs share the prompt, schema,
platform, operator, and possible training or system dependencies. Twenty-seven exact
oracle matches do not establish semantic understanding. The semantic map is an
owner-review judgment over quote-linked text, and its three universal absences are
part of the result. No real event resolved, so the packet contains neither a
forecast outcome nor evidence of forecast calibration.</p>

<p>The local Lean source states query-signature sufficiency and kernel exactness
using Mathlib's pinned <code>Function.FactorsThrough</code> vocabulary [47]. The
module compiled directly in the local pinned environment, but it is not imported by
the package root and no upstream Mathlib review occurred. It is a local formalization
aid, not an accepted library contribution or external proof review.</p>

<p>One risk deserves naming on its own. Strict preservation of unknowns can make a
system unusable. If unresolved evidence blocks every action, availability and safety
trade against each other, and the protocol offers no principled exchange rate
between them. <span class="chip chip-open">OPEN</span></p>

<h3>Five tests that would demote these claims</h3>
<ol>
<li><b>Clean-room replay.</b> Give an external team the minimized public packet and
nothing else. Disagreement demotes the replay claim or exposes a hidden dependency.</li>
<li><b>Formal non-promotion check.</b> Model the lifecycle and either prove or refute
that proposal, acknowledgement, and unresolved evidence cannot advance accepted
state.</li>
<li><b>Qualified instrument pilot.</b> Use one real instrument with a metrology
review, operating limits, uncertainty, and a known sensing footprint. Failure
narrows the observation contract.</li>
<li><b>False-assurance study.</b> Pre-register a comparison between one composite
status and the six-signal view, measuring correct intervention, missed danger, false
reassurance, and response time. No benefit leaves Six Signals an accessibility
design and not a comprehension improvement.</li>
<li><b>Narrow live adapter.</b> Implement one bounded consequential tool end to end.
Any unrecorded or duplicated effect falsifies the finality boundary.</li>
</ol>
"""

GUIDE = r"""
<h2><span class="num">12</span>Adapting this</h2>

<p>The names here do not matter. The separation does. Nine steps, in order, and the
first one is the one people skip.</p>

<ol>
<li><b>Pick one consequential transition.</b> Not an ontology. One action whose wrong
execution or false acceptance would actually hurt.</li>
<li><b>List what you currently collapse.</b> Write the exact phrases your system
treats as success: request accepted, job started, HTTP 200, database commit, sensor
value, human review, deployment succeeded, customer outcome. Decide which are
genuinely different states.</li>
<li><b>Type absence.</b> Define what a real zero means in your domain, then define
no-change, missing measurement, censoring, staleness, and evaluator failure
separately. Never let an empty field pick between them.</li>
<li><b>Bind authority to an operation.</b> Not to a role, and not to a tool. Separate
risks a user may accept from constraints that must refuse. Record expiry,
revocation, and replay behavior.</li>
<li><b>Build the smallest reducer.</b> Rebuild accepted state from the event prefix
using assigned sequence and causal references. Keep presentation and telemetry
derivative. Write a second implementation if the state is load-bearing.</li>
<li><b>Attack it.</b> Change a subject identifier. Duplicate an event. Remove a
blocking check. Replace a source digest. Reorder events. Force an evaluator error.
Return an acknowledgement with no effect. Keep every successful attack as a
regression test.</li>
<li><b>Report a vector.</b> Show consequence, evidence, integrity, privacy, activity,
and the local complete condition separately, with reason codes and source links.
Never color alone.</li>
<li><b>Release less than you collected.</b> Allowlist a public derivative. Keep
sensitive evidence in a restricted store with retention rules. Record what the public
verifier can and cannot recreate.</li>
<li><b>Invite a clean-room challenge.</b> The useful first external test either
matches your bounded result or finds your instructions underspecified. Both results
are worth more than another internal pass.</li>
</ol>

<h2><span class="num">13</span>What I do not know</h2>

<p>I do not know whether this combination is novel in an academic sense, and I have
not completed the systematic literature review needed to assess it, so I make no
priority claim.
I do not know whether six signals are understood better than one status, because I
have run no user study. I do not know whether strict preservation of unknowns is
affordable in a high-volume system. I do not know how any of this behaves under
network partition, adversarial witnesses, or fast schema churn. I do not know
whether the missing Ledger bytes would resolve the terminology conflict in section 2
or deepen it.</p>

<p>Those are part of the result. The clearest implementation finding in this work is narrow:
specific false-pass paths became explicit tests, and unresolved conditions stayed
visible instead of being rounded to green. The next tests are external reproduction,
one real qualified instrument, and one bounded live adapter.</p>
"""

BACK = r"""
<h2><span class="num">14</span>Lineage, credits, and AI-assistance disclosure</h2>

<h3>Where this came from</h3>

<p>The ideas in this paper did not start here, and they did not start with me alone.
The early conceptual work was done in April and May 2026 in extended dialogue with
language models, principally Claude and Gemini. I set the problems, argued with the
answers, and kept what survived. What the models contributed was real and I am not
going to describe it as tooling.</p>

<p>I published the first versions publicly on LinkedIn in May and June 2026, before
any of the software described here existed. Those posts introduced most of the
vocabulary this work still runs on: the biological floor, the metabolic veto,
agentic drift, structural harmonics, the structural floor, hidden actualities,
mechanical psychosis, and state-delta architecture. Several arguments in section 1
appear there first, in less careful form. The posts are on my public profile at
<code>linkedin.com/in/jake-tiller-548b409b</code>, and per-post locators belong in
this paragraph once they are archived independently rather than cited from a
platform that can change them.</p>

<p>What this paper adds to that earlier work is not the ideas. It is the part that
can be checked. The posts asserted a framework. This document reports what happened
when I built it, tested it, tried to break it, and recorded the places it failed.
The move from assertion to evidence is the whole contribution, and the earlier
material is stronger for having been narrowed by it.</p>

<p>I make no originality claim over the component ideas. Causal ordering, event
sourcing, compensating transactions, safety and liveness, measurement uncertainty,
conformity assessment, and provenance modeling are all established fields, cited in
section 15, and none of them are mine. The synthesis is what I did. Whether that
synthesis is novel in an academic sense requires a systematic literature review I
have not completed, so I do not claim priority over anyone.</p>

<h3>Credits and disclosure</h3>

<p>I supplied and classified the source artifacts, set the operating, acceptance, and
privacy constraints, chose which claims to make public, and am responsible for the
manuscript and every release decision.</p>

<p>Generative AI systems were used as research, coding, testing, and editing tools.
Recorded uses include brainstorming, terminology extraction, source discovery,
repository inspection, code drafting, test generation, adversarial review, and
manuscript editing. Their outputs were treated as candidate material, never as
evidence, authority, authorship, or independent validation. Checks run by agents
that share models, prompts, tools, or specifications are not described anywhere in
this paper as independent replication. The synthesis and the prose benefited
materially from that assistance, and I reviewed the final text.</p>

<h2><span class="num">15</span>References</h2>
<div class="refs">
<ol>
<li>A. Vaswani et al. Attention Is All You Need. NeurIPS, 2017. <span class="src">papers.nips.cc/paper/7181</span></li>
<li>L. Lamport. Time, Clocks, and the Ordering of Events in a Distributed System. CACM 21(7), 1978. <span class="src">doi:10.1145/359545.359563</span></li>
<li>M. Fowler. Event Sourcing. 2005. <span class="src">martinfowler.com/eaaDev/EventSourcing.html</span></li>
<li>J. Gray. The Transaction Concept: Virtues and Limitations. VLDB, 1981.</li>
<li>H. Garcia-Molina and K. Salem. Sagas. SIGMOD, 1987. <span class="src">doi:10.1145/38713.38742</span></li>
<li>F. B. Schneider. Implementing Fault-Tolerant Services Using the State Machine Approach. ACM Computing Surveys 22(4), 1990. <span class="src">doi:10.1145/98163.98167</span></li>
<li>D. Seto et al. The Simplex Architecture for Safe On-Line Control System Upgrades. ACC, 1998. <span class="src">doi:10.1109/ACC.1998.703255</span></li>
<li>JCGM 200:2012. International Vocabulary of Metrology, 3rd ed. <span class="src">doi:10.59161/jcgm200-2012</span></li>
<li>JCGM 106:2012. The Role of Measurement Uncertainty in Conformity Assessment. <span class="src">doi:10.59161/jcgm106-2012</span></li>
<li>National Academies. Reproducibility and Replicability in Science. 2019. <span class="src">doi:10.17226/25303</span></li>
<li>JCGM 100:2008. Guide to the Expression of Uncertainty in Measurement.</li>
<li>ICH E9(R1). Estimands and Sensitivity Analysis in Clinical Trials. Final addendum.</li>
<li>M. A. Hern&aacute;n and J. M. Robins. Causal Inference: What If. 2020. <span class="src">miguelhernan.org/whatifbook</span></li>
<li>EU General Data Protection Regulation, Articles 5 and 17. Regulation 2016/679.</li>
<li>A. Rundgren, B. Jordan, S. Erdtman. JSON Canonicalization Scheme. RFC 8785, 2020.</li>
<li>B. Laurie et al. Certificate Transparency Version 2.0. RFC 9162, 2021.</li>
<li>W3C. PROV-DM: The PROV Data Model. Recommendation, 2013.</li>
<li>W3C. Web Content Accessibility Guidelines 2.2. Recommendation, 2024.</li>
<li>S. Torres-Arias et al. in-toto: Providing Farm-to-Table Guarantees for Bits and Bytes. USENIX Security, 2019.</li>
<li>SLSA. Supply-chain Levels for Software Artifacts, v1.2. <span class="src">slsa.dev/spec/v1.2</span></li>
<li>NIST SP 800-207. Zero Trust Architecture. 2020.</li>
<li>NIST SP 800-82 Rev. 3. Guide to Operational Technology Security. 2023.</li>
<li>NIST AI 100-1. Artificial Intelligence Risk Management Framework 1.0. 2023.</li>
<li>CPMI-IOSCO. Principles for Financial Market Infrastructures. 2012.</li>
<li>U.S. SEC. Risk Management Controls for Brokers or Dealers With Market Access. Rule 15c3-5.</li>
<li>BCBS 239. Principles for Effective Risk Data Aggregation and Risk Reporting. 2013.</li>
<li>OMG. Structured Assurance Case Metamodel, v2.3. 2023.</li>
<li>U.S. FDA. Predetermined Change Control Plan for AI-Enabled Device Software Functions. 2025.</li>
<li>U.S. FDA. Applying Human Factors and Usability Engineering to Medical Devices. 2016.</li>
<li>EU Artificial Intelligence Act, Regulation 2024/1689, Articles 12, 14, 19.</li>
<li>Kubernetes. KEP-1623, Standardize Conditions. <span class="src">kubernetes.dev/resources/keps/1623</span></li>
<li>CNCF. CloudEvents Specification 1.0.2. 2022.</li>
<li>JSON Schema. Core and Validation, Draft 2020-12.</li>
<li>Model Context Protocol. Specification revision 2026-07-28.</li>
<li>L. Marom, S. Tibbits, G. Zardini, M. J. Buehler. A Category-Theoretic Framework from Biological Mechanics to Engineered Stimulus-Response Systems. arXiv:2604.26367, 2026.</li>
<li>P. Kocher, J. Jaffe, B. Jun. Differential Power Analysis. CRYPTO, 1999. <span class="src">doi:10.1007/3-540-48405-1_25</span></li>
<li>J. Macdonald. OpenGoldenRatio (OGR) v0.1: Containment-First Multi-Agent Governance Protocol. Zenodo, 2026. <a href="https://doi.org/10.5281/zenodo.18969396">doi:10.5281/zenodo.18969396</a>. Executable demonstration at <a href="https://github.com/macess888-cmyk/open-golden-ratio-demo/tree/58450185582f4ecf1410b33f77e22d8d4b0441a2">commit <code>58450185582f4ecf1410b33f77e22d8d4b0441a2</code></a>.</li>
<li>T. Heightman, E. Orlova, P. Mantrov, and A. Ustimenko. Hamilton-Zero: A Neural Tensor-Network Foundation Model for Ground States of Arbitrary Quadratic Qubit Hamiltonians. arXiv:2608.11911v2 [quant-ph], 2026. <a href="https://doi.org/10.48550/arXiv.2608.11911">doi:10.48550/arXiv.2608.11911</a>.</li>
<li>G. W. Brier. Verification of Forecasts Expressed in Terms of Probability. Monthly Weather Review 78(1), 1950. <a href="https://doi.org/10.1175/1520-0493(1950)078%3C0001%3AVOFEIT%3E2.0.CO%3B2">doi:10.1175/1520-0493(1950)078&lt;0001:VOFEIT&gt;2.0.CO;2</a>.</li>
<li>T. Gneiting and A. E. Raftery. Strictly Proper Scoring Rules, Prediction, and Estimation. Journal of the American Statistical Association 102(477), 2007. <a href="https://doi.org/10.1198/016214506000001437">doi:10.1198/016214506000001437</a>.</li>
<li>A. P. Dawid. Calibration-Based Empirical Probability. Annals of Statistics 13(4), 1985. <a href="https://doi.org/10.1214/aos/1176349736">doi:10.1214/aos/1176349736</a>.</li>
<li>J. C. Perdomo, T. Zrnic, C. Mendler-D&uuml;nner, and M. Hardt. Performative Prediction. Proceedings of Machine Learning Research 119, 2020. <a href="https://proceedings.mlr.press/v119/perdomo20a.html">proceedings.mlr.press/v119/perdomo20a.html</a>.</li>
<li>E. F. Moore. Gedanken-experiments on Sequential Machines. In Automata Studies, 1956. <a href="https://doi.org/10.1515/9781400882618-006">doi:10.1515/9781400882618-006</a>.</li>
<li>A. Nerode. Linear Automaton Transformations. Proceedings of the American Mathematical Society 9(4), 1958. <a href="https://doi.org/10.1090/S0002-9939-1958-0135681-9">doi:10.1090/S0002-9939-1958-0135681-9</a>.</li>
<li>J. E. Hopcroft. An n log n Algorithm for Minimizing States in a Finite Automaton. Stanford CS-TR-71-190, 1971. <a href="https://i.stanford.edu/TR/CS-TR-71-190.html">i.stanford.edu/TR/CS-TR-71-190.html</a>.</li>
<li>S. Boyd and L. Vandenberghe. Convex Optimization. Cambridge University Press, 2004. <a href="https://web.stanford.edu/~boyd/cvxbook/">web.stanford.edu/~boyd/cvxbook</a>.</li>
<li>Leanprover-community. Mathlib <code>Function.FactorsThrough</code>, pinned at commit <code>520045ab14e26149ee970e2e617ca04b09bde5d6</code>. <a href="https://github.com/leanprover-community/mathlib4/blob/520045ab14e26149ee970e2e617ca04b09bde5d6/Mathlib/Logic/Function/Basic.lean#L832-L885">Mathlib/Logic/Function/Basic.lean, lines 832-885</a>.</li>
<li>A. Ben-Tal and A. Nemirovski. Robust Convex Optimization. Mathematics of Operations Research 23(4), 1998. <a href="https://doi.org/10.1287/moor.23.4.769">doi:10.1287/moor.23.4.769</a>.</li>
</ol>
</div>

<h2><span class="num">A</span>Properties, assumptions, and limits</h2>

<h4>A.1 Proposal non-promotion</h4>
<p>Let <code>L(k)</code> be a valid event prefix and <code>A(k) = R(P, L(k))</code>.
Let <code>U(P)</code> be the nonempty set of policy-authorized projection-update
events, containing only qualified <code>ACCEPT</code> records that close a governed
transition. A <code>CORRECT</code> record begins a new governed transition and may
propose a superseding state, but it cannot update <code>A(k)</code> without a later
qualified <code>ACCEPT</code>. Appending only records whose types lie outside
<code>U(P)</code>, including proposal, preparation, tool acknowledgement, and an
unaccepted correction, cannot change <code>A(k)</code>.</p>
<p class="tnote">By induction over the appended sequence. The base projection is
unchanged, and each step records history without invoking the update function. The
result depends on complete reference validation and on there being no second update
path. A reducer defect or an incomplete policy invalidates the assumption, and
section 10.1 shows a related assumption failing in practice.</p>

<h4>A.2 Unknown preservation</h4>
<p>For the proposed normalized aggregate over a finite nonempty required set, the
result is <code>PASS</code> only when
every condition passes, <code>FAIL</code> if any fails, and <code>UNRESOLVED</code>
if none fails and any is unknown, stale, or errored. An empty set returns
<code>UNRESOLVED</code> with reason <code>INVALID_POLICY</code>. No unresolved
required predicate produces a pass. The rule says nothing about predicates omitted
from the set. This general precedence rule has not been exercised by a mixed
false-plus-unknown public fixture. <span class="chip chip-proposed">PROPOSED</span></p>

<h4>A.3 Deterministic replay</h4>
<p>With fixed policy bytes, event bytes, schema versions, canonicalization, reducer
code, and deterministic dependencies, repeated evaluation returns the same
projection. This is a property of the computational boundary. It does not establish
that the events are true, complete, or authorized.</p>

<h4>A.4 Hash-link mutation detection</h4>
<p>Assuming second-preimage resistance, an unambiguous canonical encoding, and a
trusted externally anchored tip that transitively commits the event, modifying that
event changes the committed tip except with negligible probability. A checkpoint
protects only the prefix it commits. An anchor before a modified event does not
prevent changing a later event and rehashing the suffix, so detecting suffix
replacement requires an authenticated current tip.</p>

<h4>A.5 Illustrative effect-trace counterexample</h4>
<p>Consider two declared effects, <code>alpha</code> and <code>beta</code>. Schedule
<code>(alpha, beta)</code> emits the ordered trace
<code>[dispatch-alpha, dispatch-beta]</code>, while schedule
<code>(beta, alpha)</code> emits <code>[dispatch-beta, dispatch-alpha]</code>. If both
schedules reduce to the same accepted projection, equal projections still do not
entail equal ordered effect traces. This is a counterexample by construction at the
specification level. No public fixture in the pinned repository implements it, so it
is not a tested result. <span class="chip chip-proposed">PROPOSED</span></p>

<h4>A.6 Bounded lane balance</h4>
<p>Capacity is tracked per lane, and the three lanes do not share a unit.
Observation, settlement, and recovery each measure something different, so their
backlogs are held as a vector and never summed. For a declared lane
<code>x</code>, a finite trace is evaluated by the deterministic recurrence:</p>

<div class="formula">
<div class="eq">B_x[k+1]  =  max( 0,  B_x[k] + A_x[k] - S_x[k] )

M_x(H)        =  max { B_x[k] : 0 &lt;= k &lt;= H }

finite_capacity_pass_x(H)  iff  M_x(H) &lt;= C_x</div>
<div class="where"><b>A_x</b> arrivals into lane x &nbsp;&middot;&nbsp; <b>S_x</b> service
capacity of lane x &nbsp;&middot;&nbsp; <b>B_x</b> backlog &nbsp;&middot;&nbsp; <b>C_x</b> declared
finite capacity &nbsp;&middot;&nbsp; <b>H</b> declared finite horizon &nbsp;&middot;&nbsp; all lane
quantities finite, nonnegative, and in one declared unit.
<span class="chip chip-proposed">PROPOSED</span></div>
</div>

<p>For declared arrays, initial backlog, horizon, and capacity, these equations
answer one bounded question: whether the computed backlog exceeds capacity anywhere
in that finite trace. They do not establish stationarity, asymptotic stability,
recurrence class, a queue-length distribution, or a future arrival or service rate.
No stochastic queueing theorem is claimed or tested here.</p>

<p>The autonomy rule in section 3 treats observation, settlement, and recovery
capacity as separate constraints. Applying it to a live lane would require declared
measurement procedures and a justified rule for projecting beyond the observed
window. This project supplies neither. A finite-capacity pass is therefore a local
trace result, not evidence that a live lane will keep pace.
<span class="chip chip-open">OPEN</span></p>

<p>Where a bounded check is wanted before an estimator exists, the survivability
harness substitutes finite reachable-state traversal at a declared horizon. The
profile fixes <code>H = 7</code> rounds and a no-change tolerance of
<code>epsilon = 0.02</code> in the lane's declared unit. Both are conventions. A
longer horizon evaluates a different, generally more expensive bounded question,
and neither value is derived from anything. Under an exact-<code>H</code> recovery
condition, one horizon is not uniformly stronger or weaker than another without
additional monotonicity and absorbing-target assumptions. Every disturbed and
controlled state must stay legal, preserve the named invariant, and retain the
required essential function, and every state in the frontier at round
<code>H</code> must be in the recovery target set. Merely reaching the target
before <code>H</code> is insufficient unless the required <code>H</code>-frontier
condition also holds. An invalid model, an undefined
controller, or an exceeded bound returns <code>UNKNOWN</code> rather than a pass.
<span class="chip chip-proposed">PROPOSED</span></p>

<h4>A.7 Brier loss and the coupled-objective shift</h4>
<p>Let <code>Y</code> be binary with <code>Pr(Y=1)=q</code>. For a forecast
<code>p</code>, direct expansion gives:</p>

<div class="formula">
<div class="eq">E[(p-Y)^2]
  = q(p-1)^2 + (1-q)p^2
  = p^2 - 2pq + q
  = (p-q)^2 + q(1-q)</div>
<div class="where">The final term is constant in <b>p</b>, so the unique minimum on
the unit interval is <b>p = q</b>. This is the binary Brier result [39, 40].</div>
</div>

<p>If the same objective adds <code>mu p</code>, its derivative is
<code>2(p-q)+mu</code>. Strict convexity gives the constrained minimizer
<code>clip(q-mu/2, 0, 1)</code>. At <code>q=1/2</code> and <code>mu=1/2</code>, the
optimum moves from <code>1/2</code> to <code>1/4</code>. The lower report is not a
better estimate of <code>q</code>. It is the optimum of a different objective. The
counterexample proves that an incentive attached directly to the report can distort
the report; it does not prove that every coupled system does so.</p>

<h4>A.8 Query factorization and exact kernels</h4>
<p>For a finite family of queries, let <code>sigma_Q(x)</code> be the vector of all
declared answers at state <code>x</code>, and let <code>r(x)</code> be a proposed
representation. The representation is sufficient exactly when equal represented
values never hide unequal query signatures:</p>

<div class="formula">
<div class="eq">r(x) = r(y)  implies  sigma_Q(x) = sigma_Q(y)

equivalently,  sigma_Q = d after r  on the image of r</div>
<div class="where">This is <code>sigma_Q.FactorsThrough r</code> in Mathlib's pinned
vocabulary [47]. The decoder <b>d</b> need only be defined on represented values
that occur.</div>
</div>

<p>Exactness requires the reverse factorization as well. Then
<code>r(x)=r(y)</code> if and only if <code>sigma_Q(x)=sigma_Q(y)</code>, so the two
functions induce the same kernel partition. Their class labels and data structures
may still differ. The local <code>QueryQuotient.lean</code> module proves component
factorization, the sufficiency equivalence, separation of unequal signatures, and
this kernel characterization. It compiled directly against the pinned Mathlib
environment but is not an upstream-reviewed contribution.</p>

<p>In the finite activation packet, the unique five-field candidate minimum is
sufficient for all seven queries over 151 traces. It realizes 47 representation
values, while the full query signature realizes 33 classes. It therefore preserves
the answers but does not implement the exact quotient. The result is relative to
the supplied ten fields and exhaustive 1,023-subset search.</p>

<h4>A.9 Future-stable refinement</h4>
<p>Static query equality is the initial relation
<code>x equiv_0 y</code> when <code>sigma_Q(x)=sigma_Q(y)</code>. Define the next
relation by retaining a pair only when it was previously equivalent and every
declared event has the same enabled-or-refused status and leads to states equivalent
under the previous relation. Each round can split classes and never merge them. On
a finite state set the descending sequence must stabilize.</p>

<p>At the fixed point, equivalent states have the same query answers after every
permitted finite continuation. Conversely, any transition-stable equivalence lying
inside the initial query kernel survives every refinement round by induction, so it
lies inside the fixed point. The limit is therefore the largest transition-stable
equivalence contained in the declared query kernel, or the coarsest stable
refinement of its partition. This is established sequential-machine refinement,
not a new theorem [43-45].</p>

<p>The frozen packet's full seven-query partition began with 33 classes and was
already stable. Omitting <code>nextPermittedActions</code> began with 18 classes and
refined to 33 in one round. Both reached the same partition digest
<span class="digest">2f129b2ac6c0</span>. The witness is concrete: after
<code>BOOT</code>, <code>ACCEPT_CONSENT</code> is enabled and advances; from the
empty trace it is refused and remains in place. This proves the distinction only in
the pinned finite graph.</p>

<h4>A.10 Pareto existence and policy selection</h4>
<p>Let a finite nonempty action set carry a finite risk vector. Say action
<code>a</code> dominates <code>b</code> when every component of <code>a</code> is no
worse and at least one is strictly better. A Pareto-minimal action must exist. Start
from any action. If it is dominated, move to a dominator. Strict dominance cannot
cycle, and a finite set cannot support an infinite descent, so the process ends at
a nondominated action.</p>

<p>If every scalarization weight is positive, a minimizer of the weighted sum is
Pareto-minimal: a dominator would make at least one positively weighted component
smaller and none larger, contradicting minimality [46]. The converse does not give
one authorized weight vector, and neither existence result gives uniqueness. In the
blind fixture, all three actions are nondominated. Returning the frontier and an
unresolved selection is therefore the complete result until policy supplies a
preference rule.</p>

<h2><span class="num">B</span>Provenance, reuse, and attribution</h2>

<p>The intended public release will use CC BY 4.0. Adaptation will be welcome,
including commercial adaptation, with attribution to the author and identification
of what was modified. I cite my own sources throughout and expect the same in
return, which is the whole of what I am asking.</p>

<p>For publication, the exact release bytes will be hashed with SHA-256, recorded in
the public event history described in section 6, sealed by a checkpoint, and checked
again in continuous integration. Until that workflow runs against the final release,
this owner-review draft has no completed publication commitment. Once complete, the
record can support artifact identity and chronology for the committed bytes. It does
not by itself prove authorship, originality, independent creation, or legal
priority.</p>

<div class="callout split">
<h4>Interoperability fixtures in this specification</h4>
<p>Several values here are arbitrary by construction, meaning any distinct value
would serve the same technical purpose. They are fixed so that implementations can
exchange and replay the same records. They are technical fixtures, not watermarks or
evidence of origin:</p>
<ul>
<li>the domain separation tag <code>D</code> in section 6;</li>
<li>the condition vocabulary <code>PASS | FAIL | UNKNOWN | STALE | ERROR |
NOT_APPLICABLE</code>, and the reason code <code>INVALID_POLICY</code> returned for
an empty required set;</li>
<li>the coined terms <b>protocol-calibrated predicate</b>, <b>decisive evidence
coverage</b>, <b>decisive conformance</b>, and <b>non-stale status fraction</b>,
each defined at first use;</li>
<li>the three-lane capacity vector of A.6, naming observation, settlement, and
recovery as separately metered lanes that are never summed.</li>
</ul>
<p>An implementation that adopts this protocol may reproduce these values under the
license. Attribution and identification of modifications are license obligations,
separate from any technical identity check.</p>
</div>

<h2><span class="num">C</span>Artifact index</h2>
<p>Full SHA-256 values for every digest abbreviated in the text. The table separates
public file bytes, derived outputs, and declared digests because they have different
verification ceilings.</p>

<p class="tnote">Verification note: for public blob rows, check out the named commit
and hash the exact file bytes with a local SHA-256 tool. The projection-root row is
reproduced by the named verifier, not by hashing that script. The refusal corpus row
cannot be recomputed from the public repository because the source bytes are absent.
No single command applies to every row.</p>

<table class="artifact-index">
<caption><b>Table 12.</b> Exact locators and expected digests. Repository abbreviations
are RL for Resilience-Ledger, TS for the-stable, and TR for
typed-refusal-harness.</caption>
<thead><tr><th style="width:25%">Artifact</th><th style="width:43%">Exact locator and status</th><th>Expected SHA-256 or root</th></tr></thead>
<tbody>
<tr><td>Atlas data-sync contract</td><td>public blob: RL@<code>275d0b3e7474</code><br><code>governance/<wbr>contracts/<wbr>atlas-data-sync.contract.v2.json</code></td><td class="mono">7366c7042ec2e40a501fe091f9367eb5e8e8449763b69afadf29762864d58263</td></tr>
<tr><td>Atlas runtime contract</td><td>public blob: RL@<code>275d0b3e7474</code><br><code>governance/<wbr>contracts/<wbr>atlas-runtime-contract.v1.json</code></td><td class="mono">7cd8c2a89f6df20995789f066643240a4cbcbc3ca67d2dc1cc4c71129b22ffd5</td></tr>
<tr><td>Production observation 000001</td><td>public blob: RL@<code>275d0b3e7474</code><br><code>governance/<wbr>ledger/<wbr>events/<wbr>deployment/<wbr>000001-wp0-production-observation.json</code></td><td class="mono">34bde4ec2eb4d1bfb70b8d44df6439cb295bd1dc1293df0ae47490193ad3fa97</td></tr>
<tr><td>Production observation 000002</td><td>public blob: RL@<code>275d0b3e7474</code><br><code>governance/<wbr>ledger/<wbr>events/<wbr>deployment/<wbr>000002-public-explanation-production-observed.json</code></td><td class="mono">4917a927727e3b0cc03cd057100a698ccc18e51751f69dd33f5bed14344fa24f</td></tr>
<tr><td>STP v1.2 release manifest</td><td>public blob: RL@<code>275d0b3e7474</code><br><code>research/<wbr>stp-v1.2/<wbr>release-manifest.json</code></td><td class="mono">2f95ed233a20060d1cbca3fae555410732242b26d9fb08afe482bc3390077704</td></tr>
<tr><td>Cross-language projection root</td><td>derived output: RL@<code>275d0b3e7474</code><br><code>node governance/<wbr>harnesses/<wbr>verify-replayers.js</code></td><td class="mono">22852b5a3025d4ed7ee1d26cc4efcd51ae2e3e02ba2a20332c2a09827d6462ca</td></tr>
<tr><td>Refusal corpus, US Code Title 29</td><td>declared only: TR@<code>721a824c9f73</code><br><code>data/<wbr>arms.json#corpus.sha256</code>; source bytes absent</td><td class="mono">188ab1c50a46f0dd2ff32aaa5f65c759a07710e052d297644b1a8f6b58ff413d</td></tr>
<tr><td>Replication registration record</td><td>public blob: TS@<code>77408db59cad</code><br><code>experiments/<wbr>replication-2026-07-17/<wbr>PREREGISTRATION.md</code></td><td class="mono">eff780cff6a4522370af2f00d01a7dc121ab143677f805cbdc865620dad7820b</td></tr>
<tr><td>Replication decision logs</td><td>public blob: TS@<code>77408db59cad</code><br><code>experiments/<wbr>replication-2026-07-17/<wbr>decision-logs.json</code></td><td class="mono">9fb48b2c0a837f91581c5faf5a043126348b6f86e64bf2383182f65978ffdca6</td></tr>
<tr><td>Generic activation dataset</td><td>local owner-review artifact, 98,769 bytes<br><code>work/<wbr>device-activation-fixture/<wbr>dataset/<wbr>device-activation-v1.json</code></td><td class="mono">a2dece0b00e9659e3f50df307bd41dedc722a1c5b93b16153f616d1f2b58a179</td></tr>
<tr><td>Generic activation checker config</td><td>local owner-review artifact, 540 bytes<br><code>work/<wbr>device-activation-fixture/<wbr>config/<wbr>checker-v2.config.json</code></td><td class="mono">7d6545f4d5cfa603b33f94ef42f747e4bf5e98631edfef30896cb5d24fb31c4d</td></tr>
<tr><td>Generic activation analysis</td><td>local owner-review artifact, 2,737 bytes<br><code>work/<wbr>device-activation-fixture/<wbr>results/<wbr>expected-analysis.json</code></td><td class="mono">7c550d125d383f7238ff936c7d05a3815ceb35132326253b973562fbca4b0a80</td></tr>
<tr><td>Generic activation receipt</td><td>local owner-review receipt, 3,158 bytes<br><code>work/<wbr>device-activation-fixture/<wbr>evidence/<wbr>BUILD-RECEIPT-000001.md</code></td><td class="mono">ee60b9aa4baa0286fb5899255380d6bf9772ca9240354bddc3b1a75fce1b9ab6</td></tr>
<tr><td>Transition-stable quotient report</td><td>local owner-review artifact, 2,627 bytes<br><code>work/<wbr>transition-stable-quotient/<wbr>results/<wbr>expected-report.json</code></td><td class="mono">1b0e78adcac732561a0263ef2704d53b397597c502f81e88a0999a37232df183</td></tr>
<tr><td>Transition-stable partition over frozen case IDs</td><td>derived output: <code>stablePartitionSha256</code> in the transition-stable quotient report</td><td class="mono">2f129b2ac6c060d253831dbded1810cfd64b030fa6b8a0514d6e048fc7086187</td></tr>
<tr><td>Transition-stable quotient receipt</td><td>local owner-review receipt, 4,016 bytes<br><code>work/<wbr>transition-stable-quotient/<wbr>evidence/<wbr>BUILD-RECEIPT-000001.md</code></td><td class="mono">4d0b0f50c361c51734db51a786fdc40b85de591e077d295677dbd40d63967514</td></tr>
<tr><td>Blind prompt</td><td>local owner-private input, 1,662 bytes<br><code>work/<wbr>probabilistic-audit-lane-study/<wbr>PROMPT.md</code></td><td class="mono">6b0628ef41bdf3b8d871238aa39ac44af43576887d5e0b1ed44ad8e7cdeccaf1</td></tr>
<tr><td>Blind response schema</td><td>local owner-private input, 1,808 bytes<br><code>work/<wbr>probabilistic-audit-lane-study/<wbr>schemas/<wbr>response.schema.json</code></td><td class="mono">3656a398b63255eefc2121327da65884cca365a965f5601d6eab18e33aa0a505</td></tr>
<tr><td>Blind run manifest</td><td>local owner-private metadata, 2,175 bytes<br><code>work/<wbr>probabilistic-audit-lane-study/<wbr>RUN-MANIFEST.json</code></td><td class="mono">5e104bff1ccd4cffc684667f84783a06414cfb7177da1b43717f0c90145e2f63</td></tr>
<tr><td>Blind evaluator report</td><td>local owner-review artifact, 20,945 bytes<br><code>work/<wbr>probabilistic-audit-lane-study/<wbr>results/<wbr>expected-report.json</code></td><td class="mono">de2c28735762a153602fc6e4bb777520c2aa3c687837e3f64b6277c459d67fe9</td></tr>
<tr><td>Blind packet receipt</td><td>local owner-review receipt, 4,488 bytes<br><code>work/<wbr>probabilistic-audit-lane-study/<wbr>evidence/<wbr>BUILD-RECEIPT-000001.md</code></td><td class="mono">537e8cc13e8425e53304dd22637df6d186efa4df0be0f910a747b5f78632c815</td></tr>
<tr><td>Lean query quotient source</td><td>local source, standalone-module compile only, 3,791 bytes<br><code>work/<wbr>mathlib-zero-state/<wbr>ZeroState/<wbr>QueryQuotient.lean</code></td><td class="mono">cfbb166202ade30abc0c79287ff8c1acf216e91a863121ade923218caede9896</td></tr>
</tbody></table>

<div class="footer-note">
Jake Tiller &middot; From Model Output to Accepted State &middot; owner-review draft,
15 August 2026 &middot; intended for release under CC BY 4.0. This draft is not a certification, a deployment
authorization, or a claim of independent validation.
</div>
"""
