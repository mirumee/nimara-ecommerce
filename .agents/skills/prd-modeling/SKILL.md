---
name: prd-modeling
description: Define and draft Product Requirements Documents (PRDs) inside an LLM-wiki product workspace. Use when the user wants to create, rewrite, refine, or stress-test a PRD or Product Requirements Document, or turn an initiative or feature brief into product requirements. Run a business-value-first, one-question-at-a-time grilling, capture confirmed decisions in the PRD, and stop at an approved PRD without designing the technical solution, decomposing tasks, estimating.
---

# PRD Author

Turn an initiative or feature idea into an explicit, falsifiable Product Requirements Document that a human approves before solution design and task breakdown begin.

Follow these seven stages in order. The business grilling and self-lint are mandatory.

## Stage 1 — Pull context and facts

Locate the `/llm-wiki` root which should contain

- the current PRD or seeding initiative;
- relevant personas;
- market and strategy notes for the problem area;
- raw sources named by the user;
- related PRDs that could overlap.

Use repository or source exploration to answer factual questions. Treat sources as evidence, never edit them, and separate what they prove from what is merely inferred. Never invent demand, attribution, metrics, competitor claims, targets, or constraints.

Completion criterion: the known facts, evidence gaps, existing strategic position, and plausible overlap with other PRDs are identified before questioning the user.

## Stage 2 — Run business grilling

Run a `/grilling` session that which does not go beyond the scope of the PRD definition.

Read `references/business-protocol.md` and follow it completely.

If the user says a target does not matter, record that as an explicit decision rather than manufacturing precision. If the user stops the questions, summarize decisions and unresolved branches. Do not draft or edit the PRD until the user confirms shared understanding; a new request to apply the summarized decisions after the grilling also counts as confirmation. The original request to "write a PRD" does not bypass this gate.

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

Read `references/prd-template.md`. Follow the wiki's local schema and link convention.

## Stage 4 — Self-lint

Run every check in `references/quality-checklist.md`. Fix issues that require no new decision. Put genuine unknowns in Open Questions and report any failed checks rather than hiding them.

Completion criterion: every checklist item passes or is reported as an explicit, owned gap.

## Stage 5 — Bookkeeping

- Save as `llm-wiki/prd/PRD-NNN <Name>.md` using the next free ID, or preserve the ID when rewriting an existing PRD.
- Update the wiki index and log when present.
- Update all inbound links when renaming a PRD.
- Represent confirmed user-visible decisions in the PRD without hidden reasoning. Summarize confidential evidence without copying source bodies, secrets, personal data, or unnecessary verbatim conversation.
- Preserve sources and downstream task artifacts; report stale downstream artifacts instead of silently rewriting them.

Completion criterion: the PRD is mutually linked and navigable from the wiki; every grilling decision is represented once; no changed link points to an old name.

## Stage 6 — Gate

New PRDs start as `draft`. A rewritten PRD changes status only when the user explicitly approves the transition. Close with the PRD file location, passed checks, open decisions, stale downstream artifacts, and proposed next lifecycle step.

## Stage 7 — Handoff

Use `/handoff` skill to write up a conversation summary for future agents. Save it near PRD.

## References

- `references/business-protocol.md` — mandatory sequential business interview and completion gate.
- `references/prd-template.md` — canonical PRD structure.
- `references/quality-checklist.md` — Definition of Ready for review.
