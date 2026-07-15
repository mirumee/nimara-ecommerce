---
type: "Strategic Initiative"
title: "5 - Provider-Agnostic Interface"
description: "Research-derived provider-abstraction proposal compared with Nimara's current capability-specific service and provider boundaries."
tags:
  - "strategy"
  - "architecture"
  - "providers"
created: "2026-06-16T00:00:00+00:00"
timestamp: "2026-07-15T11:10:59+02:00"
status: "research_proposal"
knowledge_status: "mixed"
implementation_status: "partial"
direction_status: "planned"
verified_at: "2026-07-15T09:50:07+00:00"
code_branch: "main"
code_commit: "e32732ea85f7e6cfb807b462c7bbc47e6f569603"
scope_paths:
  - "apps/storefront/src/services"
  - "packages/domain/src"
  - "packages/infrastructure/src"
---

# Content

## Research proposal

The June 2026 strategy research proposed a more provider-agnostic interface to reduce backend
and vendor lock-in. Provider swapping and Medusa exploration are planned, but the exact product
boundary remains broad.

## Current implementation

Nimara already has capability-specific domain contracts, infrastructure services, storefront
loaders, and selectable providers. Search supports Saleor, Algolia, and dummy implementations;
CMS supports Saleor, ButterCMS, and dummy implementations; payments are narrower. These seams
are real but do not amount to one universal provider-agnostic commerce interface, and observed
package dependencies do not perfectly follow the intended layering model.

## Direction and gaps

Medusa attributes and platform validation remain planned or in refinement. Code is already
partial relative to this direction for CMS/search, while payments and the wider commerce engine
are not generally interchangeable. The concrete boundary, consumer, migration use case, and
compatibility guarantee still need definition.

## Evidence

- Directional source: [Initiative Prioritization](./Initiative%20Prioritization.md).
- Code baseline: [Main e32732e Snapshot](../../../sources/codebase/Main%20e32732e%20Snapshot.md).

# Related Notes

[Service And Provider Architecture](../../../tech/architecture/Service%20And%20Provider%20Architecture.md)
[Monorepo Layers](../../../tech/architecture/Monorepo%20Layers.md)
[CMS And Search](../../../tech/integrations/CMS%20And%20Search.md)
