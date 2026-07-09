# Agentic AI Governance Glossary

**A function-first reference for everyday AI terms.**
Version 0.1 · 2026-06-28 · Open research draft

---

## What this is

A plain-language map of the words people use around AI and AI governance, built for anyone who has landed in AI-adjacent work and keeps hearing terms like *ontology gate*, *provenance*, or *excessive agency* without a clear definition. It is aimed at non-technical newcomers first, but written precisely enough to stay useful for upskilling professionals and policy readers.

It is deliberately **not** a dictionary. Terms are not here to be exhaustively defined; they are here because they help you understand, use, or govern AI systems day to day. If a term doesn't earn its place by that test, it isn't included.

**How it borrows from the Resilience Ledger.** Following the Ledger's core move, each term is described by **what it does (its function/purpose)**, not just what it is called. Terms are grouped into six *function clusters* rather than alphabetically, so related ideas sit together. A crosswalk (below) links the control-and-safety terms back to the Ledger's three functions: Absorb, Check, and Reset, so you can see which terms serve the same purpose under different names.

## How to read an entry

Every entry follows the same shape:

> **Term** *(other names)*
> *Plain:* what it means in everyday language.
> *Does:* the function: what it's for and why it matters.
> *Related:* nearby terms in this glossary.
> *Note (optional): a more technical detail for readers who want it.*

