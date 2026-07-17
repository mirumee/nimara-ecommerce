---
okf_version: "0.1"
---

# Root

- [Agent Instructions](AGENTS.md) - Schema, naming rules, maintenance workflow, and operating conventions for this wiki.

# Templates

- [ADR Template](_templates/ADR.md) - Reusable template for architecture decision records.
- [Capability Template](_templates/CAP.md) - Reusable template for documenting a current product capability.
- [Flow Template](_templates/FLOW.md) - Reusable template for documenting an end-to-end product flow.
- [Implementation Template](_templates/IMP.md) - Reusable template for implementation details and verification evidence.
- [Integration Template](_templates/INT.md) - Reusable template for an integration contract.
- [Operations Template](_templates/OPS.md) - Reusable template for runbooks and other operational knowledge.
- [PRD Template](_templates/prd.md) - Reusable template for drafting Nimara Product Requirements Documents.
- [Quality Template](_templates/QA.md) - Reusable template for verification plans and acceptance evidence.
- [RFC Design Doc Template](_templates/RFC.md) - Reusable template for an RFC design proposal: problem, requirements, proposed solution, and cross-cutting considerations.
- [Undefined Template](_templates/Undefined.md) - Generic template for a new concept document.
- [Saleor Schema Note Template](_templates/saleor-schema-note.md) - Reusable template for a version-stamped Saleor GraphQL schema note.

# Sources

- [LLM Wiki](sources/LLM%20Wiki.md) - Upstream LLM-wiki pattern describing raw sources, maintained wiki notes, schema files, indexing, and logs.
- [Strategic Product Report - Nimara.store (Gemini Deep Research)](sources/Strategic%20Product%20Report%20-%20Nimara.store%20%28Gemini%20Deep%20Research%29.md) - Raw source stub for the Deep Research report used by the 2026 strategy and market corpus.

# Product Requirements

- [PRD-001 Natural-Language Product Discovery](prd/PRD-001%20Natural-Language%20Product%20Discovery.md) - Product requirements for closing Nimara's natural-language discovery gap with a reusable, open-source storefront capability.
- [PRD-002 Verified User Reviews](prd/PRD-002%20User%20Reviews.md) - Product requirements for a verified-purchase user reviews system in Nimara.
- [PRD-003 Cookie Consent & Google Consent Mode v2](prd/PRD-003%20Cookie%20Consent.md) - Product requirements for Cookie Consent and Google Consent Mode v2 in the Nimara storefront.

# Product Strategy

- [Product Strategy 2026 (MOC)](product/strategy/Product%20Strategy%202026%20%28MOC%29.md) - Entry point and executive summary for 2026 product strategy.
- [Initiative Prioritization](product/strategy/initiatives/Initiative%20Prioritization.md) - Ranked scoring of recommended initiatives across impact, fit, timing, and effort/risk.
- [Marketplace & Agentic Commerce Bets](product/strategy/Marketplace%20%26%20Agentic%20Commerce%20Bets.md) - Evaluation of the marketplace and agentic-commerce bets.
- [Top-of-Funnel Adoption Moves](product/strategy/Top-of-Funnel%20Adoption%20Moves.md) - High-leverage moves to accelerate open-source developer adoption.
- [Do Not Pursue](product/strategy/Do%20Not%20Pursue.md) - Strategic non-goals and distractions to avoid.
- [Open Questions & Assumptions](product/strategy/Open%20Questions%20%26%20Assumptions.md) - Assumptions behind the strategy and evidence that could change it.

# Product Market

- [Composable Commerce Market](product/market/Composable%20Commerce%20Market.md) - Sector maturity and self-hosted open-source economics above the ~$2-10M revenue threshold.
- [Competitor Landscape](product/market/Competitor%20Landscape.md) - 2026 positioning, architecture, momentum, and DX of competing platforms.
- [Table Stakes vs Differentiators](product/market/Table%20Stakes%20vs%20Differentiators.md) - Commoditized requirements versus Nimara's genuine differentiators.
- [Emerging Trends 2026](product/market/Emerging%20Trends%202026.md) - Agentic commerce, UCP/MCP, marketplaces, and deploy-in-minutes DX.
- [Developer Pain Points](product/market/Developer%20Pain%20Points.md) - Community and GitHub evidence of ecosystem dissatisfaction.

# Product Personas

