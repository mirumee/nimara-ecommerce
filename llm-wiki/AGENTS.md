---
type: "Agent Instructions"
title: "LLM Wiki OKF Conventions"
description: "Schema, evidence model, and operating rules for the Nimara encyclopedia."
tags:
  - "agents"
  - "okf"
  - "llm-wiki"
  - "schema"
created: "2026-07-09T00:00:00+00:00"
timestamp: "2026-07-15T11:10:59+02:00"
---

# Content

This directory is the maintained encyclopedia of Nimara for product, engineering, and
autonomous agents. It explains what Nimara is, what is implemented, how the system
is structured, which capabilities and integrations exist, and where current product direction
differs from code reality.

The wiki follows the Open Knowledge Format (OKF) v0.1: Markdown concept documents with YAML
frontmatter, standard Markdown links, reserved `index.md` files for progressive disclosure,
and reserved `log.md` files for chronological updates.

Use the [Open Knowledge Format v0.1](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md)
as the interoperability contract and this file as Nimara's domain schema.

# Folder Structure

```text
llm-wiki/
  AGENTS.md         # this file: bundle schema and operating rules
  index.md          # exhaustive root catalogue and primary entry points
  log.md            # chronological update log, newest first
  _templates/       # reusable document templates
  sources/
    codebase/        # immutable manifests for verified main-branch snapshots
  references/       # source lists and bibliographies
  system/            # what Nimara is today
    applications/    # deployable apps and test/documentation surfaces
    capabilities/    # user and business capabilities across applications
  product/
    personas/
    market/
    strategy/
      initiatives/
    prds/
      grilling/
    solution/
  quality/           # QA operating knowledge
  tech/
    architecture/    # monorepo, provider, runtime, and data-flow architecture
    integrations/    # Saleor, Stripe, CMS/search, protocols, observability, deployment
    ADR/             # accepted architecture decisions
    RFC/             # design proposals and their register
    saleor/          # version-stamped notes on the Saleor GraphQL schema
```

`index.md` and `log.md` are OKF reserved filenames. All other `.md` files are concept
documents and must have parseable YAML frontmatter with a non-empty `type`.

# Concept Documents

Use this shape for a normal page:

```markdown
---
type: "Capability"
title: "Example Capability"
description: "One sentence describing the capability."
tags:
  - "capability"
created: "2026-07-15T00:00:00+00:00"
timestamp: "2026-07-15T00:00:00+00:00"
knowledge_status: "current"
implementation_status: "wired"
direction_status: "unknown"
verified_at: "2026-07-15T00:00:00+00:00"
code_branch: "main"
code_commit: "0123456789abcdef0123456789abcdef01234567"
scope_paths:
  - "apps/example"
---

# Content

## Current implementation

What users and operators can do, and how the code is wired.

## Direction and gaps

Current product direction, expected behavior, explicit conflicts, and unresolved gaps.

## Evidence

Repository paths, tests, product documents, and limitations of the evidence.

# Related Notes

[Applications](../applications/Applications%20%28MOC%29.md)
```

Required for every concept:

- `type` - short, human-readable concept kind. Consumers must tolerate unknown values.

Recommended for every concept:

- `title` - display name.
- `description` - one-sentence summary used by indexes and search snippets.
- `resource` - canonical URI for the underlying asset, when one exists.
- `tags` - YAML list of short strings without `#`.
- `created` - original creation time.
- `timestamp` - ISO 8601 time of the last meaningful content change.

Local extensions:

- `status`, `owner`, `prd_type`, `template_for` - PRD, RFC, ADR, and template lifecycle.
- `prd_id`, `prd_title`, `session_status` - PRD grilling-log identity and lifecycle.
- `saleor_schema_hash`, `saleor_schema_generated` - Saleor schema freshness stamp.
- `knowledge_status` - `current`, `planned`, `mixed`, `research`, `reference`, or `historical`.
- `implementation_status` - `wired`, `conditional`, `partial`, `implemented_unwired`,
  `not_observed`, `not_applicable`, or `unknown`.
- `direction_status` - `planned`, `active`, `done`, `abandoned`, `untracked`, or `unknown`.
- `verified_at`, `code_branch`, `code_commit`, `scope_paths` - code evidence stamp.

`research` means a sourced hypothesis or time-bounded analysis and requires `source_status`; it
must not be presented as current roadmap direction. `reference` is for durable vocabulary such
as personas that is neither implementation nor delivery state. `planned` requires an explicit
`direction_status` and direction evidence.

# Links

Use standard document-relative Markdown links only. A link in the same directory starts with
`./`; a link to a parent or sibling tree starts with `../`:

```markdown
[Capabilities](../capabilities/Capabilities%20%28MOC%29.md)
```

Root `index.md` entries are relative to the bundle root:

```markdown
- [Nimara](./system/Nimara.md) - canonical overview of the current system.
```

Do not use Obsidian `[[wikilinks]]` or the former implicit bundle-root form such as
`product/personas/Storefront%20Developer.md` from a nested document. Encode spaces and other
special filename characters in link targets.

# Evidence And Source Model

There is no single global source of truth. Resolve each claim with the source that can prove it:

