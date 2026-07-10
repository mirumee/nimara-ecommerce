# Business Grilling Protocol

Use this protocol before drafting or rewriting an epic. Its purpose is to expose whether the proposed initiative is a real business bet, a weak assumption, or a solution looking for a problem.

## Conversation contract

- Ask one question per turn and wait.
- Begin each turn by reflecting the decision just made when that context matters.
- Ask one business decision, then give the recommended answer and why.
- Look up discoverable facts before asking. Decisions belong to the user; facts do not.
- Challenge vague claims until they have a population, evidence status, measure, and timeframe, or are explicitly rejected as irrelevant.
- Treat "keep up with the market", "improve UX", "increase adoption", and "differentiate" as starting claims, not accepted value.
- Keep technical solution branches parked for solution design. Record them; do not grill them during epic definition.

## Decision tree

Walk the branches in order because later decisions depend on earlier ones.

### 1. Problem, evidence, and counterfactual

Establish:

- what business harm or opportunity exists;
- what happens if nothing is done;
- what evidence exists: customer requests, lost deals, usage data, support signals, or market evidence;
- whether evidence proves demand, attribution, or only correlation;
- which claims must be labeled `[ASSUMPTION]`.

Do not let one lost proposal become proof that one missing feature caused the loss.

### 2. Target segment and value chain

Identify:

- the narrow adopter or buyer segment;
- the job they are trying to complete;
- the economic or technical decision-maker;
- the end-user experience persona;
- how end-user value becomes value for the adopter and then for the product business.

Avoid "users", "customers", or a persona that is broader than the evidence.

### 3. Strategic role and urgency

Decide whether the epic is:

- market parity or table stakes;
- a genuine differentiator;
- risk reduction;
- revenue, retention, adoption, or cost improvement.

Establish why now, the portfolio priority, the current alternative, and the cost of delay. A table stake should not be marketed as a unique differentiator.

### 4. Business outcomes

Choose one primary outcome when values compete. For each outcome establish:

- target population;
- target or threshold;
- timeframe;
- evidence source and accountable owner;
- confidence level or `[ASSUMPTION]` status.

Separate lagging business outcomes from leading indicators. Exclude vanity metrics unless the user explicitly chooses them as a proxy and explains the value path.

### 5. Falsification and insufficient evidence

Define:

- the result that proves the hypothesis wrong;
- the action after failure: stop, pivot, narrow, or retain only an integration seam;
- how to treat insufficient opportunities or sample size separately from a negative result;
- when the validation clock starts.

The hypothesis must be capable of losing.

### 6. MVP learning slice and appetite

Identify the smallest observable capability that can test the outcome. Decide:

- what an evaluator or adopter must be able to experience;
- what evidence the MVP buys;
- rollout shape: preview, pilot, or public release;
- whether a design partner is required;
- investment appetite only if the user considers it relevant.

Do not turn MVP into a list of all desired features.

### 7. Scope edges

Resolve one boundary at a time:

- core capability versus adjacent existing capabilities;
- default behavior versus deployment-specific configuration;
- primary journey start and end;
- explicitly deferred experiences and operator workflows;
- separate epics that must remain independent.

Every exclusion needs a reason and destination.

### 8. Business constraints, risks, and governance

Cover only constraints that affect the bet:

- product ownership and operating-cost model;
- privacy and data responsibility;
- trust, accessibility, and unacceptable failure modes;
- maintenance promise and open-source boundary;
- rollout ownership, evidence collection, lifecycle state, and decision gate.

Defer concrete provider, API, schema, package, infrastructure, and implementation choices.

## Question shape

Use this structure:

> **Decision context:** one sentence reflecting what is known or just decided.
>
> **Question:** one decision only.
>
> **Recommendation:** the preferred answer and its business rationale.

Never bundle decisions into a questionnaire or present several branches at once.

## Handling stops and uncertainty

- If the user says "I don't know", recommend a default. If they still cannot decide, create an owned Open Question with a lifecycle gate.
- If the user says a measure "does not matter", record the exclusion and remove it from success criteria.
- If the user says "enough questions", stop immediately, summarize agreed decisions and unresolved branches, and make no edits.
- Resume drafting only after the user confirms the summary or makes a new request to apply the summarized decisions. The request that originally triggered the skill is not confirmation.

## Completion gate

The grilling is complete only when the shared understanding contains:

- a specific target segment and primary persona;
- a problem statement with evidence separated from assumptions;
- the epic's strategic role and urgency;
- one primary business outcome and its value path;
- quantified validation evidence or an explicitly accepted lack of a target;
- leading indicators distinct from business outcomes;
- a negative falsification result and treatment of insufficient evidence;
- the smallest learning MVP, rollout, and appetite decision;
- explicit in-scope and out-of-scope boundaries;
- business NFRs, ownership, risks, and lifecycle gate;
- a list of technical decisions deferred to solution design;
- explicit user confirmation of shared understanding.
