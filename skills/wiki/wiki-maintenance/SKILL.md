---
name: wiki-maintenance
description: Maintain the llm-wiki knowledge base — ingest a new source into interlinked notes, lint/audit the graph (orphans, dangling links, uncited claims, format drift), or answer a question from the wiki and file the answer back so knowledge compounds. Use this skill whenever the user wants to add/ingest a document or research into the wiki, audit/lint/clean up the wiki, check for broken [[links]] or orphan notes, or ask a question that the wiki should answer (and save the answer). Follows the schema in llm-wiki/README.md. Do NOT use to write an epic (use epic-definition) or to run QA (use the skills/qa/* skills).
---

# Wiki Maintenance

Keep `llm-wiki/` coherent and compounding. This skill is the executable runbook for the
schema in `llm-wiki/README.md` — read that first; it defines the folder layout, the note
format, naming/linking, and the scoped citation rules this skill enforces.

Three modes. Pick by what the user asked.

## Operating principles

1. **Schema is law.** Every note you create or edit matches the format in
   `llm-wiki/README.md` (Summary + Tags + Created/Last Updated → Content → Related Notes),
   Title-Case filenames, `[[Title]]` wikilinks.
2. **Provenance scoped by kind.** Research notes (`market/`, `references/`) need hard
   citations to `references/Works Cited.md`; operational notes (`qa/`, `personas/`,
   `strategy/`) use soft provenance + `[ASSUMPTION]` tags. Never state AI-generated
   research as verified fact.
3. **Keep the graph navigable.** Every new note lands in a domain **MOC** and carries a
   `## Related Notes` block. Update the MOC in the same change.
4. **Discuss before writing.** Especially on ingest — surface takeaways and the proposed
   note set to the user before creating files. A single source may touch many notes.
5. **Never fabricate.** Missing source, ambiguous claim, or no home folder → ASK.

---

## Mode: INGEST — turn a source into notes

Use when the user gives you a document, research dump, or URL to fold into the wiki.

1. **READ** the full source. Don't skim.
2. **DISCUSS** key takeaways with the user and propose the note set (which existing notes
   get updated, which new ones get created, which folder each belongs to) *before* writing.
3. **WRITE / UPDATE notes** per the schema:
   - A per-source summary note when the source is external research → goes in `market/`
     or `references/` with hard citations `(source: …)`.
   - Concept/entity notes for each major idea → the folder matching its kind.
   - Bump `**Last Updated**`; add `**Created**` on new notes.
4. **LINK** — add `[[wikilinks]]` inline where concepts connect, and fill each note's
   `## Related Notes`. Stub links to not-yet-written notes are fine.
5. **UPDATE the MOC** for each domain touched (add the note + a one-line description).
6. **REPORT** what changed: notes created/updated, links added, any stubs left, any claim
   you couldn't source (flag as needs-verification).

## Mode: LINT — audit the graph

Use when the user asks to lint, audit, or clean up the wiki. Report findings as a
numbered list with a suggested fix per item; **don't auto-edit unless asked.**

Check, across `llm-wiki/**`:

1. **Dangling links** — `[[targets]]` with no matching note file. (This is how the missing
   `initiatives/1..5` notes surface.)
2. **Orphans** — notes with no inbound `[[link]]` from any other note or MOC.
3. **Missing concept pages** — entities/ideas referenced repeatedly across notes that lack
   their own note.
4. **Format drift** — notes missing `**Summary**`, `**Tags**`, `**Last Updated**`, the
   `---` separator, or a `## Related Notes` block; filenames not matching their title.
5. **Uncited claims** — in `market/`/`references/`, factual claims (stats, CVEs, sizes) with
   no `(source: …)` and no entry in `references/Works Cited.md`; anywhere, a strong claim
   with neither source nor `[ASSUMPTION]`.
6. **MOC coverage** — notes not indexed by any MOC; MOC entries pointing at deleted notes.
7. **Stale-vs-source** — claims contradicted by a newer ingested source (flag, don't guess).

Method: prefer `grep`/`Glob` for links, headings, and filenames — deterministic, no flake.

## Mode: ANSWER-AND-FILE-BACK — answer, then compound

Use when the user asks a question the wiki should cover.

1. **READ the relevant MOC first** (`strategy/…(MOC)` or `qa/…(MOC)`) to find the right
   notes, then read those notes.
2. **SYNTHESISE** an answer, **citing the specific notes** you drew from (`[[Note]]`).
3. **If the wiki doesn't cover it, say so plainly** — don't invent.
4. **OFFER TO FILE IT BACK** — if the answer is durable and reusable, propose saving it as
   a new note (or extending an existing one) so the next reader gets it for free. On yes,
   switch to INGEST mode for that answer.

---

## References
- `llm-wiki/README.md` — the schema this skill enforces.
- `[[Product Strategy 2026 (MOC)]]` · `[[Quality & Testing (MOC)]]` — the domain indexes.
- `[[Works Cited]]` — provenance record for research claims.
