---
type: "Agent Instructions"
title: "LLM Wiki OKF Conventions"
description: "Schema and operating rules for the Nimara LLM wiki as an OKF v0.1 bundle."
tags:
  - "agents"
  - "okf"
  - "llm-wiki"
  - "schema"
created: "2026-07-09T00:00:00+00:00"
timestamp: "2026-07-10T00:00:00+00:00"
---

# Content

This directory is an interlinked knowledge base for planning, testing, and building Nimara.
It follows the Open Knowledge Format (OKF) v0.1 shape: a directory of Markdown files with
YAML frontmatter, standard Markdown cross-links, reserved `index.md` files for progressive
disclosure, and reserved `log.md` files for chronological updates.

Use the OKF specification as the interoperability contract:
[Open Knowledge Format v0.1](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md).

# Folder Structure

Content is grouped by domain:

```text
llm-wiki/
  AGENTS.md         # this file: bundle schema and operating rules
  index.md          # root OKF index; exhaustive catalogue of concepts
  log.md            # root OKF update log
  _templates/       # reusable document templates
  sources/          # raw or near-raw source material the notes synthesize
  references/       # source lists and bibliographies
  product/          # personas, market research, strategy, epics
    personas/
    market/
    strategy/
      initiatives/
    epics/
      grilling/     # one durable business-grilling decision log per epic
    solution/       # created per epic when a technical solution exists
    tasks/          # created per epic when implementation tasks exist
  quality/          # QA operating knowledge
  tech/
    ADR/            # architecture decision records
```

`index.md` and `log.md` are OKF reserved filenames. All other `.md` files are concept
documents and must have parseable YAML frontmatter with a non-empty `type` field.

# Concept Document Format

Use this shape for every normal Markdown page:

```markdown
---
type: "Strategy Note"
title: "Example Concept"
description: "One sentence describing the concept."
tags:
  - "strategy"
created: "2026-07-09T00:00:00+00:00"
timestamp: "2026-07-09T00:00:00+00:00"
---

# Content

Main content. Use clear headings, short paragraphs, tables, and lists.
Link related concepts with standard Markdown links:
[Product Strategy 2026 (MOC)](product/strategy/Product%20Strategy%202026%20%28MOC%29.md).

# Related Notes

[Initiative Prioritization](product/strategy/initiatives/Initiative%20Prioritization.md)
```

Required:

- `type` - short, human-readable concept kind. Consumers must tolerate unknown values.

Recommended:

- `title` - display name.
- `description` - one-sentence summary used by indexes and search snippets.
- `resource` - URI for the underlying asset when the concept describes one.
- `tags` - YAML list of short strings without `#`.
- `timestamp` - ISO 8601 last meaningful update time.

Local extensions currently used:

- `created` - original creation time for the concept.
- `status`, `owner`, `epic_type`, `template_for` - domain-specific fields on epics,
  ADR templates, or other structured notes.
- `epic_id`, `epic_title`, `session_status` - identity and lifecycle fields on epic
  grilling logs.
