---
type: "Map of Content"
title: "Product Strategy 2026 (MOC)"
description: "Map-of-content and executive summary for Nimara's 2026 product strategy — roadmap, competitive positioning, and composable market assessment. Entry point for all strategy notes."
tags:
  - "strategy"
  - "moc"
  - "roadmap"
  - "index"
  - "2026"
created: "2026-06-16T00:00:00+00:00"
timestamp: "2026-07-15T11:10:59+02:00"
status: "research_hypothesis"
knowledge_status: "research"
direction_status: "active"
source_status: "incomplete_raw_source"
---

## Content

> **Evidence status:** this is a June 2026 research hypothesis overlaid with current product and
> implementation knowledge. Implementation reality remains documented under
> [Nimara](../../system/Nimara.md); conflicts are preserved instead of rewriting the original
> research rankings.

### Current direction overlay

- Marketplace, custom search, and OPS stabilization are active.
- CLI/monorepo, Stripe invoice/tax, provider swapping, and Medusa support are planned.
- ACP/UCP endpoint and schema delivery is treated as complete, although the code remains
  protocol-partial.
- Natural-language discovery and detailed ledger/batch evolution remain untracked directions.

See [Initiative Prioritization](./initiatives/Initiative%20Prioritization.md).

### Executive summary

The headless commerce landscape is in a critical transition — mainstream enterprise adoption of microservices alongside rising developer frustration with integration complexity and deployment friction. To secure a dominant position as a scaling open-source storefront, Nimara should focus immediate engineering on eliminating setup barriers for its primary developer persona while executing its two 2026 bets in marketplace and agentic commerce.

The core recommendation: prioritize an automated **"Zero-to-Deploy" setup CLI** alongside a production-grade, open-source **Stripe Connect split-payment engine**, then establish early compatibility with emerging AI-agent standards (**MCP** and **UCP**). By also addressing store-operator compliance needs and keeping the core fully open-source, Nimara captures share from expensive gated enterprise platforms and complex self-hosted alternatives — converting developer adoption directly into transactional value.

> Source: Gemini Deep Research, "Strategic Product Report: Nimara.store Roadmapping, Competitive Positioning, and Composable Market Assessment" (June 16, 2026). Full sources in [Works Cited](../../references/Works%20Cited.md).

### Market & competitive findings

- [Composable Commerce Market](../market/Composable%20Commerce%20Market.md) — market size, economics, the adoption bottleneck
- [Competitor Landscape](../market/Competitor%20Landscape.md) — Saleor, Medusa, commercetools, Alokai, Vendure, Hydrogen, Swell and more
- [Table Stakes vs Differentiators](../market/Table%20Stakes%20vs%20Differentiators.md) — what's commoditized vs Nimara's opportunity
- [Emerging Trends 2026](../market/Emerging%20Trends%202026.md) — agentic commerce, UCP/MCP, marketplaces, deploy-in-minutes DX
- [Developer Pain Points](../market/Developer%20Pain%20Points.md) — community feedback and competitor stability/security gaps

### Prioritized roadmap (seed for PRDs)

- [Initiative Prioritization](./initiatives/Initiative%20Prioritization.md) — the ranked scoring table
  1. [1 - Zero-to-Deploy CLI](./initiatives/1%20-%20Zero-to-Deploy%20CLI.md) — _Now_
  2. [2 - Stripe Connect Split Payments](./initiatives/2%20-%20Stripe%20Connect%20Split%20Payments.md) — _Now_
  3. [3 - UCP-MCP Agentic Discovery](./initiatives/3%20-%20UCP-MCP%20Agentic%20Discovery.md) — _Next_
  4. [4 - Auto-Invoicing & Regional Tax](./initiatives/4%20-%20Auto-Invoicing%20%26%20Regional%20Tax.md) — _Next_
  5. [5 - Provider-Agnostic Interface](./initiatives/5%20-%20Provider-Agnostic%20Interface.md) — _Later_

### Strategic context

- [Marketplace & Agentic Commerce Bets](./Marketplace%20%26%20Agentic%20Commerce%20Bets.md) — evaluation of the two 2026 bets + credible v1s
- [Top-of-Funnel Adoption Moves](./Top-of-Funnel%20Adoption%20Moves.md) — smallest set of moves for developer adoption
- [Do Not Pursue](./Do%20Not%20Pursue.md) — explicit non-goals
- [Open Questions & Assumptions](./Open%20Questions%20%26%20Assumptions.md) — what could change the recommendations

### Personas

- [Storefront Developer](../personas/Storefront%20Developer.md) (primary) · [Ecommerce Manager](../personas/Ecommerce%20Manager.md) · [Marketplace Vendor](../personas/Marketplace%20Vendor.md) · [Anti-Persona - No-Code Solo Merchant](../personas/Anti-Persona%20-%20No-Code%20Solo%20Merchant.md)

## Related Notes

[Initiative Prioritization](./initiatives/Initiative%20Prioritization.md)
[Composable Commerce Market](../market/Composable%20Commerce%20Market.md)
[Works Cited](../../references/Works%20Cited.md)
