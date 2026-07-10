---
name: wiki-maintenance
description: Maintain the OKF llm-wiki knowledge base: ingest sources, lint the graph, record ADRs, or answer and file durable knowledge back.
---

# Wiki Maintenance

Maintain `llm-wiki/` as a coherent knowledge bundle. Read `llm-wiki/AGENTS.md` first; it is
the canonical schema and overrides older conventions. Use standard Markdown links, never
Obsidian bracket links.

## Operating principles

1. **Schema is law.** Every concept has parseable YAML frontmatter with non-empty `type` and
   follows the folder, link, MOC, ADR, index, and log rules in `llm-wiki/AGENTS.md`.
2. **Three layers stay distinct.** Immutable inputs live under `sources/`, maintained synthesis
   lives in concept pages, and `AGENTS.md` defines the operating schema.
3. **Repository evidence beats synthesis.** Technical pages cite current code through
   `source_refs`; QMD snippets are discovery aids, never validation.
4. **Keep the graph navigable.** Every new non-exempt concept is linked from a domain MOC,
   appears in root `index.md`, and contains a `Related Notes` section.
5. **Never fabricate.** Mark unresolved claims and verification gaps explicitly. Do not convert
   an intended outcome into a claim about implemented behavior.
6. **Decisions are ADRs.** A durable, hard-to-reverse technical choice belongs in `tech/ADR/`
   and is registered in `tech/ADR/ADR MOC.md`.
7. **Bookkeeping changes together.** Update relevant concepts, domain MOCs, root `index.md`,
   and the newest date group in `log.md` in the same change.
8. **Validate after changes.** Run `pnpm wiki:lint`, refresh QMD, and verify important queries
   against the underlying Markdown and repository sources.

## Mode: INGEST

Use when adding a document, report, transcript, research result, or other source.

1. Read the full source.
2. Archive a local copy under `sources/` when licensing and access allow. Preserve its body;
   later changes may add metadata or provenance but must not rewrite the archived content.
   Compute and store the body `content_sha256` required by the schema.
3. Identify existing concepts to update before proposing new pages. Prefer synthesis and
   compression over one page per source.
4. Create or update concept pages using the frontmatter contract in `llm-wiki/AGENTS.md`.
5. Use standard bundle-relative Markdown links. Do not create dangling placeholder links;
   create a clearly marked concept or record the gap as prose instead.
6. Link every new concept from its domain MOC and add a `Related Notes` section.
7. Update root `index.md` and add a newest-first bullet to the current date in `log.md`.
8. Run `pnpm wiki:lint`, then `pnpm wiki:qmd:rebuild`.

## Mode: LINT

Use when auditing or cleaning the wiki.

Start with:

```bash
pnpm wiki:lint
```

The deterministic CLI checks:

- OKF frontmatter and required `type`;
- root-index and domain-MOC coverage;
- broken internal Markdown links, including `log.md`;
- concepts without inbound links;
- missing or empty `Related Notes` sections;
- declared `required_relations` used by explicit tracers;
- missing, invalid, or stale `verified_at`/`timestamp` values;
- `source_refs` targets and provenance for source material;
- archived source bodies that no longer match their durable `content_sha256`.

For pull-request CI, set `WIKI_LINT_BASE` to the merge base so a body and hash cannot be changed
together across a multi-commit branch. Use `--allow-source-migration` only for an explicitly
approved correction to archived material.

Then perform semantic checks the CLI cannot prove:

- contradictions between concepts and newer sources;
- duplicated concepts that should be merged;
- important ideas repeatedly mentioned without a concept;
- factual research claims lacking citations in `Works Cited` or archived sources;
- technical claims that no longer match the referenced repository code.

Report findings before destructive cleanup. Never delete, merge, or supersede a concept without
review. Record a completed lint operation as a bullet under the current date in `log.md`.

## Mode: ANSWER AND FILE BACK

1. Check QMD status and query for candidate pages.
2. Read the relevant MOC and full Markdown concepts.
3. Verify technical claims against `source_refs`; do not answer from QMD snippets alone.
4. Cite the specific concept pages used. If the wiki has a gap, say so.
5. File back only durable synthesis. For an accepted file-back, follow INGEST bookkeeping and
   validation steps.

## Mode: ADR

1. Confirm the choice is significant and hard to reverse.
2. Copy `_templates/ADR.md` to `tech/ADR/ADR-NNNN Title.md`, using the next unused number.
3. Set `type: "Architecture Decision Record"` and frontmatter `status`.
4. Fill Context, Decision, Consequences, and Related Notes. State positive and negative
   consequences and any known implementation-conformance gap.
5. Link the ADR to the relevant initiative, solution, flow, or QA page.
6. Register it in `tech/ADR/ADR MOC.md`, update root `index.md`, and add a log bullet.
7. Accepted ADR bodies are immutable. Supersede an accepted decision with a new ADR and link
   both records.
8. Run lint and rebuild QMD.

## Commands

```bash
pnpm wiki:lint
pnpm wiki:lint:test
pnpm wiki:qmd:status
pnpm wiki:qmd:query "question" -- --json --no-rerank -n 10
pnpm wiki:qmd:rebuild
```

## References

- `llm-wiki/AGENTS.md` — canonical schema.
- `llm-wiki/index.md` — exhaustive root catalogue.
- `llm-wiki/log.md` — newest-first date-grouped update history.
- `llm-wiki/sources/` — immutable source bodies.
- `llm-wiki/tech/ADR/ADR MOC.md` — ADR register.
- `llm-wiki/tech/Technical Architecture (MOC).md` — runtime-flow entry point.
- `llm-wiki/product/strategy/Product Strategy 2026 (MOC).md` — product entry point.
- `llm-wiki/quality/Quality & Testing (MOC).md` — QA entry point.
- `llm-wiki/operations/Operations (MOC).md` — knowledge-system operations entry point.
