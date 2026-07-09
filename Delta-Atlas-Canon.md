# Delta Atlas Canon

*A portable terminology spec. Version 1.8 · generated 2026-07-01 · content hash `0202d4a4d829`.*

This file exists to keep **drift under control**, not to freeze it. Some drift is essential: changing a definition on purpose, with a reason, is how the vocabulary gets tuned. What this guards against is the *uncontrolled* kind, where meaning shifts silently over a long session and no one decides it should, until answers start to contradict each other. Hand it to any model or agent at the start of a session and it will use the same terms, definitions, and honesty about what is verified. It is generated from an open dataset (`terms.enriched.json`), not written by hand, so anyone can regenerate it and check that it matches. Carry this, not a long history: it is small on purpose.

## How to use this with any model

> Load this file first. Use these exact terms and definitions. Flag any term you use that is not in this list. If an answer starts to contradict itself or drift from these definitions, stop and re-ground it against the relevant entry here. Cite the entry; do not re-explain the whole file. Keep the working context small.

## Two kinds of drift

**Controlled drift is allowed, and necessary.** Editing a definition deliberately, with a reason recorded, is tuning: it is how this vocabulary improves over time. **Uncontrolled drift is what this targets.** That is the silent kind, where meaning slides across a long session without anyone choosing it. The goal is to minimize the second while leaving full room for the first.

## Operating principles

The method underneath every tool, stated plainly:

1. Keep what is true, drop the noise. Hold one current understanding, not a pile of everything said.
2. Check before you trust. Validate a new claim against ground truth before accepting it.
3. Account for every step. Anything committed is logged and can be traced.
4. Carry less, not more. Coherence comes from reducing context wisely, not adding to it.
5. Say what is not verified. Mark candidates as candidates, and when you change a definition on purpose, record why.

## Coherence status legend

Every entry carries a status, shown as a traffic light:

- **Green (Verified)** — human-reviewed and well-sourced. Use with confidence.
- **Amber (Draft)** — AI-drafted candidate, plausible but not yet verified. Use, but check.
- **Red (Thin)** — placeholder or single weak source. Treat as provisional.

A high status means well-grounded, **not** automatically correct. Groundedness measures evidence and source independence, not truth.

## Cornerstone: State-Delta

The vocabulary rests on a grounding approach called **State-Delta**: the model proposes changes, but a fixed local rule-layer must verify each one against current reality before it takes effect. This is offered as **independent convergence** with the 2026 field consensus (Five Eyes *Careful Adoption of Agentic AI Services*, the Lean-Agent Protocol, and related work), not as a claim that the field validates it. Two items (elimination-earned confidence, metaphor as a transmission layer) are marked as candidate contributions pending review.

