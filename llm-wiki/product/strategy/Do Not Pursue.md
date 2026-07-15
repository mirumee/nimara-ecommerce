---
type: "Strategy Note"
title: "Do Not Pursue"
description: "Initiatives Nimara should explicitly avoid — distractions and traps that would dilute its code-first, composable, open-source positioning."
tags:
  - "strategy"
  - "antipattern"
  - "scope"
  - "donotpursue"
created: "2026-06-16T00:00:00+00:00"
timestamp: "2026-07-15T11:10:59+02:00"
status: "research_hypothesis"
knowledge_status: "research"
direction_status: "unknown"
source_status: "incomplete_raw_source"
---

## Content

- **Drag-and-drop visual theme editor** — pulls Nimara into direct competition with hosted Shopify-style setups and Alokai's visual editors, violates the code-first persona, and adds heavy monorepo tech debt. (See [Anti-Persona - No-Code Solo Merchant](../personas/Anti-Persona%20-%20No-Code%20Solo%20Merchant.md).)
- **Bi-directional vendor store catalog sync engines** — real-time sync to external platforms (Shopify, WooCommerce) is highly complex due to API drift; should stay an enterprise-tier plugin / custom integration concern.
- **Proprietary search indexing & storage engine** — inefficient to build and maintain; Medusa v2's search-module removal shows the unsustainable overhead. Adopters expect clean integrations with Algolia/Meilisearch (see [Developer Pain Points](../market/Developer%20Pain%20Points.md)).
- **Closed-source marketplace gateway or enterprise add-ons** — gating multi-vendor behind a paid license is counterproductive at this growth phase. Open-source accessibility is the top-of-funnel engine; monetize via managed deployment infrastructure and SLA-backed support instead.

### Search-engine boundary

The warning against a proprietary search indexing/storage engine must be reconciled with active
custom-search work. A Nimara search service should remain replaceable and clearly bounded rather
than become an inseparable proprietary platform. The exact boundary between reference service,
provider integration, and maintained engine remains an open strategic decision.

## Related Notes

[Anti-Persona - No-Code Solo Merchant](../personas/Anti-Persona%20-%20No-Code%20Solo%20Merchant.md)
[Developer Pain Points](../market/Developer%20Pain%20Points.md)
[Initiative Prioritization](./initiatives/Initiative%20Prioritization.md)
[Product Strategy 2026 (MOC)](./Product%20Strategy%202026%20%28MOC%29.md)
