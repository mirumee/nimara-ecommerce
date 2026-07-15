---
type: "Strategic Initiative Index"
title: "Initiative Prioritization"
description: "Ranked scoring of the five recommended initiatives across impact, strategic fit, market timing, and effort/risk — the master index for the initiative notes."
tags:
  - "strategy"
  - "roadmap"
  - "prioritization"
  - "initiatives"
created: "2026-06-16T00:00:00+00:00"
timestamp: "2026-07-15T11:10:59+02:00"
status: "research_hypothesis"
knowledge_status: "research"
direction_status: "active"
source_status: "incomplete_raw_source"
---

## Content

> **Evidence status:** ranks and tiers come from the June 2026 research synthesis. The current
> context below records product direction and implementation reality without retroactively
> changing that research scoring.

Scores are 1–5 (higher = stronger), except Effort/Risk where higher = more effort/risk.

| Initiative                                                                              | Target Persona                                                   | Impact | Strategic Fit | Market Timing | Effort/Risk | Tier      |
| :-------------------------------------------------------------------------------------- | :--------------------------------------------------------------- | :----: | :-----------: | :-----------: | :---------: | :-------- |
| [1 - Zero-to-Deploy CLI](./1%20-%20Zero-to-Deploy%20CLI.md)                             | [Storefront Developer](../../personas/Storefront%20Developer.md) |   5    |       5       |       5       | 2 (Low/Med) | **Now**   |
| [2 - Stripe Connect Split Payments](./2%20-%20Stripe%20Connect%20Split%20Payments.md)   | [Marketplace Vendor](../../personas/Marketplace%20Vendor.md)     |   4    |       4       |       5       |  4 (High)   | **Now**   |
| [3 - UCP-MCP Agentic Discovery](./3%20-%20UCP-MCP%20Agentic%20Discovery.md)             | [Storefront Developer](../../personas/Storefront%20Developer.md) |   4    |       5       |       5       | 3 (Medium)  | **Next**  |
| [4 - Auto-Invoicing & Regional Tax](./4%20-%20Auto-Invoicing%20%26%20Regional%20Tax.md) | [Ecommerce Manager](../../personas/Ecommerce%20Manager.md)       |   3    |       3       |       4       |   2 (Low)   | **Next**  |
| [5 - Provider-Agnostic Interface](./5%20-%20Provider-Agnostic%20Interface.md)           | [Storefront Developer](../../personas/Storefront%20Developer.md) |   3    |       4       |       3       |  4 (High)   | **Later** |

### Current product and implementation context

| Initiative                    | Strategic direction                               | Current Nimara state                                                                 | Next decision                                                                  |
| ----------------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| Zero-to-Deploy CLI            | Planned; onboarding is active                     | Scripts, docs, and Terraform exist, but no integrated CLI                            | Define the supported setup-to-deploy journey and success metric                |
| Stripe Connect Split Payments | Active Marketplace investment                     | Substantial payment, ledger, batch, and Transfer code; readiness gaps remain         | Define fee/refund accounting, authorization, and production-readiness criteria |
| UCP-MCP Agentic Discovery     | ACP/UCP scope treated as delivered; MCP untracked | ACP/UCP remain partial against broader protocol expectations; no MCP server observed | Define protocol conformance, durability, payment, and MCP scope                |
| Auto-Invoicing & Regional Tax | Planned and still being refined                   | Dedicated invoice/tax capability not observed                                        | Define regional scope and the Nimara/Saleor ownership boundary                 |
| Provider-Agnostic Interface   | Planned                                           | CMS/search seams exist; universal commerce-provider portability does not             | Select the provider boundary and compatibility guarantee                       |

The live portfolio is mixed rather than the simple Now/Next/Later sequence from research. The
individual initiative pages preserve the difference between strategic intent and current state.

### How to use this for PRDs

- Each row links to a full initiative note containing Outcome, rationale, success criteria, in/out of scope, and risks — ready to seed a PRD.
- "Now" tier = the two bets to staff immediately; "Next"/"Later" = sequence behind them.
- Pair this with the PRD template conventions when drafting PRDs.

## Related Notes

[1 - Zero-to-Deploy CLI](./1%20-%20Zero-to-Deploy%20CLI.md)
[2 - Stripe Connect Split Payments](./2%20-%20Stripe%20Connect%20Split%20Payments.md)
[3 - UCP-MCP Agentic Discovery](./3%20-%20UCP-MCP%20Agentic%20Discovery.md)
[4 - Auto-Invoicing & Regional Tax](./4%20-%20Auto-Invoicing%20%26%20Regional%20Tax.md)
[5 - Provider-Agnostic Interface](./5%20-%20Provider-Agnostic%20Interface.md)
[Product Strategy 2026 (MOC)](../Product%20Strategy%202026%20%28MOC%29.md)
[Table Stakes vs Differentiators](../../market/Table%20Stakes%20vs%20Differentiators.md)
