---
name: llm-wiki
description: Work with Nimara's llm-wiki encyclopedia using QMD-backed retrieval and source verification. Use when answering what Nimara is or implements, finding or maintaining application/capability/architecture/integration notes, reconciling product direction with code reality, auditing wiki consistency, ingesting sources, or filing durable knowledge back into llm-wiki. Also use for Saleor GraphQL schema questions, whose version-stamped notes must pass `pnpm wiki:saleor:check` before citation.
---

# LLM Wiki

Use this skill to work with `llm-wiki/` as the maintained encyclopedia of Nimara, not as a
loose folder of Markdown. QMD is the discovery layer; Markdown files and their cited evidence
remain the source of truth.

## Ground Rules

1. Read `llm-wiki/AGENTS.md` when schema, naming, folder placement, ADR rules, or maintenance rules matter.
2. Read `llm-wiki/sources/LLM Wiki.md` when the user asks about the upstream LLM-wiki pattern or why this wiki is structured this way.
3. Use QMD to find candidate notes, then read the actual Markdown before answering or editing. Do not answer from snippets alone.
4. Treat `qmd` output as retrieval, not validation. It does not prove link integrity, source integrity, MOC coverage, or JSON-vs-Markdown consistency.
5. Current implementation claims come from local `main` at a recorded SHA. Product direction is
   stored as source-neutral, durable knowledge and never overrides observed code.
6. Operational tracker exports are temporary analysis inputs and never become wiki content.
   Keep QMD state out of Git; the wrapper chooses a branch-specific index under `~/.cache/qmd/`.

## Setup Check

Before using QMD, run:

```bash
pnpm wiki:qmd:status
```

If QMD has no collection or missing embeddings, use:

```bash
pnpm wiki:qmd:setup
pnpm wiki:qmd:embed
```

After wiki Markdown changes, refresh retrieval. Prefer `rebuild` after adds, moves, or deletes:

```bash
pnpm wiki:qmd:update
pnpm wiki:qmd:embed
pnpm wiki:qmd:rebuild
```

If `pnpm` on the local machine misbehaves, use the wrapper directly:

```bash
node scripts/wiki-qmd.mjs status
node scripts/wiki-qmd.mjs query "question" --json --no-rerank -n 10
```

## Answer Workflow

1. Search with QMD:

   ```bash
   pnpm wiki:qmd:query "the user's question" -- --json --no-rerank -n 10
   ```

   Use `wiki:qmd:search` for short keyword probes such as `reviews`, `ADR`, or `moderation`.

2. Fetch the full notes by `docid` or `qmd://...` URI:

   ```bash
   pnpm wiki:qmd:get "#abc123" -- --full
   ```

   QMD may normalize spaces in filenames, so prefer `docid` from search results.

3. Read the relevant MOC when the topic is domain-specific:
   - Nimara/current system: `llm-wiki/system/Nimara.md`
   - Applications: `llm-wiki/system/applications/Applications (MOC).md`
   - Capabilities: `llm-wiki/system/capabilities/Capabilities (MOC).md`
   - Architecture: `llm-wiki/tech/architecture/Architecture (MOC).md`
   - Integrations: `llm-wiki/tech/integrations/Integrations (MOC).md`
   - Product strategy: `llm-wiki/product/strategy/Product Strategy 2026 (MOC).md`
   - QA/testing: `llm-wiki/quality/Quality & Testing (MOC).md`
   - ADRs: `llm-wiki/tech/ADR/ADR MOC.md`

4. Answer with specific file references. If the wiki does not contain the answer, say that plainly and name the gap.

5. If the answer is durable knowledge, update the smallest relevant concept. Do not edit
   immutable codebase manifests under `llm-wiki/sources/`; add a new snapshot instead.

## Saleor Schema Notes

Notes under `llm-wiki/tech/saleor/` describe the Saleor GraphQL API and are **version-stamped**. Nimara does not pin a Saleor version — `pnpm codegen` fetches the schema live from `NEXT_PUBLIC_SALEOR_API_URL` into `packages/codegen/schema.ts`, so a note can drift from the schema the code actually uses.

- **Before citing** any `tech/saleor/` note, run `pnpm wiki:saleor:check`. `OK` = the note matches the current schema; `STALE` = it was written against a different schema. On `STALE`, warn the user, verify the specifics against `packages/codegen/schema.ts`, and offer to update and restamp the note rather than citing it as-is.
- **When authoring/updating** a Saleor note, follow `llm-wiki/_templates/saleor-schema-note.md` and stamp `saleor_schema_hash` with `pnpm wiki:saleor:hash`.
- After `pnpm codegen` regenerates the schema (see the `codegen-check` skill), expect Saleor notes to go `STALE` — review them against the new schema, then restamp.

Start from [Saleor Schema (MOC)](../../llm-wiki/tech/saleor/Saleor%20Schema%20%28MOC%29.md).

## Maintenance Workflow

For lint, ingest, ADR, or answer-and-file-back work, also read `skills/wiki/wiki-maintenance/SKILL.md`. Follow its mode rules, especially:

- report lint findings with suggested fixes before editing unless the user asked for cleanup;
- update `llm-wiki/log.md` for wiki operations;
- update MOCs and `index.md` when adding, renaming, or removing notes;
- keep current-state evidence stamped to `main`;
- synthesize temporary operational inputs into source-neutral concepts, never work-item pages or
  `delivery/`;
- record significant technical decisions as ADRs instead of burying them in prose.

## Useful Probes

```bash
pnpm wiki:qmd:query "what contradicts the user reviews PRD?" -- --json --no-rerank -n 10
pnpm wiki:qmd:search "moderation" -- --json -n 5
pnpm wiki:qmd:query "where does LLM Wiki discuss index.md?" -- --json --no-rerank -n 5
pnpm wiki:qmd:ls
```

## Common Failure Modes

- Long natural-language `wiki:qmd:search` queries can return nothing. Use `wiki:qmd:query` for semantic questions.
- QMD snippets are not enough for a verdict. Fetch full files and cite those.
- QMD includes templates unless filtered by the question. Ignore `_templates/` results unless template behavior is relevant.
- Run `pnpm wiki:check` for deterministic validation; QMD cannot validate evidence or links.
- Existing `index.md` can drift. Prefer QMD for discovery, but still maintain `index.md` until the schema says otherwise.