- `saleor_version` - the exact Saleor release a source-derived note was synthesized from
  (e.g. `"3.23.17"`), mirrored by a one-line **Saleor version:** callout in the body. See
  [Source-Derived Reference Notes](#source-derived-reference-notes).

# Links

Use standard Markdown links only. Local links are relative to the `llm-wiki/` bundle root
and must not include the `llm-wiki/` prefix:

```markdown
[Storefront Developer](product/personas/Storefront%20Developer.md)
```

Use the same bundle-relative form in `index.md` entries:

```markdown
- [Storefront Developer](product/personas/Storefront%20Developer.md) - primary adopter persona.
```

Do not add Obsidian-style bracket links. If old bracket-style links appear, migrate them to
Markdown links in the same change.

# Index Files

`index.md` supports progressive disclosure. The root `index.md` is the exhaustive catalogue
for this bundle and may declare:

```yaml
---
okf_version: "0.1"
---
```

After that optional root frontmatter, index files should use section headings and bullets:

```markdown
# Product Strategy

- [Product Strategy 2026 (MOC)](product/strategy/Product%20Strategy%202026%20%28MOC%29.md) - entry point for strategy notes.
```

Update the relevant index whenever adding, removing, renaming, or materially changing a
concept description.

# Log Files

`log.md` is a flat date-grouped update history, newest first:

```markdown
# Directory Update Log

## 2026-07-09

- **Update**: Added a new concept document for ...
- **Lint**: Repaired broken Markdown links in ...
```

Date headings must use `YYYY-MM-DD`.

# Architecture Decision Records

Significant technical decisions are standalone concept documents in `tech/ADR/`, one decision
per file, using the **DERBY-style design ADR** structure from `_templates/ADR.md`:
**Recommendation → Problem → Requirements → Proposed solution → Cross-cutting considerations**
(the last carries Security, Monitoring, Failure cases, **Alternative solutions**, Dependencies,
System Impacts, Documentation, QA Validation, and DevOps). DERBY's H1 sections map to H2 in
this wiki so the note title stays in frontmatter and the linter can parse sections.

Rules:

- **Before writing an ADR, always ask the user which system the application, feature, or
  provider is built on** — e.g. Saleor, Algolia, or a greenfield app from scratch. Do not
  assume or infer it; the answer anchors the decision context and prevents hallucinated
  constraints. Capture it as the **Base system** line at the top of the **Problem** section.
- File name: `ADR-NNNN Title.md`, zero-padded and monotonically increasing.
- Status lives in frontmatter as `status`. The **Recommendation** section is filled only once
  the ADR reaches its Final state (`status: Accepted`).
- Accepted ADRs are immutable. Supersede them with a new ADR and link both documents.
- Register every ADR in [ADR MOC](tech/ADR/ADR%20MOC.md) and link it back to the relevant
  epic, solution, or task note.
- **Legacy MADR ADRs** (pre-DERBY) keep their structure and opt into the old ruleset with
  `adr_format: "MADR-legacy"` in frontmatter. Do not migrate them; new ADRs use DERBY.

**Quality bar — an ADR records a *decision*, not a proposal for one option:**

- **≥1 weighed Alternative solution + a Proposed solution justified against the Requirements.**
  A design that weighs no alternative is rejected — that is the difference between a decision
  record and a press release. Requirements (functional + non-functional) double as the
  drivers the alternatives are scored against.
- **Every alternative states why it was rejected**, naming the deciding requirement/driver,
  under **Cross-cutting considerations → Alternative solutions**. "We also considered X and Y;
  X rejected because …, Y rejected because …" is the point of the document.
- **Each ADR is self-contained.** Rejected alternatives and their reasons live inside the
  one file. Do not assume the reader has seen sibling ADRs, and do not cross-link ADRs as
  each other's "alternatives" — each ADR stands alone.
- **Proposed solution is mandatory and concrete:** an interface / DTO sketch (pseudo-TS
  is fine), storage/database mapping, real monorepo paths (`packages/domain/…`,
  `packages/infrastructure/<capability>/<provider>/`, the consuming service),
  an env schema (variable names + Zod validation), and the `Result<T, E>` convention. No
  hand-waving like "persist through metadata / an app-owned surface" without saying which.
- **Problem is a short problem statement, not an essay.** Link the driving epic/solution
  instead of paraphrasing its requirements; state only what this decision adds.
- **The bar is machine-checked.** Run `pnpm wiki:adr:lint` (all ADRs) or
  `pnpm wiki:adr:lint "<path>"` (one ADR) — it fails any ADR missing the DERBY sections, the
  `**Base system:**` line, a weighed Alternative solution, a "Rejected because" reason per
  alternative, or a register entry, and warns on a thin Proposed solution. (MADR-legacy ADRs
  are checked against the old ruleset.) Fix every ERROR before an ADR is considered done.

# Epic Grilling Logs

Business grilling is preserved as a decision record rather than a raw chat transcript.

Rules:

- Store one log per epic in `product/epics/grilling/` as
  `EPIC-NNN <Epic Name> - Grilling Log.md`.
- Create new logs from `_templates/epic-grilling-log.md`. Append later sessions to the same
  file and continue the `G-*` decision numbering.
- Record each user-visible question, recommendation, answer, and resulting decision. Include
  rejected metrics or scope, unresolved branches, and decisions deferred to solution design.
- Summarize rather than expose hidden reasoning. Never copy secrets, personal data, or a
  confidential source body into the log; record only the evidence used and its limitations.
- Link the epic and grilling log in both directions. Register the log in `index.md` and the
  creation or update in `log.md`.
- When an epic is renamed, rename its grilling log and update all inbound links in the same
  change.

# Solution Design & Technical Grilling

Architecture decisions are grilled before they are recorded. The business grilling
(`epic-author`) settles the *value bet* and defers technical choices to solution design; the
`solution-author` skill runs the *technical* grilling that produces an ADR.

Rules:

- **Confirm the base system first** (same gate as the ADR rules below) — it anchors every
  driver, and `solution-author` asks it as the first grilling question.
- The technical grilling produces two artifacts: the **ADR** in `tech/ADR/` (the polished
  decision) and a **Solution Grilling Log** in `product/solution/<Epic Name>/` (the
  user-visible decision trail), created from `_templates/solution-grilling-log.md` with
  `D-*` decision IDs — the technical counterpart to the epic grilling log.
- Keep the grilling at **architecture altitude**: base system, decision drivers, considered
  options and why the rejected ones lost, interface/data/env shape, cross-cutting NFRs, and
  reversibility. Defer line-level implementation (function names, tests, minor libraries) to
  the build phase, recording it as deferred rather than dropping it.
- Link the ADR, the solution grilling log, and the epic in all directions. Register the ADR
  in [ADR MOC](tech/ADR/ADR%20MOC.md), and the log in `index.md` and `log.md`.
- Summarize rather than expose hidden reasoning. Never copy secrets, personal data, or a
  confidential source body into the log.

# Source-Derived Reference Notes

Notes synthesized from a **versioned external source** (currently the Saleor GraphQL API
notes under `tech/saleor/`, synthesized from `sources/saleor/schema.graphql`) must pin the
exact source version they describe, so a reader — human or agent — can tell whether a note
still matches the live backend.

Rules:

- **Record the version in two places, kept identical:**
  - a `saleor_version: "<x.y.z>"` frontmatter field, and
  - a one-line body callout immediately under the `## Content` heading, e.g.
    `> **Saleor version:** 3.23.17 — these notes are synthesized from the archived
[schema.graphql](/sources/saleor/schema.graphql) at this version. Re-synthesize them if
the schema is bumped to a different Saleor version.`
- **Determine the version from the source, do not guess.** A GraphQL schema does not embed
  its release number statically (`Shop.version`/`schemaVersion` are runtime fields), so
  confirm the version with the user or the source's provenance (release tag / commit) before
  writing it. Use the same version string across every note in the bundle.
- **When the source version changes** (a new `schema.graphql` is ingested): treat the notes
  as stale. Re-synthesize the affected notes against the new schema, update every
  `saleor_version` field and body callout to the new version, and note the version bump in
  `log.md`. Do not leave a note claiming an old version alongside re-derived content.
- Generalize the same pattern (`<source>_version` frontmatter + body callout) to any future
  source-derived reference bundle.

# Maintaining The Wiki

Use the repo-local `llm-wiki` skill as the entrypoint for discovery and wiki work. For
maintenance modes, it delegates to `skills/wiki/wiki-maintenance`.

Expected operations:

- Ingest a new source: add or update source material, update synthesized notes, update
  `index.md`, and append to `log.md`.
- Lint or audit: check frontmatter, links, orphans, MOC coverage, stale claims, and source
  coverage.
- Answer and file back: answer from existing concepts first, then add durable insights as
  concept documents when they should persist.

Sources under `sources/` should preserve the source body. Prefer appending metadata,
provenance, or citations over rewriting the raw source text unless the user explicitly asks
for a migration or correction.

# QMD Retrieval

`qmd` is the preferred local retrieval layer once configured. The Markdown files remain the
source of truth; the generated QMD SQLite index is local developer state and is never
committed.

Project wrapper commands:

```bash
pnpm wiki:qmd:setup
pnpm wiki:qmd:embed
pnpm wiki:qmd:query "what contradicts the user reviews epic?"
pnpm wiki:qmd:search "ADR MOC" -- --json -n 10
pnpm wiki:qmd:get "#abc123" -- --full
pnpm wiki:qmd:mcp
```

Operational rules:

- Use [LLM Wiki](sources/LLM%20Wiki.md) for the upstream pattern and this file for Nimara's
  local OKF schema.
- Run `pnpm wiki:qmd:update` after Markdown changes and `pnpm wiki:qmd:embed` when semantic
  search should reflect those changes.
- Use `qmd search` or `qmd query` to get a `docid` or `qmd://...` URI before calling
  `qmd get`.
- Do not treat QMD results as validation. Link integrity, frontmatter, source integrity, MOC
  coverage, and index coverage still require a wiki-maintenance lint pass.

# Rules

- Keep this bundle OKF-conformant: every non-reserved `.md` file starts with frontmatter and
  has non-empty `type`.
- Keep `index.md`, `log.md`, and domain MOCs current in the same change as concept edits.
- Keep one idea per note. Split mixed topics and cross-link them.
- Record durable technical decisions as ADRs.
- Match the house style: short descriptions, structured headings, and Markdown links.
- When unsure how to categorize something, ask rather than inventing a new folder.

# Related Notes

[LLM Wiki](sources/LLM%20Wiki.md)
[ADR MOC](tech/ADR/ADR%20MOC.md)
[Product Strategy 2026 (MOC)](product/strategy/Product%20Strategy%202026%20%28MOC%29.md)
