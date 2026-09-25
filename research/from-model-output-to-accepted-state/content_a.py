"""Paper body, part A: front matter through the lifecycle."""

FRONT = r"""
<div class="title-block">
  <div class="eyebrow">Working paper &middot; owner-review draft</div>
  <h1 class="title">From Model Output to Accepted State</h1>
  <div class="subtitle">A typed state boundary for AI-assisted operations</div>
  <div class="byline">
    <strong>Jake Tiller</strong> &middot; independent operator and researcher<br>
    <span class="meta">15 August 2026 &middot; public case-study evidence pinned to commit
    <span class="digest">275d0b3e7474</span> &middot; local owner-review packets receipted separately
    &middot; CC BY 4.0</span>
  </div>
</div>

<div class="abstract">
<h4>Abstract</h4>
<p>A language model produces plausible proposals. A proposal is not an authorization,
a completed action, an observation, or an accepted record of state. I built a
reference implementation, contracts, reducers, and test harnesses that keep those
records separate within the evaluated boundary. I used them on a public software
project and found real defects, including defects in the system itself.</p>

<p>This paper proposes the State Transition Protocol as a typed boundary around a
probabilistic proposer. A conceptual ten-stage lifecycle separates proposal from
authority, execution, observation, acceptance, and correction. The broader
observation algebra and six-condition reporting surface are also design proposals.
<span class="chip chip-proposed" data-claim="001">PROPOSED</span></p>

<p>The public packet implements a narrower seven-event instrument profile over
synthetic fixtures; it is not a complete implementation of that lifecycle. Within
the tested slice, deterministic reducers rebuild a finite projection from pinned
inputs. <span class="chip chip-tested" data-claim="002">TESTED</span></p>

<p>Three additional local packets test a finite query representation,
transition-stable refinement, and recovery of frozen answer fields from one compact
prompt. That prompt declared separate gate, forecast, and pending-resolution fields;
all three responses recovered the frozen finite outputs. No real forecast was issued
or resolved. These
local results extend the analysis but are not part of the pinned public commit.
<span class="chip chip-tested" data-claim="003">TESTED</span></p>

<p>The evidence is finite and I state its limits precisely. Separate JavaScript and
Python ports derived from the same specification and fixture corpus produce the same
projection root over the pinned inputs, and did so on runtime versions two releases
apart from the pinned continuous-integration environment. This is cross-language
replay parity, not independent reproduction. Thirty-four runner-reported numbered
holds across twelve suites are a diagnostic inventory, not a coverage measure. A
data contract found that six public views of one 439-term source had drifted apart,
and that 258 shared terms disagreed on review status. A production observation found
100 of 102 paths matching and left two unresolved rather than rounding them off.
<span class="chip chip-tested" data-claim="004">TESTED</span></p>

<p>The most useful results are the ones that went against me. In a refusal experiment,
an unstructured larger-model control recorded zero unsupported claims, matching the
excluded P4 arm and below the rates in the eligible P1-P3 structured arms. That
comparison concerns unsupported-claim counts; it does not establish that either
structure or model choice causally improved accuracy. The auditability contribution
lies in making the artifacts, assumptions, and limits behind the comparison
inspectable. An experiment described by its repository as preregistered denied its
own doctrine on a single counterexample. One deployment receipt in this repository
contradicts itself across two fields, and the schema gate passes it. Those are
reported here at full strength.</p>
</div>
"""

