---
type: "ADR"
title: "ADR"
description: "One sentence — the decision and its status (e.g. \"Use RAG over fine-tuning for product discovery — Proposed\")."
tags:
  - "adr"
  - "topic"
created: "2026-06-16T00:00:00+00:00"
timestamp: "2026-06-16T00:00:00+00:00"
status: "Proposed"
---

<!--
  DERBY-style design ADR. A good ADR is self-contained: a reader who has never seen any
  other ADR must understand the problem, the chosen design, which alternatives were weighed,
  and WHY the others were rejected — all from this one file. Do not lean on sibling ADRs.

  STRUCTURE NOTE: DERBY uses H1 (#) for its main sections; this wiki uses H2 (##) so the note
  title stays in frontmatter and the ADR linter can parse sections. This H1→H2 mapping is a
  deliberate house-style adaptation of the DERBY template, not the DERBY template verbatim.

  Nimara guardrails layered onto DERBY (the wiki linter and reviewers check these):
  - Problem: opens with the **Base system:** line. Confirm the base system with the user
    before writing — see the prerequisite in [ADR MOC](tech/ADR/ADR%20MOC.md).
  - Alternative solutions: at least ONE real alternative besides the proposed one (a design
    that weighs no alternative is a press release, not a decision), each with pros/cons and
    an explicit "Rejected because …" tied to a requirement/driver.
  - Proposed solution: concrete technical shape — interface/DTO sketch, real monorepo paths,
    env schema, the Result<T, E> convention. No hand-waving.

  Keep prose tight. Do NOT paraphrase the epic/solution — link it and state only what this
  decision adds. If you catch yourself restating requirements, cut it.
-->

## Recommendation

<!--
  Fill this section only after the document reaches its Final state (status: Accepted).
  Leave the placeholder while status is Proposed.
-->

_Fill this section after the ADR is Final (status: `Accepted`)._

Implementation page: _link to the PR / task / implementation note, once it exists._

### Outcome

Briefly describe whether this was ever implemented and how it went.

## Problem

**Base system:** State which system this application, feature, or provider is built on
(e.g. Saleor, Algolia, or a greenfield app from scratch). This must be confirmed with the
user before the ADR is written — see the prerequisite in [ADR MOC](tech/ADR/ADR%20MOC.md).

Two to four sentences: the problem this design solves and why now. Link the driving epic,
solution, or task — do not re-describe its requirements here.

## Requirements

### Functional requirements

1. List the functional requirements the design must meet, each with a short description.

### Non-functional requirements

1. List the non-functional requirements the design must meet (e.g. performance,
   scalability, security, cost), each with a short description. These double as the
   **decision drivers** the alternatives are scored against below.

## Proposed solution

<!--
  The most critical and biggest part of the ADR. Describe the chosen design in enough detail
  that an implementer can start: diagrams, schemas, tables as needed. Divide into
  sub-sections when it aids clarity. This section IS the decision — name the chosen approach
  and justify it against the requirements above.

  Nimara concreteness bar: include an interface/DTO sketch (pseudo-TypeScript is fine), real
  monorepo paths (packages/domain/…, packages/infrastructure/<capability>/<provider>/, the
  consuming apps/<app>/src/… service), the env schema (NAMESPACED variable names + where they
  are Zod-validated), and the Result<T, E> convention for fallible operations.
-->

```ts
// interface / DTO sketch here
```

### Component changes

#### Existing components

List the existing components that must change, with a short description of how each changes
to satisfy the design (name real monorepo paths).

#### New components

List the new components to create, with a short description of each (name real monorepo
paths and the layer each belongs to).

### API changes

Describe API changes (internal or external). For small changes, a diff of the endpoint is
enough; for larger ones, show the definition (e.g. GraphQL SDL, OpenAPI). Note the
`Result<T, E>` shape returned by services/Server Actions.

### Database changes

Describe schema changes (new table, new field, new Saleor metadata key / attribute). Call
out whether each change is backward-compatible and the migration strategy. If there is no
database, say so and where state lives instead.

## Cross-cutting considerations

### Security

Changes that affect system security — e.g. storage of sensitive data, or a change to the
authentication/authorization mechanism.

### Monitoring and alerting

What needs monitoring and how, plus the rules that would trigger alerts in production.

### Failure cases and remediation

The expected failure scenarios and how each is resolved or degraded gracefully.

### Alternative solutions

<!--
  At least ONE real alternative besides the proposed design (a strawman nobody would pick
  does not count). One bullet per alternative: pros, cons, and a "Rejected because …" line
  naming the deciding requirement/driver. Together with the Proposed solution this is what
  makes the ADR a decision rather than a proposal for a single option.
-->

- **Alternative A** — one-line description.
  - Good, because … (requirement/driver).
  - Bad, because … (requirement/driver).
  - **Rejected because** … (the deciding requirement/driver).
- **Alternative B** — one-line description.
  - **Rejected because** … (the deciding requirement/driver).

### Dependencies

The dependencies this design relies on, with a short description of each. Per Nimara rules,
a NEW package dependency is proposed with alternatives and approved before use — never added
automatically.

### System Impacts

Impact on the system and external systems — e.g. the services affected and how.

### Documentation Changes

The documents that need changes, and how; note any new documents the design requires
(e.g. `apps/docs`, `.env.example`).

### QA Validation

Test scenarios that would validate the implemented solution, noting whether each can be
automated later (Vitest / Playwright).

### DevOps / Infrastructure

Infrastructure changes needed for the design to function (e.g. env/secrets, `turbo.json`
pass-through, Terraform, migrations).

## Related Notes

[ADR MOC](tech/ADR/ADR%20MOC.md)
Replace this line with a real epic, solution, or task link before use.
