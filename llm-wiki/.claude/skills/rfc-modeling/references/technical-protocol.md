# Technical Protocol

Use this protocol after an approach is chosen and before drafting or rewriting an RFC. Its purpose is to expose whether the chosen approach is a design that survives review, hand-waving dressed as architecture, or a design whose real cost sits in a concern nobody owns.

## Decision tree

Walk the branches in order because later decisions depend on earlier ones.

Keep every branch at solution altitude: architectural principles, boundaries, and the gotchas that could sink the design. A branch the design does not touch is closed with a recorded reason, never filled with plausible detail — an honestly empty concern beats an invented one.

### 1. Design problem and requirements

Establish:

- the design problem restated from the PRD as facts and forces, not as the solution;
- the functional requirements the design must meet;
- the non-functional requirements that constrain it, derived from the ranked decision drivers;
- which of the PRD's deferred technical decisions this RFC has to resolve;
- which statements about current behavior were verified in the repo and which are still assumed.

Do not re-open the business bet. If a technical finding actually breaks it, send it back to the PRD instead of grilling it here. A requirement the PRD does not carry is a new bet, not a design detail.

### 2. Base system and system of record

Establish:

- which existing system the design builds on, or whether it adds a new one;
- for each piece of data the design concerns, the authoritative source of truth;
- what is merely consulted, cached, or projected from that source;
- what the repo already provides versus what this design adds;
- which providers and layers are in play, and which of them stay swappable.

Look this up; do not guess it. A guessed source of truth invalidates every branch below it, and this is where the real decision usually hides.

### 3. Component changes

Decide:

- which new capability layers over which existing one;
- what becomes a new swappable boundary versus what is reused wholesale;
- how the pieces compose, respecting the module boundaries and the dependency direction that the repository defines;
- the scope in one or two sentences: the repo, the app or layers the change lands in, and the plan in a line;
- the new services or capabilities as roles and boundaries, grouped rather than split per part.

Reject a structure that violates the layer boundaries. Name the architectural roles, not folder paths, file names, or signatures — those are implementation, and they constrain the implementer without earning their place. Concrete placement is at most a one-line, non-binding suggestion.

### 4. API surface and contracts

Decide:

- the internal and external API changes, exposed through the service boundaries that the repository owns;
- the contract shape and who is allowed to call it;
- versioning and backward compatibility for existing callers;
- the error modes, expressed through the error contract that the repository already uses.

Do not let the raw schema become the contract. An operation that can fail without saying how it fails is not designed.

### 5. Data model, compatibility, and migration

Establish:

- the schema changes: new tables, fields, or indexes;
- backward compatibility for readers and writers already in production;
- whether the change can roll out incrementally, and in what order relative to the code;
- how to roll it back once data exists.

A migration without a rollback is a one-way door pretending to be a step. If the design persists nothing, say so and close the branch.

### 6. Trust boundaries and sensitive data

Establish:

- the trust boundary the design adds or moves;
- the sensitive data it stores, forwards, or logs, and where that data comes to rest;
- the authentication and authorization changes, including who may invoke the new surface;
- the failure modes that are unacceptable rather than merely bad.

Do not manufacture a threat model for a feature that stores nothing and adds no boundary. Name the real exposure or close the branch with the reason.

### 7. Failure modes, observability, and remediation

Establish:

- the failure scenarios that are expected rather than theoretical, and their user-visible effect;
- the fallback or degraded behavior for each;
- the signals worth acting on, and which of them deserve an alert;
- the remediation for every alert.

An alert with no remediation is a notification, and a metric nobody would act on is not observability. If the design introduces no failure mode of its own, say which existing behavior absorbs the failure.

### 8. Reversibility and blast radius

Establish:

- whether the change is a one-way door or easily undone;
- the seam that contains the **blast radius**.
- A **kill switch** should be discused.

This is a property of the proposal worth stating in one or two sentences, not a decision to grill to death. A seam that exists only in the RFC's prose is not a seam.

### 9. Dependencies, impacts, and delivery obligations

Identify:

- the actual new dependencies the design would add: a package, an external account, a service;
- the alternative to each one, presented as a recommendation rather than a settled choice;
- the services affected inside the repository and the impact on external systems;
- the documents that must change;
- the test scenarios that validate the design, scenarios only;
- the infrastructure changes required: configuration and secrets, infrastructure as code, the build and CI pipeline, network access.

Code that the team writes itself is not a dependency, and automatability is the QA team's call, not the RFC's. Leave approval to the ADR: never write "pending approval" into the design, and never pad this branch to make it look substantial.