SUMMARY = r"""
<h2><span class="num">1</span>The problem, in plain terms</h2>

<p class="lead">An AI system can report that something happened when several
different things may be true. It may have suggested an action. A tool may have
accepted the request. The action may have started and not finished. A sensor may
have returned an unclear reading. A person may have looked at the record without
accepting it. The world may have moved again before anyone asked.</p>

<p>I hit this while building Delta Atlas, a public set of tools for finding gaps
and unstated assumptions in AI plans. The project grew into static pages, JSON
data, harnesses, and hosted releases. The same confusion kept appearing at every
level. A model answered confidently from a stale copy of the glossary. A test
passed while checking only the records that happened to be loaded. A merge
completed without showing that the host served the merged bytes. A deployment
succeeded without showing that every route had converged. A green panel reported
on synthetic evidence.</p>

<p>None of that needed a new theory of attention. It needed a boundary. A
transformer maps context to candidate continuations. Once a candidate can call a
tool, move money, change infrastructure, or become the memory the next session
reads, the surrounding system has to answer questions the architecture never
addresses.</p>

<blockquote><p>Can a system use a stochastic model as a proposer while rebuilding
its governed state through explicit, typed, replayable transitions, without
mistaking a deterministic procedure for truth?</p></blockquote>

<p>The supported answer is narrow and useful. A reference implementation can force
explicit promotion steps and produce identical accepted-state projections from
pinned policy, pinned event bytes, and a pinned reducer version. It can hold
unresolved evidence open instead of rounding it to pass. It can keep
counterexamples and corrections in the record. It cannot show that a source was
honest, that an authority was lawful, that an observation was complete, or that
the chosen policy was wise.</p>

<p>The public evidence is narrower than the conceptual protocol. It establishes
finite behavior for an instrumented seven-event profile and related harnesses. It
does not establish end-to-end conformance with the proposed ten-stage lifecycle.
<span class="chip chip-tested" data-claim="005">TESTED</span></p>

<h3>Six terms used throughout</h3>
<p>An <b>output</b> is anything a component emits before validation or acceptance.
An <b>outcome</b> is a later qualified record of consequence. A <b>receipt</b> is a typed record of one check, action, observation, decision,
or correction. A <b>reducer</b> is a deterministic function that rebuilds accepted
state from policy and event history. A <b>projection</b> is that rebuilt view, not
the world. An <b>instrument</b> is whatever acts on or observes a system, with its
own limits. An unaccepted output remains in candidate or receipt space. It is not
silently promoted to governed state or relabeled as an outcome.</p>
"""

CLAIMS = r"""
<h2><span class="num">2</span>How to read the claims</h2>

<p>Confidence in prose is not evidence. Result-bearing empirical and implementation
claims use one of four markers at paragraph, table-row, or block level. Unmarked
prose explains terminology, motivation, or limits and should not be read as an
additional empirical result. The marker sets what you are entitled to conclude.</p>

<table>
<caption><b>Table 1.</b> Claim markers. A marker states the strongest reading the
evidence supports, not the author's confidence.</caption>
<thead><tr><th style="width:16%">Marker</th><th style="width:42%">What it means</th><th>What it never means</th></tr></thead>
<tbody>
<tr><td><span class="chip chip-tested">TESTED</span></td>
    <td>Exact behavior over a named finite corpus, reproducible by a stated command.</td>
    <td>That the behavior generalizes past that corpus.</td></tr>
<tr><td><span class="chip chip-observed">OBSERVED</span></td>
    <td>A bounded inspection of a named surface at a recorded time.</td>
    <td>That the surface still looks that way, or that other surfaces match.</td></tr>
<tr><td><span class="chip chip-proposed">PROPOSED</span></td>
    <td>Specified or reasoned beyond the tested artifact boundary. It may have a
    partial fixture, but the marked claim itself is not established.</td>
    <td>Implemented behavior. Do not cite it as a result.</td></tr>
<tr><td><span class="chip chip-open">OPEN</span></td>
    <td>I do not know, and I say where the evidence stops.</td>
    <td>That the question is unimportant.</td></tr>
</tbody></table>

<p>Implemented, tested, merged, deployed, observed, and accepted are six verbs, not
one. A result can hold several at once. None of them implies the next. Section 11
states the full claim boundary once, so the rest of the paper does not repeat it
paragraph by paragraph.</p>

<h3>Digests and locators</h3>
<p>Every result-bearing project artifact referenced here is pinned by SHA-256 over its exact bytes. Digests
appear in text as the first twelve hexadecimal characters, which is enough to
identify a file and short enough to read. Appendix C lists full values, exact
locators, and the applicable verification boundary. Public case-study claims are bound to commit
<span class="digest">275d0b3e7474</span> of the <code>Resilience-Ledger</code>
repository.</p>

<div class="callout warn">
<h4>Artifact identity is part of the result</h4>
<p>The Calibration Ledger document I hold does not match the Ledger digest printed
in State Transition Protocol v1.1, and I could not retrieve the bytes that digest
was computed over. I do not know whether the document is a later revision, a
sibling artifact, or an unrelated export. I have not treated the two as equivalent
anywhere in this paper. <span class="chip chip-open" data-claim="006">OPEN</span></p>
<p>That mismatch is evidence, not clutter. An identity check stopped a convenient
substitution that prose alone would have waved through.</p>
</div>
"""

