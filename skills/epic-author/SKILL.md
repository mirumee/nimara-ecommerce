---
name: epic-author
description: Define and draft business epics inside an LLM-wiki product workspace. Use when the user wants to create, rewrite, refine, or stress-test an epic, initiative, feature brief, or epic hypothesis. Run a business-value-first, one-question-at-a-time grilling before drafting; stop at an approved epic and do not design the technical solution, decompose tasks, estimate, or export to Jira.
---

# Epic Author

Turn an initiative or feature idea into an explicit, falsifiable business bet that a human approves before solution design and task breakdown begin.

Follow these six stages in order. The business grilling and self-lint are mandatory.

## Stage 1 — Pull context and facts

Locate the wiki root containing `epics/`, `personas/`, and `strategy/`. Read:

- the current epic or seeding initiative;
- every relevant persona;
- market and strategy notes for the problem area;
- raw sources named by the user;
- related epics that could overlap.

Use repository or source exploration to answer factual questions. Treat sources as evidence, never edit them, and separate what they prove from what is merely inferred. Never invent demand, attribution, metrics, competitor claims, targets, or constraints.

Completion criterion: the known facts, evidence gaps, existing strategic position, and plausible overlap with other epics are identified before questioning the user.

## Stage 2 — Run business grilling

Read `references/business-grilling.md` and follow it completely.

Ask exactly one question per turn. Each question must:

1. resolve one business decision or challenge one vague value claim;
2. include a recommended answer and short rationale;
3. wait for the user's answer before advancing.

Keep the grilling at epic altitude: problem, evidence, target segment, business value, strategic role, outcomes, leading indicators, falsification, MVP learning, scope, rollout, ownership, and business constraints. Defer provider, API, package, schema, infrastructure, library, and architecture decisions to solution design unless a technical constraint changes the business bet itself.

If the user says a target does not matter, record that as an explicit decision rather than manufacturing precision. If the user stops the questions, summarize decisions and unresolved branches. Do not draft or edit the epic until the user confirms shared understanding; a new request to apply the summarized decisions after the grilling also counts as confirmation. The original request to "write an epic" does not bypass this gate.

Completion criterion: every branch in the business-grilling completion gate is answered, deliberately deferred with an owner and gate, or explicitly rejected by the user; the user has confirmed the shared understanding.

## Stage 3 — Draft the epic

Read `references/epic-template.md` and `references/example-epic.md`. Follow the wiki's local schema and link convention.

Draft in this order:

1. value hypothesis;
2. evidence and assumptions;
3. business goal and value path;
4. quantified business outcomes and leading indicators;
5. MVP and falsification;
6. business-level NFRs, scope, risks, and open questions;
7. user stories and acceptance criteria derived from the approved business behavior.

Rules:

- Give scope items `S-*`, stories `US-*`, criteria `AC-*`, risks `R-*`, and questions `Q-*` stable IDs.
- Mark unproven claims as `[ASSUMPTION]`; never convert a proxy or output into a business outcome.
- State the solution category and capability boundaries without freezing technical design.
- Write INVEST stories with persona, want, and benefit. Write Given/When/Then criteria mapped to stories.
- Keep technical choices out of stories and criteria. Put unresolved solution decisions in Open Questions with an owner and a `before <stage>` gate.
- Explain why every out-of-scope item is deferred and where it belongs.

Completion criterion: the document expresses the approved business bet without introducing decisions the user did not make.

## Stage 4 — Self-lint

Run every check in `references/quality-checklist.md`. Fix issues that require no new decision. Put genuine unknowns in Open Questions and report any failed checks rather than hiding them.

Completion criterion: every checklist item passes or is reported as an explicit, owned gap.

## Stage 5 — Bookkeeping

- Save as `epics/EPIC-NNN <Name>.md` using the next free ID, or preserve the ID when rewriting an existing epic.
- Update the wiki index and log when present.
- Add or update persona backlinks.
- Update all inbound links when renaming an epic.
- Preserve sources and downstream task artifacts; report stale downstream artifacts instead of silently rewriting them.

Completion criterion: the epic is navigable from the wiki and no changed link points to its old name.

## Stage 6 — Gate

New epics start as `draft`. A rewritten epic changes status only when the user explicitly approves the transition. Close with the file location, passed checks, open decisions, stale downstream artifacts, and proposed next lifecycle step.

## References

- `references/business-grilling.md` — mandatory sequential business interview and completion gate.
- `references/epic-template.md` — canonical epic structure.
- `references/quality-checklist.md` — Definition of Ready for review.
- `references/example-epic.md` — business-first quality bar.
