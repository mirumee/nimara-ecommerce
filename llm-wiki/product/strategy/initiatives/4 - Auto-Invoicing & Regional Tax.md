---
type: "Strategic Initiative"
title: "4 - Auto-Invoicing & Regional Tax"
description: "Research-derived proposal for regional tax and invoice automation, not observed as a dedicated Nimara capability on main."
tags:
  - "strategy"
  - "tax"
  - "invoicing"
created: "2026-06-16T00:00:00+00:00"
timestamp: "2026-07-15T11:10:59+02:00"
status: "research_proposal"
knowledge_status: "mixed"
implementation_status: "not_observed"
direction_status: "planned"
verified_at: "2026-07-15T09:50:07+00:00"
code_branch: "main"
code_commit: "e32732ea85f7e6cfb807b462c7bbc47e6f569603"
scope_paths:
  - "apps/storefront"
  - "apps/marketplace"
  - "packages/infrastructure"
---

# Content

## Research proposal

The June 2026 strategy research proposed automated invoicing and regional tax support as an
operator-facing capability. Matching Stripe expansion remains planned and in refinement.

## Current implementation

No dedicated Nimara invoice-generation or regional-tax orchestration capability was observed
in the reviewed Storefront, Marketplace, or infrastructure packages. Saleor-provided monetary
and tax data may appear in commerce flows, but that is not evidence of the proposed automation.

## Direction and gaps

Invoice creation, Stripe Tax, regeneration, finalization, and customer views are planned and
still being refined. The absence of matching code is consistent with that status. Regional scope,
the Nimara/Saleor ownership boundary, lifecycle, compliance requirements, and acceptance criteria
still need definition.

## Evidence

- Directional source: [Initiative Prioritization](./Initiative%20Prioritization.md).
- Code baseline: [Main e32732e Snapshot](../../../sources/codebase/Main%20e32732e%20Snapshot.md).

# Related Notes

[Marketplace Operations](../../../system/capabilities/Marketplace%20Operations.md)
[Saleor](../../../tech/integrations/Saleor.md)
[Ecommerce Manager](../../personas/Ecommerce%20Manager.md)