- **Context Reset After Commit** (Amber) — Flushing an agent's working memory after each committed change so the next task starts from verified current state, not accumulated reasoning. Drift cannot compound when memory resets against truth.
- **Deterministic Air-Gapping** (Amber) — The requirement that safety-critical checks run entirely on local hardware with no network dependency, so they still work when the connection fails. The lock works whether or not the security company's servers are online.
- **Dual-Pass Local Validation** (Amber) — Requiring every proposed change to clear two local checks before commit: does it fit the rules (ontology), and does it make sense in reality now (semantics). One check is not enough.
- **Dynamic Agent Layer** (Amber) — The flexible, creative reasoning zone of a system, run in a temporary read-only sandbox with no direct authority over real systems. It proposes; it does not commit.
- **Elimination-Earned Confidence** (Amber) — A proposed mechanism where a system earns the right to act in proportion to what it has ruled out, carried as an explicit margin, rather than from self-reported certainty. The right to commit scales with confidence and shrinks as consequence rises. Author's candidate contribution, pending review.
- **Firewall of Cognition** (Amber) — Keeping the reasoning model in a read-only context that never directly touches infrastructure, with actions run in disposable sandboxes. The boundary does the work, so the reasoning engine is never trusted with the controls.
- **Friction Principle** (Amber) — The design stance that a calibrated amount of resistance, validation that can refuse, is what gives a system traction under load. Too little and it drifts; too much and it consumes itself.
- **Impedance** (Amber) — Borrowed from electronics: how much a structure resists a signal passing through it. In governance, the deliberate friction a control layer adds so unverified change meets resistance and only a clean, in-tune signal (a grounded, coherent change) passes without distortion. Too little and drift flows straight through; too much and the system chokes: the tuning that keeps a structure's integrity under load.
- **Mandate Gate** (Amber) — A check that routes high-consequence actions to a human instead of letting the agent commit them. Autonomy is scoped by how much is at stake.
- **Metaphor as Transmission Layer** (Amber) — Treating a plain-language bridge image as a required layer of a control, not optional documentation, so engineers, operators, and affected people can all audit the same boundary. A control no outsider can read is one no outsider can challenge. Author's candidate contribution.
- **Monotonicity Gate** (Amber) — A validation pass enforcing signed, append-only time: history moves forward only, so committed records cannot be silently rewritten.
- **Purpose Gate** (Amber) — A check that re-verifies an agent is still pursuing its authorized intent during a task, not only at startup, since static permissions do not survive dynamic workflows.
- **Refusal Logic** (Amber) — The deterministic, non-AI hard stop that blocks a change when validation fails, independent of the model's reasoning. The model does not get a vote; the breaker trips on its own, and the failure is logged.
- **Representation Locality** (Amber) — The rule that components communicate only in compact state-deltas, never raw narrative or full histories, so contradictions cannot pile up in transit.
- **Semantic Drift** (Amber) — When a system's internal picture slowly stops matching reality because it keeps absorbing data without checking it against current truth. Distinct from model drift: the world may be unchanged while the representation rots.
- **Semantics Gate** (Amber) — The second validation pass: even if a change is technically allowed, does it cohere with current conditions and safety thresholds? Catches the move that is legal but catastrophic.
- **State** (Amber) — What a system currently treats as true about its environment: the single current model it acts on, not the pile of everything it has ever seen. The map the GPS is using now, not every map it has held.
- **State-Delta (the unit)** (Amber) — A small structured record of one change: what changed, where, and when, carrying only the minimum needed to update a single variable. Parts of the system talk in these instead of long histories. A receipt for one transaction, not the whole bank statement.
- **State-Delta Architecture** (Amber) — A way of building agentic systems where the AI proposes changes but a fixed, local rule-layer must verify each one against current reality before it can take effect. The model reasons; the structure decides what commits.
- **Structural Floor** (Amber) — The commitment that safety boundaries are enforced by fixed, non-AI components rather than by the model's own judgment. A fence at the cliff edge, not a sign asking you not to fall. Closely tied to the Harness.
- **Substrate Gate** (Amber) — A validation pass that checks a proposed change stays coupled to ground truth, real-world signal, rather than only being internally consistent.
- **Truth Ledger** (Amber) — An append-only local record of every change that passed validation; once written, entries cannot be edited or erased, so the audit trail is the system itself rather than a report bolted on later.
- **Unbounded Accumulation** (Amber) — The failure of piling up inputs without ever deciding what is still true, until contradictions make a clean decision impossible. The closet you never clean out.

## The canonical vocabulary

Core load-bearing terms, grouped by area. Format: **Term** (status) — what it does.

### Foundations
*What it is built from.*