- [Storefront Developer](product/personas/Storefront%20Developer.md) - Primary developer persona adopting Nimara to ship a production Saleor storefront.
- [Ecommerce Manager](product/personas/Ecommerce%20Manager.md) - Secondary business-operator persona managing commerce operations through dashboards.
- [Marketplace Vendor](product/personas/Marketplace%20Vendor.md) - Secondary third-party seller persona for vendor-panel workflows.
- [Shopper](product/personas/Shopper.md) - Pre-purchase buyer experience persona.
- [Customer](product/personas/Customer.md) - Post-purchase buyer experience persona.
- [QA Engineer (Test Agent)](product/personas/QA%20Engineer%20%28Test%20Agent%29.md) - QA agent persona that verifies behavior from evidence.
- [Anti-Persona - No-Code Solo Merchant](product/personas/Anti-Persona%20-%20No-Code%20Solo%20Merchant.md) - Excluded no-code solo merchant segment.

# Product Tasks

- [LLM Product Discovery - Developer Task Breakdown](product/tasks/llm-product-discovery.json) - Implementation backlog containing 53 tasks across discovery foundations, classic search, AI suggestions, administration, analytics, and launch hardening.

# Quality

- [Quality & Testing (MOC)](quality/Quality%20%26%20Testing%20%28MOC%29.md) - QA map of content and entry point.
- [Bug Retest & Triage Process](quality/Bug%20Retest%20%26%20Triage%20Process.md) - Canonical live-board retest and triage flow.
- [Jira & Board 74 Operating Manual](quality/Jira%20%26%20Board%2074%20Operating%20Manual.md) - Jira board 74 status mapping, transitions, fields, and gotchas.
- [Environments & Access Matrix](quality/Environments%20%26%20Access%20Matrix.md) - Reachable environments, channels, credentials, and backend-only limits.
- [Coverage Maps](quality/Coverage%20Maps.md) - Equivalence partitions for important Nimara test surfaces.
- [Defect Taxonomy & Severity](quality/Defect%20Taxonomy%20%26%20Severity.md) - Shared vocabulary for defect type, area, and severity.
- [Test Data & Fixtures](quality/Test%20Data%20%26%20Fixtures.md) - Reusable verified test data and address rules.
- [Test Method Playbooks](quality/Test%20Method%20Playbooks.md) - Cheapest reliable verification technique by defect class.
- [Verdict & Evidence Policy](quality/Verdict%20%26%20Evidence%20Policy.md) - Evidence rules for defensible QA verdicts.
- [Known Flaky, Blocked & Backend-Only](quality/Known%20Flaky%2C%20Blocked%20%26%20Backend-Only.md) - Areas where agents should not force a verdict.

# Technology ADR

- [ADR MOC](tech/ADR/ADR%20MOC.md) - Map of content and chronological register for architecture decision records.

# Technology RFC

- [RFC MOC](tech/RFC/RFC%20MOC.md) - Map of content and register for RFC design proposals that precede an accepting or rejecting ADR.
- [RFC-0001 Natural-Language Product Discovery](tech/RFC/RFC-0001%20Natural-Language%20Product%20Discovery.md) - Draft proposal for an opt-in, provider-agnostic NL discovery layer over SearchService (hybrid query-plan + grounded re-rank); serves PRD-001.
- [RFC-0002 Provider-Native Natural-Language Product Discovery](tech/RFC/RFC-0002%20Provider-Native%20Natural-Language%20Product%20Discovery.md) - Draft proposal for discovery as an optional search-provider capability using Algolia Agent Studio; competing approach to RFC-0001, same PRD.

# Technology Saleor Schema

- [Saleor Schema (MOC)](tech/saleor/Saleor%20Schema%20%28MOC%29.md) - Register and freshness workflow for version-stamped Saleor GraphQL schema notes.
- [Products & Variants](tech/saleor/Products%20%26%20Variants.md) - Catalog types: Product, ProductVariant, pricing, availability.
- [Checkout & Payments](tech/saleor/Checkout%20%26%20Payments.md) - Checkout type, lines, payment gateways, and the Transactions API.
- [Orders & Fulfillment](tech/saleor/Orders%20%26%20Fulfillment.md) - Order type, status/charge enums, fulfillments, payment status.
- [Account & Auth](tech/saleor/Account%20%26%20Auth.md) - User and Address types plus JWT token mutations.
- [Shop, Channels & Warehouses](tech/saleor/Shop%2C%20Channels%20%26%20Warehouses.md) - Shop (incl. version), Channel, Warehouse, and the Money model.
- [Attributes & Metadata](tech/saleor/Attributes%20%26%20Metadata.md) - Attribute input types and the ObjectWithMetadata key/value extension pattern.

# References

- [Works Cited](references/Works%20Cited.md) - Source list for the 2026 product strategy research.
