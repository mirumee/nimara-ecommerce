---
okf_version: "0.1"
---

# Root

- [Agent Instructions](AGENTS.md) - Schema, naming rules, maintenance workflow, and operating conventions for this wiki.

# Templates

- [ADR Template](_templates/ADR.md) - Reusable template for architecture decision records.
- [CAP Template](_templates/CAP.md) - Reusable template for documenting a current product capability.
- [FLOW Template](_templates/FLOW.md) - Reusable template for documenting an end-to-end product flow.
- [IMP Template](_templates/IMP.md) - Reusable template for implementation details and verification evidence.
- [INT Template](_templates/INT.md) - Reusable template for an integration contract.
- [OPS Template](_templates/OPS.md) - Reusable template for operational runbooks, rollback procedures, and incident guidance.
- [PRD Template](_templates/PRD.md) - Reusable template for drafting Nimara Product Requirements Documents.
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

# Implementation Evidence

- [Implementation (MOC)](tech/implementation/Implementation%20%28MOC%29.md) - Register for implementation records that connect work items and requirements to code, tests, and current product state.

# Current Product State

- [Product (MOC)](product/Product%20%28MOC%29.md) - Current capabilities, flows, and integration contracts at the selected Git ref.
- [Nimara Product Overview](product/overview/Product%20Overview.md) - Code-grounded map of actors, app surfaces, architecture, behavior, integrations, and current limitations.

# Product Capabilities

- [CAP-0001 Swappable Storefront Search and Content Providers](product/capabilities/CAP-0001%20Swappable%20Storefront%20Search%20and%20Content%20Providers.md) - Build-time selection of search and content implementations behind stable storefront services.
- [CAP-0002 Marketplace Payable Ledger and Payout Batching](product/capabilities/CAP-0002%20Marketplace%20Payable%20Ledger%20and%20Payout%20Batching.md) - Vendor-proceeds ledger, payable-period closing, and idempotent connected-account Transfers.
- [CAP-0003 Guided Storefront Checkout](product/capabilities/CAP-0003%20Guided%20Storefront%20Checkout.md) - Shared guidance for standard and marketplace checkout, payment, and confirmation state.
- [CAP-0004 Marketplace Vendor Operations](product/capabilities/CAP-0004%20Marketplace%20Vendor%20Operations.md) - Vendor-isolated catalog, customer, order, configuration, and connected-account operations.
- [CAP-0005 Agent-Compatible Commerce](product/capabilities/CAP-0005%20Agent-Compatible%20Commerce.md) - Discoverable, negotiated catalog, cart, checkout-session, and order operations for agents.
- [CAP-0006 Storefront Discovery and Cart](product/capabilities/CAP-0006%20Storefront%20Discovery%20and%20Cart.md) - Regional search, collections, product and vendor pages, and standard or vendor-aware carts.
- [CAP-0007 Customer Account Self-Service](product/capabilities/CAP-0007%20Customer%20Account%20Self-Service.md) - Account, profile, address, order, return, saved-payment, and privacy operations.

# Product Flows

- [FLOW-0001 Cart to Confirmed Order](product/flows/FLOW-0001%20Cart%20to%20Confirmed%20Order.md) - Standard checkout through payment, order creation, confirmation, and checkout cleanup.
- [FLOW-0002 Paid Order to Vendor Transfer](product/flows/FLOW-0002%20Paid%20Order%20to%20Vendor%20Transfer.md) - Paid vendor proceeds through ledger settlement, payout batching, and connected-account Transfer.
- [FLOW-0003 Agent Catalog to Checkout Session](product/flows/FLOW-0003%20Agent%20Catalog%20to%20Checkout%20Session.md) - Negotiated catalog discovery through a channel-specific checkout session and buyer handoff.
- [FLOW-0004 Marketplace Checkout to Vendor Orders](product/flows/FLOW-0004%20Marketplace%20Checkout%20to%20Vendor%20Orders.md) - One marketplace payment followed by asynchronous completion of vendor-specific orders.

# Integration Contracts

