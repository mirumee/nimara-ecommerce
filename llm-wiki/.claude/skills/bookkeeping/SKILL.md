---
name: bookkeeping
description: Keep an LLM-wiki coherent while ingesting sources, filing durable knowledge, auditing or repairing its graph, reconciling indexes and logs after content changes, or recording architecture decisions. Use the target wiki's AGENTS.md as the sole authority for its schema, locations, templates, links, provenance, and bookkeeping rules.
---

# LLM Wiki Bookkeeping

Maintain the wiki as a coherent, Git-versioned knowledge graph.

## Establish the contract

Locate the target wiki and read its governing `AGENTS.md` completely before inspecting or
changing records. Treat that file as the single source of truth for:

- the knowledge model and folder structure;
- record frontmatter and templates;
- naming and linking conventions;
- source and provenance rules;
- indexes, registers, logs, and lifecycle rules;
- repository-defined validation and retrieval-refresh commands.

`AGENTS.md` may delegate rather than restate. Where it points at a template, a schema file, or a
command as the authority for a record type, read that too: the governing instructions are the set
it names, not the one file.

Derive these rules from the current checkout. Do not retain or infer them from this skill,
another branch, or prior runs. If the governing instructions are missing, incomplete, or
contradict the requested operation, report the gap before mutating the wiki.

Completion criterion: the requested operation and every affected bookkeeping obligation can
be stated from the current governing instructions.

## Map the impact

Inspect the relevant records and the actual wiki tree. Identify:

- records to create, edit, rename, or remove;
- inbound and outbound links affected by those changes;
- indexes, registers, MOCs, logs, or derived retrieval state affected by the operation;
- sources and provenance needed to support changed claims;
- downstream records that may become stale.

Use deterministic repository searches for graph and format checks. For a read-only audit,
produce findings and proposed fixes without changing files.

Completion criterion: every directly affected record and bookkeeping artifact is accounted
for before mutation begins.

## Perform the requested branch

### Ingest or file knowledge

Preserve source material according to the governing instructions. Separate evidence from
assumptions, synthesize the durable records, and register them using the current schema.
Discuss the proposed record set with the user before writing when filing choices require
product or editorial judgment.

In Nimara's wiki, material under `sources/` keeps its body. Append metadata, provenance, or
citations rather than rewriting the raw text, unless the user asked for a migration or a
correction. A `Saleor Schema Note` additionally carries a freshness stamp — see
`references/saleor-schema-notes.md`.

### Reconcile a content change

After creating, editing, renaming, moving, or removing records, update every affected link
and every bookkeeping artifact required by the governing instructions. Preserve downstream
artifacts unless the user requested their revision; report stale ones.

### Audit or repair

Check every invariant declared by the governing instructions against the actual files,
including record format, graph integrity, registration coverage, provenance, source
integrity, and stale claims. Rank findings by impact and attach a concrete repair. Apply
repairs only when the user requested changes.

### Record a decision

Confirm that the decision belongs to the record type defined for durable architecture
decisions. Use the current template, identifier sequence, location, register, and
supersession rules discovered from the governing instructions.

## Validate and report

Run the repository-defined checks relevant to the operation. In Nimara's `llm-wiki/`:

- **`pnpm wiki:lint`** must end at zero violations, and it closes every change to the directory.
  It checks frontmatter against `_schema.json`, link and anchor integrity, orphans, and register
  coverage. Every violation is an error; there is no warning tier. Machine-readable output is
  `pnpm --silent wiki:lint -- --json` — without `--silent`, pnpm's banner breaks the JSON. It is
  deliberately not wired into CI, so nothing else will run it.
- **`pnpm wiki:index:sync`** after adding, renaming, or removing a note. It adds and removes rows
  in `index.md` and the MOC registers, keeps existing rows verbatim, and appends new ones at the
  end of their section. Several sections are ordered by hand, so move an inserted row when the
  section has a reading order, and shorten the hook it copied from the note's `description`.
- **`pnpm wiki:saleor:check`** before citing or restamping a Saleor schema note.
- **`npx prettier --write`** over the files the operation added or modified, before reporting.
  The repository's `pnpm format:check` gate covers Markdown, so an unformatted record fails CI
  even though `wiki:lint` passes. Pass the changed paths, not a glob: reformatting files the
  operation did not touch buries the real diff and rewrites someone else's prose.
- **`_schema.json` is the machine-readable half of the contracts in `_templates/`.** A contract
  change means changing both. Silencing a rule means adding an `except` entry that states why.

Inspect the final diff and verify:

- every modified record follows the current schema;
- every affected internal link resolves from its source file;
- every required index, register, MOC, or log entry is consistent;
- renamed or removed targets have no stale inbound links;
- no unrelated files changed.

Refresh derived retrieval state only when the repository instructions require it.

Completion criterion: report the records and bookkeeping artifacts changed, checks run,
remaining gaps, stale downstream artifacts, and any decisions still requiring the user.
