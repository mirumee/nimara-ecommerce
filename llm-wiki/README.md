---
type: "Agent Instructions"
title: "Branch-aware, git-versioned LLM Wiki"
description: "What is and what is not llm-wiki for this project. Schemas, templates, rules, knowledge model and operations"
tags:
  - "agents"
  - "llm-wiki"
  - "schema"
  - "rules"
created: "2026-07-09T00:00:00+00:00"
---

# Content

This directory is an interlinked knowledge base for planning, testing, and building this project.
It follows the llm-wiki shape: a directory of Markdown files with YAML frontmatter, standard Markdown cross-links, reserved `index.md` files for progressive disclosure, and reserved `log.md` files for chronological updates.

## Source of truth

- The wiki view is the complete `llm-wiki/` tree at one exact Git commit.
- `main` is the canonical development branch.
- A branch name is a movable alias. Where a record anchors code at all, it resolves that alias
  to a release tag or an exact 40-character commit SHA.
- Current-state records — CAP, FLOW, INT, OPS — carry no `Provenance` section and no commit
  permalinks. They describe what is true at the commit that contains them, so a permalink inside
  one is a second, separately rotting copy of that answer. Implementation evidence belongs to IMP.
- A `vX.Y.Z` tag is the immutable release snapshot.
- There are no per-branch directories. Git already versions branch-specific state.
- When a note last changed comes from Git — `git log -1 --format=%cs -- <path>`
- A record's identity is its filename.

# Folder Structure

Content is grouped by domain:

```text
llm-wiki/
├── AGENTS.md         # loader; the rules live in README.md
├── README.md         # this file: bundle schema and operating rules
├── index.md          # root index; exhaustive catalogue of concepts
├── log.md            # root update log
├── _schema.json      # the same record contracts, machine-readable
├── _templates/       # one template per record type; each is its type's contract
├── _scripts/         # wiki tooling: the linter, the register sync, qmd and Saleor wrappers
├── .claude/skills/   # the skills that work on this directory, Claude Code only
├── sources/          # raw or near-raw source material the notes synthesize

├── operations/       # OPS operational records and register
├── prd/              # product requirement documents - planned, implemented, blocked
├── product/          # current product state at this Git ref
│   ├── Product (MOC).md
│   ├── capabilities/
│   ├── flows/
│   ├── integrations/
│   └── overview/
├── market/           # market related to the product discovery and strategy. Hypothetical scenarior. It does not reflect the current status of the project.
│   ├── personas/
│   ├── research/
│   ├── strategy/
│   │   └── initiatives/
├── quality/          # QA operating knowledge
│   └── records/      # durable QA records; large evidence remains external
└── tech/
    ├── ADR/              # architecture decision records
    ├── RFC/              # RFC design proposals and register
    ├── implementation/   # IMP implementation evidence and register
    └── saleor/           # version-stamped notes on the Saleor GraphQL schema
```

## Knowledge model

Every record is created from its template, and the template is the contract: its frontmatter
carries every required field, and each field is commented with the rule that governs it —
location and filename, allowed statuses and who approves a transition, link shape, and where the
record is registered. Read the template before creating or changing a record of that type. The
rules are not repeated here, so this file cannot drift from them.

| Record             | Responsibility                                                    | Template                                               |
| ------------------ | ----------------------------------------------------------------- | ------------------------------------------------------ |
| PRD                | Why and what are product requirements                             | [PRD Template](_templates/PRD.md)                      |
| RFC                | A proposed technical solution and considered alternatives         | [RFC Design Doc](_templates/RFC.md)                    |
| ADR                | A durable architecture decision                                   | [ADR Template](_templates/ADR.md)                      |
| IMP                | What was implemented and how it was verified                      | [IMP Template](_templates/IMP.md)                      |
| CAP                | Current product capability                                        | [CAP Template](_templates/CAP.md)                      |
| INT                | Current integration contract                                      | [INT Template](_templates/INT.md)                      |
| FLOW               | Current end-to-end product flow                                   | [FLOW Template](_templates/FLOW.md)                    |
| OPS                | Operational knowledge, runbook, rollback, or incident guidance    | [OPS Template](_templates/OPS.md)                      |
| Saleor schema note | One domain of the Saleor GraphQL schema, stamped with its version | [Saleor Schema Note](_templates/saleor-schema-note.md) |
| Anything else      | A generic concept with no record contract                         | [Undefined Template](_templates/Undefined.md)          |

A Saleor schema note additionally carries a freshness stamp, because the project does not pin a
Saleor version. Those rules depend on repository tooling rather than on the record's own shape, so
they live with the skill that writes them:
[saleor-schema-notes](.claude/skills/bookkeeping/references/saleor-schema-notes.md).

The field comments are guidance for the author: strip them once the fields are filled in. A
created record carries values, not the rules that produced them.

## Workflow

```mermaid
flowchart LR
    S["Sources<br/>immutable evidence, Harness conversation, Developer Ideas"] --> P["Plans and decisions<br/>PRD → RFC → ADR"]
    P --> I["Implementation evidence<br/>IMP + + PR/commit + tests"]
    I --> C["Current project reality<br/>CAP + FLOW + INT + OPS"]
    C --> Q["product - Quality knowledge"]
    I --> Q
```

## Index and log

`index.md` and `log.md` are llm-wiki reserved filenames.

- `index.md` is content-oriented. It lists every validated record once, grouped by record type,
  with a link, title, and one-line summary.
- `log.md` is chronological and append-only. It records maintenance, ingest, query, lint, and
  release operations using parseable dated headings. Date headings must use `YYYY-MM-DD`.

Both are kept in step by `_scripts/`, not by hand: `pnpm wiki:index:sync` maintains the registers
and `pnpm wiki:lint` enforces this file's rules against `_schema.json`. How and when to run them
belongs to the `bookkeeping` skill.

```markdown
# Directory Update Log

## 2026-07-09

- **Update**: Added a new concept document for ...
- **Lint**: Repaired broken Markdown links in ...
```

# Skills

Skills live inside this directory, under `.claude/skills/`.

| Skill                                        | Use it for                                                                                                                                                                           | Writes to                        |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------- |
| [`explore`](.claude/skills/explore/SKILL.md) | Every way into this directory — the index, the MOCs, `qmd` semantic search, plain grep — and how to answer from what you find. Read that skill instead of reinventing a search here. | nothing — read only              |
| `bookkeeping`                                | Ingesting a source, filing durable knowledge, auditing or repairing the graph, reconciling the index and log after a change, recording an ADR.                                       | any record, `index.md`, `log.md` |
| `prd-modeling`                               | Creating, rewriting, or stress-testing a PRD. Stops at an approved PRD: it does not design the solution or decompose the work.                                                       | `prd/`                           |
| `rfc-modeling`                               | Turning an approved PRD into an RFC design proposal. Stops at a proposal: an ADR records the verdict.                                                                                | `tech/RFC/`                      |
| `grilling`                                   | Stress-testing a plan or design one question at a time. `prd-modeling` runs it as its business-grilling stage.                                                                       | nothing — asks questions         |
| `handoff`                                    | Compacting a conversation into a document another agent can pick up. `prd-modeling` runs it to close a session.                                                                      | wherever it is told to write     |

# Related Notes

[LLM Wiki](sources/LLM%20Wiki.md)
[ADR MOC](tech/ADR/ADR%20MOC.md)
[Product Strategy 2026 (MOC)](market/strategy/Product%20Strategy%202026%20%28MOC%29.md)
