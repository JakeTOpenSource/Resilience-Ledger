"""Paper body, part B: observation, replay, evidence state."""

OBSERVATION = r"""
<h2><span class="num">5</span>Measurement before acceptance</h2>

<p>A consequential system has to separate what happened from what was recorded
about what happened. A tool can return success while producing an unexpected
effect. A sensor can return a valid null. A result can be missing because nothing
was sampled, because it fell below a detection limit, or because a stated rule
censored it. Those support different decisions. Storing each as an empty field
destroys the information the next check needs.</p>

<p>An observation is therefore a tagged record, never a bare value.</p>

<div class="formula">
<div class="eq">DOMAIN_VALUE(value, unit_or_schema, uncertainty)
DOMAIN_NULL(reason)
BELOW_LIMIT(limit, procedure)
NO_CHANGE(quantity, delta_hat, u_delta, epsilon, rule, interval, procedure, conditions)
ABSENT(reason)
CENSORED(rule, bound)
INTERCURRENT(event, strategy)</div>
<div class="where"><b>DOMAIN_NULL</b> is a meaningful null the domain supplies, not a
missing field. <b>BELOW_LIMIT</b> records that a procedure could not quantify below a
stated limit, and does not assert zero. <b>NO_CHANGE</b> is a positive measurement
claim and is never inferred from an empty event stream. It records an observed
change estimate, an uncertainty statement, a tolerance, and a pinned decision rule.
<b>ABSENT</b> records that the required observation was not obtained.</div>
</div>

<p>For a scalar quantity, one conservative decision rule could require
<code>|delta_hat| + k u_delta &le; epsilon</code>, with <code>k</code>, the meaning of
<code>u_delta</code>, the interval, and the procedure fixed before evaluation. That
rule is an example, not a universal definition. If the required uncertainty or
operating conditions are missing, the evaluator returns <code>UNKNOWN</code> rather
than <code>NO_CHANGE</code>. The full tuple above is a design proposal.
<span class="chip chip-proposed">PROPOSED</span></p>

<p>The public instrument profile tests the narrower label
<code>NO_CHANGE_DETECTED</code> bound to a declared resolution and observation
window; it does not implement the full uncertainty-aware tuple.
<span class="chip chip-tested">TESTED</span></p>

<p>Condition evaluation is a separate type, and keeping both is the point.</p>

<div class="formula">
<div class="eq">PASS | FAIL | UNKNOWN | STALE | ERROR | NOT_APPLICABLE</div>
<div class="where">Applicability is settled first. <b>NOT_APPLICABLE</b> leaves the
required set and every metric denominator. An absent record maps to <b>UNKNOWN</b>,
a known expired record to <b>STALE</b>, and an evaluator crash to <b>ERROR</b>. An
evaluator failure is not an observation of the world and cannot become one.</div>
</div>

<p>Clinical trial guidance keeps a related discipline. ICH E9(R1) ties each
objective to a defined estimand and separates intercurrent events from missing
data [12]. A participant's death can make a later value nonexistent rather than
missing. Administrative censoring limits follow-up. A sample may never have been
collected. I borrowed the record-keeping discipline. The protocol supplies no
estimand, no imputation rule, and no sensitivity analysis, and adopting the
vocabulary does not import the statistics.</p>

<p>An observation feeding a consequential predicate should identify its subject,
the quantity evaluated, the instrument and version, the procedure, the time or
interval, the operating conditions, the result type, the uncertainty, the freshness
rule, and the source artifact. Where sensing changes the subject, the sensing
action gets its own effect record. Reading a database consumes capacity. A medical
test may require an invasive sample. A probe alters a cache. Observation and
sensing effect answer different questions and are recorded separately.</p>

<h3>Forecasts are records about later events</h3>
<p>A forecast is evaluated only after its declared event has a qualified resolution.
For a binary event with outcome <code>y</code> and forecast <code>p</code>, the Brier
score is a proper scoring rule [39, 40]. If the forecaster's information implies a
true conditional event probability <code>q</code>, its expected value separates into
a reducible error term and irreducible event variance.</p>

<div class="formula">
<div class="eq">BS(p, y)       =  (p - y)^2
E_q[BS(p,Y)]   =  (p - q)^2 + q(1 - q)

F_mu(p)        =  E_q[BS(p,Y)] + mu p
arg min F_mu   =  clip( q - mu/2, 0, 1 )</div>
<div class="where">The last two lines are a diagnostic counterexample, not a
recommended objective. With <b>q = 1/2</b> and <b>mu = 1/2</b>, the uncoupled Brier
objective selects <b>p = 1/2</b>, while the coupled objective selects
<b>p = 1/4</b>. Rewarding the same optimizer for a lower reported risk changes the
report rather than the event probability.</div>
</div>

<p>The architectural consequence is to estimate, freeze, and later score the
forecast as one lane, then select an action under a separately declared policy. If
the action can change the event distribution, the record must identify that action
and either forecast <code>Pr(Y | I_t, action)</code> or preserve a clearly labeled
pre-action scenario. Otherwise the intervention can be mistaken for forecast error.
This is related to the feedback problem studied as performative prediction [42].
<span class="chip chip-proposed">PROPOSED</span></p>

<h3>Three meanings of calibration that must remain separate</h3>
<p>Forecast calibration is a property of a cohort of comparable, frozen forecasts:
among cases issued near probability <code>r</code>, the observed event frequency
should approach <code>r</code> under the declared grouping and resolution rules
[40, 41]. One resolved forecast has a score. It cannot establish calibration. Model
agreement is recurrence, not calibration, and an unresolved forecast is not part of
a resolved calibration denominator.</p>

<p>Metrology defines metrological traceability as a property of a measurement
result that relates it to a reference through a documented unbroken calibration
chain, with every link contributing uncertainty [8]. The same source warns that
traceability does not show the uncertainty is fit for a purpose and does not prove
the absence of mistakes.</p>

<p>A green indicator is not that. A high pass fraction is not that. Two programs
agreeing is not that. Conformity assessment adds a second distinction: a
measurement result is not an accept-or-reject decision, and the gap between them is
governed by stated requirements, uncertainty, acceptance limits, and the tolerated
risk of accepting a nonconforming item [9].</p>

<p>So this paper uses <b>protocol-calibrated predicate</b> for the project's strict
software condition. It is computable from declared inputs. It implies no SI
traceability, no calibration hierarchy, and no probability that a system is healthy.
The bridge to metrology is procedural. The protocol can carry measurement identity,
uncertainty, conditions, and decision rules without collapsing them. It does not
compute an uncertainty budget, qualify a laboratory, or establish forecast
calibration. <span class="chip chip-proposed">PROPOSED</span></p>
"""

