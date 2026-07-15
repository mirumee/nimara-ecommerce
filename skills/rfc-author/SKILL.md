---
name: rfc-author
description: Turn an approved PRD into an RFC design proposal inside the LLM-wiki. Use when the user wants to design, draft, refine, or stress-test the technical solution for a PRD — an RFC, design doc, solution design, or "how do we build this". Deep-research the solution space, propose approaches, run a technical grilling one question at a time, and file an RFC that stops at a proposal — it does not make the decision (an ADR does) or write code.
---

# RFC Author

Turn an approved PRD into an explicit, reviewable **RFC** — a technical design _proposal_ for a non-trivial change. An RFC proposes; it does not decide. The verdict and outcome are captured later in an [ADR](../../llm-wiki/tech/RFC/RFC%20MOC.md). Stop at a filed proposal; do not implement.

Follow these seven stages in order. The deep research, the technical grilling, and the self-lint are mandatory.

## Altitude — a proposal, not an implementation plan

An RFC is a _solution proposal_, not an implementation plan. Describe the **shape** of the solution: the load-bearing architectural principles (what layers over what, which boundaries are swappable, the dependency direction), the key decisions, and the important implementation gotchas and risks that could sink the design. Do **not** specify exact package or folder paths, file or function names, type signatures, or line-level structure — that belongs in implementation tickets and PRs. Concrete package placement may appear at most as a one-line, non-binding suggestion. When in doubt, ask "does a reviewer need this to judge the approach?" — if not, it is too low, and it constrains the implementer without earning its place.

## Stage 1 — Resolve the PRD and pull context

An RFC is always anchored to one PRD. Resolve it before anything else.

- If the user named a PRD, load it.
- If they did not, list the PRDs under `llm-wiki/product/prds/` and make the user pick one. Do not invent a PRD, and do not design against a loose feature idea — an RFC without a PRD has nothing to be falsified against.

Then read, before questioning the user:

- the PRD and its grilling log (the business bet, deferred technical branches, open questions);
- relevant personas, strategy, and market notes;
- existing ADRs and RFCs that overlap or constrain this design;
- the actual code and infrastructure the design touches — packages, layers, services, schema, config.

Use repository and source exploration to answer factual questions. Facts belong to exploration; decisions belong to the user. Never invent constraints, current behavior, or capabilities.

Completion criterion: the PRD is fixed, the deferred technical branches are collected, and the affected code/infra surface is understood before research begins.

## Stage 2 — Deep research and propose approaches

Read `references/research-brief.md` and follow it.

Spin up a **background research agent** (see the `research` pattern) so the main thread stays responsive. Investigate the solution space against **primary sources** — official docs, source code, specs, first-party APIs — not secondary write-ups. Follow every claim back to the source that owns it.

Return **2–3 candidate approaches**, each with: what it is, how it maps onto Nimara's layers, trade-offs, cost/complexity, and risks. Keep every approach **OSS provider-agnostic** — layer over existing provider abstractions; never mandate a vendor or lock the design to one SaaS.

Then let the user choose the direction:

- The user generally picks the approach before the grilling starts.
- If research (or the grilling) shows only one approach is viable, present that one with its reasoning and confirm it — do not manufacture a fake choice.
- Rejected approaches are not discarded: they become the RFC's Alternative solutions, and any that deserves its own full design is flagged as a separate RFC.

Completion criterion: one approach is chosen (or the single viable approach is confirmed), and the rejected alternatives with reasons are recorded.

## Stage 3 — Run the technical grilling

Read `references/technical-grilling.md` and follow it completely.

Maintain an in-memory ledger as the grilling proceeds: for every question capture a `D-*` ID, the design branch, the question, the recommendation, the user's answer, and the resulting decision. Also capture rejected options, deferred decisions with an owner and gate, and any decision that belongs in the resolving ADR rather than the RFC.

Ask exactly one question per turn. Each question must:

