# LLM Wiki — conventions & schema

An interlinked knowledge base for **planning and building Nimara**, maintained by
agents (Claude Code) and curated by the team. Inspired by Andrej Karpathy's "LLM wiki"
pattern, adapted to how this repo actually works — content organised **by type**, an
Obsidian-style link graph, and executable **skills** that cite the notes.

This file is the _declarative_ schema (what a good page looks like, how things are
named and linked). The _executable_ maintenance workflows — ingest, lint,
answer-and-file-back — live in the skill **`skills/wiki/wiki-maintenance`**, which cites
this file.

> Naming & format here describe what the corpus already uses. If you change a rule,
> you are committing to migrating every existing note and every `[[link]]` — don't
> change lightly.

## Folder structure

Content is grouped by **domain** — `product/`, `quality/`, `tech/` — with typed sub-folders
inside each; not by a `raw/` + `wiki/` split. The three layers of Karpathy's model map here
as: **raw** = `sources/` (immutable source documents), **wiki** = the typed note folders below,
**schema** = this file (`AGENTS.md`). `index.md` is the global content catalogue (every note +
a one-line summary), read first when answering a query; each domain additionally has a **Map of
Content (MOC)** note that curates navigation within it.

```
llm-wiki/
  AGENTS.md         -- this file: the wiki schema (conventions, naming, rules)
  index.md          -- global content catalogue (every note + one-line summary)
  log.md            -- append-only chronicle of wiki operations (ingest/query/lint/adr)
  _templates/       -- Obsidian note templates (not content)
  sources/          -- raw, immutable source documents the notes synthesise (never rewritten)
  references/       -- source lists (Works Cited) backing the research notes
  product/          -- what we build & who for: personas, market, strategy, epic→task data layer
    personas/       -- who we build for (primary/secondary/anti-personas)
    market/         -- external research: competitors, trends, market sizing
    strategy/       -- product strategy, roadmap, initiatives, non-goals
      initiatives/  -- one note per prioritised initiative
    epics/          -- structured epic definitions
    solution/       -- technical solution per epic
    tasks/          -- developer task breakdown per epic
  quality/          -- QA operating knowledge: environments, board, methods, policy
  tech/             -- technical knowledge
    ADR/            -- architecture decision records (ADRs)   (.md, one per decision)
```

> `index.md` and `log.md` are machine-maintained navigation/bookkeeping files, not notes —
> they are exempt from the note format below. `product/solution/` is created per epic when a
> technical solution is written; it may be absent until then.

## Note format (`.md` pages)

Every markdown note follows this shape (see `_templates/Undefined.md`):

```markdown
**Summary**: One or two sentences describing this note.

**Tags**: #topic1 #topic2
**Created**: 2026-06-16T00:00:00+00:00
**Last Updated**: 2026-06-16T00:00:00+00:00

---

## Content

Main content. Clear headings, short paragraphs. Link related concepts inline
using [[Note Title]] wikilinks throughout the text.

## Related Notes

[[Another Note]]
[[Yet Another Note]]
```

- `**Summary**` is mandatory — it's what a reader (or an agent scanning the graph) uses
  to decide relevance without opening the note.
- Bump `**Last Updated**` on every edit. Use ISO-8601 with offset.
- Close with a `## Related Notes` block so the graph stays navigable.

## Architecture Decision Records (ADRs)

Significant technical decisions are recorded as **standalone `.md` notes in `tech/ADR/`**,
one decision per note, using the **Michael Nygard template** (`_templates/ADR.md`):

```markdown
**Status**: Proposed | Accepted | Rejected | Deprecated | Superseded by [[ADR-NNNN Title]]
---
## Context      -- the forces motivating the decision (value-neutral)
## Decision     -- the change we are making ("We will …")
## Consequences -- what becomes easier / harder as a result (the trade-offs)
```

- **File name / title**: `ADR-NNNN <Title>` — zero-padded, monotonically increasing,
  never reused (e.g. `ADR-0001 Use RAG over fine-tuning`). Wikilink is `[[ADR-0001 Use RAG over fine-tuning]]`.
- **Immutable once Accepted.** Don't edit a decided ADR — supersede it: write a new ADR and
  set the old one's `**Status**` to `Superseded by [[ADR-NNNN …]]`.
- Every ADR is registered in `[[ADR MOC]]` and links back to the `product/solution/` or
  `product/epics/` note it supports.

## Naming & linking

- **File names are Title Case with spaces**, matching the note's title. This is deliberate: Obsidian resolves `[[links]]`
  by title, so filename == title == link target.
- **Wikilinks** use the title without extension: `[[Competitor Landscape]]`.

## Maintaining the wiki

Don't hand-maintain — invoke the skill:

- **Ingest** a new source into notes → `skills/wiki/wiki-maintenance` (ingest mode). On
  ingest the raw source is archived under `sources/`, `index.md` gains the new/changed notes,
  and `log.md` gets an entry.
- **Lint / audit** the graph (orphans, dangling links, format drift, uncited claims) →
  same skill (lint mode).
- **Answer a question and file the answer back** as a note → same skill (answer mode). The
  answer starts by reading `index.md` to locate relevant notes.

Every skill operation appends one line to `log.md` (`## [YYYY-MM-DD] <mode> | Title`), so the
wiki keeps a chronological record of how it evolved.

## Rules

- **Never rewrite sources.** Documents under `sources/` are immutable raw inputs — append new
  sources, never edit an archived one. `references/Works Cited.md` is the provenance record —
  append, don't silently alter cited claims; link a citation to its `sources/` copy when one exists.
- **Keep `index.md` and `log.md` current.** Adding, renaming, or removing a note updates
  `index.md` in the same change; every skill operation appends a line to `log.md`.
- **Keep MOCs current.** Adding or removing a note means updating its domain MOC in the
  same change. `index.md` is the exhaustive catalogue; MOCs are curated navigation hubs — both
  are maintained, they are not redundant.
- **One idea per note.** If a note grows two topics, split it and cross-link.
- **Record decisions as ADRs.** A significant, hard-to-reverse technical decision goes in
  `tech/ADR/` using `_templates/ADR.md` — never buried inline in prose. ADRs are immutable
  once Accepted; supersede rather than rewrite.
- **Match the house style.** New notes use the format above; new skills follow the
  `skills/**/SKILL.md` convention and cite the notes they rely on.
- **When unsure how to categorise something, ask** rather than inventing a new folder.

## Deliberate deviations from Karpathy's pattern

These are conscious choices, not gaps — revisit only if the trade-off changes:

- **Notes use `**Summary**` / `**Tags**` pseudo-fields, not YAML frontmatter.** Karpathy
  suggests YAML frontmatter to unlock Obsidian Dataview/Properties; we keep the existing bold
  fields. Consequence: Dataview queries won't work until (if ever) we migrate.
- **No CLI search engine (e.g. qmd).** At current scale `index.md` + `grep` is enough; add
  on-device search only when the wiki outgrows it.
