---
type: "Strategy Note"
title: "Open Questions & Assumptions"
description: "Assumptions the strategy rests on and the evidence that would change the recommendations — review before committing roadmap."
tags:
  - "strategy"
  - "assumptions"
  - "risk"
  - "openquestions"
created: "2026-06-16T00:00:00+00:00"
timestamp: "2026-06-16T00:00:00+00:00"
---

## Content

- **IaC usage assumption:** Developers use the bundled Terraform/Vercel scripts directly. If they bypass these for manual DevOps pipelines, the value of the **Zero-to-Deploy CLI** initiative diminishes. Validate by researching active repository forks and IaC usage rates.
- **UCP dominance assumption:** Google's UCP becomes the dominant, universally accepted agentic-transaction standard. If competing standards (e.g. OpenAI's Agentic Commerce Protocol) fragment the market, the abstract schema layer must avoid single-vendor protocol lock-in (affects the **UCP-MCP Agentic Discovery** initiative).
- **Saleor capacity assumption:** Saleor's GraphQL API can performantly support split-payment mutations and complex multi-vendor order routing. If Saleor struggles with the DB-level isolation marketplace vendor domains need, a pivot toward a more modular framework (Medusa v2, custom DB views) may be required (affects the **Stripe Connect Split Payments** initiative).

## Related Notes

[Initiative Prioritization](initiatives/Initiative%20Prioritization.md)
[Marketplace & Agentic Commerce Bets](Marketplace%20%26%20Agentic%20Commerce%20Bets.md)
[Product Strategy 2026 (MOC)](Product%20Strategy%202026%20%28MOC%29.md)
