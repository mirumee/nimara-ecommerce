# Technical Grilling Protocol

Use this protocol after an approach is chosen and before drafting the RFC. Its purpose is to turn a chosen approach into a design that survives review — to expose hand-waving, hidden coupling, unhandled failure, and unowned operational cost.

## Contents

- [Conversation contract](#conversation-contract)
- [Decision tree](#decision-tree)
- [Question shape](#question-shape)
- [Handling stops and uncertainty](#handling-stops-and-uncertainty)
- [Completion gate](#completion-gate)

## Conversation contract

- Ask one question per turn and wait.
- Begin each turn by reflecting the decision just made when that context matters.
- Ask one design decision, then give the recommended answer and why.
- Keep every question at **solution altitude** — architectural principles, boundaries, and gotchas, not file/folder/function-level implementation. Concrete package placement is at most a one-line, non-binding suggestion. An RFC proposes a solution; it does not pre-write the implementation.
- Look up discoverable facts before asking — layer boundaries, existing services, current schema, config. Decisions belong to the user; facts do not.
- Do not re-open the business bet. It was settled in the PRD. If a technical finding actually breaks the bet, surface it and send it back to the PRD rather than grilling it here.
- Do not decide acceptance. An RFC proposes; the ADR decides. Park "should we do this at all" for the ADR.
- Maintain a structured in-memory ledger for every question: `D-*` ID, branch, question, recommendation, answer, and decision. Record rejected options and decisions deferred to the ADR.

## Decision tree

Walk the branches in order because later decisions depend on earlier ones.

### 1. Problem framing and requirements

Confirm the design problem restated from the PRD, the functional requirements the design must meet, and the non-functional requirements (performance, scale, cost) that constrain it. State facts and forces, not the solution.

### 2. Component changes

Decide the solution's structure at the level of **principles and boundaries**, not files: which new capability layers over which existing one, what is a new swappable boundary versus something reused wholesale, and how the pieces compose — all respecting the dependency direction (domain / foundation / infrastructure / features / app). Reject a structure that violates the boundaries. Name the architectural roles and why, not exact package/folder paths, file names, or signatures — those are implementation. Concrete placement is at most a one-line, non-binding suggestion.

### 3. API surface

Define the internal and external API changes. Expose them through infrastructure use-cases and services, not the raw Saleor schema. Decide contract shape, versioning/compat, and error modes. For anything fallible, confirm the `Result<T, E>` shape rather than thrown business errors.

### 4. Data model and migration

Establish schema changes — new tables or fields — backward compatibility, and the migration strategy. Decide whether the change is safe to roll out incrementally and how to roll back.

### 5. Security

Cover sensitive-data storage, authentication/authorization changes, and any new trust boundary. Name unacceptable failure modes.

### 6. Monitoring, alerting, and failure cases

Decide what must be observable, the alert rules, the expected failure scenarios, and the remediation for each. A design with no failure story is not done.

### 7. Dependencies and system impacts

List the dependencies the design relies on. Any new package is a proposal requiring explicit approval — never assume it. Identify the services affected and any impact on external systems.

### 8. Documentation, QA, and DevOps

Decide the documents that must change, the test scenarios that validate the design (and which can be automated), and the infrastructure changes required (env vars, Terraform, CI task-graph, firewall).

## Question shape

Use this structure:

> **Decision context:** one sentence reflecting what is known or just decided.
>
> **Question:** one design decision only.
>
> **Recommendation:** the preferred answer and its technical rationale.

Never bundle decisions into a questionnaire or present several branches at once.

## Handling stops and uncertainty

- If the user says "I don't know", recommend a default. If they still cannot decide, create a deferred decision with an owner and a `before <stage>` gate.
- If the user says a concern "does not apply", record the exclusion and drop it from the RFC.
- If the user says "enough questions", stop immediately, summarize agreed decisions and unresolved branches, and make no edits.
- Resume drafting only after the user confirms the summary or makes a new request to apply the summarized decisions. The request that originally triggered the skill is not confirmation.

## Completion gate

The grilling is complete only when the shared understanding contains:

- a design problem and the functional/non-functional requirements it must meet;
- component changes stated as roles and boundaries in the correct layers (solution altitude, not file-level) without violating dependency direction;
- an API surface exposed through services, with contract, compatibility, and error modes;
- data-model changes with backward-compatibility and migration/rollback strategy;
- a security position with named unacceptable failure modes;
- monitoring, alerting, expected failures, and remediation;
- dependencies (new ones flagged for approval) and system/external impacts;
- documentation, QA validation, and DevOps/infrastructure changes;
- rejected options captured as Alternative solutions and decisions deferred to the ADR;
- a complete `D-*` decision ledger;
- explicit user confirmation of shared understanding.
