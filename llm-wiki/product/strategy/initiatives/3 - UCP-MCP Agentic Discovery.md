---
type: "Strategic Initiative"
title: "3 - UCP-MCP Agentic Discovery"
description: "Research-derived agentic-commerce proposal compared with the ACP and UCP APIs currently present on main."
tags:
  - "strategy"
  - "agentic-commerce"
  - "ucp"
  - "mcp"
created: "2026-06-16T00:00:00+00:00"
timestamp: "2026-07-15T11:10:59+02:00"
status: "research_proposal"
knowledge_status: "mixed"
implementation_status: "partial"
direction_status: "done"
verified_at: "2026-07-15T09:50:07+00:00"
code_branch: "main"
code_commit: "e32732ea85f7e6cfb807b462c7bbc47e6f569603"
scope_paths:
  - "apps/storefront/src/app/.well-known"
  - "apps/storefront/src/app/api/acp"
  - "apps/storefront/src/app/api/ucp"
  - "apps/storefront/src/features/ucp"
---

# Content

## Research proposal

The June 2026 strategy research proposed compatibility with UCP and MCP so products and
transactions can participate in agent-mediated commerce. ACP and UCP delivery slices are treated
as complete, but no dedicated MCP scope is defined.

## Current implementation

The Storefront exposes ACP and UCP discovery, catalog, cart, checkout-session, and order API
surfaces. The UCP order-adjustment path is incomplete and returns an error response. No
general-purpose MCP server implementation was observed in the reviewed application code, so
the original UCP-MCP label does not describe the exact present protocol surface.

## Direction and gaps

ACP/UCP endpoint and schema direction is treated as `done`. Code remains protocol-partial: AP2
verification is dummy, idempotency is in-memory, payment handlers are not advertised, and order
adjustment is absent. MCP scope is not defined, so the combined initiative title remains broader
than the current product direction.

## Evidence

- Directional source: [Initiative Prioritization](./Initiative%20Prioritization.md).
- Code baseline: [Main e32732e Snapshot](../../../sources/codebase/Main%20e32732e%20Snapshot.md).

# Related Notes

[Agentic Commerce](../../../system/capabilities/Agentic%20Commerce.md)
[ACP And UCP](../../../tech/integrations/ACP%20And%20UCP.md)
[Runtime And Data Flows](../../../tech/architecture/Runtime%20And%20Data%20Flows.md)
