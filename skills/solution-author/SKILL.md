---
name: solution-author
description: Drive a technical solution-design decision to a recorded ADR inside an LLM-wiki. Use when moving from an approved epic to an architecture decision — choosing a provider, datastore, protocol, service boundary, or cross-cutting pattern — or when the user says "help me decide X", "we don't know which approach yet", "which option is best", or "write an ADR but I haven't decided". Runs an architecture-altitude, one-question-at-a-time grilling toward a chosen option, preserves the decision trail as a solution grilling log, then writes a MADR-style ADR. Pairs with epic-author (business grilling) upstream and wiki-maintenance (ADR filing) for bookkeeping. Stops at an approved ADR; does not write code, decompose tasks, or estimate.
---

# Solution Author

Turn an open technical question into a **recorded, hard-to-reverse decision** a human approves — an ADR that states which option won, why the alternatives lost, and enough of the technical shape that an implementer can start.

This is the phase *after* the business bet is settled (`epic-author`) and *before* code. Its single most important job is to **not let the decision stay a proposal for one option**: a good ADR weighs at least two real options against explicit drivers and says why each rejected one lost.

Follow these six stages in order. The technical grilling and self-lint are mandatory.

## Operating principles

1. **A decision, not a description.** The user often arrives having half-picked an option. Acknowledge it, then force the alternatives onto the table and grill the trade-offs. An ADR with one option is a press release.
2. **Confirm the base system first — it is a hard gate.** Before any other question, confirm which system this is built on (Saleor, Algolia, a greenfield service, a SaaS, …). Never guess it; it anchors every driver and constraint. This is the wiki's ADR prerequisite (`llm-wiki/AGENTS.md`, `tech/ADR/ADR MOC.md`).
3. **Facts are looked up; decisions belong to the user.** Read the epic, the code, and the existing notes before asking. Don't put a discoverable fact to the user as a question.
4. **Architecture altitude, not line-level code.** Decide provider/datastore/protocol/boundary/pattern and the interface + data shape. Defer function names, test structure, and library minutiae that don't change the decision to implementation — but record them as deferred.
5. **Self-contained ADR.** Rejected options and their reasons live inside the one file. Do not cross-link sibling ADRs as each other's "alternatives".
6. **Stop at the ADR.** No code, no task breakdown, no estimates.

## Stage 1 — Pull context and facts

Locate the wiki root (`tech/ADR/`, `product/epics/`, `product/solution/`, `tech/`). Read:

- the driving epic and its grilling log (the business bet and its **Open Questions** — these seed the candidate options);
- relevant reference notes for the base system (`tech/saleor/`, `tech/nimara/`) so constraints and capabilities are real, not guessed;
- **both** ADR registers so you don't miss precedent or a numbering clash: the wiki register in [ADR MOC](../../llm-wiki/tech/ADR/ADR%20MOC.md) *and* the code-docs register under `apps/docs/adr/`;
- the layer/boundary rules in `.agents/skills/project-guidelines/SKILL.md` and the swappable-provider convention in `apps/docs/adr/0001-integration-provider-architecture.md`;
- any code the decision touches (`packages/infrastructure/<capability>/`, `packages/domain/`, the consuming `apps/*/src/services/`).

Completion criterion: the exact decision(s) to make, the candidate options, the real constraints of the base system, and any precedent ADR are identified before questioning the user.

## Stage 2 — Confirm the base system (gate)

Ask the base-system question **first**, as a single grilling turn with a recommendation. Record the confirmed answer verbatim — it becomes the **Base system** line in the ADR Context and frames every driver. Do not proceed until it is confirmed.

## Stage 3 — Run technical grilling

Read `references/technical-grilling.md` and follow it completely.

Maintain an in-memory ledger: for every question capture its `D-*` ID, decision branch, user-visible question, recommendation, user answer, and resulting decision. Also capture rejected options (with the deciding driver), decisions deferred to implementation, and unresolved sub-decisions with an owner and gate. Do not write the wiki log before the shared-understanding gate.

Ask exactly one question per turn. Each question must:

1. resolve one technical decision or force one option's trade-off into the open;
2. include a recommended answer and a short rationale tied to a driver;
3. wait for the user's answer before advancing.

Keep it at architecture altitude: base system, decision drivers, candidate options, per-option rejection reasons, layer/boundary fit, interface and data shape (enough to fill Implementation Notes), cross-cutting NFRs (performance on hot paths, security/authz, data lifecycle/GDPR, observability, failure/degradation), reversibility and blast radius, and status. Defer line-level implementation to the build phase unless it changes the decision.

If the user stops the questions, summarize the chosen direction, rejected options, and unresolved sub-decisions, and make no edits. The original request does not bypass the shared-understanding gate.

Completion criterion: base system confirmed; drivers agreed; at least two real options on the table with one chosen and every rejected option carrying a driver-tied reason; interface/data/env shape sufficient for concrete Implementation Notes; NFRs and reversibility covered; the user has confirmed the shared understanding.

## Stage 4 — Draft the ADR

Copy `_templates/ADR.md` (MADR-style) into `tech/ADR/` as `ADR-NNNN <Title>.md` — next free zero-padded number from the wiki register. Obey the ADR quality bar in `llm-wiki/AGENTS.md`. Fill in this order:

1. **Context and Problem Statement** — Base system line + a short problem (2–4 sentences). Link the epic; do not paraphrase its requirements.
2. **Decision Drivers** — the criteria from the grilling, stated once.
3. **Considered Options** — the real candidates (≥2).
4. **Decision Outcome** — the chosen option, justified against the drivers ("We will …"). If not final, "Recommended, pending <what resolves it>".
5. **Pros and Cons of the Options** — each option scored against the drivers; every rejected option has a "Rejected because" line naming the deciding driver.
6. **Implementation Notes** — concrete: interface/DTO sketch (pseudo-TS), storage mapping, real monorepo paths, env schema (variable names + Zod validation), the `Result<T, E>` convention, and what to build first.
7. **Consequences** — positive/negative/neutral of the chosen option.

Completion criterion: the ADR expresses the approved decision and its rejected alternatives, and stands alone without reference to other ADRs.

## Stage 5 — Self-lint

Run the mechanical linter first: `pnpm wiki:adr:lint "<path to the new ADR>"` (or
`node scripts/wiki-adr-lint.mjs "<path>"`). Fix every ERROR it reports before continuing.
Then run every check in `references/quality-checklist.md` — the manual checks catch what the
regex cannot (are the drivers real, is each rejection reason honest). Fix what needs no new
decision; put genuine unknowns in an owned open sub-decision and report failed checks rather
than hiding them. `references/example-adr.md` is the quality bar.

## Stage 6 — Bookkeeping and gate

- **Register** the ADR in [ADR MOC](../../llm-wiki/tech/ADR/ADR%20MOC.md) (one line) in the same change. If the chosen number could collide with the code-docs register, note the relationship rather than silently reusing a number.
- **Solution grilling log:** create or append `product/solution/<Epic Name>/Solution Grilling Log.md` from `_templates/solution-grilling-log.md`. Record the user-visible decision trail (`D-*`), rejected options, deferred-to-implementation items, and unresolved sub-decisions — not hidden reasoning or secrets. Continue the `D-*` sequence across sessions.
- **Link both ways** — ADR ↔ epic ↔ solution log — and update `index.md` and append one line to `log.md` (`## [YYYY-MM-DD] adr | ADR-NNNN <Title>`).
- **Status gate:** the ADR starts `Proposed`. It becomes `Accepted` only on the user's explicit approval. Accepted ADRs are immutable — supersede, never rewrite.
- Close with the ADR and log file locations, passed checks, unresolved sub-decisions, and the proposed next step (implementation).

## References

- `references/technical-grilling.md` — the mandatory architecture-altitude interview and its completion gate.
- `references/quality-checklist.md` — Definition of Ready for an ADR.
- `references/example-adr.md` — a worked MADR ADR that sets the quality bar.
- `_templates/ADR.md` and `_templates/solution-grilling-log.md` in the target wiki — canonical structures; do not duplicate them inside the skill.