1. resolve one design decision or challenge one hand-wavy technical claim;
2. include a recommended answer and short rationale;
3. wait for the user's answer before advancing.

Keep the grilling at **solution altitude** (see Altitude above): architectural principles, boundaries, and gotchas — not exact package/folder paths, file or function names, or signatures. Cover component changes as roles and boundaries, API surface (exposed through infrastructure use-cases and services, not the raw Saleor schema), data model and migration, security, monitoring and alerting, failure cases and remediation, dependencies, system impacts, documentation, QA validation, and DevOps/infrastructure. Do not re-litigate the business bet — that was settled in the PRD. Do not decide acceptance — that is the ADR.

If the user says a concern does not apply, record that as an explicit decision rather than inventing detail. If the user stops the questions, summarize decisions and unresolved branches and make no edits. Do not draft the RFC until the user confirms shared understanding; the original request to "write an RFC" does not bypass this gate.

Completion criterion: every branch in the technical-grilling completion gate is answered, deliberately deferred with an owner and gate, or explicitly rejected; the user has confirmed shared understanding.

## Stage 4 — Draft the RFC

Read the wiki template at `llm-wiki/_templates/RFC.md` and follow the wiki's local OKF schema and link convention. Do not duplicate the template inside this skill.

Draft in this order:

1. Problem (from the PRD, restated as the design problem — facts and forces, not the solution);
2. Requirements (functional and non-functional, derived from the PRD's outcomes and NFRs);
3. Proposed solution (the chosen approach: component changes, API changes, database changes);
4. Cross-cutting considerations (security, monitoring, failure cases, alternatives, dependencies, system impacts, docs, QA, DevOps).

Rules:

- Keep the draft at solution altitude (see Altitude): principles, boundaries, decisions, and gotchas — not exact package/folder paths, file/function names, or signatures. Package placement is at most a one-line, non-binding suggestion.
- Put the rejected approaches under Alternative solutions with pros, cons, and why not chosen; cross-link any that becomes its own RFC.
- Keep the design provider-agnostic and route API/data changes through services, not the raw Saleor schema.
- Never add a package dependency in the design without flagging it under Dependencies for explicit approval.
- Leave genuinely unresolved decisions as deferred items with an owner and a gate — do not fabricate a resolution.

Completion criterion: the RFC expresses the chosen proposal and its alternatives without introducing decisions the user did not make, and without recording a verdict.

## Stage 5 — Self-lint

Run every check in `references/quality-checklist.md`. Fix issues that require no new decision. Put genuine unknowns in deferred items and report any failed checks rather than hiding them.

Completion criterion: every checklist item passes or is reported as an explicit, owned gap.

## Stage 6 — Bookkeeping

- Save as `llm-wiki/tech/RFC/RFC-NNNN <Title>.md` using the next free ID from the RFC register; preserve the ID when rewriting an existing RFC.
- Register the RFC in `llm-wiki/tech/RFC/RFC MOC.md`, and link the PRD it serves.
- Link the PRD and the RFC in both directions (PRD Related Notes ↔ RFC).
- Update `llm-wiki/index.md` and append to `llm-wiki/log.md`.
- Preserve sources and downstream artifacts; report stale ones rather than silently rewriting them.

Completion criterion: the RFC and its PRD are mutually linked and navigable from the wiki; the RFC is in the register; no changed link points to an old name.

## Stage 7 — Gate

New RFCs start as `status: Draft`. A rewritten RFC changes status only when the user explicitly approves the transition (Draft → In Review → Final). Close with the file location, passed checks, open decisions, rejected alternatives, and the proposed next step: an ADR that accepts or rejects this RFC and links back to it.

## References

- `references/research-brief.md` — how to run the deep research and the shape of the approach comparison.
- `references/technical-grilling.md` — mandatory sequential design interview and completion gate.
- `references/quality-checklist.md` — RFC Definition of Ready.
- `llm-wiki/_templates/RFC.md` in the target wiki — canonical RFC structure; do not duplicate it inside the skill.
