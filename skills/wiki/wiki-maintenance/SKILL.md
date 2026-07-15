---
name: wiki-maintenance
description: Maintain the Nimara llm-wiki knowledge base: ingest sources, audit links and provenance, record ADRs, or answer and file durable knowledge back into the encyclopedia. Use for llm-wiki ingest, lint, cleanup, freshness, source reconciliation, ADR work, and durable answers. Do not use to author PRDs or execute QA runs.
---

# Wiki Maintenance

Maintain `llm-wiki/` as the current, evidence-backed encyclopedia of Nimara. Read
`llm-wiki/AGENTS.md` completely before acting; it is the schema and overrides examples here.
QMD discovers candidate notes, while Markdown and cited sources determine the verdict.

## Operating Principles

1. **Schema is law.** Use OKF frontmatter and document-relative Markdown links. Never create
   Obsidian wikilinks.
2. **Evidence is typed.** Code on `main` proves implementation; product knowledge describes
   direction; PRDs/ADRs prove expected behavior and rationale; runtime evidence proves
   deployment. Do not let one evidence type impersonate another.
3. **Preserve conflicts.** When direction and code differ, record both on the relevant
   application or capability page under `Current implementation`, `Direction and gaps`, and
   `Evidence`.
4. **Keep the graph navigable.** Every new concept is registered in the root `index.md`, its
   domain MOC, and `log.md` in the same change.
5. **No delivery-history encyclopedias.** Operational trackers are temporary analysis inputs. Create a
   note only for a durable concept, decision, or major cross-cutting discrepancy. Never create a
   `delivery/` directory or persist source-specific work-item identifiers.
6. **Protect operational inputs.** Never archive tracker exports in the wiki. After synthesis,
   delete the input and retain only source-neutral knowledge without comments, worklogs,
   attachments, personal data, secrets, or confidential text.
7. **Decisions are ADRs.** Significant, hard-to-reverse technical decisions live in
   `tech/ADR/` and are not buried in prose.
8. **Never fabricate.** Mark uncertain claims `unknown` and state the missing evidence.

## Mode: INGEST

Use for a new report, operational export, or other source.

1. Read the complete source and inspect its scope before synthesis.
2. Archive only durable sources that are independently useful and safe for Git. Operational
   tracker exports remain temporary and are deleted after analysis; do not create manifests for
   them inside the wiki.
3. Propose the affected concepts before broad changes. Prefer updating applications and
   capabilities over creating source-shaped pages.
4. Write or update concepts using the schema and evidence fields in `llm-wiki/AGENTS.md`.
5. Add document-relative links, update the relevant MOCs and root index, and append a dated
   entry to `log.md`.
6. Run `pnpm wiki:check`, then `pnpm wiki:qmd:rebuild` after Markdown changes.

## Mode: CODEBASE REFRESH

Use when the Nimara current-state pages must follow a newer `main`.

1. Record the local `main` SHA, commit date, and verification time in a new immutable manifest
   under `llm-wiki/sources/codebase/`.
2. Inspect routes, service registries, provider manifests, schemas/migrations, app/package
   manifests, tests, and CI at that exact commit. File presence without wiring is
   `implemented_unwired`, not `wired`.
3. Update affected application, capability, architecture, and integration pages. Refresh
   `verified_at`, `code_commit`, and `scope_paths` only after reading the cited paths.
4. Preserve current product direction separately. A code refresh must not silently change
   direction claims.
5. Update MOCs, root index, and log; run `pnpm wiki:check` and rebuild QMD.

## Mode: LINT

Use for audits and cleanup. Report before editing unless the user explicitly asked for fixes.

Check:

- parseable frontmatter and required `type`;
- document-relative local links and dangling targets;
- root-index and MOC coverage;
- current-state evidence fields and valid `scope_paths` at the recorded commit;
- operational tracker exports or source-specific work-item identifiers persisted in the wiki;
- stale code stamps compared with local `main`;
- source integrity, uncited research claims, and contradictory newer evidence;
- concepts repeatedly referenced but not represented by a page.

QMD is not a linter. Use deterministic file and Git checks. Log a lint operation only when the
wiki files themselves are changed or the user explicitly requests a durable audit record.

## Mode: ANSWER AND FILE BACK

1. Run `pnpm wiki:qmd:query "<question>" -- --json --no-rerank -n 10` and read the relevant
   MOC plus the full Markdown candidates.
2. Verify current-state claims against their evidence stamps. Recheck `main` when freshness is
   uncertain.
3. Answer with specific wiki references and name gaps plainly.
4. If the answer is durable, update the smallest relevant application, capability, architecture,
   or integration concept. Update indexes and the log, run `pnpm wiki:check`, then rebuild QMD.

## Mode: ADR

1. Confirm the choice is significant and hard to reverse.
2. Copy `_templates/ADR.md` to `tech/ADR/ADR-NNNN Title.md` using the next unused number.
3. Fill status, context, decision, and positive/negative consequences. One decision per note.
4. Link the relevant RFC, PRD, capability, or architecture concept in both directions.
5. Register it in `tech/ADR/ADR MOC.md`, root `index.md`, and `log.md`.
6. Supersede accepted ADRs with a new ADR rather than rewriting their decision.
7. Run `pnpm wiki:check` and rebuild QMD.

## References

- `llm-wiki/AGENTS.md` - canonical schema and evidence model.
- `llm-wiki/index.md` - exhaustive catalogue.
- `llm-wiki/log.md` - chronological update history.
- `llm-wiki/system/` - current Nimara encyclopedia.
- `llm-wiki/sources/` - immutable, safe-to-commit source manifests.