- [INT-0001 Search Provider Selection](product/integrations/INT-0001%20Search%20Provider%20Selection.md) - Build-time search-provider selection and configuration validation.
- [INT-0002 Content Provider Selection](product/integrations/INT-0002%20Content%20Provider%20Selection.md) - Shared build-time provider selection for storefront pages and menus.
- [INT-0003 Stripe Connect Vendor Accounts and Transfers](product/integrations/INT-0003%20Stripe%20Connect%20Vendor%20Accounts%20and%20Transfers.md) - Vendor account onboarding, signed events, and idempotent Transfers.
- [INT-0004 Agent-Compatible Storefront API](product/integrations/INT-0004%20Agent-Compatible%20Storefront%20API.md) - Negotiated, channel-aware catalog, cart, checkout, and order operations.
- [INT-0005 Stripe Payment Application](product/integrations/INT-0005%20Stripe%20Payment%20Application.md) - Standard-checkout PaymentIntent configuration, transaction webhooks, and asynchronous state reporting.
- [INT-0006 Saleor Commerce Backend](product/integrations/INT-0006%20Saleor%20Commerce%20Backend.md) - Core commerce state through GraphQL, application, and webhook contracts.
- [INT-0007 Marketplace Checkout Payment Orchestration](product/integrations/INT-0007%20Marketplace%20Checkout%20Payment%20Orchestration.md) - One platform payment across multiple vendor checkouts with asynchronous order completion.

# Product Strategy

- [Product Strategy 2026 (MOC)](market/strategy/Product%20Strategy%202026%20%28MOC%29.md) - Entry point and executive summary for 2026 product strategy.
- [Initiative Prioritization](market/strategy/initiatives/Initiative%20Prioritization.md) - Ranked scoring of recommended initiatives across impact, fit, timing, and effort/risk.
- [Marketplace & Agentic Commerce Bets](market/strategy/Marketplace%20%26%20Agentic%20Commerce%20Bets.md) - Evaluation of the marketplace and agentic-commerce bets.
- [Top-of-Funnel Adoption Moves](market/strategy/Top-of-Funnel%20Adoption%20Moves.md) - High-leverage moves to accelerate open-source developer adoption.
- [Do Not Pursue](market/strategy/Do%20Not%20Pursue.md) - Strategic non-goals and distractions to avoid.
- [Open Questions & Assumptions](market/strategy/Open%20Questions%20%26%20Assumptions.md) - Assumptions behind the strategy and evidence that could change it.

# Product Market

- [Composable Commerce Market](market/research/Composable%20Commerce%20Market.md) - Sector maturity and self-hosted open-source economics above the ~$2-10M revenue threshold.
- [Competitor Landscape](market/research/Competitor%20Landscape.md) - 2026 positioning, architecture, momentum, and DX of competing platforms.
- [Table Stakes vs Differentiators](market/research/Table%20Stakes%20vs%20Differentiators.md) - Commoditized requirements versus Nimara's genuine differentiators.
- [Emerging Trends 2026](market/research/Emerging%20Trends%202026.md) - Agentic commerce, UCP/MCP, marketplaces, and deploy-in-minutes DX.
- [Developer Pain Points](market/research/Developer%20Pain%20Points.md) - Community and GitHub evidence of ecosystem dissatisfaction.

# Product Personas

- [Storefront Developer](market/personas/Storefront%20Developer.md) - Primary developer persona adopting Nimara to ship a production Saleor storefront.
- [Ecommerce Manager](market/personas/Ecommerce%20Manager.md) - Secondary business-operator persona managing commerce operations through dashboards.
- [Marketplace Vendor](market/personas/Marketplace%20Vendor.md) - Secondary third-party seller persona for vendor-panel workflows.
- [Shopper](market/personas/Shopper.md) - Pre-purchase buyer experience persona.
- [Customer](market/personas/Customer.md) - Post-purchase buyer experience persona.
- [QA Engineer (Test Agent)](market/personas/QA%20Engineer%20%28Test%20Agent%29.md) - QA agent persona that verifies behavior from evidence.
- [Anti-Persona - No-Code Solo Merchant](market/personas/Anti-Persona%20-%20No-Code%20Solo%20Merchant.md) - Excluded no-code solo merchant segment.

# Quality

