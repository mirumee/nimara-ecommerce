---
name: llm-wiki
description: Work with llm-wiki knowledge base using QMD-backed retrieval and source-file verification. Use when answering questions from llm-wiki, finding relevant notes, auditing wiki consistency, ingesting or filing durable knowledge back into llm-wiki, updating wiki conventions, or helping agents use the llm-wiki/sources/LLM Wiki.md pattern. Use for product strategy, QA process, ADR, persona, epic, source, and wiki-maintenance questions that should cite or update llm-wiki.
---

# LLM Wiki

Use this skill to work with `llm-wiki/` as a maintained knowledge base, not as a loose folder of Markdown. QMD is the discovery layer; Markdown files remain the source of truth.

## Ground Rules

1. Read `llm-wiki/AGENTS.md` when schema, naming, folder placement, ADR rules, or maintenance rules matter.
2. Read `llm-wiki/sources/LLM Wiki.md` when the user asks about the upstream LLM-wiki pattern or why this wiki is structured this way.
3. Use QMD to find candidate notes, then read the actual Markdown before answering or editing. Do not answer from snippets alone.
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
   - Product strategy: `llm-wiki/product/strategy/Product Strategy 2026 (MOC).md`
   - QA/testing: `llm-wiki/quality/Quality & Testing (MOC).md`
   - ADRs: `llm-wiki/tech/ADR/ADR MOC.md`

4. Answer with specific file references. If the wiki does not contain the answer, say that plainly and name the gap.

5. If the answer is durable knowledge, offer to file it back into the wiki. Do not edit sources under `llm-wiki/sources/` except to add a new immutable source document.

## Maintenance Workflow

For lint, ingest, ADR, or answer-and-file-back work, also read `skills/wiki/wiki-maintenance/SKILL.md`. Follow its mode rules, especially:

- report lint findings with suggested fixes before editing unless the user asked for cleanup;
- update `llm-wiki/log.md` for wiki operations;
- update MOCs and `index.md` when adding, renaming, or removing notes;
- record significant technical decisions as ADRs instead of burying them in prose.

Run the deterministic repository check after wiki changes:

```bash
pnpm wiki:lint
```

This is the validation layer for OKF frontmatter, index coverage, Markdown links, freshness,
source references, orphans, and required relationships. QMD remains discovery only.

## Useful Probes

```bash
pnpm wiki:qmd:query "what contradicts the user reviews epic?" -- --json --no-rerank -n 10
pnpm wiki:qmd:search "moderation" -- --json -n 5
pnpm wiki:qmd:query "where does LLM Wiki discuss index.md?" -- --json --no-rerank -n 5
pnpm wiki:qmd:ls
```

## Common Failure Modes

- Long natural-language `wiki:qmd:search` queries can return nothing. Use `wiki:qmd:query` for semantic questions.
- QMD snippets are not enough for a verdict. Fetch full files and cite those.
- QMD includes templates unless filtered by the question. Ignore `_templates/` results unless template behavior is relevant.
- Existing `index.md` can drift. Prefer QMD for discovery, but still maintain `index.md` until the schema says otherwise.