- **Artificial Intelligence** (Green) — Software that performs tasks we associate with human intelligence: learning from data, spotting patterns, using language, or making decisions.
- **Context Window** (Green) — The fixed amount of text, measured in tokens, a model can consider at once. Input beyond it is dropped or must be retrieved.
- **Deep Learning** (Green) — The breakthrough that made image recognition, speech, and language models work well.
- **Depth** (Amber) — How many layers or reasoning steps a process runs through. Deeper models and chains capture more abstract structure but are harder to inspect and explain.
- **Embedding** (Green) — Turning data into vectors whose distances capture meaning.
- **Embeddings** (Green) — Data represented as numeric vectors whose distances reflect similarity in meaning, which enables search and comparison by meaning.
- **Fine-tuning** (Green) — Further training a pretrained model on focused data so it adapts to a specific task or domain.
- **Foundation Model** (Green) — A large model trained broadly on general data, then adapted to many tasks rather than trained from scratch for each one.
- **Friction Principle** (Amber) — The design stance that a calibrated amount of resistance, validation that can refuse, is what gives a system traction under load. Too little and it drifts; too much and it consumes itself.
- **Frontier AI** (Green) — The most capable, newest models at the leading edge of ability and risk, the focus of heightened governance.
- **Generative AI** (Green) — Names the capability that distinguishes today's tools from older predict-and-classify AI.
- **Inference** (Green) — Running a trained model to produce an output. The operating phase of AI, as opposed to training.
- **Large Language Model** (Green) — The core of chatbots and most agentic systems; NSA/CISA guidance treats agentic AI as primarily LLM-based.
- **Machine Learning** (Green) — A method where a system learns patterns from data instead of following explicit rules, then applies them to new inputs.
- **Model** (Green) — A trained system that maps inputs to outputs. The artifact you run, deploy, and govern once training is finished.
- **Multimodal AI** (Green) — Expands what agents can perceive and act on (reading a screenshot, describing a photo).
- **Neural Network** (Green) — The basic machinery deep learning runs on.
- **Parameter** (Green) — A single learned value inside a model.
- **Parameter / Weights** (Green) — The numbers a model adjusts during training to store what it has learned. Model size is often quoted as a parameter count.
- **Pre-training** (Green) — Training a model broadly before specializing it.
- **Pretraining** (Green) — Training a model broadly before specializing it.
- **Prompt** (Green) — The text input given to a model. It carries both the request and its context, so its wording strongly shapes the output.
- **Prompt Engineering** (Green) — The practice of designing prompts, examples, and context to get reliable outputs from a model without retraining it.
- **Reasoning Model** (Green) — Better at math, logic, and multi-step tasks; underpins more capable agents.
- **Reinforcement learning** (Green) — A model learns by trial and error, rewarded for actions that move it toward a goal.
- **State-Delta Architecture** (Amber) — A way of building agentic systems where the AI proposes changes but a fixed, local rule-layer must verify each one against current reality before it can take effect. The model reasons; the structure decides what commits.
- **Supervised** (Green) — Learning from labeled examples.
- **Token** (Green) — A chunk of text a model reads or writes.
- **Token / Tokenization** (Green) — Explains usage limits and pricing: most AI services bill and budget by tokens.
- **Tokenization** (Green) — Splitting text into tokens for a model.
- **Traditional AI** (Green) — Useful contrast: it explains why modern AI behaves less predictably, having learned patterns instead of being told rules.
- **Training** (Green) — Adjusting a model's weights from data.
- **Transformer** (Green) — The architecture that made LLMs possible. You rarely need the internals, but the word comes up constantly.
- **Unsupervised** (Green) — Finding structure in data without labels.
- **Weights** (Green) — The learned numbers that hold a model's knowledge.

### Data & Provenance
*What it is anchored to.*

- **Anonymization** (Green) — Removing identity so data cannot be traced to a person.
- **Attestation** (Green) — Verifiable, often cryptographic, evidence of a system's identity or state, used to establish trust between parties.
- **Chain of Custody** (Green) — The unbroken, traceable record of where data and decisions came from and how they changed, preserved end to end.
- **Context Engineering** (Green) — Designs what enters a model's context: retrieval, memory, and prompts assembled so the output stays grounded.
- **Data Lineage** (Green) — The detailed, technical form of provenance. Essential for auditing and debugging bad outputs.
- **Ground Truth** (Green) — The fixed reference everything is measured from. The Ledger's whole point: a system can be perfectly self-consistent and still wrong, so it needs an external ground truth, ultimately verified by a human in contact with reality.
- **Knowledge Graph** (Green) — Gives agents a reliable, queryable map of how things relate; a structured alternative or complement to RAG.
- **Monotonicity Gate** (Amber) — A validation pass enforcing signed, append-only time: history moves forward only, so committed records cannot be silently rewritten.
- **Polarity** (Amber) — The positive-versus-negative orientation of a text or signal, as measured in sentiment analysis. When data or outputs cluster at opposing extremes they are polarized, which can skew what a model learns or produces.
- **Provenance** (Green) — The recorded origin and history of data or a model, used to judge whether it can be trusted.
- **Pseudonymization** (Green) — Replacing identifiers with reversible tokens.
- **Retrieval** (Green) — Fetching relevant external documents to ground an answer.
- **Sensitive** (Green) — Data needing special protection, such as health or identity.
- **State** (Amber) — What a system currently treats as true about its environment: the single current model it acts on, not the pile of everything it has ever seen. The map the GPS is using now, not every map it has held.
- **State-Delta (the unit)** (Amber) — A small structured record of one change: what changed, where, and when, carrying only the minimum needed to update a single variable. Parts of the system talk in these instead of long histories. A receipt for one transaction, not the whole bank statement.
- **Synthetic Data** (Green) — Useful when real data is scarce or sensitive, but its quality and biases need their own scrutiny.
- **Truth Ledger** (Amber) — An append-only local record of every change that passed validation; once written, entries cannot be edited or erased, so the audit trail is the system itself rather than a report bolted on later.
- **Vector Database** (Green) — The memory store behind most RAG and agent-memory systems.
- **Watermarking** (Green) — Helps trace provenance of outputs and flag synthetic media. Imperfect, but raises the cost of undetected fakery.

