---
type: "Map of Content"
title: "Operations (MOC)"
description: "Entry point for operating and evaluating Nimara's maintained LLM knowledge system."
tags:
  - "operations"
  - "moc"
  - "llm-wiki"
created: "2026-07-10T00:00:00+02:00"
timestamp: "2026-07-10T00:00:00+02:00"
status: "verified"
owner: "wiki-maintainers"
verified_at: "2026-07-10T00:00:00+02:00"
source_refs:
  - "wiki:AGENTS.md"
  - "repo:scripts/wiki-lint.mjs"
---

# Content

## Knowledge-system operations

- [LLM Wiki Usefulness Review](operations/LLM%20Wiki%20Usefulness%20Review.md) — baseline,
  one-month metrics, and the decision gate before further ingestion automation.
- `pnpm wiki:lint` — deterministic conformance and graph-health gate.
- `pnpm wiki:qmd:rebuild` — local retrieval refresh after Markdown changes.

## Operating boundary

Markdown and repository sources are authoritative. QMD is a disposable discovery index. New
automation must remain human-reviewed until the usefulness review demonstrates that retrieval
quality and time saved justify the additional maintenance surface.

# Related Notes

[LLM Wiki Usefulness Review](operations/LLM%20Wiki%20Usefulness%20Review.md)
[Technical Architecture (MOC)](tech/Technical%20Architecture%20%28MOC%29.md)
[Agent Instructions](AGENTS.md)
