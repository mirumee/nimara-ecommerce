---
name: rfc-modeling
description: Use when designing, drafting, refining, or stress-testing an RFC for an approved PRD, including requests for a design doc, solution design, or how to build it.
---

# RFC modeling

Follow these stages in order. The technical grilling, and the self-lint are mandatory.

## Altitude: a proposal, not an implementation plan

An RFC proposes a solution. **It is not an implementation plan**.

Describe the shape of the solution:

- the architectural principles that hold the design up: what layers over what, which boundaries are swappable, and the dependency direction.
- the key decisions.
- the implementation gotchas and the risks that can sink the design.

Do not specify exact package or folder paths, file or function names, type signatures, or line-level structure. Those belong in implementation tickets and pull requests. Package placement can appear once, as a one-line suggestion that does not bind the implementer.

If a detail is doubtful, ask one question: does a reviewer need this detail to judge the approach? If the answer is no, the detail sits too low. It constrains the implementer and it earns nothing.

## Stage 1 - Resolve the PRD and pull context

An RFC is always anchored to one PRD. Resolve it first.

- If the user named a PRD, load it.
- If the user named no PRD, list the PRDs under `llm-wiki/prd/` and ask the user to pick one. Do not invent a PRD. Do not design against a loose feature idea, because an RFC without a PRD has nothing to be falsified against.

Then read the following, before you question the user:

- the PRD, and especially its business bet, its deferred technical decisions, and its open questions.
- the relevant personas, strategy notes, and market notes.
- the existing ADRs and RFCs that overlap or constrain this design.
- the code and the infrastructure the design touches: packages, layers, services, schema, and config.

Use repository and source exploration to answer factual questions. Facts belong to exploration. Decisions belong to the user. Never invent a constraint, a current behavior, or a capability.

Completion criterion: the PRD is fixed, the deferred technical branches are collected, and you understand the affected code and infrastructure before research begins.

## Stage 2 - Run technical grilling - use proper languages

Run a `/llm-wiki:grilling` session that which does not go beyond the scope of the RFC definition.

If a problem is complex use `/llm-wiki:show-me` skill so that the questions are easy for the user to understand. A diagram with a description settles a structural question faster than a paragraph.

Read `references/technical-protocol.md` and follow it completely.

Adjust your language so that it is as easy to understand as possible for the person you're grilling.

## Stage 3 — Draft the RFC

Read `references/rfc-template.md`. Follow the wiki's local schema and link convention.

## Stage 4 - Self-lint

Run every check in `references/quality-checklist.md`. Fix the issues that need no new decision. Put the genuine unknowns in the deferred items. Report every failed check instead of hiding it.

Completion criterion: every checklist item passes, or it is reported as an explicit gap with an owner.

## Stage 5 - Gate

A new RFC starts as `status: draft`. A rewritten RFC changes status only when the user approves the transition explicitly: `draft` to `in_review` to `final`.

## References

- `references/technical-protocol.md` - the mandatory sequential design interview and its completion gate.
- `references/quality-checklist.md` - the Definition of Ready for an RFC.
- `references/rfc-template.md` the canonical RFC template structure.