### Agentic Mechanics
*How it acts.*

- **Agent** (Green) — An AI system that pursues a goal over multiple steps, choosing actions and calling tools, rather than answering a single prompt.
- **Agentic** (Green) — Describes a system that acts on goals with autonomy rather than only answering, often working through agents and subagents that each handle part of the task.
- **Agentic AI** (Green) — AI that pursues goals over multiple steps with limited human oversight, often by coordinating one or more agents and subagents. Agency is a spectrum, from a single scoped agent to many acting together, not an on/off switch.
- **Automation** (Green) — Running a task without human effort each time.
- **Autonomous** (Green) — Acting without step-by-step human direction.
- **Autonomy** (Green) — The dial that most determines risk. More autonomy = more speed and scale, but also more ways to go wrong before anyone notices.
- **Chain-of-Thought** (Green) — Prompting a model to reason step by step before answering.
- **Collaboration** (Green) — Agents or people working together toward a goal.
- **Context** (Green) — The surrounding information a model uses to respond.
- **Context Reset After Commit** (Amber) — Flushing an agent's working memory after each committed change so the next task starts from verified current state, not accumulated reasoning. Drift cannot compound when memory resets against truth.
- **Decision** (Green) — A choice a model or agent commits to.
- **Decomposition** (Green) — Breaking a task into smaller subtasks.
- **Delegation** (Green) — Handing a task to another agent or tool.
- **Deployment** (Green) — Putting a trained model into production use.
- **Dynamic Agent Layer** (Amber) — The flexible, creative reasoning zone of a system, run in a temporary read-only sandbox with no direct authority over real systems. It proposes; it does not commit.
- **Excessive Agency** (Green) — Names a top agentic risk category and points straight at the fix: scope it down, limit its tools, add approval.
- **Execution** (Green) — Carrying out a planned action.
- **Few-Shot** (Green) — Giving a few examples in the prompt to guide output.
- **Goal** (Green) — The outcome an agent is trying to reach.
- **Goal / Objective** (Green) — The thing everything else is optimized toward. Most agentic failures trace back to a goal that was vague, wrong, or quietly outranked the rules.
- **Human-in-the-Loop** (Green) — A setup where a person must review or approve an AI's action before it takes effect, so higher-risk decisions are not left fully to the machine.
- **Human-on-the-Loop** (Green) — A lighter-touch oversight model for higher autonomy: faster, but relies on the human actually noticing in time.
- **Kahneman-Tversky** (Green) — An alignment method using human-style gain/loss judgments.
- **KTO** (Green) — Kahneman-Tversky Optimization: aligns a model from simple good/bad signals.
- **Learning from human feedback** (Green) — Humans rank a model's outputs and that preference signal trains the model toward what people actually want.
- **Loops** (Green) — The feedback and control cycles an agent runs in: acting, being checked, and correcting, including human-in and human-on-the-loop.
- **Memory** (Green) — Lets agents stay coherent over long tasks, and creates a new place where bad or poisoned data can persist.
- **Model Context Protocol** (Green) — An open standard for connecting agents to external tools and data through one uniform interface.
- **Multi-Agent** (Green) — Several agents working together on a task.
- **Multi-Agent System** (Green) — More capable, but introduces structural risk: one agent's error can cascade through the others (NSA/CISA).
- **Negotiation** (Green) — Agents resolving differences to reach agreement.
- **One-Shot** (Green) — Giving one example in the prompt to guide output.
- **Orchestration** (Green) — The layer that coordinates models, tools, and steps into a workflow, and where approvals and limits are enforced.
- **Plan** (Green) — An ordered set of steps toward a goal.
- **Planning** (Green) — The capability that turns a single answer into a multi-step task. Powerful, and harder to predict or audit.
- **Preference** (Green) — A human signal of which output is better.
- **Prefix** (Green) — Tokens prepended to steer a model's output.
- **Prompting** (Green) — Phrasing an input to steer a model's output.
- **ReAct** (Green) — Interleaving reasoning with tool actions in a loop.
- **Reasoning** (Green) — Working through a problem in steps before answering.
- **Reflect** (Green) — An agent reviewing its own work to improve it.
- **Representation Locality** (Amber) — The rule that components communicate only in compact state-deltas, never raw narrative or full histories, so contradictions cannot pile up in transit.
- **RLAIF** (Green) — Reinforcement learning where an AI model, not a human, gives the preference signal.
- **Scaffold** (Green) — The supporting structure of prompts, tools, memory, and checks around a model that both enables and bounds agentic behavior.
- **Self-Reflection** (Green) — An agent critiques its own output and revises it.
- **Skills** (Green) — Discrete, scoped capabilities an agent can call: modular tools it composes, each permissioned and bounded.
- **Tool** (Green) — An external function an agent can call.
- **Tool Use / Function Calling** (Green) — What lets an agent affect the real world. Also the main place it can cause real damage, so tools are a key control point.
- **Tree-of-Thoughts** (Green) — Exploring multiple reasoning branches and keeping the best.
- **Workflow** (Green) — A fixed series of steps the AI follows to finish a task. Because the path is set ahead of time, it is predictable and easy to check, which is why it is the safest place to start.
- **Zero-Shot** (Green) — Asking with no examples, relying on prior training.

