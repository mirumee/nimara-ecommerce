---
name: epic-author
description: Draft complete, high-quality project epics inside an LLM-wiki product workspace (a markdown/Obsidian wiki with epics/, personas/, strategy/ folders). Use this skill whenever the user asks to create, draft, or write an epic, turn an initiative, idea, or feature brief into an epic, or wants a feature specification with business goal, scope, user stories and acceptance criteria — even if they never say the word "epic". Epic authoring only — do not decompose into tasks, estimate, or export to Jira.
---

# Epic Author

Turn an initiative, idea, or brief into one complete epic document in the product wiki. The epic is the contract a human approves before any downstream work (solution design, task breakdown) starts — so its job is to make the bet explicit: what we believe, how we'll know we were right, and what would make us stop.

Work through the six stages below in order. The interview and the self-lint are the two stages that most improve quality — don't skip them.

## Stage 1 — Context pull

Locate the wiki root: the folder containing `epics/` (usually alongside `personas/`, `strategy/`, `market/`). If no such folder is evident, ask the user where the wiki lives.

Read before writing, so the epic is grounded in what the team already knows:

- the initiative or strategy note that seeds this epic, if one exists
- the persona notes for every persona the epic will serve
- market/strategy notes that mention the feature area
- any raw sources the user points at (briefs, transcripts, agency recommendations)

Treat sources as ground truth you may quote, never edit. Anything the sources don't answer is a candidate for the interview or an open question — never invent facts, metrics, competitor claims, or constraints. A fabricated number in an epic silently becomes a commitment.

## Stage 2 — Interview

Ask the user one round of at most 7 targeted questions — only the ones the sources didn't answer. Prioritize, in this order:

1. **Success metrics** — how will we measure that this worked, with what target?
2. **Kill criteria** — what evidence would make us stop or pivot? (falsification)
3. **Scope edges** — the 2–3 most ambiguous inclusion/exclusion calls you found
4. **Out of scope** — what is deliberately deferred, and where does it go (fast-follow vs. separate epic)?
5. **Appetite** — how much are we willing to spend on this (time/team), Shape Up style, if the user thinks in those terms

If the user is unavailable or answers "don't know", don't block and don't guess: record the question verbatim in Open Questions with an owner and the stage it must be answered before.

## Stage 3 — Draft

Write the epic using `references/epic-template.md` for structure and `references/example-epic.md` as the quality bar — read both first. Conventions that matter:

- **IDs everywhere**: scope items `S-1…`, stories `US-1…`, criteria `AC-1…`. Downstream artifacts (tasks, QA coverage) will reference these IDs, so they must be stable and unique within the epic.
- **Stories follow INVEST** and always carry persona, want, and benefit ("As a …, I want …, so that …"). A story without a benefit clause is a task in disguise.
- **Acceptance criteria are Given/When/Then** and each maps to a story: `AC-3 (US-2): Given … when … then …`. Every story needs at least one AC.
- **Value hypothesis** fills all seven slots (For / who / the / is a / that / unlike / our solution). If you can't fill "unlike", the differentiation is unclear — flag it.
- **Success metrics are a first-class section**, not open questions. Each metric: name, target, where it's measured. If targets are genuinely undecided, list the metric with the target as an open question — but never invent a number.
- **Out of scope items say why** and where the deferred thing goes. This is the Shape Up "no-gos" idea: explicit non-goals prevent scope creep more than any process.
- Personas are wikilinks (`[[Shopper]]`) that resolve to real persona notes.

## Stage 4 — Self-lint

Before showing the draft, run every check in `references/quality-checklist.md`. Fix what you can fix without new information; anything needing a human decision goes to Open Questions. Report unfixed items to the user rather than hiding them.

## Stage 5 — Bookkeeping

File the epic so the wiki stays navigable:

- Save as `epics/EPIC-NNN <Name>.md` using the next free number (scan existing epics).
- If `index.md` exists at the wiki root, add the epic with status and a one-liner. If `log.md` exists, append an entry (`## [YYYY-MM-DD] epic-draft | EPIC-NNN <Name>`). If neither exists, offer to create them — don't create unasked.
- Add a back-reference in each persona note this epic serves (one line under Related Notes / relevant section), so the graph links both ways.

## Stage 6 — Gate

The epic is born with `status: draft`. Propose the transition to `analyzing` (or whatever the wiki's lifecycle uses) — the transition itself is the human's call, never yours. State the proposal in your closing summary (and in `log.md` if the wiki keeps one).

Close by telling the user, briefly: where the epic was filed, which checks passed, what remains open, and the proposed next step.

## References

- `references/epic-template.md` — the epic structure; copy it, don't reinvent it
- `references/quality-checklist.md` — the self-lint checks for Stage 4
- `references/example-epic.md` — a real epic at the expected quality bar
