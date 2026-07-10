# Directory Update Log

## 2026-07-10

- **Grilling log**: Added the decision record and reusable template for [EPIC-001 Natural-Language Product Discovery](product/epics/EPIC-001%20Natural-Language%20Product%20Discovery.md), including the business interview, exclusions, deferred technical branches, and unresolved decisions.
- **Epic refinement**: Renamed [EPIC-001 Natural-Language Product Discovery](product/epics/EPIC-001%20Natural-Language%20Product%20Discovery.md), promoted it to `analyzing`, and replaced the client-delivery framing with the agreed market-parity hypothesis, validation thresholds, falsification, and MVP boundaries.

## 2026-07-13

- **Update**: Pinned the Saleor source version (**3.23.17**) across the `tech/saleor/` reference bundle — added a `saleor_version` frontmatter field and a one-line **Saleor version:** body callout to all 18 notes, and noted the version in `index.md`. Added a [Source-Derived Reference Notes](AGENTS.md) rule to `AGENTS.md` requiring versioned source notes to record their source version (in frontmatter + body) and to be re-synthesized when the source version changes.

## 2026-07-10

- **Ingest**: Saleor GraphQL Schema (`sources/saleor/schema.graphql`). Synthesized the archived schema into a new `tech/saleor/` reference bundle — [Saleor GraphQL API (MOC)](tech/saleor/Saleor%20GraphQL%20API%20%28MOC%29.md), an overview, and 16 per-domain notes (products, attributes, categories & collections, checkout, orders & fulfillment, payments & transactions, accounts & permissions, channels, warehouses & stock, shipping, taxes, discounts, gift cards, content & navigation, apps/webhooks/extensibility, translations). Registered the source and all notes in `index.md`.
- **Update**: Added an ADR prerequisite — the agent must confirm the base system (e.g. Saleor, Algolia, or a greenfield app) with the user before writing an ADR — to [AGENTS.md](AGENTS.md), [ADR MOC](tech/ADR/ADR%20MOC.md), and the `_templates/ADR.md` Context section.

## 2026-07-09

- **Creation**: Added an OKF placeholder for [3 - UCP-MCP Agentic Discovery](product/strategy/initiatives/3%20-%20UCP-MCP%20Agentic%20Discovery.md), which was referenced by the initiative index.
- **Update**: Reworked `llm-wiki/` into OKF v0.1-style documents: YAML frontmatter for concept files, standard Markdown cross-links, and OKF reserved-file structure for `index.md` and `log.md`.
- **Lint**: Renamed `README.md` to `AGENTS.md`, added `index.md`, `log.md`, and `sources/`, and updated the wiki-maintenance conventions for the LLM-wiki pattern.