### Failure Modes & Risks
*What goes wrong.*

- **Agent Goal Hijack** (Green) — Combines prompt injection with autonomy: multi-step execution amplifies the damage before a human can step in.
- **Automation Bias** (Green) — The human tendency to over-trust automated output and stop checking it, which weakens human oversight.
- **Bias** (Green) — A core fairness and legal risk; often traces back to training data.
- **Cascading Failure** (Green) — When one part's failure sets off others in a chain, so a small fault spreads into a system-wide breakdown. Common where many agents or services depend on each other.
- **Data Poisoning** (Green) — An attack that corrupts training data so the resulting model behaves incorrectly or carries hidden flaws.
- **Deceptive Alignment** (Green) — The hardest failure to detect: it's invisible to checks that only test individual claims. Maps to the Ledger's ordering drift: Purpose quietly outranking the Check, with every local test still green.
- **Emergent Behavior** (Green) — Cuts both ways: useful new skills, but also unanticipated risks. A reason evaluation must be ongoing.
- **Goal Misalignment / Goal Misgeneralization** (Green) — A quiet, systemic failure: every individual step can look fine while the overall direction is wrong.
- **Hallucination** (Green) — When an AI states something false as if it were true: fluent, confident output that isn't grounded in real data. Also called contextual mismatch or semantic drift.
- **Jailbreak** (Green) — Close to prompt injection; specifically aimed at defeating guardrails. A reason guardrails alone aren't enough.
- **Model Drift** (Green) — The gradual decline in a model's accuracy as real-world data drifts away from the data it was trained on.
- **Privilege** (Green) — Names the single most cited agentic risk and its fix: don't over-grant access.
- **Prompt Injection** (Green) — The top-ranked LLM risk. Dangerous for agents because the injected instruction can trigger real tool actions.
- **Reward Hacking** (Green) — When a system maximizes its given metric in unintended ways that satisfy the measure but not the real goal.
- **Semantic Drift** (Amber) — When a system's internal picture slowly stops matching reality because it keeps absorbing data without checking it against current truth. Distinct from model drift: the world may be unchanged while the representation rots.
- **Sensitive Information Disclosure** (Green) — A leading real-world harm, especially for agents with access to internal data. Drives least-privilege and scoping.
- **Tool Poisoning** (Green) — Turns the agent's own capabilities against it. A supply-chain attack aimed at the action layer.
- **Unbounded Accumulation** (Amber) — The failure of piling up inputs without ever deciding what is still true, until contradictions make a clean decision impossible. The closet you never clean out.

