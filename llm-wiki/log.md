# Wiki log

Append-only chronicle of wiki operations, newest last. **Machine-maintained — never edit past
entries.** One entry per operation. Each entry starts with a parseable prefix so the log can be
scanned with plain tools:

```
grep "^## \[" log.md | tail -5
```

Entry format — a level-2 heading `[DATE] <mode> | Title`, then one line of detail:

    (heading)  [YYYY-MM-DD] <mode> | Title
    (body)     one line: what happened — notes created/updated, sources archived, links added.

`<mode>` is one of: `ingest`, `query`, `lint`, `adr`. Only real entries below the `---` use
the `##` heading, so `grep "^## \["` returns exactly the operation history.

---

## [2026-07-09] lint | Align wiki with Karpathy's LLM-wiki pattern
Renamed README.md → AGENTS.md (schema layer); added index.md (global catalogue), log.md (this file), and sources/ (raw layer, seeded with the Deep Research report stub); updated wiki-maintenance skill with LOG/index/sources steps.
