---
name: llm-wiki-bookkeeping
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

Run the repository-defined checks relevant to the operation. Inspect the final diff and
verify:

- every modified record follows the current schema;
- every affected internal link resolves from its source file;
- every required index, register, MOC, or log entry is consistent;
- provenance and source-integrity obligations are satisfied;
- renamed or removed targets have no stale inbound links;
- no unrelated files changed.

Refresh derived retrieval state only when the repository instructions require it.

Completion criterion: report the records and bookkeeping artifacts changed, checks run,
remaining gaps, stale downstream artifacts, and any decisions still requiring the user.
