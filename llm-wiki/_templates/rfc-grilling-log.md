---
type: "Template"
title: "RFC Grilling Log Template"
description: "Reusable template for recording the technical decisions, recommendations, answers, and rejected options produced while grilling toward an RFC proposal."
tags:
  - "template"
  - "rfc"
  - "grilling"
  - "decision-log"
created: "2026-07-17T00:00:00+00:00"
timestamp: "2026-07-17T00:00:00+00:00"
template_for: "RFC Grilling Log"
---

# <RFC-NNNN Title> — Grilling Log

## Purpose

Durable record of the user-visible technical grilling that shaped this RFC. It captures questions, recommendations, answers, decisions, and rejected options — not a raw transcript or a hidden reasoning trace. Produced by the `rfc-modeling` skill; it lives beside its RFC in `tech/RFC/<PRD Name>/` and, downstream, feeds the ADR that accepts or rejects the RFC.

## Session 1 — YYYY-MM-DD

### Session Context

- PRD: [PRD-NNN PRD Name](prd/PRD-NNN%20PRD%20Name.md)
- Trigger: which decision(s) forced this RFC session
- Base system / system of record: the confirmed system this builds on, and what is authoritative vs merely consulted
- Starting facts: research findings, reference notes, existing RFCs/ADRs, and code read before grilling
- Facilitator: `rfc-modeling`
- Outcome: `in-progress | stopped | shared-understanding-confirmed`

### Decision Drivers

The criteria the approaches were judged on, ranked, with the two or three that dominated marked. These trace to the PRD's outcomes and NFRs.

### Decision Log

| ID    | Branch | Question | Recommendation | User answer | Resulting decision |
| :---- | :----- | :------- | :------------- | :---------- | :----------------- |
| D-001 | …      | …        | …              | …           | …                  |

### Chosen Approach and Rejected Alternatives

The chosen approach becomes the RFC's Proposed solution; rejected approaches become Alternative solutions (or their own RFCs, cross-linked).

- **Approach A** — chosen / rejected because … (deciding driver)
- **Approach B** — rejected because … (deciding driver)

### Deferred to Implementation

- Detail deferred to a later PR/ADR — why it does not change this proposal — owner — gate

### Open / Deferred Decisions

- U-1: unresolved item — owner — must be answered before `<stage>`

### Reversibility

One or two sentences: is the design a one-way door or easily reversed, and what seam contains the blast radius.

### For the ADR

Questions this RFC does not answer, because they decide acceptance (owned by the resolving ADR).

## Related Notes

[RFC-NNNN Title](tech/RFC/<PRD%20Name>/RFC-NNNN%20Title.md)
[PRD-NNN PRD Name](prd/PRD-NNN%20PRD%20Name.md)
[RFC MOC](tech/RFC/RFC%20MOC.md)
