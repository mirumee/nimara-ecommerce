---
name: llm-wiki
description: Retrieve and verify existing project knowledge from llm-wiki. Use when the user asks to find, explain, compare, or cite existing strategy, persona, product, quality, PRD, RFC, ADR, or source notes.. Use QMD only for discovery, verify the full Markdown source.
---

# LLM Wiki

Use this skill to retrieve and answer from `llm-wiki/`. QMD is the discovery layer;
Markdown files remain the source of truth.

## Ground Rules

1. Read `llm-wiki/AGENTS.md` when schema, naming, folder placement, ADR rules, or maintenance rules matter.
2. Read `llm-wiki/sources/LLM Wiki.md` when the user asks about the upstream LLM-wiki pattern or why this wiki is structured this way.
3. Use QMD to find candidate notes, then read the actual Markdown before answering. Do not answer from snippets alone.
4. Treat `qmd` output as retrieval, not validation. It does not prove link integrity, source integrity, MOC coverage, or JSON-vs-Markdown consistency.
5. Keep QMD local state out of git. The project wrapper uses `qmd --index nimara-wiki`, stored under `~/.cache/qmd/nimara-wiki.sqlite`.

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

After wiki Markdown changes, refresh retrieval:

```bash
pnpm wiki:qmd:update
pnpm wiki:qmd:embed
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
   - Product strategy: `llm-wiki/market/strategy/Product Strategy 2026 (MOC).md`
   - QA/testing: `llm-wiki/quality/Quality & Testing (MOC).md`
   - ADRs: `llm-wiki/tech/ADR/ADR MOC.md`

4. Answer with specific file references. If the wiki does not contain the answer, say that plainly and name the gap.

5. If the answer should become durable knowledge, route the mutation to
   `llm-wiki-bookkeeping`.

## Saleor Schema Notes

Notes under `llm-wiki/tech/saleor/` describe the Saleor GraphQL API and are **version-stamped**. Nimara does not pin a Saleor version — `pnpm codegen` fetches the schema live from `NEXT_PUBLIC_SALEOR_API_URL` into `packages/codegen/schema.ts`, so a note can drift from the schema the code actually uses.

- **Before citing** any `tech/saleor/` note, run `pnpm wiki:saleor:check`. `OK` = the note matches the current schema; `STALE` = it was written against a different schema. On `STALE`, warn the user, verify the specifics against `packages/codegen/schema.ts`, and offer to update and restamp the note rather than citing it as-is.
- **When authoring/updating** a Saleor note, follow `llm-wiki/_templates/saleor-schema-note.md` and stamp `saleor_schema_hash` with `pnpm wiki:saleor:hash`.
- After `pnpm codegen` regenerates the schema, expect Saleor notes to go `STALE` — review them against the new schema, then restamp.

Start from [Saleor Schema (MOC)](../../../llm-wiki/tech/saleor/Saleor%20Schema%20%28MOC%29.md).

## Route Authoring and Mutations

Give each operation one owner:

- `llm-wiki-bookkeeping` — ingest, audit, graph repair, durable file-back, and architecture
  decisions;
- `prd-author` — create, rewrite, refine, or stress-test a PRD;
- `rfc-modeling` — create, rewrite, refine, or stress-test an RFC;
- the task-specific QA skill — design test cases, retest a reported defect, or run a broad
  regression sweep.

Use this skill only to supply verified wiki context to those workflows.

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
- Existing `index.md` can drift. Prefer QMD for discovery, but still maintain `index.md` until the schema says otherwise.
