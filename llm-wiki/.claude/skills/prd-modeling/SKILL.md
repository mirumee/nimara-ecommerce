---
name: prd-modeling
description: Use when creating, rewriting, refining, or stress-testing a Product Requirements Document (PRD), including turning an initiative or feature brief into product requirements.
---

# PRD Modeling

Turn an initiative or feature idea into an explicit, falsifiable Product Requirements Document that a human approves before solution design and task breakdown begin.

Follow these stages in order. The business grilling and self-lint are mandatory.

## Stage 1 — Pull context and facts

Locate the `/llm-wiki` root which should contain

- the current PRD or seeding initiative;
- relevant personas;
- market and strategy notes for the problem area;
- raw sources named by the user;
- related PRDs that could overlap.

Use repository or source exploration to answer factual questions. Treat sources as evidence, never edit them, and separate what they prove from what is merely inferred. Never invent demand, attribution, metrics, competitor claims, targets, or constraints.

Completion criterion: the known facts, evidence gaps, existing strategic position, and plausible overlap with other PRDs are identified before questioning the user.

## Stage 2 — Run business grilling - use proper languages

Run a `/llm-wiki:grilling` session that which does not go beyond the scope of the PRD definition.

If a problem is complex use `/llm-wiki:show-me` skill so that the questions are easy for the user to understand

Read `references/business-protocol.md` and follow it completely.

Adjust your language so that it is as easy to understand as possible for the person you're grilling.

### Completion gate

The grilling is complete only when the shared understanding contains:

- a specific target segment and personas;
- a problem statement with evidence separated from assumptions;
- the PRD's strategic role and urgency;
- one primary business outcome and its value path;
- quantified validation evidence or an explicitly accepted lack of a target;
- leading indicators distinct from business outcomes;
- a negative falsification result and treatment of insufficient evidence;
- the smallest learning MVP, rollout, and appetite decision;
- explicit in-scope and out-of-scope boundaries;
- business NFRs, ownership, risks, and lifecycle gate;
- a list of technical decisions deferred to solution design;
- explicit user confirmation of shared understanding.

## Stage 3 — Draft the PRD

Read `references/prd-template.md`. Follow the schema and link convention.

## Stage 4 — Self-lint

Run every check in `references/quality-checklist.md`. Fix issues that require no new decision. Put genuine unknowns in Open Questions and report any failed checks rather than hiding them.

Completion criterion: every checklist item passes or is reported as an explicit, owned gap.

## Stage 5 — Gate

New PRDs start as `draft`. A rewritten PRD changes status only when the user explicitly approves the transition. Close with the PRD file location, passed checks, open decisions, stale downstream artifacts, and proposed next lifecycle step.

## References

- `references/business-protocol.md` — mandatory sequential business interview and completion gate.
- `references/prd-template.md` — canonical PRD structure.
- `references/quality-checklist.md` — Definition of Ready for review.
