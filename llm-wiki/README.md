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

Content is grouped by **type**, not by a `raw/` + `wiki/` split. There is no global
`index.md`; each domain has a **Map of Content (MOC)** note that indexes it.

```
llm-wiki/
  _templates/     -- Obsidian note templates (not content)
  personas/       -- who we build for (primary/secondary/anti-personas)
  market/         -- external research: competitors, trends, market sizing
  strategy/       -- product strategy, roadmap, initiatives, non-goals
    initiatives/  -- one note per prioritised initiative
  qa/             -- QA operating knowledge: environments, board, methods, policy
  decisions/      -- architecture decision records (ADRs)   (.md, one per decision)
  references/     -- source lists (Works Cited) backing the research notes
  epics/          -- structured epic definitions            (.json, one per initiative)
  solution/       -- technical solution per epic             (.json)
  tasks/          -- developer task breakdown per epic        (.json)
```

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

Significant technical decisions are recorded as **standalone `.md` notes in `decisions/`**,
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
- Every ADR is registered in `[[Decisions MOC]]` and links back to the `solution/` or
  `epics/` note it supports.

> The `key_architecture_decisions` array inside `solution/*.json` is a per-epic *summary*
> of decisions; a full ADR in `decisions/` is the durable, standalone record. When a
> solution-level decision is significant enough to outlive the epic, promote it to an ADR.

## Naming & linking

- **File names are Title Case with spaces**, matching the note's title. This is deliberate: Obsidian resolves `[[links]]`
  by title, so filename == title == link target.
- **Wikilinks** use the title without extension: `[[Competitor Landscape]]`.

## Maintaining the wiki

Don't hand-maintain — invoke the skill:

- **Ingest** a new source into notes → `skills/wiki/wiki-maintenance` (ingest mode).
- **Lint / audit** the graph (orphans, dangling links, format drift, uncited claims) →
  same skill (lint mode).
- **Answer a question and file the answer back** as a note → same skill (answer mode).

## Rules

- **Never rewrite research sources.** `references/Works Cited.md` is the provenance
  record — append, don't silently alter cited claims.
- **Keep MOCs current.** Adding or removing a note means updating its domain MOC in the
  same change; the MOC is the index.
- **One idea per note.** If a note grows two topics, split it and cross-link.
- **Record decisions as ADRs.** A significant, hard-to-reverse technical decision goes in
  `decisions/` using `_templates/ADR.md` — never buried inline in prose. ADRs are immutable
  once Accepted; supersede rather than rewrite.
- **Match the house style.** New notes use the format above; new skills follow the
  `skills/**/SKILL.md` convention and cite the notes they rely on.
- **When unsure how to categorise something, ask** rather than inventing a new folder.