- **Implementation, wiring, routes, schemas, and configured providers:** local `main` at an
  explicit commit SHA. A file's presence alone does not prove it is wired.
- **Direction, priority, and intended scope:** durable product knowledge synthesized into the
  relevant capability, application, or strategy concept.
- **Expected behavior and rationale:** accepted PRDs, RFCs, and ADRs, checked against code.
- **Runtime or production availability:** runtime evidence. Neither `main` nor product plans
  alone prove that a capability is deployed or operational.
- **Saleor API shape:** committed `packages/codegen/schema.ts` and its schema stamp.

Current application, capability, architecture, and integration notes must include
`knowledge_status`, `implementation_status`, `direction_status`, `verified_at`, `code_branch`,
`code_commit`, and `scope_paths`. `code_branch` is `main`; `code_commit` is the exact local
`main` SHA reviewed.

When implementation and current product direction disagree, preserve both facts in the relevant
concept's `Current implementation`, `Direction and gaps`, and `Evidence` sections. Never turn a
planning claim into an implementation claim.

Operational tracker exports are transient analysis inputs, not wiki content. After analysis,
retain only source-neutral, durable conclusions on the relevant concepts. Never persist tracker
names, source-specific work-item identifiers, export metadata, comments, worklogs, attachments, ownership data, or
source-shaped delivery pages in `llm-wiki/`.

# Index And Log Files

Root `index.md` is the exhaustive catalogue and may declare `okf_version: "0.1"` in
frontmatter. Domain MOCs provide narrative entry points. Update the root index and relevant
MOC whenever adding, removing, renaming, or materially changing a concept description.

`log.md` is a date-grouped history, newest first:

```markdown
# Directory Update Log

## 2026-07-15

- **Creation**: Added the current Nimara system map from `main` at commit `0123456`.
```

Date headings use `YYYY-MM-DD`.

# Architecture Decisions And PRDs

Significant technical decisions live in `tech/ADR/`, one decision per file, using the Nygard
structure from `_templates/ADR.md`. Names use `ADR-NNNN Title.md`; status lives in frontmatter;
accepted ADRs are immutable and are superseded by a new ADR. Register every ADR in
[ADR MOC](./tech/ADR/ADR%20MOC.md).

PRD grilling logs live in `product/prds/grilling/` as
`PRD-NNN PRD Name - Grilling Log.md`. Preserve user-visible questions, recommendations,
answers, resulting decisions, rejected scope, and unresolved branches without exposing hidden
reasoning or copying confidential source bodies. Link PRDs and logs in both directions.

# Saleor Schema Notes

Curated Saleor API notes live in `tech/saleor/` and are registered in
[Saleor Schema (MOC)](./tech/saleor/Saleor%20Schema%20%28MOC%29.md). Nimara does not pin a
Saleor server version; the committed `packages/codegen/schema.ts` is the de-facto schema pin.

- Create notes from `_templates/saleor-schema-note.md` with type `Saleor Schema Note`.
- Stamp `saleor_schema_hash` using `pnpm wiki:saleor:hash`.
- Run `pnpm wiki:saleor:check` before citing a Saleor note.
- After `pnpm codegen` changes the schema, review stale notes before restamping them.

# Maintaining The Wiki

Use the repo-local `llm-wiki` skill for discovery and `wiki-maintenance` for ingest, lint,
ADR, or answer-and-file-back work. Every operation that changes concepts also updates the root
index, relevant MOCs, and `log.md`.

Codebase manifests under `sources/` are immutable snapshot records. Do not copy the codebase
into the wiki; cite paths at the recorded commit instead.

# QMD Retrieval

QMD is the local discovery layer; Markdown remains the source of truth. The wrapper uses a
branch-specific local index so results from another branch or worktree cannot leak into the
current wiki.

```bash
pnpm wiki:qmd:setup
pnpm wiki:qmd:rebuild
pnpm wiki:qmd:query "what is implemented in Nimara today?"
pnpm wiki:qmd:search "marketplace payouts" -- --json -n 10
pnpm wiki:qmd:get "#abc123" -- --full
pnpm wiki:qmd:mcp
```

Run `pnpm wiki:qmd:rebuild` after adding, moving, renaming, or deleting notes. Use QMD to find
candidates, then read the Markdown. QMD does not validate frontmatter, links, provenance, MOC
coverage, source integrity, or freshness.

# Rules

- Keep the bundle OKF-conformant: every non-reserved Markdown file has frontmatter and `type`.
- Keep `index.md`, `log.md`, and domain MOCs current in the same change as concept edits.
- Keep one idea per note and connect related concepts with document-relative Markdown links.
- Treat `system/` as the canonical entry point for what Nimara is today.
- Never infer runtime deployment or completeness from code presence.
- Keep operational tracker exports and source-specific work-item identifiers out of the wiki. Do not create a
  `delivery/` directory.
- Record durable technical decisions as ADRs.
- When evidence cannot classify a fact safely, mark it `unknown` and state what is missing.

# Related Notes

[Nimara](./system/Nimara.md)
[LLM Wiki](./sources/LLM%20Wiki.md)
[ADR MOC](./tech/ADR/ADR%20MOC.md)
[Product Strategy 2026 (MOC)](./product/strategy/Product%20Strategy%202026%20%28MOC%29.md)