### Control & Safety
*How it is constrained.*

- **AI Safety** (Green) — The discipline that contains most other terms in this cluster.
- **Alignment** (Green) — The overarching aim of safety work. Misalignment is the root of many failure modes downstream.
- **Boundary** (Green) — The limit of what a system may do.
- **Buffer** (Green) — Takes survivable error and deforms instead of breaking, holding room a node cannot shed.
- **Constraint** (Green) — A rule limiting an agent's actions.
- **Control** (Green) — Keeping a system within intended bounds.
- **Defense-in-Depth** (Green) — If one control fails, others still hold. An Absorb function at the system level.
- **Deterministic Air-Gapping** (Amber) — The requirement that safety-critical checks run entirely on local hardware with no network dependency, so they still work when the connection fails. The lock works whether or not the security company's servers are online.
- **Deterministic Constraint** (Green) — A fixed rule the model cannot override, so it holds even when the model misbehaves. It is the enforcing core of a harness or tether: the part that actually says no.
- **Dual-Pass Local Validation** (Amber) — Requiring every proposed change to clear two local checks before commit: does it fit the rules (ontology), and does it make sense in reality now (semantics). One check is not enough.
- **Elimination-Earned Confidence** (Amber) — A proposed mechanism where a system earns the right to act in proportion to what it has ruled out, carried as an explicit margin, rather than from self-reported certainty. The right to commit scales with confidence and shrinks as consequence rises. Author's candidate contribution, pending review.
- **Evaluation / Benchmark** (Green) — A standardized test of a model or agent's performance, used to judge fitness for a task and to detect decline over time.
- **Fallbacks** (Green) — Backup actions used when the main one fails.
- **Firewall of Cognition** (Amber) — Keeping the reasoning model in a read-only context that never directly touches infrastructure, with actions run in disposable sandboxes. The boundary does the work, so the reasoning engine is never trusted with the controls.
- **Floor** (Green) — Compares every claim to a fixed reference held still during the check.
- **Forgiveness** (Green) — Absorbs cost after a stop, making a valid intervention distinguishable from damage.
- **Grace** (Green) — Absorbs cost before a stop, so a recoverable error does not end the run.
- **Graceful Degradation** (Green) — The Ledger's Absorb function by its field-standard name: survivable error doesn't become a terminal stop.
- **Guardrail** (Green) — An enforced limit on what a model or agent may do, checked against a rule before an action is allowed to proceed.
- **Harness** (Green) — Wraps a model to direct, constrain, and watch its actions: the control surface that turns a raw model into a governable agent.
- **HITC** (Green) — Human-in-the-Command: a human directs the agent's actions.
- **HOTL** (Green) — Human-on-the-Loop: a human monitors and can intervene.
- **Human-in-the-Command** (Green) — A human directs and authorizes the agent's actions.
- **Impedance** (Amber) — Borrowed from electronics: how much a structure resists a signal passing through it. In governance, the deliberate friction a control layer adds so unverified change meets resistance and only a clean, in-tune signal (a grounded, coherent change) passes without distortion. Too little and drift flows straight through; too much and the system chokes: the tuning that keeps a structure's integrity under load.
- **Kill Switch / Circuit Breaker** (Green) — The last-resort Reset: halts runaway behavior. Circuit breakers can trip automatically when limits are crossed.
- **Least Privilege** (Green) — Giving an agent only the minimum access and permissions its task needs, so a compromise or mistake can do limited damage.
- **Loop** (Green) — The control loop placing a human in or on the process.
- **Mandate Gate** (Amber) — A check that routes high-consequence actions to a human instead of letting the agent commit them. Autonomy is scoped by how much is at stake.
- **Ontology / Policy Gate** (Green) — A control that first checks whether an action is even a permitted type, before checking whether it is carried out correctly.
- **Purpose Gate** (Amber) — A check that re-verifies an agent is still pursuing its authorized intent during a task, not only at startup, since static permissions do not survive dynamic workflows.
- **Rate Limiting** (Green) — Slows damage so humans can catch it, an Absorb function that buys reaction time.
- **Red Teaming** (Green) — Turns unknown risks into known, fixable ones. A Check run adversarially.
- **Redaction** (Green) — Removing sensitive content from data or output.
- **Redundancy** (Green) — Spare capacity that keeps a system running.
- **Refusal Logic** (Amber) — The deterministic, non-AI hard stop that blocks a change when validation fails, independent of the model's reasoning. The model does not get a vote; the breaker trips on its own, and the failure is logged.
- **Safety** (Green) — Keeping a system from causing harm.
- **Sandboxing** (Green) — Lets an agent fail safely. In Ledger terms an Absorb function: it contains survivable error instead of letting it spread.
- **Scoping** (Green) — The cheapest, most effective control. NSA/CISA advise starting with low-risk, tightly scoped, non-sensitive use cases.
- **Security** (Green) — Protecting systems and data from attack.
- **Semantics Gate** (Amber) — The second validation pass: even if a change is technically allowed, does it cohere with current conditions and safety thresholds? Catches the move that is legal but catastrophic.
- **Structural Floor** (Amber) — The commitment that safety boundaries are enforced by fixed, non-AI components rather than by the model's own judgment. A fence at the cliff edge, not a sign asking you not to fall. Closely tied to the Harness.
- **Substrate Gate** (Amber) — A validation pass that checks a proposed change stays coupled to ground truth, real-world signal, rather than only being internally consistent.
- **Tether** (Green) — Binds an agent to its goal, its ground truth, and human oversight, so it cannot drift loose.
- **Tolerance** (Green) — Fault tolerance: staying up despite failures.
- **Validation Gate** (Green) — Catches bad results before they take effect. A deterministic Check the agent cannot talk its way past.
- **Zero Trust** (Green) — A security model that verifies every action rather than trusting it by default, applied here to each step an agent takes.