- [Quality & Testing (MOC)](quality/Quality%20%26%20Testing%20%28MOC%29.md) - QA map of content and entry point.
- [Bug Retest & Triage Process](quality/Bug%20Retest%20%26%20Triage%20Process.md) - Evidence-first process for understanding, reproducing, and concluding reported defects.
- [Environments & Access Matrix](quality/Environments%20%26%20Access%20Matrix.md) - Reachable environments, channels, credentials, and backend-only limits.
- [Coverage Maps](quality/Coverage%20Maps.md) - Equivalence partitions for important Nimara test surfaces.
- [Defect Taxonomy & Severity](quality/Defect%20Taxonomy%20%26%20Severity.md) - Shared vocabulary for defect type, area, and severity.
- [Test Data & Fixtures](quality/Test%20Data%20%26%20Fixtures.md) - Reusable verified test data and address rules.
- [Test Method Playbooks](quality/Test%20Method%20Playbooks.md) - Cheapest reliable verification technique by defect class.
- [Verdict & Evidence Policy](quality/Verdict%20%26%20Evidence%20Policy.md) - Evidence rules for defensible QA verdicts.
- [Known Flaky, Blocked & Backend-Only](quality/Known%20Flaky%2C%20Blocked%20%26%20Backend-Only.md) - Areas where agents should not force a verdict.

# Operations

- [Operations (MOC)](operations/Operations%20%28MOC%29.md) - Register for current runbooks, rollback procedures, and incident-response guidance.
- [OPS-0001 Storefront Deployment and Configuration Validation](operations/OPS-0001%20Storefront%20Deployment%20and%20Configuration%20Validation.md) - Storefront configuration validation, Vercel planning, immutable deployment, verification, and rollback boundary.
- [OPS-0002 Stripe Payment Application Installation and Key Rotation](operations/OPS-0002%20Stripe%20Payment%20Application%20Installation%20and%20Key%20Rotation.md) - Payment-application installation, per-channel keys, Stripe webhook rotation, and standard-checkout verification.
- [OPS-0003 Marketplace Ledger Migration and Settlement Reconciliation](operations/OPS-0003%20Marketplace%20Ledger%20Migration%20and%20Settlement%20Reconciliation.md) - Optional-ledger migration, order-proceeds ingest verification, and Stripe settlement reconciliation.
- [OPS-0004 Marketplace Payout Batch Execution and Recovery](operations/OPS-0004%20Marketplace%20Payout%20Batch%20Execution%20and%20Recovery.md) - Payable-period close, connected-account Transfer execution, verification, and partial-batch recovery limits.
- [OPS-0005 Marketplace Payment Completion Incident Response](operations/OPS-0005%20Marketplace%20Payment%20Completion%20Incident%20Response.md) - Incident response for successful payments with missing, partial, or vendor-invisible marketplace orders.
- [OPS-0006 Storefront Provider Change and Rollback](operations/OPS-0006%20Storefront%20Provider%20Change%20and%20Rollback.md) - Controlled search/content provider change and rebuild-based rollback to a known-good deployment.
- [OPS-0007 Saleor Schema Regeneration and Compatibility Check](operations/OPS-0007%20Saleor%20Schema%20Regeneration%20and%20Compatibility%20Check.md) - Saleor GraphQL regeneration, compatibility review, test gates, and schema-note refresh.
- [OPS-0008 Release Promotion and Production Rollback](operations/OPS-0008%20Release%20Promotion%20and%20Production%20Rollback.md) - Protected-branch release promotion, semantic-release verification, production checks, and immutable deployment rollback.

# Technology ADR

- [ADR MOC](tech/ADR/ADR%20MOC.md) - Map of content and chronological register for architecture decision records.

# Technology RFC

- [RFC MOC](tech/RFC/RFC%20MOC.md) - Map of content and register for RFC design proposals that precede an accepting or rejecting ADR.

# Technology Saleor Schema

- [Saleor Schema (MOC)](tech/saleor/Saleor%20Schema%20%28MOC%29.md) - Register and freshness workflow for version-stamped Saleor GraphQL schema notes.
- [Products & Variants](tech/saleor/Products%20%26%20Variants.md) - Catalog types: Product, ProductVariant, pricing, availability.
- [Checkout & Payments](tech/saleor/Checkout%20%26%20Payments.md) - Checkout type, lines, payment gateways, and the Transactions API.
- [Orders & Fulfillment](tech/saleor/Orders%20%26%20Fulfillment.md) - Order type, status/charge enums, fulfillments, payment status.
- [Account & Auth](tech/saleor/Account%20%26%20Auth.md) - User and Address types plus JWT token mutations.
- [Shop, Channels & Warehouses](tech/saleor/Shop%2C%20Channels%20%26%20Warehouses.md) - Shop (incl. version), Channel, Warehouse, and the Money model.
- [Attributes & Metadata](tech/saleor/Attributes%20%26%20Metadata.md) - Attribute input types and the ObjectWithMetadata key/value extension pattern.

# References

- [Works Cited](market/Works%20Cited.md) - Source list for the 2026 product strategy research.
