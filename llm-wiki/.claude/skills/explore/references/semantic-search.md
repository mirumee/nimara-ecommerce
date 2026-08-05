# Semantic search with qmd

`qmd` is a local index over the wiki's Markdown. Use it when the question is a phrase rather than
a location, and when you do not know which record would hold the answer. The Markdown files stay
the source of truth; the index is a way of finding candidates, never a way of proving anything.

Verified against qmd 2.5.3. `qmd` is not a repo dependency — `npm install -g @tobilu/qmd`.

## Check the index before trusting a result

```bash
pnpm wiki:qmd:status
```

Read the counters together. `Total: 0 files indexed` next to a non-zero `Vectors` means the
collection points at a directory that is not this checkout — usually an abandoned worktree — and
every result describes a tree you cannot see. Confirm where it points:

```bash
qmd --index nimara-wiki collection show nimara-wiki
```

**`pnpm wiki:qmd:setup` will not repair this.** It only adds the collection when none exists; with
one already configured it prints `already configured` and changes nothing. Repointing takes a
removal first:

```bash
qmd --index nimara-wiki collection remove nimara-wiki
pnpm wiki:qmd:setup
pnpm wiki:qmd:rebuild                # update, then embed
```

After ordinary Markdown edits, `pnpm wiki:qmd:update` reindexes and `pnpm wiki:qmd:embed` refreshes
the vectors. Semantic results reflect an edit only after the embed; `update` alone leaves `Pending:
N need embedding` in the status.

The index lives in `~/.cache/qmd/nimara-wiki.sqlite`, is local developer state, and is never
committed.

## Querying

```bash
pnpm wiki:qmd:query "the user's question" -- --format json --no-rerank -n 10
pnpm wiki:qmd:search "redisplay" -- --format json -n 5
pnpm wiki:qmd:get "#152b30" -- --full
pnpm wiki:qmd:ls
```

- **`query` is hybrid** — expansion, vectors, and reranking. Use it for anything shaped like a
  question. Asked "how does the marketplace pay vendors after an order is paid", it returns
  CAP-0002 and FLOW-0002, which is the right pair.
- **`search` is BM25 keywords only.** Use it for short probes — `redisplay`, `ADR`, `moderation`.
  Handed a full sentence it returns nothing: the same question that `query` answers correctly gave
  `search` zero hits, and two of three sentence-shaped probes returned zero. That reads as "the
  wiki has no answer" when it means "wrong tool".
- **`get` accepts the `docid`** from a result, including the leading `#`. Prefer it over a path.
- **`--format json` is the documented flag.** `--json` currently works as an alias but is not in
  `qmd --help`, so it may not survive an upgrade.
- **`pnpm --silent` is required** if you intend to parse the JSON; otherwise pnpm prints its own
  banner onto stdout and the output no longer parses.

If `pnpm` misbehaves, the wrapper works directly, and it does not need the `--` separator:

```bash
node llm-wiki/_scripts/wiki-qmd.mjs query "question" --format json --no-rerank -n 10
```

`pnpm wiki:qmd:mcp` exposes the same index over MCP, for a client that would rather call tools than
shell out.

## Failure modes

- **Unknown flags are silently ignored.** A misspelled option does not error and does not apply —
  `search "x" --totally-not-a-flag` prints results as if nothing were passed. Check `qmd --help`
  rather than assuming a flag took effect.
- **Result paths are not repository paths.** qmd slugifies: spaces become hyphens and a leading
  underscore is dropped, so `_templates/OPS.md` appears as `qmd://nimara-wiki/templates/OPS.md`
  and `IMP-0001 Saleor Stored Payment Methods.md` as `IMP-0001-Saleor-Stored-Payment-Methods.md`.
  Filtering results on `_templates` therefore matches nothing.
- **A snippet is not an answer.** qmd returns fragments. Open the file and read it — a record's
  real constraints usually live in its `Limitations` section, which rarely matches the query.
- **A single hit in `log.md` usually means the query missed.** The log holds more prose than any
  record, so when a sentence handed to `search` matches one thing, that thing is often the log —
  which is a symptom of the wrong tool, not an answer. Short probes do not have this problem: across
  four of them, neither `log.md` nor `index.md` appeared in the top ten at all.
- **Zero results is not evidence of absence.** Try `query` if you used `search`, grep the record ID,
  and check `index.md` before concluding the wiki is silent.
- **Retrieval is not validation.** A result proves nothing about link integrity, registration,
  frontmatter, or whether the claim is still true. `pnpm wiki:lint` checks the structure; staleness
  and contradiction need a `bookkeeping` audit.
