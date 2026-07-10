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
timestamp: "2026-07-09T00:00:00+00:00"
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
    solution/       # created per epic when a technical solution exists
    tasks/          # created per epic when implementation tasks exist
  quality/          # QA operating knowledge
  operations/       # operations MOC, measurement plans, and knowledge-system reviews
  tech/
    flows/          # verified cross-layer runtime sequences and invariants
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
- `status`, `owner`, `epic_type`, `template_for` - domain-specific lifecycle fields.
- `verified_at` - last time a technical or operational concept was checked against its sources.
- `source_refs` - YAML list of evidence references. Use `repo:<path>`, `wiki:<path>`, or an
  absolute `https://` URL. A concept with `status: verified` must declare at least one source.
- `review_on` - scheduled review date for a time-bound decision or measurement plan.
- `required_relations` - bundle-relative concept paths that must appear inside the page's
  `Related Notes` section. Use this for explicit tracers and other required graph edges.
- `content_sha256` - required on `Source Material`; SHA-256 of the Markdown body after the
  closing frontmatter delimiter, written as `sha256:<hex>`. Metadata can evolve without
  changing the hash. The linter compares it with `HEAD`, its parent, and optional
  `WIKI_LINT_BASE`; CI should set that variable to the pull-request merge base.

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
per file, using the Michael Nygard structure from `_templates/ADR.md`.

Rules:

- File name: `ADR-NNNN Title.md`, zero-padded and monotonically increasing.
- Type: `Architecture Decision Record`.
- Status lives in frontmatter as `status`.
- Accepted ADRs are immutable. Supersede them with a new ADR and link both documents.
- Register every ADR in [ADR MOC](tech/ADR/ADR%20MOC.md) and link it back to the relevant
  epic, solution, or task note.

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

Deterministic health check:

```bash
pnpm wiki:lint
pnpm wiki:lint:test
```

The linter checks OKF frontmatter, root-index and domain-MOC coverage, all internal links,
freshness, `source_refs`, immutable source bodies, orphan concepts, `Related Notes`, and any
declared `required_relations`. It exits non-zero on findings.
The default freshness limit is 120 days and can be overridden with `--max-age-days`.
An intentional correction to archived material requires explicit review and
`--allow-source-migration`, plus a new matching `content_sha256`.

Sources under `sources/` should preserve the source body. Prefer appending metadata,
provenance, or citations over rewriting the raw source text unless the user explicitly asks
for a migration or correction. Source Markdown is excluded from Prettier so formatting cannot
silently rewrite archived bodies.

# QMD Retrieval

`qmd` is the preferred local retrieval layer once configured. The Markdown files remain the
source of truth; the generated QMD SQLite index is local developer state and is never
committed.

Project wrapper commands:

```bash
pnpm wiki:qmd:setup
pnpm wiki:qmd:embed
pnpm wiki:qmd:rebuild
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
- Treat repository code and immutable source material as evidence; the wiki stores synthesis,
  invariants, ownership, and rationale rather than copying implementation details.
- Every pull request answers `Wiki impact: none | update | ADR`. `update` and `ADR` changes keep
  the relevant MOC, root index, and log current in the same pull request.
- Match the house style: short descriptions, structured headings, and Markdown links.
- When unsure how to categorize something, ask rather than inventing a new folder.

# Related Notes

[LLM Wiki](sources/LLM%20Wiki.md)
[ADR MOC](tech/ADR/ADR%20MOC.md)
[Product Strategy 2026 (MOC)](product/strategy/Product%20Strategy%202026%20%28MOC%29.md)
