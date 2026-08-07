check @README.md

## Skills

These live under `.claude/skills/`, so only Claude Code loads them as skills — and only after it
reads a file in this directory. Every other agent should read them as plain Markdown, because they
hold the operating rules that `README.md` deliberately does not repeat.

- [explore](.claude/skills/explore/SKILL.md) — the ways into this directory and how to answer from
  what you find. Read-only. Its
  [semantic-search](.claude/skills/explore/references/semantic-search.md) reference covers `qmd`.
- [bookkeeping](.claude/skills/bookkeeping/SKILL.md) — ingesting a source, filing a record,
  auditing or repairing the graph, reconciling the index and log, recording a decision. It owns
  `pnpm wiki:lint` and `pnpm wiki:index:sync`, and its
  [saleor-schema-notes](.claude/skills/bookkeeping/references/saleor-schema-notes.md) reference
  covers the freshness stamp.
- [prd-modeling](.claude/skills/prd-modeling/SKILL.md) — writing a PRD, stopping at an approved one.
- [rfc-modeling](.claude/skills/rfc-modeling/SKILL.md) — turning an approved PRD into an RFC
  proposal, stopping short of the decision.
- [grilling](.claude/skills/grilling/SKILL.md) — stress-testing a plan one question at a time.
  `prd-modeling` runs it.
- [handoff](.claude/skills/handoff/SKILL.md) — compacting a conversation for the next agent.
  `prd-modeling` runs it.

Any change to this directory ends with `pnpm wiki:lint` at zero violations.
