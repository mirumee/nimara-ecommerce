# Business Protocol

Use this protocol before drafting or rewriting a PRD. Its purpose is to expose whether the proposed initiative is a real business bet, a weak assumption, or a solution looking for a problem.

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

Decide whether the PRD is:

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
- separate PRDs that must remain independent.

Every exclusion needs a reason and destination.

### 8. Business constraints, risks, and governance

Cover only constraints that affect the bet:

- product ownership and operating-cost model;
- privacy and data responsibility;
- trust, accessibility, and unacceptable failure modes;
- maintenance promise and open-source boundary;
- rollout ownership, evidence collection, lifecycle state, and decision gate.

Defer concrete provider, API, schema, package, infrastructure, and implementation choices.
