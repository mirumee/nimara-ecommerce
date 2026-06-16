**Summary**: Initiatives Nimara should explicitly avoid — distractions and traps that would dilute its code-first, composable, open-source positioning.

**Tags**: #strategy #antipattern #scope #donotpursue
**Created**: 2026-06-16T00:00:00+00:00
**Last Updated**: 2026-06-16T00:00:00+00:00

---
## Content

- **Drag-and-drop visual theme editor** — pulls Nimara into direct competition with hosted Shopify-style setups and Alokai's visual editors, violates the code-first persona, and adds heavy monorepo tech debt. (See [[Anti-Persona - No-Code Solo Merchant]].)
- **Bi-directional vendor store catalog sync engines** — real-time sync to external platforms (Shopify, WooCommerce) is highly complex due to API drift; should stay an enterprise-tier plugin / custom integration concern.
- **Proprietary search indexing & storage engine** — inefficient to build and maintain; Medusa v2's search-module removal shows the unsustainable overhead. Adopters expect clean integrations with Algolia/Meilisearch (see [[Developer Pain Points]]).
- **Closed-source marketplace gateway or enterprise add-ons** — gating multi-vendor behind a paid license is counterproductive at this growth phase. Open-source accessibility is the top-of-funnel engine; monetize via managed deployment infrastructure and SLA-backed support instead.

## Related Notes
[[Anti-Persona - No-Code Solo Merchant]]
[[Developer Pain Points]]
[[Initiative Prioritization]]
[[Product Strategy 2026 (MOC)]]