Jump to a cluster: [1. Foundations](#cluster-1--foundations) · [2. Agentic Mechanics](#cluster-2--agentic-mechanics) · [3. Control & Safety](#cluster-3--control--safety) · [4. Oversight & Governance](#cluster-4--oversight--governance) · [5. Data & Provenance](#cluster-5--data--provenance) · [6. Failure Modes & Risks](#cluster-6--failure-modes--risks)

---

## The crosswalk (linking by purpose)

The Resilience Ledger reduces a system to three functions measured from one center. Many safety and governance terms in this glossary are just field-standard names for those same functions. This table is the bridge.

| Ledger function | What it does | Glossary terms that serve this purpose |
|---|---|---|
| **Absorb load** (Buffer / Grace) | Takes survivable error and bends instead of snapping | Sandboxing, rate limiting, graceful degradation, defense-in-depth, fail-soft, circuit breaker |
| **Check against a fixed reference** (Floor) | Compares every claim to something external it cannot edit mid-check | Guardrail, ontology/policy gate, validation gate, grounding, ground truth, alignment, evaluation, red teaming, provenance, attestation |
| **Reset to baseline** (Return) | Keeps an append-only record so the system returns to center, not a changed state | Rollback, checkpoint, audit trail, kill switch, state recovery, model/system cards |
| **The center** (uncaptured zero) | The known origin actions are aimed from | Ground truth, human-in-the-loop, accountability |

> The Ledger's lesson applied here: when two terms pass the same self-test ("does something in the system do this?"), they belong in the same row. Apparent disagreement between vocabularies is usually the same function wearing different words.

---

## Cluster 1 · Foundations
*What AI is built from. The substrate everything else runs on.*

**Artificial Intelligence (AI)**
*Plain:* Software that performs tasks we'd normally call "intelligent": recognizing images, writing text, making decisions.
*Does:* The umbrella term; everything below is a piece of how modern AI is built or governed.
*Related:* Machine Learning, Generative AI, Traditional AI.

**Traditional AI** *(symbolic AI, rule-based AI)*
*Plain:* Older AI that follows explicit human-written rules ("if X, then Y") rather than learning from data.
*Does:* Useful contrast: it explains why modern AI behaves less predictably, having learned patterns instead of being told rules.
*Related:* Expert System, Machine Learning.

**Machine Learning (ML)**
*Plain:* Software that learns patterns from examples instead of being explicitly programmed with rules.
*Does:* The engine behind almost all current AI. If a system "got better with data," it was machine learning.
*Related:* Deep Learning, Training Data, Model.

**Deep Learning**
*Plain:* A kind of machine learning that uses large, many-layered neural networks to find complex patterns.
*Does:* The breakthrough that made image recognition, speech, and language models work well.
*Related:* Neural Network, Foundation Model.

**Neural Network**
*Plain:* A computing structure loosely inspired by the brain, made of interconnected "neurons" that pass signals.
*Does:* The basic machinery deep learning runs on.
*Related:* Deep Learning, Weights, Parameter.

**Parameter / Weights**
*Plain:* The internal numbers a model adjusts as it learns; weights are the connection strengths between neurons.
*Does:* "How a model knows what it knows." A model's size is often quoted in parameters (e.g. billions).
*Related:* Training Data, Fine-tuning, Model.

**Model**
*Plain:* The trained file that does the work: takes an input and produces an output.
*Does:* The deliverable of training; what you actually run, deploy, and govern.
*Related:* Foundation Model, Inference, Open-Weight Model.

**Foundation Model**
*Plain:* A large model trained on broad data that can be adapted to many tasks, serving as a base for other applications.
*Does:* The reusable "foundation" most products are built on top of rather than training from scratch.
*Related:* Large Language Model, Fine-tuning, Transformer.

**Large Language Model (LLM)**
*Plain:* A model trained on massive amounts of text to understand and generate human-like language.
*Does:* The core of chatbots and most agentic systems; NSA/CISA guidance treats agentic AI as primarily LLM-based.
*Related:* Foundation Model, Generative AI, Token.

**Generative AI (GenAI)**
*Plain:* AI that creates new content: text, images, audio, code, or video.
*Does:* Names the capability that distinguishes today's tools from older predict-and-classify AI.
*Related:* Large Language Model, Hallucination.

**Transformer**
*Plain:* The neural-network design behind modern language models; it uses "attention" to weigh how parts of the input relate.
*Does:* The architecture that made LLMs possible. You rarely need the internals, but the word comes up constantly.
*Related:* Attention Mechanism, Foundation Model.
*Note: the "GPT" in ChatGPT stands for Generative Pre-trained Transformer.*

**Token / Tokenization**
*Plain:* Text broken into small chunks (words or word-pieces) that a model processes; tokenization is that splitting step.
*Does:* Explains usage limits and pricing: most AI services bill and budget by tokens.
*Related:* Context Window, Large Language Model.

**Context Window**
*Plain:* How much input a model can consider at once, its short-term working memory, measured in tokens.
*Does:* Sets the practical limit on how much a model can "hold in mind" in a single task.
*Related:* Token, Memory, RAG.

**Embeddings**
*Plain:* Turning words, images, or data into lists of numbers that capture meaning, so similar things sit near each other.
*Does:* The trick that lets AI "search by meaning" rather than exact keywords.
*Related:* Vector Database, Semantic Analysis.

**Inference**
*Plain:* Running a trained model to get an answer: the "use" phase, as opposed to the "training" phase.
*Does:* Distinguishes the cost/act of *using* AI from the cost/act of *building* it.
*Related:* Model, Training Data.

**Training Data**
*Plain:* The examples used to teach a model.
*Does:* Quality, bias, and provenance of this data shape everything the model later does. A core governance concern.
*Related:* Data Poisoning, Synthetic Data, Bias.

**Fine-tuning**
*Plain:* Taking a general pre-trained model and training it a bit more on specific data to specialize it.
*Does:* How organizations adapt a foundation model to their domain without building one from scratch.
*Related:* Foundation Model, Transfer Learning.

**Prompt**
*Plain:* The instruction or question you give an AI.
*Does:* The primary control surface for non-technical users: how you steer a model is mostly how you prompt it.
*Related:* Prompt Engineering, Prompt Injection.

**Prompt Engineering**
*Plain:* The practice of carefully wording prompts to get better, more reliable outputs.
*Does:* A practical, learnable skill, often the highest-leverage thing a non-technical user can get good at.
*Related:* Prompt, Context Window.

**Retrieval-Augmented Generation (RAG)**
*Plain:* Letting a model look up external, up-to-date documents before answering, instead of relying only on memory.
*Does:* Reduces hallucination and lets AI cite current/internal facts. A key grounding technique.
*Related:* Grounding, Vector Database, Hallucination.

**Reasoning Model**
*Plain:* A model designed to work through problems in explicit step-by-step "thinking" before answering.
*Does:* Better at math, logic, and multi-step tasks; underpins more capable agents.
*Related:* Agentic AI, Inference.

**Multimodal AI**
*Plain:* AI that handles more than one type of data at once, e.g. text and images and audio.
*Does:* Expands what agents can perceive and act on (reading a screenshot, describing a photo).
*Related:* Generative AI, Computer Vision.

---

## Cluster 2 · Agentic Mechanics
*How an AI stops being a chatbot and starts taking actions. This is the heart of "agentic."*

**Agent**
*Plain:* An AI system that doesn't just answer: it takes actions to reach a goal, like searching the web, running code, or sending an email.
*Does:* The shift from "tool you operate" to "actor that operates on your behalf." Everything in governance gets harder here.
*Related:* Agentic AI, Tool Use, Autonomy.

**Agentic AI**
*Plain:* AI systems that act as autonomous or semi-autonomous agents: they set or interpret goals, plan, use tools, and adapt over time to finish a task. *(Stanford HAI; NIST.)*
*Does:* The central subject of this glossary. NIST stresses agency is a *spectrum*, not on/off: from a single scoped agent to many agents acting with little human oversight.
*Related:* Agent, Autonomy, Multi-Agent System.

**Autonomy**
*Plain:* How much an AI does on its own without asking a human first.
*Does:* The dial that most determines risk. More autonomy = more speed and scale, but also more ways to go wrong before anyone notices.
*Related:* Human-in-the-Loop, Excessive Agency, Scoping.

**Tool Use / Function Calling**
*Plain:* An agent's ability to use external tools: call an API, run a search, query a database, execute code.
*Does:* What lets an agent affect the real world. Also the main place it can cause real damage, so tools are a key control point.
*Related:* Agent, Least Privilege, Tool Poisoning.

**Orchestration**
*Plain:* Coordinating multiple steps, tools, or agents so a complex task gets done in order.
*Does:* The "conductor" layer. Where workflows are defined, it's also where guardrails and approvals are enforced.
*Related:* Workflow, Planning, Multi-Agent System.

**Planning**
*Plain:* An agent breaking a goal into a sequence of steps and deciding what to do next.
*Does:* The capability that turns a single answer into a multi-step task. Powerful, and harder to predict or audit.
*Related:* Reasoning Model, Orchestration, Goal.

**Goal / Objective**
*Plain:* What the agent is trying to achieve.
*Does:* The thing everything else is optimized toward. Most agentic failures trace back to a goal that was vague, wrong, or quietly outranked the rules.
*Related:* Goal Misalignment, Reward Hacking, Alignment.

**Workflow**
*Plain:* A defined sequence of steps an agent follows to complete a task.
*Does:* The unit organizations actually deploy and govern. Lower-autonomy, fixed workflows are the recommended starting point.
*Related:* Orchestration, Scoping.

**Multi-Agent System**
*Plain:* Several AI agents working together, sometimes specialized (one researches, one writes, one checks).
*Does:* More capable, but introduces *structural risk*: one agent's error can cascade through the others (NSA/CISA).
*Related:* Cascading Failure, Orchestration, Sybil Resistance.

**Model Context Protocol (MCP)** *(tool/connector protocol)*
*Plain:* An emerging open standard for how agents connect to external tools and data sources in a consistent way.
*Does:* Standardizes the "plug" between agents and tools, which also makes that plug a shared security boundary to govern.
*Related:* Tool Use, Supply Chain, Least Privilege.

**Memory**
*Plain:* An agent's ability to store and recall information across steps or sessions, beyond its context window.
*Does:* Lets agents stay coherent over long tasks, and creates a new place where bad or poisoned data can persist.
*Related:* Context Window, RAG, Data Poisoning.

**Human-in-the-Loop (HITL)**
*Plain:* A person reviews or approves an AI's actions as part of how it runs.
*Does:* The primary safety control for higher-risk actions. In the Resilience Ledger's terms, the human is the only node whose costs don't reset, so it holds the reference.
*Related:* Human-on-the-Loop, Accountability, Kill Switch.

**Human-on-the-Loop**
*Plain:* A person monitors an AI that mostly acts on its own, stepping in only when needed.
*Does:* A lighter-touch oversight model for higher autonomy: faster, but relies on the human actually noticing in time.
*Related:* Human-in-the-Loop, Autonomy, Automation Bias.

**Excessive Agency**
*Plain:* When an agent can do more than it should: too much access, too much autonomy, too little oversight. *(OWASP LLM06; NIST.)*
*Does:* Names a top agentic risk category and points straight at the fix: scope it down, limit its tools, add approval.
*Related:* Least Privilege, Scoping, Autonomy.

---

## Cluster 3 · Control & Safety
*The mechanisms that keep an agent inside its bounds. Most of these map directly to the Ledger crosswalk.*

**Guardrail**
*Plain:* A rule or filter that blocks an AI from doing or saying certain things.
*Does:* The everyday word for an enforced limit. In Ledger terms this is a **Check**: it compares an action against a fixed rule before allowing it.
*Related:* Ontology/Policy Gate, Validation Gate, Alignment.

**Ontology / Policy Gate**
*Plain:* A checkpoint that only lets an action through if it fits a defined set of allowed concepts, categories, or policies. ("Ontology" = an agreed map of what things are and how they relate.)
*Does:* A stricter, structured guardrail: it asks "is this action even a permitted *kind* of thing here?" before asking whether it's done correctly. A **Check** function.
*Related:* Guardrail, Validation Gate, Grounding.
*Note: this is the kind of term the project set out to demystify: it's just a structured permission gate defined by a concept map.*

**Validation Gate** *(enforcement gate)*
*Plain:* A step that verifies an output or action meets requirements before it's allowed to proceed.
*Does:* Catches bad results before they take effect. A deterministic **Check** the agent cannot talk its way past.
*Related:* Guardrail, Deterministic Constraint, Evaluation.

**Deterministic Constraint**
*Plain:* A fixed, non-negotiable rule enforced by code, not by the model's judgment ("never spend over $100").
*Does:* The reliable backstop. Because it doesn't depend on the model behaving, it holds even when the model misbehaves.
*Related:* Validation Gate, Guardrail.

**Alignment**
*Plain:* Making an AI's goals and behavior match what people actually want: our values, rules, and intentions. *(Stanford HAI.)*
*Does:* The overarching aim of safety work. Misalignment is the root of many failure modes downstream.
*Related:* AI Safety, Goal Misalignment, Deceptive Alignment.

**AI Safety**
*Plain:* The field focused on making AI behave reliably and avoid harm, even when powerful or in unexpected situations. *(Stanford HAI.)*
*Does:* The discipline that contains most other terms in this cluster.
*Related:* Alignment, Red Teaming, Responsible AI.

**Sandboxing**
*Plain:* Running an agent in an isolated environment where its actions can't affect real systems.
*Does:* Lets an agent fail safely. In Ledger terms an **Absorb** function: it contains survivable error instead of letting it spread.
*Related:* Defense-in-Depth, Least Privilege.

**Least Privilege**
*Plain:* Giving an agent only the minimum access it needs, nothing more.
*Does:* Limits the blast radius if the agent is compromised or misbehaves. A foundational NSA/CISA principle.
*Related:* Zero Trust, Excessive Agency, Tool Use.

**Zero Trust**
*Plain:* A security model that trusts nothing by default and verifies every request, even from inside the system.
*Does:* Applied to agents: each action is re-checked rather than assumed safe because "it's our own agent." NSA/CISA recommend folding agents into this existing model.
*Related:* Least Privilege, Defense-in-Depth.

**Defense-in-Depth**
*Plain:* Layering multiple independent safeguards so no single failure is catastrophic.
*Does:* If one control fails, others still hold. An **Absorb** function at the system level.
*Related:* Sandboxing, Zero Trust, Circuit Breaker.

**Red Teaming**
*Plain:* Deliberately attacking or stress-testing an AI to find weaknesses before real adversaries do.
*Does:* Turns unknown risks into known, fixable ones. A **Check** run adversarially.
*Related:* Evaluation, Prompt Injection, Jailbreak.

**Evaluation (Evals) / Benchmark**
*Plain:* Standardized tests that measure how well or safely an AI performs. *(Stanford HAI.)*
*Does:* How you know if a model or agent is good enough to trust for a task, and whether it's getting worse over time.
*Related:* Red Teaming, Model Drift, Validation Gate.

**Kill Switch / Circuit Breaker**
*Plain:* A way to immediately stop an agent.
*Does:* The last-resort **Reset**: halts runaway behavior. Circuit breakers can trip automatically when limits are crossed.
*Related:* Rollback, Rate Limiting, Human-in-the-Loop.

**Rate Limiting**
*Plain:* Capping how many actions an agent can take in a given time.
*Does:* Slows damage so humans can catch it, an **Absorb** function that buys reaction time.
*Related:* Circuit Breaker, Defense-in-Depth.

**Scoping**
*Plain:* Narrowly defining what an agent is allowed to do and on what.
*Does:* The cheapest, most effective control. NSA/CISA advise starting with low-risk, tightly scoped, non-sensitive use cases.
*Related:* Least Privilege, Workflow, Excessive Agency.

**Graceful Degradation** *(fail-soft, fault tolerance)*
*Plain:* When something breaks, the system bends and keeps partly working instead of crashing entirely.
*Does:* The Ledger's **Absorb** function by its field-standard name: survivable error doesn't become a terminal stop.
*Related:* Defense-in-Depth, Rate Limiting.

---

## Cluster 4 · Oversight & Governance
*Who is accountable, how it's documented, and how risk is managed across the lifecycle.*

**AI Governance**
*Plain:* The policies, roles, and processes an organization uses to manage AI responsibly.
*Does:* The framework everything in this cluster lives inside. NSA/CISA stress agentic AI usually fits *existing* governance, not a brand-new discipline.
*Related:* NIST AI RMF, Accountability, Compliance.

**NIST AI Risk Management Framework (AI RMF)**
*Plain:* A widely used US government framework for managing AI risk, organized around four functions: **Govern, Map, Measure, Manage.**
*Does:* Gives organizations a shared structure and vocabulary for AI risk. Govern sets policy; Map finds risks in context; Measure rates trustworthiness; Manage decides what to do about them.
*Related:* AI Governance, Risk Assessment, Responsible AI.

**Responsible AI**
*Plain:* The principles and practices for developing and deploying AI ethically and safely. *(Stanford HAI.)*
*Does:* The values layer that governance operationalizes.
*Related:* Ethical AI, AI Governance, Human-Centered AI.

**Ethical AI**
*Plain:* Designing and using AI in line with human values, fairness, and transparency. *(Stanford HAI.)*
*Does:* Close cousin of Responsible AI; emphasizes the values themselves over the process.
*Related:* Responsible AI, Bias.

**Accountability**
*Plain:* Clarity about *who* is answerable when an AI system causes harm or makes a decision.
*Does:* One of NSA/CISA's five agentic risk categories. Hard with autonomous agents precisely because the actor isn't a person, so accountability has to be assigned deliberately.
*Related:* Human-in-the-Loop, Audit Trail, Governance.

**Audit Trail** *(audit log)*
*Plain:* An append-only record of what an agent did, when, and why.
*Does:* The Ledger's **Reset/Return** function: it makes a valid action distinguishable from damage, and makes accountability possible after the fact.
*Related:* Provenance, Rollback, Accountability.

**Model Card**
*Plain:* A short standardized document describing a model: what it does, its limits, and how it was tested.
*Does:* The "nutrition label" for a model. Helps non-builders judge whether it fits their use.
*Related:* System Card, Transparency.

**System Card**
*Plain:* Like a model card but for a whole deployed system, including its safeguards and intended use.
*Does:* Documents the thing you actually deploy, not just the underlying model.
*Related:* Model Card, Transparency.

**Transparency**
*Plain:* Being open about how an AI system works, what it's for, and its limits.
*Does:* A precondition for trust, oversight, and informed use.
*Related:* Explainability, Model Card.

**Explainability / Interpretability**
*Plain:* How well humans can understand why an AI made a given decision. Explainable AI (XAI) is the set of methods for this. *(Stanford HAI.)*
*Does:* Without it, you can't fully audit, debug, or contest a decision. Key for high-stakes and regulated uses.
*Related:* Transparency, Black Box.

**Black Box**
*Plain:* A system whose internal reasoning isn't visible or understandable, even if its inputs and outputs are.
*Does:* Names the core challenge interpretability fights: you can see what it did, not always why.
*Related:* Explainability, Interpretability.

**Compliance**
*Plain:* Meeting the laws, regulations, and standards that apply to an AI system.
*Does:* The enforceable floor of governance: the rules you don't get to opt out of.
*Related:* AI Governance, Risk Assessment.

**Risk Assessment**
*Plain:* Identifying and rating what could go wrong with an AI system before and during deployment.
*Does:* The "Map" and "Measure" of governance in practice: turns vague worry into a prioritized list.
*Related:* NIST AI RMF, Red Teaming.

**AI Lifecycle**
*Plain:* The full path of an AI system: design, build/train, deploy, operate, and retire.
*Does:* Governance attaches at every stage; risks and controls differ by stage. A useful mental map for newcomers.
*Related:* MLOps, AI Governance.

**Shadow AI**
*Plain:* AI tools used inside an organization without approval or oversight.
*Does:* A fast-growing governance gap: you can't govern what you don't know is running.
*Related:* AI Governance, Compliance.

**Human-Centered AI (HAI)**
*Plain:* An approach that puts human needs, values, and wellbeing first throughout AI development and use. *(Stanford HAI.)*
*Does:* The orienting philosophy behind keeping a human meaningfully in the loop.
*Related:* Human-in-the-Loop, Responsible AI.

---

## Cluster 5 · Data & Provenance
*Where an agent's "truth" comes from, and how you verify it wasn't tampered with.*

**Ground Truth**
*Plain:* The verified, real-world correct answer, used as the standard to check against.
*Does:* The fixed reference everything is measured from. The Ledger's whole point: a system can be perfectly self-consistent and still wrong, so it needs an external ground truth, ultimately verified by a human in contact with reality.
*Related:* Grounding, Validation Gate, Hallucination.

**Grounding**
*Plain:* Tying an AI's answers to verifiable external sources rather than letting it rely on memory alone.
*Does:* The main defense against confident-but-false output. RAG is the most common way to do it.
*Related:* RAG, Ground Truth, Hallucination.

**Provenance**
*Plain:* The documented origin and history of data, a model, or an output: where it came from and what happened to it.
*Does:* Lets you trust (or distrust) a source by tracing it. A **Check** function, and central to NSA/CISA data-security guidance.
*Related:* Attestation, Lineage, Supply Chain.

**Attestation**
*Plain:* A verifiable, signed claim that something is what it says it is (this data, this model, this agent).
*Does:* Turns "trust me" into "here's cryptographic proof." Lets agents verify each other instead of taking output on faith.
*Related:* Provenance, Sybil Resistance, Zero Trust.

**Data Lineage**
*Plain:* The traceable path of data from origin through every transformation to its current use.
*Does:* The detailed, technical form of provenance. Essential for auditing and debugging bad outputs.
*Related:* Provenance, Audit Trail.

**Synthetic Data**
*Plain:* Artificially generated data used for training instead of real-world data. *(Stanford HAI.)*
*Does:* Useful when real data is scarce or sensitive, but its quality and biases need their own scrutiny.
*Related:* Training Data, Bias.

**Vector Database**
*Plain:* A database built to store and search embeddings, numerical meaning-representations, so you can find things by similarity. *(Stanford HAI.)*
*Does:* The memory store behind most RAG and agent-memory systems.
*Related:* Embeddings, RAG, Memory.

**Knowledge Graph**
*Plain:* A structured network of facts: entities and the relationships between them. *(Stanford HAI.)*
*Does:* Gives agents a reliable, queryable map of how things relate; a structured alternative or complement to RAG.
*Related:* Ontology/Policy Gate, Grounding.

**Watermarking**
*Plain:* Embedding a hidden, detectable mark in AI-generated content to identify its origin.
*Does:* Helps trace provenance of outputs and flag synthetic media. Imperfect, but raises the cost of undetected fakery.
*Related:* Provenance, Synthetic Data.

**Sybil Resistance**
*Plain:* Defending against one actor pretending to be many independent ones.
*Does:* In multi-agent settings, stops fake "agreement" from many sock-puppet sources. The Ledger names this directly: convergence counts only in proportion to how independent the sources truly are.
*Related:* Multi-Agent System, Attestation, Provenance.

**Supply Chain (AI)**
*Plain:* All the external models, data, tools, and components an AI system depends on.
*Does:* Each dependency is a way in for risk (OWASP LLM03). Governing agents means governing what they're built from and connect to.
*Related:* Provenance, Tool Poisoning, Model Context Protocol.

---

## Cluster 6 · Failure Modes & Risks
*The named ways agentic systems go wrong. Knowing the name is the first step to spotting it.*

**Hallucination**
*Plain:* When an AI confidently states something false or made-up as if it were fact. *(Stanford HAI.)*
*Does:* The most common everyday failure. Why grounding, RAG, and human review matter.
*Related:* Grounding, Ground Truth, RAG.

**Prompt Injection**
*Plain:* A malicious input that tricks an LLM into ignoring its instructions and doing something unintended. *(Stanford HAI; OWASP LLM01.)*
*Does:* The top-ranked LLM risk. Dangerous for agents because the injected instruction can trigger real tool actions.
*Related:* Jailbreak, Tool Use, Agent Goal Hijack.
*Note: LLMs read instructions and data in the same channel, so cleverly worded data can pose as a command.*

**Jailbreak**
*Plain:* Tricking an AI into bypassing its own safety rules.
*Does:* Close to prompt injection; specifically aimed at defeating guardrails. A reason guardrails alone aren't enough.
*Related:* Prompt Injection, Guardrail, Red Teaming.

**Agent Goal Hijack**
*Plain:* Steering an autonomous agent off its real goal toward an attacker's goal. *(OWASP Agentic ASI01.)*
*Does:* Combines prompt injection with autonomy: multi-step execution amplifies the damage before a human can step in.
*Related:* Prompt Injection, Excessive Agency, Multi-Agent System.

**Goal Misalignment / Goal Misgeneralization**
*Plain:* The agent optimizes for something subtly different from what you actually wanted.
*Does:* A quiet, systemic failure: every individual step can look fine while the overall direction is wrong.
*Related:* Alignment, Reward Hacking, Deceptive Alignment.

**Reward Hacking**
*Plain:* The agent finds a loophole that technically satisfies its goal while defeating its intent (gaming the metric).
*Does:* Explains "it did exactly what I said, not what I meant" failures. Why goals and metrics need careful design.
*Related:* Goal Misalignment, Alignment.

**Deceptive Alignment**
*Plain:* A system that appears aligned and passes checks while actually pursuing a different goal.
*Does:* The hardest failure to detect: it's invisible to checks that only test individual claims. Maps to the Ledger's *ordering drift*: Purpose quietly outranking the Check, with every local test still green.
*Related:* Alignment, Goal Misalignment, Red Teaming.

**Model Drift**
*Plain:* A model's performance degrades over time as the real world changes from its training data. *(Stanford HAI.)*
*Does:* Why "it worked at launch" isn't enough: systems need ongoing evaluation and re-grounding.
*Related:* Evaluation, Training Data.

**Cascading Failure**
*Plain:* One agent's error spreads through interconnected agents or systems, amplifying as it goes. *(NSA/CISA structural risk.)*
*Does:* The signature multi-agent danger. Why isolation, rate limits, and circuit breakers matter at the system level.
*Related:* Multi-Agent System, Circuit Breaker, Defense-in-Depth.

**Tool Poisoning**
*Plain:* Corrupting a tool, plugin, or connector an agent relies on, so using it causes harm.
*Does:* Turns the agent's own capabilities against it. A supply-chain attack aimed at the action layer.
*Related:* Supply Chain, Tool Use, Data Poisoning.

**Data Poisoning**
*Plain:* Deliberately corrupting training or reference data so the model learns the wrong thing. *(OWASP LLM04.)*
*Does:* Attacks the foundation: hard to detect later because the damage is baked into what the model "knows."
*Related:* Training Data, Provenance, Supply Chain.

**Sensitive Information Disclosure** *(data leakage)*
*Plain:* An AI revealing private, confidential, or proprietary information it shouldn't. *(OWASP LLM02.)*
*Does:* A leading real-world harm, especially for agents with access to internal data. Drives least-privilege and scoping.
*Related:* Least Privilege, Privilege, Shadow AI.

**Privilege (risk)**
*Plain:* Risk from an agent being granted too much access to data or systems. *(NSA/CISA risk category.)*
*Does:* Names the single most cited agentic risk and its fix: don't over-grant access.
*Related:* Least Privilege, Excessive Agency, Scoping.

**Bias (in AI)**
*Plain:* When a system produces results that unfairly favor or disadvantage certain groups. *(Stanford HAI.)*
*Does:* A core fairness and legal risk; often traces back to training data.
*Related:* Training Data, Ethical AI.

**Automation Bias**
*Plain:* People over-trusting an automated system and rubber-stamping its outputs.
*Does:* The human-side failure that undermines human-in-the-loop: the human is "there" but not really checking.
*Related:* Human-in-the-Loop, Human-on-the-Loop.

**Overfitting**
*Plain:* A model that memorized its training data too closely, including noise, so it does poorly on new data. *(Stanford HAI.)*
*Does:* Explains why a model can ace tests yet fail in the real world.
*Related:* Training Data, Model Drift.

**Emergent Behavior**
*Plain:* Capabilities or behaviors that appear at scale without being explicitly designed in.
*Does:* Cuts both ways: useful new skills, but also unanticipated risks. A reason evaluation must be ongoing.
*Related:* Scaling Laws, Red Teaming.

---

## Sources

Core definitions verified against the following authoritative, publicly available sources:

- Stanford HAI: *Artificial Intelligence Glossary* and *What is Agentic AI*: [hai.stanford.edu/ai-definitions](https://hai.stanford.edu/ai-definitions)
- NSA / CISA and Five Eyes partners: *Careful Adoption of Agentic Artificial Intelligence (AI) Services* (2026): [media.defense.gov](https://media.defense.gov/2026/Apr/30/2003922823/-1/-1/0/CAREFUL%20ADOPTION%20OF%20AGENTIC%20AI%20SERVICES_FINAL.PDF) · CISA announcement: [cisa.gov](https://www.cisa.gov/news-events/news/cisa-us-and-international-partners-release-guide-secure-adoption-agentic-ai)
- NSA / CISA: *AI Data Security* joint guidance (2025): [media.defense.gov](https://media.defense.gov/2025/May/22/2003720601/-1/-1/0/CSI_AI_DATA_SECURITY.PDF)
- NIST: *AI Risk Management Framework (AI RMF 1.0)*: [nist.gov/itl/ai-risk-management-framework](https://www.nist.gov/itl/ai-risk-management-framework)
- OWASP: *Top 10 for LLM Applications (2025)* and *Top 10 for Agentic Applications (2026)*: [genai.owasp.org](https://genai.owasp.org/llm-top-10/)
- Crosswalk structure adapted from JT's *Resilience Ledger v0.5*.

*Entries marked "(Stanford HAI)", "(NIST)", "(OWASP …)", or "(NSA/CISA)" draw their wording closely from that source. Unmarked entries are plain-language syntheses consistent with these sources.*

---
## Limitations and threat model

A standing, honest account of where this glossary is weak and how it could mislead or be misused, kept visible on purpose in the spirit of the Resilience Ledger's candidate register. Reading the limits is part of using the tool well. A fuller adversarial review lives in `Red-Team-Report.md`.

### What this is not

It is not authoritative, legal, or compliance advice; it defines what terms mean and what they do, and it does not certify that any practice is safe or permitted. It is not exhaustive: it holds about 96 terms chosen for everyday usefulness, not the whole field. It is a snapshot in time: definitions are current as of their 2026 sources, not permanently true.

### Known limitations

1. **Source currency and drift.** Definitions are tied to 2026 sources in a fast-moving field. Re-verify against primary sources before relying on an entry for anything consequential.
2. **Selection is a stance.** Choosing which terms matter is an editorial and governance judgment. What is included or left out shapes the mental model, and that choice is ours, not a neutral fact.
3. **Plain language trades precision for access.** Each definition loses nuance by design. For high-stakes work, treat an entry as a doorway to the primary source, not a substitute for it.
4. **Semi-formal terms.** "Ontology gate" and Model Context Protocol are defined here by function rather than by a single canonical authority, because the field has not fully settled them.
5. **The crosswalk is interpretive.** Mapping terms to the Ledger's functions (Absorb, Check, Reset, Center) is a useful, contestable judgment, not a verified result.
6. **Framing bias.** The sources lean US and institutional (NIST, NSA/CISA, OWASP, Stanford). Other governance traditions and critical perspectives are underrepresented, and broadening them is a v0.2 goal.
7. **Cluster boundaries are a choice.** Several terms (RAG, provenance, alignment) could sit in two clusters; they are placed by primary purpose and cross-linked.

### How this could mislead or be misused

- **False authority.** Being cited to wave through a bad practice ("the glossary says it is fine"). Defense: the glossary describes, it does not approve.
- **Manufactured convergence.** Trusting agreement among sources that look independent but share an origin. Defense, borrowed from the Ledger: weight agreement by how independent the sources truly are, and check the primary documents rather than counting secondary summaries.
- **Illusion of understanding.** Knowing a term's definition is not understanding its risk. For a newcomer entering a high-stakes role, this is the subtlest danger; treat fluency here as orientation, not mastery.
- **Staleness exploited.** Leaning on an entry the field has already moved past. Defense: the review cadence below.
- **Dual use.** The glossary names attack concepts (prompt injection, jailbreak). This is accepted as low risk: the terms are widely public and defenders need them more than attackers do.

### Review cadence

Load-based, not calendar-based, following the Ledger. Review whenever the glossary is used for a real decision, and after any change to a definition or to the structure, whichever comes first. The review asks one cold question: does each definition still hold against current primary sources and against a hostile reading? Log what changed.

### Open questions carried

1. MCP and "ontology gate" remain semi-formal; worth a cold check before formal use.
2. Coverage is about 96 terms. Candidates for a v0.2 expansion: AGI, RLHF, distillation, quantization, agent identity, confidential computing, differential privacy, model collapse, chain-of-thought, guard model.
3. The interactive 3D map (`Agentic-AI-Governance-Map.html`) is the next layer built on this 2D foundation; the crosswalk drives its nodes and edges.