REPLAY = r"""
<h2><span class="num">6</span>Cross-language replay parity</h2>

<p>The National Academies separates computational reproducibility, replication, and
generalization [10]. Reproducibility asks whether the same data, code, and
conditions give consistent results. Replication uses newly obtained data. The
reducer evidence here is reproducibility, and only that.</p>

<div class="formula">
<div class="eq">C( R_js(P, L) )  =  C( R_py(P, L) )

  both roots  =  22852b5a3025d4ed7ee1d26cc4efcd51ae2e3e02ba2a20332c2a09827d6462ca</div>
<div class="where"><b>C</b> serializes nulls, booleans, finite numbers, and strings,
preserves array order, sorts object keys recursively, and emits no insignificant
whitespace. This is not RFC 8785 canonicalization and makes no claim about Unicode
keys outside the pinned corpus, whose keys are ASCII. <span class="chip chip-tested">TESTED</span></div>
</div>

<p>The JavaScript and Python reducers are ports derived from the same specification
and fixture corpus. Their agreement can catch language-specific, transcription, and
runtime defects. It is not clean-room independence and it is weaker than replication,
because both ports can share a specification error, the same fixtures, and the same
assumptions. It says nothing about whether a recorded event was true.</p>

<p>One result strengthens it slightly. Continuous integration pins Node 22.17.1 and
Python 3.12.10. I reran both reducers on Node 24.18.0 and Python 3.14.6, two
release lines later, and got the identical projection root with all checks holding.
That is evidence the parity is not an artifact of one pinned runtime.
<span class="chip chip-tested">TESTED</span></p>

<table>
<caption><b>Table 3.</b> The validation ladder. Current artifacts reach level three
for selected finite cases. Levels four through six are open.</caption>
<thead><tr><th class="num" style="width:6%">#</th><th style="width:46%">Level</th><th>Status here</th></tr></thead>
<tbody>
<tr><td class="num">1</td><td>Records satisfy a declared structural schema</td><td><span class="chip chip-tested">TESTED</span></td></tr>
<tr><td class="num">2</td><td>One implementation repeats its own result</td><td><span class="chip chip-tested">TESTED</span></td></tr>
<tr><td class="num">3</td><td>Cross-language ports agree on pinned inputs</td><td><span class="chip chip-tested">TESTED</span></td></tr>
<tr><td class="num">4</td><td>Another team reproduces from a minimized packet</td><td><span class="chip chip-open">OPEN</span></td></tr>
<tr><td class="num">5</td><td>A new study obtains fresh evidence for the question</td><td><span class="chip chip-open">OPEN</span></td></tr>
<tr><td class="num">6</td><td>The result stays informative in another system</td><td><span class="chip chip-open">OPEN</span></td></tr>
</tbody></table>

<h3>Ordering is not causation</h3>
<p>Sequence numbers, previous digests, and parent references show that named bytes
were linked and that one computation consumed another record. Lamport's
happened-before relation supports partial order without treating wall-clock time as
a complete order [2]. That supports replay, conflict detection, and audit.</p>

<p>It does not establish a causal effect. If a change ships and the error rate later
falls, the history shows the deployment preceded the measurement. The fall could be
a traffic shift, a cache change, a provider action, a changed measurement
procedure, or something else entirely. The same trace fits several causes. Causal
inference starts from a defined effect and the conditions under which it is
identified [13], and a trustworthy event history supplies none of them.</p>

<h3>The integrity ladder</h3>
<p>Six claims usually get compressed into the single word verified. They are
separate, and no lower step establishes a higher one.</p>

<ol>
<li>A hash link can expose a byte change relative to a trusted commitment that covers the linked event.</li>
<li>A signature shows a key signed declared bytes.</li>
<li>An authority policy decides whether that key and scope are acceptable.</li>
<li>A measurement profile decides whether an observation fits the predicate.</li>
<li>An acceptance record advances governed state.</li>
<li>A later outcome record describes consequence.</li>
</ol>

<p>A privileged custodian can replace an entire unanchored history and recompute
every hash. A chain therefore supports consistency checks against a trusted anchor;
it does not make storage immutable or prove that additions were the only changes.
Resisting replacement needs external checkpoints, signatures, access control, or
independent witnesses. The repository's additions-only check states this ceiling in
its output rather than implying otherwise: it reports that Git branch protection and
an external witness are required to resist history replacement.
<span class="chip chip-tested">TESTED</span></p>

<h3>The chain construction</h3>
<p>A portable chain profile needs an unambiguous encoding and a domain separator, so
that a digest computed for one purpose is not accepted in another domain. The
construction below is proposed. The public instrument packet instead uses a
fixture-scoped digest chain and does not implement this full portable profile.</p>

<div class="formula">
<div class="eq">b(k)  =  Canon( event(k) without event_hash )
h(k)  =  H( D || len(b(k)) || b(k) || h(k-1) )

D  =  "STP_EVENTCHAIN_SHA256_V1.2_JAKETOPENSOURCE_DELTAATLAS_2026"</div>
<div class="where"><b>D</b> is this protocol's domain separation tag. Its value is
arbitrary by construction, in the sense that any distinct constant separates domains
equally well, and it is fixed here so that two implementations agree. The profile
must also pin the length encoding, duplicate-key handling, number and Unicode
rendering, media type, schema version, and the initial value <b>h(-1)</b>. The
current implementation uses local canonicalizers and does not claim RFC 8785
conformance. <span class="chip chip-proposed">PROPOSED</span></div>
</div>

<h3>Claim-relative evidence surfaces, and the surface this work has not tested</h3>

<p>Every automated check reported in section 9 is software checking software. That
bounds what those checks can establish. Independence is not a global property of a
tool or a count of verifiers. It is relative to a claim and a candidate failure
mode. A shared parser weakens separation for parser failures; a shared specification
weakens separation for specification failures; a shared operator weakens separation
for provenance and execution failures. Those dependencies do not make every
observation equivalent for every question. They identify the failure modes that can
corrupt the observations together.</p>

<table>
<caption><b>Table 4.</b> Claim-relative evidence surfaces. Shared dependencies reduce
separation for the named failure modes; no row is a universal rank.</caption>
<thead><tr><th style="width:22%">Evidence surface</th><th style="width:29%">Claim it can test</th>
<th style="width:31%">Shared dependency that limits it</th><th>Status here</th></tr></thead>
<tbody>
<tr><td>Artifact-internal structure</td><td>One artifact satisfies its declared shape and consistency rules</td>
    <td>A coherent false record or a faulty rule can pass</td><td><span class="chip chip-tested">TESTED</span></td></tr>
<tr><td>Cross-implementation replay</td><td>Separate implementations produce the same projection from the same bytes</td>
    <td>A shared specification, fixture, or source record can be wrong in common</td><td><span class="chip chip-tested">TESTED</span></td></tr>
<tr><td>Physical observation</td><td>A declared physical quantity covaries with a declared execution condition</td>
    <td>Instrument, driver, clock, host, custody, calibration, and inference model</td><td><span class="chip chip-open">OPEN</span></td></tr>
</tbody></table>

<p>The cross-language replay result supports agreement between two execution paths
and can expose language-specific, transcription, or runtime defects. It cannot
detect a specification or fixture error reproduced by both paths. Adding another
port changes the evidence only if it removes a dependency relevant to the failure
mode under examination.</p>

<p>Power draw, timing, and electromagnetic emission are established side channels,
studied since differential power analysis [36]. A monitor on a machine's power rail
can add separation for some claims about physical execution because it does not
depend on the same process-table report. It does not thereby establish that the
software result was correct, authorized, or caused by the reported operation.</p>

<p>I built a bounded loop between an agent harness and an Nvidia GPU that sampled
power draw during agent runs. <b>No result from it is part of this paper's
evidence.</b> Several readings shared a sensor, driver, clock, host, and operator.
For failure modes at or upstream of that measurement chain, they are repeated
observations with common dependencies, not independent confirmation. They may still
describe variation across runs, but that is a different claim.</p>

<p>A physical trace is not unforgeable, and the countermeasure literature on masking,
hiding, and noise injection exists precisely because traces can be shaped. A sensor
reading is not self-authenticating, since custody, calibration, and the path from
probe to record are attackable. A correlation between load and an assertion about
behavior is not a mechanism. Supporting a narrow physical predicate would require a
declared measurand, calibration reference, operating limits, uncertainty budget,
known sensing footprint, and a pre-registered discrimination task with false-accept
and false-reject rates. Those conditions have not been met here.
<span class="chip chip-open">OPEN</span></p>

<h3>Additions-only is a protocol rule, not a storage guarantee</h3>
<p>The rule governs how accepted protocol events are handled: a correction adds a
new record and does not edit the record it corrects. A hash chain can expose
divergence from an anchored prefix, but it cannot prevent a privileged rewrite of an
unanchored history. The rule also does not authorize indefinite retention of raw
evidence or personal data. Data minimization, storage limitation, correction, and
erasure all conflict with a naive permanent log [14]. Three stores keep those
obligations separable.</p>

<figure>
  {FIG3}
  <figcaption><b>Figure 3.</b> An erasure record can persist in the event history
  after the restricted object is destroyed. Hashing a personal record does not
  anonymize it, and a deletion receipt does not establish legal compliance.</figcaption>
</figure>
"""