BOUNDARY = r"""
<h2><span class="num">3</span>The boundary</h2>

<p>Write <code>W(k)</code> for an external world state that is partly hidden,
<code>O</code> for the qualified observations recorded so far, and <code>A(k)</code>
for the accepted projection. A model generates a candidate change stochastically.
The probability it assigns gives the candidate no standing.</p>

<div class="formula">
<div class="eq">delta(k)  ~  pi( A(k), O(&le;k), H(k) )          candidate generation
A(k)      =  R( P(g), L(&le;k) )                 accepted projection</div>
<div class="where"><b>pi</b> the candidate-generating distribution, not an
authorization policy &nbsp;&middot;&nbsp;
<b>P(g)</b> pinned policy bytes at generation g &nbsp;&middot;&nbsp;
<b>L(&le;k)</b> the valid event prefix through sequence k &nbsp;&middot;&nbsp;
<b>R</b> a pinned reducer version &nbsp;&middot;&nbsp; <b>H(k)</b> whatever context the
model had, which the protocol does not model</div>
</div>

<p>The determinism claim is narrower than the word usually suggests. It starts at
identified input bytes and a policy generation, and it ends at a projected record.
It does not cover the model that produced the candidate. It does not cover
undisclosed external state, physical effects, the people involved, the network in
between, or anything that happens afterward.</p>

<h3>Two lanes, one acceptance boundary</h3>
<p>In plain terms, the deterministic lane decides whether the current record permits
an action. A parallel forecast lane may record uncertainty about a later event. The
two records can inform one another, but neither can silently become the other. A
high forecast probability cannot promote an unresolved gate to pass.</p>

<div class="formula">
<div class="eq">g_t  =  G( P(g), L(&le;t) )  in  PASS | UNRESOLVED | FAIL
execute_t  =  1  only if  g_t = PASS

f_t  =  ( forecast_id, claim, event, p, I_t, horizon, resolution_rule,
          scoring_rule_id, model_id, policy_id, scenario_id, digest )
a_s  =  ( action_id, forecast_id, policy_id, selected_at )
r_u  =  ( resolution_id, forecast_id, event, action_id_or_none, outcome,
          resolution_time, witness, qualification, digest )
s_v  =  ( score_id, forecast_id, resolution_id, scoring_rule_id,
          score, computed_at, digest )
c_w  =  ( calibration_id, cohort_rule_id, eligible_score_ids,
          statistic, computed_at, digest )</div>
<div class="where"><b>g_t</b> is the exact gate result at time t &nbsp;&middot;&nbsp;
<b>f_t</b> is a registered forecast frozen before the event resolves &nbsp;&middot;&nbsp;
<b>a_s</b> binds any selected action to the frozen forecast and policy &nbsp;&middot;&nbsp;
<b>r_u</b> is the later qualified resolution, where u is not earlier than t
&nbsp;&middot;&nbsp;
<b>s_v</b> records the score computed from the frozen forecast and linked resolution
&nbsp;&middot;&nbsp; <b>c_w</b> records a declared cohort statistic over identified eligible scores
&nbsp;&middot;&nbsp;
<b>I_t</b> identifies the information available when the forecast was issued
&nbsp;&middot;&nbsp; <b>p</b> is a declared probability, not execution authority. The internal
belief of a person or model is not directly observable. The auditable object is the
registered forecast and its later resolution.</div>
</div>

<p>The proposed record order is
<code>FREEZE_FORECAST</code> &rarr; <code>CHOOSE_ACTION</code> &rarr;
<code>APPEND_RESOLUTION</code> &rarr; <code>SCORE_FORECAST</code> &rarr;
<code>UPDATE_CALIBRATION</code>. Before a qualified resolution is appended, the
forecast remains pending. Pending is not zero, false, success, or failure. A reducer
for these proposed records can verify the order, identities, score, and replay without claiming that
the forecast was true when issued or that the selected action was wise.
<span class="chip chip-proposed" data-claim="007">PROPOSED</span></p>

<p>BP-001 used <code>HOLD</code> as a frozen gate value and asked for its execution
output, <code>BLOCK</code>. This paper maps an <code>UNRESOLVED</code> condition to
<code>HOLD</code> as a post-test vocabulary crosswalk. BP-001 established
<code>HOLD</code> to <code>BLOCK</code> only; it did not test the crosswalk.
<span class="chip chip-proposed" data-claim="008">PROPOSED</span></p>

<figure>
  {FIG1}
  <figcaption><b>Figure 1.</b> The proposer sits inside a wider boundary. Only the
  tinted span is deterministic. The world is reached through a declared instrument
  and is never read directly.</figcaption>
</figure>

<h3>Planes that cannot promote themselves</h3>

<table>
<caption><b>Table 2.</b> Seven planes. Each answers a different question, and none
of them establishes the next one on its own.</caption>
<thead><tr><th style="width:20%">Plane</th><th style="width:40%">Question it answers</th><th>What it cannot settle alone</th></tr></thead>
<tbody>
<tr><td>External world</td><td>What is actually the case?</td><td>It may be hidden, and it moves.</td></tr>
<tr><td>Observation</td><td>What did a declared instrument report?</td><td>Whether the report was complete or correct.</td></tr>
<tr><td>Proposal</td><td>What change was suggested?</td><td>Anything. A suggestion carries no authority.</td></tr>
<tr><td>Authority</td><td>Who permitted which bounded next step?</td><td>Whether the step ran, or whether it was wise.</td></tr>
<tr><td>Execution</td><td>What was attempted, committed, or compensated?</td><td>Final world state. An acknowledgement is not an effect.</td></tr>
<tr><td>Accepted state</td><td>What does the named process now recognize?</td><td>That governed state matches the world.</td></tr>
<tr><td>Derived memory</td><td>What summary is available later?</td><td>Evidence. Surviving a restart proves storage, not truth.</td></tr>
</tbody></table>

<p>Caches, telemetry, routing models, and interface state are further planes and
stay derivative. A fresh telemetry value grants no authority. A cached summary does
not become a source by persisting. A predictive model does not become an
observation because its average accuracy was good.</p>

<h3>What the threat model covers</h3>
<p>Mistaken, stochastic, and adversarial proposals. Stale, missing, conflicting,
and correlated evidence. Scope growth. Partial and duplicate effects. Schema
change. Evaluator failure. Replay of an old authorization. Confidential material
reaching a public record. Permanent unknowns that starve availability.</p>

<p>It also covers ordinary operator error, which is the failure I hit most. A
system can be secure against an outsider and still fail because a person picked
the wrong scope, accepted a misleading threshold, read an acknowledgement as a
resolution, or trusted two witnesses that shared one source.</p>

<p>The trusted computing base is not one object. It is the policy, the schemas, the
reducers, the canonicalization rules, the authority registry, the keys, the clocks,
the instrument contracts, the evidence stores, and the release process. This
implementation does not provide an independently operated root of trust for all of
them. <span class="chip chip-open" data-claim="009">OPEN</span></p>
"""

