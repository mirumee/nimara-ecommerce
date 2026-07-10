# Directory Update Log

## 2026-07-10

- **Creation**: Added [Technical Architecture (MOC)](tech/Technical%20Architecture%20%28MOC%29.md) and five verified runtime-flow concepts.
- **Decision**: Recorded [ADR-0001 Use Separate Charges and Transfers for Marketplace Settlement](tech/ADR/ADR-0001%20Use%20Separate%20Charges%20and%20Transfers%20for%20Marketplace%20Settlement.md).
- **Tracer**: Connected Stripe Connect initiative, solution, ADR, runtime flow, repository sources, and QA verification.
- **Lint**: Added deterministic OKF, index, link, freshness, source, orphan, and relationship checks through `pnpm wiki:lint`.
- **Process**: Added `Wiki impact: none | update | ADR` to the pull request template and scheduled the one-month usefulness review.

## 2026-07-09

- **Creation**: Added an OKF placeholder for [3 - UCP-MCP Agentic Discovery](product/strategy/initiatives/3%20-%20UCP-MCP%20Agentic%20Discovery.md), which was referenced by the initiative index.
- **Update**: Reworked `llm-wiki/` into OKF v0.1-style documents: YAML frontmatter for concept files, standard Markdown cross-links, and OKF reserved-file structure for `index.md` and `log.md`.
- **Lint**: Renamed `README.md` to `AGENTS.md`, added `index.md`, `log.md`, and `sources/`, and updated the wiki-maintenance conventions for the LLM-wiki pattern.
