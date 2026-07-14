---
type: "Template"
title: "Solution Grilling Log Template"
description: "Reusable template for recording the technical decisions, recommendations, answers, and rejected options produced while grilling toward an ADR in solution design."
tags:
  - "template"
  - "solution"
  - "grilling"
  - "decision-log"
created: "2026-07-13T00:00:00+00:00"
timestamp: "2026-07-13T00:00:00+00:00"
template_for: "Solution Grilling Log"
---

# <Epic Name> — Solution Grilling Log

## Purpose

This is a durable record of the user-visible technical grilling that shaped the solution
design and the resulting ADR(s). It records questions, recommendations, answers, decisions,
and rejected options; it is not a raw transcript or a hidden reasoning trace. It is produced
by the `solution-author` skill and pairs with the epic's business grilling log.

## Session 1 — YYYY-MM-DD

### Session Context

- Epic: [EPIC-NNN Epic Name](product/epics/EPIC-NNN%20Epic%20Name.md)
- Trigger: which decision(s) forced this solution-design session
- Base system: the confirmed system this is built on (the ADR gate)
- Starting facts: reference notes, existing ADRs, and code read before grilling
- Facilitator: `solution-author`
- Outcome: `in-progress | stopped | shared-understanding-confirmed | applied`

### Decision Drivers

List the criteria the options were judged on, ranked, with the two or three that dominated
this decision marked. These become the ADR's **Requirements** (functional + non-functional).

### Decision Log

| ID    | Decision branch    | Question | Recommendation | User answer | Resulting decision |
| :---- | :----------------- | :------- | :------------- | :---------- | :----------------- |
| D-001 | Base system        | …        | …              | …           | …                  |
| D-002 | Drivers            | …        | …              | …           | …                  |
| D-003 | Options            | …        | …              | …           | …                  |

### Considered Options and Why Rejected

The chosen option becomes the ADR's **Proposed solution**; each rejected option becomes an
entry under the ADR's **Cross-cutting considerations → Alternative solutions**.

- **Option A** — chosen / rejected because … (deciding driver)
- **Option B** — rejected because … (deciding driver)
- **Option C** — rejected because … (deciding driver)

### Deferred to Implementation

- Detail deferred to a later PR/ADR — why it does not change this decision — owner — gate

### Unresolved Sub-Decisions

- U-1: unresolved sub-decision — owner — must be answered before `<stage>`

### Chosen Architecture

Summarize the confirmed base system, chosen option, interface/data/env shape, cross-cutting
NFR posture, and reversibility judgement — the raw material for the DERBY ADR's Proposed
solution and Cross-cutting considerations.

### Resulting ADR(s)

- [ADR-NNNN Title](tech/ADR/ADR-NNNN%20Title.md) — status

## Related Notes

[EPIC-NNN Epic Name](product/epics/EPIC-NNN%20Epic%20Name.md)
[ADR MOC](tech/ADR/ADR%20MOC.md)
