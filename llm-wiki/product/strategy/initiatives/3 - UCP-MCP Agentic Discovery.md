---
type: "Strategic Initiative"
title: "3 - UCP-MCP Agentic Discovery"
description: "Next-tier discovery initiative for exposing accurate catalog and checkout capabilities to commerce agents through UCP and MCP-compatible surfaces."
tags:
  - "strategy"
  - "initiative"
  - "agentic-commerce"
  - "ucp"
  - "mcp"
created: "2026-07-09T00:00:00+00:00"
timestamp: "2026-07-10T00:00:00+02:00"
status: "discovery"
owner: "product"
---

# Content

## Outcome

External agents can discover Nimara products and perform supported checkout operations using
current prices, inventory, variants, and fulfillment constraints without depending on the
browser storefront.

## Discovery questions

- Which UCP capabilities are already represented by the current storefront API routes?
- Which read-only catalog operations belong in an MCP surface rather than UCP?
- How will agent responses inherit the same cache invalidation and availability guarantees as
  the storefront?
- Which authorization and rate-limit boundaries are required before transactional access?

## Exit criterion

Produce a tested compatibility matrix and a narrow production proposal. Do not broaden the
public agent surface until stale inventory, authorization, observability, and failure recovery
have explicit owners.

# Related Notes

[Initiative Prioritization](product/strategy/initiatives/Initiative%20Prioritization.md)
[Emerging Trends 2026](product/market/Emerging%20Trends%202026.md)
[Marketplace & Agentic Commerce Bets](product/strategy/Marketplace%20%26%20Agentic%20Commerce%20Bets.md)
[Storefront Data Flow](tech/flows/Storefront%20Data%20Flow.md)