EVIDENCE = r"""
<h2><span class="num">7</span>Evidence state, reported as a vector</h2>

<p>For one subject, one policy generation, and one evaluation cut, let <code>J</code>
be the finite nonempty set of required applicable checks. Every check maps exactly
once into pass, fail, unknown, stale, or evaluator error. Not-applicable checks are
excluded from <code>J</code> and from every denominator.</p>

<div class="formula">
<div class="eq">N_app  =  P + F + U + S + E          applicable
N_dec  =  P + F                      decisive

C  =  N_dec / N_app                  decisive evidence coverage
Q  =  P / N_dec                      decisive conformance
R  =  (P + F + U + E) / N_app        non-stale status fraction</div>
<div class="where">A zero denominator returns <b>UNDEFINED</b>, never zero. Policy
must map raw observations such as <code>ABSENT</code> and <code>CENSORED</code> into
the condition partition before <b>C</b> and <b>Q</b> are computed.</div>
</div>

<p>Pass and fail contribute equally to <b>C</b>. One failed check out of one
applicable check gives <code>C = 1</code> and <code>Q = 0</code>, which is complete
decisive coverage of a failed result. If that check is policy-blocking, the
interface shows red. The coverage arithmetic alone does not, and should not.</p>

<p><b>R</b> reports only the share of applicable conditions not labeled stale. An
unknown condition counts as non-stale while staying non-decisive, so <b>R</b> is not
a measure of fresh evidence about the world. A stronger receipt-coverage measure
would need deterministic receipt selection bound to subject, check, generation, and
evaluation cut, with ties on sequence returning a typed conflict rather than a
choice. The current schema does not carry those bindings, so I make no fixture
claim for it. <span class="chip chip-proposed">PROPOSED</span></p>

<p><b>C</b> is deterministic and verdict-symmetric. <b>Q</b> is deliberately
verdict-sensitive. The system as a whole is not policy-neutral, because policy
chooses the applicable checks, the thresholds, the freshness windows, and the
evidence requirements. For that reason <b>C</b> is never called a probability of
truth, correctness, or safety.</p>

<h3>Probability does not select policy</h3>
<p>The gate, forecast, and action policy answer different questions. The gate asks
whether an action is admissible. The forecast describes uncertainty over declared
events. The policy decides how to compare safety, heat, latency, opportunity, and
other consequence dimensions. Those dimensions remain a vector unless an
authorized policy supplies a scalarization or another selection rule.</p>

<div class="formula">
<div class="eq">J_j(a | x, B_(x,a))  =  sup        sum       q(e) L_j(a, e; x)
                             q in B_(x,a)  e in E_x

a dominates b  iff  J_j(a) &le; J_j(b) for every j,
                  and J_j(a) &lt; J_j(b) for at least one j</div>
<div class="where"><b>x</b> is the recorded decision context &nbsp;&middot;&nbsp;
<b>E_x</b> is the declared event set in that context &nbsp;&middot;&nbsp;
<b>B_(x,a)</b> is the declared set of admissible event distributions for context x
and action a; when action cannot affect the distribution, <b>B_(x,a) = B_x</b>
&nbsp;&middot;&nbsp; <b>L_j</b> is the loss in consequence dimension j &nbsp;&middot;&nbsp; a
Pareto-minimal set can contain several incomparable actions. Choosing one by
weighted sum introduces policy through the weights; it does not reveal a uniquely
correct action [46, 48].</div>
</div>

<p>An infinite representation space does not imply infinitely many behavioral
answers. Many encodings can implement the same policy or forecast function. A
unique optimizer may also exist on an infinite domain. Where several admissible
actions remain incomparable and no authorized preference rule exists, the honest
output is the frontier and an unresolved selection, not a hidden default.
<span class="chip chip-proposed">PROPOSED</span></p>

<h3>A proposed drift vector</h3>
<p>The following design records drift as eight components whose units remain
separate. No committed reducer computes the complete vector, so the table is a
specification target rather than a reported implementation result.
<span class="chip chip-proposed">PROPOSED</span></p>

<table>
<caption><b>Table 5.</b> Proposed drift components. Missing evidence is not zero drift.</caption>
<thead><tr><th style="width:20%">Component</th><th style="width:44%">Definition</th><th>Range</th></tr></thead>
<tbody>
<tr><td>D_sem</td><td>unresolved or contested required semantics, over required semantics</td><td>0 to 1</td></tr>
<tr><td>D_replay</td><td>count of distinct valid reducer projections, minus one</td><td>integer &ge; 0</td></tr>
<tr><td>D_sched</td><td>distinct projection and effect-trace classes over permitted schedules, minus one</td><td>integer &ge; 0</td></tr>
<tr><td>D_inv</td><td>accepted prefixes that violate an invariant</td><td>count</td></tr>
<tr><td>D_effect</td><td>unknown effects, duplicate risks, unresolved observation conflicts</td><td>count</td></tr>
<tr><td>D_capacity</td><td>per-lane overflow, retaining each lane's unit</td><td>vector</td></tr>
<tr><td>D_fresh</td><td>required stale receipts, over required applicable receipts</td><td>0 to 1</td></tr>
<tr><td>D_policy</td><td>unknown or mismatched policy-generation bindings</td><td>count</td></tr>
</tbody></table>

<p class="tnote">D_replay and D_sched are defined only after completeness checks. A
missing or invalid required output makes the component UNDEFINED and the aggregate
UNKNOWN. Invalid outputs are never discarded to reach a cleaner number. Capacity is
never summed across incompatible units, because observation, settlement, and
recovery lanes measure different things.</p>

<p><code>DRIFT_DETECTED</code> requires a decisive component that the pinned policy
marks blocking. <code>DRIFT_NOT_DETECTED</code> means no declared test detected
drift. It does not mean drift is absent, and the two readings are not
interchangeable. <span class="chip chip-proposed">PROPOSED</span></p>

<h3>Six signals</h3>
<figure>
  {FIG4}
  <figcaption><b>Figure 4.</b> Proposed six-condition surface. The conditions stay
  separate so that a strong
  dimension cannot conceal a failing one. Every color carries a text label and a
  reason code.</figcaption>
</figure>

<p>The order is normative, not cosmetic. Conditions are reported as protocol
calibration, consequence, evidence, integrity, privacy, activity, and a conforming
surface renders them in that sequence so that two deployments can be read against
each other without remapping. Any total order would serve equally well. This one is
fixed so that the choice is not left to each renderer.
<span class="chip chip-proposed">PROPOSED</span></p>

<p>The display labels are shorthand for directional policy predicates. A conforming
record names the predicate so that <code>PASS</code> always has a stable meaning:</p>

<ul>
<li><code>PROTOCOL_CHECKS_SATISFIED</code>: all required applicable checks pass and
none is unresolved; an empty required set is <code>UNKNOWN / INVALID_POLICY</code>.</li>
<li><code>NO_BLOCKING_CONSEQUENCE</code>: complete required consequence checks find
no active blocking consequence; an active one is <code>FAIL</code>, and incomplete
checks are <code>UNKNOWN</code>.</li>
<li><code>EVIDENCE_SUFFICIENT</code>: a pinned policy maps coverage, conformance, and
receipt requirements to a condition result. A high value of <b>C</b> does not pass
this predicate by itself.</li>
<li><code>REQUIRED_COMMITMENTS_MATCH</code>: every required named artifact matches
its trusted commitment; a missing commitment is <code>UNKNOWN</code>, not
<code>PASS</code>.</li>
<li><code>DISCLOSURE_BOUNDARY_HELD</code>: every required observed disclosure path
stays within the declared boundary; an unobserved required path remains
<code>UNKNOWN</code>.</li>
<li><code>ACTIVITY_EXPECTATION_MET</code>: activity falls within the policy's stated
window and expectation. More activity is not inherently better.</li>
</ul>

<p>Each predicate returns <code>PASS</code>, <code>FAIL</code>, <code>UNKNOWN</code>,
<code>STALE</code>, <code>ERROR</code>, or <code>NOT_APPLICABLE</code> under a pinned
policy. The public case study renders partial lamps, but it does not implement this
general six-predicate decision contract. <span class="chip chip-proposed">PROPOSED</span></p>

<p>On the consequence signal, red means
<code>NO_BLOCKING_CONSEQUENCE = FAIL</code>: a named blocking consequence is active
under the pinned policy. It can request acknowledgement before another scoped action
begins. Acknowledgement does not make the condition safe, and some red conditions
are non-waivable and require refusal.
The public educational interface does not claim to control a host chat or an
external tool. Without a durable, enforceable gate the indicator is informational,
and I say so rather than implying enforcement.</p>

<p>The record separates <code>NOTIFIED</code>, <code>PRESENTED</code>,
<code>ACKNOWLEDGED</code>, <code>AUTHORIZED</code>, <code>OVERRIDDEN</code>,
<code>INTERVENED</code>, and <code>RESOLVED</code>. Understanding is never inferred
from a click. Intervention does not prove an adverse effect was prevented.
Resolution requires its own observation.</p>
"""