LIFECYCLE = r"""
<h2><span class="num">4</span>A proposed ten-stage lifecycle</h2>

<p>The candidate lifecycle runs <code>PROPOSE</code>, <code>NORMALIZE</code>,
<code>CHECK</code>, <code>AUTHORIZE</code>, <code>PREPARE</code>,
<code>EXECUTE</code>, <code>OBSERVE</code>, <code>ACCEPT</code>,
<code>OUTCOME</code>, <code>CORRECT</code>. It is not a pipeline that succeeds.
Every stage can refuse, return unknown, and stop. A failed attempt stays in the
history without moving accepted state. This is the conceptual protocol, not the
event vocabulary of the current executable packet.
<span class="chip chip-proposed" data-claim="010">PROPOSED</span></p>

<div class="callout">
<h4>The executable slice is narrower</h4>
<p>The pinned public packet is a proposed Instrumented Transition and Survivability
Profile tested over synthetic fixtures. Its event vocabulary is
<code>PLAN</code> &rarr; <code>AUTHORIZE?</code> &rarr; <code>INVOKE</code> &rarr;
<code>COMMIT</code> &rarr; <code>SENSING_EFFECT?</code> &rarr;
<code>OBSERVE</code> &rarr; <code>SETTLE</code>. A question mark means the phase is
optional only when the pinned instrument profile permits omission. These seven
event types exercise a bounded instrument profile. They do not implement the
complete ten-stage lifecycle, and <code>SETTLE</code> is not silently renamed
<code>ACCEPT</code>. <span class="chip chip-tested" data-claim="011">TESTED</span></p>
</div>

<figure>
  {FIG2}
  <figcaption><b>Figure 2.</b> Proposed lifecycle. Only a valid acceptance record
  advances governed state. Refusal and unresolved are recorded at whichever stage
  produced them, and both are kept. A correction must pass through a new governed
  transition and cannot bypass acceptance.</figcaption>
</figure>

<p><b>Propose.</b> A person, model, or program describes a candidate change, naming
its subject, scope, requested operation, policy generation, and consequence class.
<b>Normalize.</b> The candidate becomes one supported schema, and the record keeps
whatever was rejected or lost. Normalization cannot invent a mapping between two
vocabularies that merely look alike. <b>Check.</b> Required predicates evaluate
structure, invariants, evidence, concurrency, budget, and consequence, each
returning a typed result and a stable reason.</p>

<p><b>Authorize.</b> An authority receipt binds an actor to an exact subject,
operation, scope, policy, time window, and replay namespace. A full pass returns
permission to prepare and nothing further. <b>Prepare.</b> The system builds a
bounded effect request. This is the last point where an unsafe action can be
stopped without needing to compensate. <b>Execute.</b> A tool attempts the effect,
and the record separates submission, acknowledgement, partial execution, commit,
failure, timeout, and unknown effect.</p>

<p><b>Observe.</b> A declared witness measures a postcondition, recording procedure,
result type, operating conditions, freshness, and known uncertainty. <b>Accept.</b>
A named authority advances the projection only when the required predicates and
receipts satisfy policy. Acceptance is never inferred from a tool's success code.
<b>Outcome.</b> A later observation records consequence, which can arrive long after
acceptance. <b>Correct.</b> A correction opens a new governed transition that names
the prior record and states the proposed replacement and reason. It never edits the
record it corrects. The replacement changes accepted state only after a new
acceptance record satisfies the current policy. <code>CORRECT</code> cannot bypass
<code>ACCEPT</code>. <span class="chip chip-proposed" data-claim="012">PROPOSED</span></p>

<h3>How required checks aggregate</h3>

<div class="formula">
<div class="eq">FAIL        if any required predicate is decisively false
UNRESOLVED  else if any required predicate is UNKNOWN, STALE, or ERROR
PASS        only when every required predicate passes</div>
<div class="where">The transition gate maps condition <b>FAIL</b> to <b>REFUSE</b>,
carries <b>UNRESOLVED</b> through unchanged, and otherwise returns <b>PASS</b>. An
empty required set returns <b>UNRESOLVED</b> with reason <code>INVALID_POLICY</code>,
never a vacuous pass. Policy may be stricter. Policy may not map an unresolved
required predicate to pass. <span class="chip chip-proposed" data-claim="013">PROPOSED</span></div>
</div>

<p>The public instrument and concurrency reducers test narrower, reason-specific
<code>PASS</code>, <code>FAIL</code>, and <code>UNKNOWN</code> outputs, including
local <code>NOT_REQUIRED</code> obligation positions. They do not expose this general
set aggregator, a mixed false-plus-unknown precedence fixture, or the empty-set
<code>INVALID_POLICY</code> rule. The general normalization above is therefore a
design target, not a reported test result.
<span class="chip chip-tested" data-claim="014">TESTED</span></p>

<p>The rule says nothing about completeness. A system can pass every declared check
while omitting the one that mattered. That is a limit of the predicate set, not of
the aggregation, and no aggregation rule can repair it.</p>

<h3>A short trace</h3>
<p>A configuration change is proposed. The schema check passes. The current
dependency version cannot be observed, so the compatibility check returns unknown.
A valid authority receipt permits preparation only. The tool accepts the request,
and the postcondition instrument returns a real domain null while settlement stays
unresolved.</p>

<p>The projection does not advance. The history keeps the proposal, the check
results, the preparation authority, the acknowledgement, the domain null, and the
unresolved settlement. Later a qualified observation identifies the version and
confirms the postcondition, and a new acceptance record advances the projection.
The earlier unknown stays in the history. It is not overwritten, because it was
true when it was recorded.</p>
"""