### Oversight & Governance
*Who is accountable.*

- **Accountability** (Green) — One of NSA/CISA's five agentic risk categories. Hard with autonomous agents precisely because the actor isn't a person, so accountability has to be assigned deliberately.
- **AI Governance** (Green) — The framework everything in this cluster lives inside. NSA/CISA stress agentic AI usually fits existing governance, not a brand-new discipline.
- **AI Lifecycle** (Green) — Governance attaches at every stage; risks and controls differ by stage. A useful mental map for newcomers.
- **Audit Trail** (Green) — The Ledger's Reset/Return function: it makes a valid action distinguishable from damage, and makes accountability possible after the fact.
- **Auditing** (Green) — Reviewing a system against rules or expectations.
- **Black Box** (Green) — A system whose outputs can be observed but whose internal reasoning cannot be seen or readily understood.
- **Coherence** (Green) — The whole structure holding its orientation as it moves, not merely keeping its facts: sustained coupling between what a system intends, what it does, and what is real.
- **Coherence Ledger** (Green) — Audits any framework for coherence and resilience to its stated goal, scoring structure over narrative.
- **Compliance** (Green) — Conformance with the laws, regulations, and policies that apply to a system. These are the rules that cannot be opted out of without eventual consequence.
- **Delta** (Green) — The change between two versions or values.
- **Detection** (Green) — Surfacing a problem or pattern as it occurs.
- **Elasticity** (Green) — Scaling resources up and down with demand.
- **Elicitation** (Green) — Drawing out a model's capabilities or knowledge.
- **Ethical AI** (Green) — Close cousin of Responsible AI; emphasizes the values themselves over the process.
- **Ethics** (Green) — Principles for what AI should and should not do.
- **Explainability** (Green) — How clearly a model's outputs can be explained.
- **Explainability / Interpretability** (Green) — The degree to which a model's outputs, and the reasoning behind them, can be understood and explained by people.
- **Go-to-Market** (Green) — The plan for releasing an AI capability to users, governed for staged, responsible rollout rather than a single launch.
- **Governance** (Green) — The rules and oversight guiding how AI is built and used.
- **Human-Centered AI** (Green) — The orienting philosophy behind keeping a human meaningfully in the loop.
- **Interpretability** (Green) — How well a model's inner workings can be understood.
- **Management** (Green) — Coordinating resources, models, or workflows.
- **Metaphor as Transmission Layer** (Amber) — Treating a plain-language bridge image as a required layer of a control, not optional documentation, so engineers, operators, and affected people can all audit the same boundary. A control no outsider can read is one no outsider can challenge. Author's candidate contribution.
- **Model Card** (Green) — A short document describing a model's purpose, training data, limitations, and intended use.
- **NIST AI Risk Management Framework** (Green) — Gives organizations a shared structure and vocabulary for AI risk. Govern sets policy; Map finds risks in context; Measure rates trustworthiness; Manage decides what to do about them.
- **Outcomes** (Amber) — The real-world results a system produces downstream, as opposed to its immediate outputs. Governance judges an AI by its outcomes, the impact on people and systems, not just what it prints on the screen.
- **Privacy** (Green) — Protecting personal information from misuse.
- **Query** (Green) — A structured request that asks the system by pattern and function, not by keyword, so the answer reflects the structure.
- **Resilience** (Green) — A system's capacity to absorb load, hold its chain of custody, stay anchored to ground truth, and recover, while respecting the human cost.
- **Resilience Ledger** (Green) — Measures how a system absorbs load, checks against a reference, and resets, scored from a neutral center rather than its own story.
- **Responsible AI** (Green) — The values layer that governance operationalizes.
- **Return** (Green) — Keeps an append-only record so the system returns to baseline rather than locking in a changed state.
- **Risk Assessment** (Green) — The process of identifying, rating, and prioritizing the ways a system could cause harm.
- **Scalability** (Green) — How well a system grows with load.
- **Shadow AI** (Green) — AI tools used inside an organization without approval or oversight, operating outside its governance.
- **Solution Architecture** (Green) — The overall design of how an agentic system's models, tools, data, controls, and people fit together to meet a goal safely.
- **Sovereign Zero** (Green) — The neutral, function-first reference a translation calibrates against, so no single vocabulary captures the meaning.
- **Supervision** (Green) — Human oversight of a model or agent.
- **System Card** (Green) — Documentation of a deployed system as a whole: the model plus the surrounding components and safeguards.
- **Systems Thinking** (Green) — Reasoning about the whole agentic system and its feedback loops, not isolated parts, so controls and risks are seen in relation.
- **Testing** (Green) — Checking a system behaves as intended.
- **Tracking** (Green) — Recording experiment runs and their results.
- **Transparency** (Green) — Making how a system works and how it reaches its decisions open to inspection, so outsiders can see what it does rather than take it on faith.
- **Validation** (Green) — Checking that data or a model meets requirements.
- **XAI** (Green) — Explainable AI: making model decisions understandable.

## Metaphor layer (intuition, not mechanism)

These images help a person *feel* the ideas. They are not engineering claims, and should not be shown to technical reviewers as if they were. Kept here, sealed off from the verified vocabulary above, on purpose.

- **Sovereign Zero** — the ground truth beneath everything; the fixed floor you measure against.
- **Kintsugi** — coherence kept by mending fractures rather than hiding them; failures made visible and repaired, not erased.
- **Impedance / resonance (V=IR, signal vs noise)** — a loose analogy: human intent as voltage, an agent's logic as current, a good rule set as resistance; a clean logic path as a single clear signal, drift as broadband noise. Analogy only, not a measurement.

## Provenance

Generated from `terms.enriched.json` on 2026-07-01. Counts: 443 terms total, 214 in this core canon, 23 State-Delta terms, 188 human-reviewed. Content hash `0202d4a4d829`. Every claim here is a **candidate** unless its status is Green. Independent educational research, provided as-is. Licensed **CC BY 4.0**. © 2026 Jake Tiller.
