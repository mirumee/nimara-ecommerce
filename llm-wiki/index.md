---
okf_version: "0.1"
---

# Nimara Wiki

The exhaustive catalogue of concepts in this bundle. Start with [Nimara](./system/Nimara.md) for the current product picture, then use the application, capability, architecture, and integration maps for deeper navigation.

## Start Here

- [Nimara](./system/Nimara.md) - Current system overview grounded in `main`, including product direction and known limitations.
- [Applications (MOC)](./system/applications/Applications%20%28MOC%29.md) - Executable applications and their responsibilities.
- [Capabilities (MOC)](./system/capabilities/Capabilities%20%28MOC%29.md) - User- and operator-facing capabilities across applications.
- [Architecture (MOC)](./tech/architecture/Architecture%20%28MOC%29.md) - Code organization, runtime composition, and data flows.
- [Integrations (MOC)](./tech/integrations/Integrations%20%28MOC%29.md) - External systems and protocol boundaries.
- [Agent Instructions](./AGENTS.md) - Evidence hierarchy, schema, maintenance workflow, and operating conventions.

## Applications

- [Storefront](./system/applications/Storefront.md) - Next.js customer storefront for discovery, shopping, checkout, accounts, and agentic-commerce APIs.
- [Marketplace](./system/applications/Marketplace.md) - Vendor operations application, Saleor App, Stripe Connect integration, and optional ledger.
- [Stripe App](./system/applications/Stripe%20App.md) - Standalone Saleor Payment Gateway application backed by Stripe PaymentIntents.
- [Documentation](./system/applications/Documentation.md) - Versioned public Docusaurus documentation site.
- [Automated Tests](./system/applications/Automated%20Tests.md) - Playwright end-to-end test application and its current coverage.

## Capabilities

- [Commerce Storefront](./system/capabilities/Commerce%20Storefront.md) - Customer-facing storefront shell and commerce journey.
- [Catalog And Discovery](./system/capabilities/Catalog%20And%20Discovery.md) - Product, collection, vendor, and search discovery.
- [Product Reviews](./system/capabilities/Product%20Reviews.md) - Hard-coded PDP placeholder contrasted with the planned verified-review capability.
- [Cart And Checkout](./system/capabilities/Cart%20And%20Checkout.md) - Cart, checkout, delivery, and order-placement flow.
- [Payments](./system/capabilities/Payments.md) - Storefront, marketplace, and Saleor App payment paths.
- [Customer Accounts](./system/capabilities/Customer%20Accounts.md) - Authentication, addresses, and order history.
- [Content Search And Localization](./system/capabilities/Content%20Search%20And%20Localization.md) - CMS, search-provider, and locale composition.
- [Marketplace Operations](./system/capabilities/Marketplace%20Operations.md) - Vendor-scoped catalog, order, customer, and configuration operations.
- [Ledger And Payouts](./system/capabilities/Ledger%20And%20Payouts.md) - Optional Postgres ledger, payout batches, and Stripe Transfers.
- [Agentic Commerce](./system/capabilities/Agentic%20Commerce.md) - ACP and UCP endpoints exposed by the storefront.
- [Tracking Consent And Observability](./system/capabilities/Tracking%20Consent%20And%20Observability.md) - Consent, analytics gating, and application telemetry.

## Technology Architecture

- [Monorepo Layers](./tech/architecture/Monorepo%20Layers.md) - Intended package boundaries and observed exceptions on `main`.
- [Service And Provider Architecture](./tech/architecture/Service%20And%20Provider%20Architecture.md) - Storefront service registry and selectable providers.
- [Runtime And Data Flows](./tech/architecture/Runtime%20And%20Data%20Flows.md) - Major request, checkout, payment, webhook, and payout flows.
- [ADR MOC](./tech/ADR/ADR%20MOC.md) - Register for accepted or rejected architecture decisions.
- [RFC MOC](./tech/RFC/RFC%20MOC.md) - Register for design proposals that precede decisions.

## Technology Integrations

- [Saleor](./tech/integrations/Saleor.md) - Primary commerce backend and GraphQL integration surface.
- [Stripe](./tech/integrations/Stripe.md) - PaymentIntent, Connect, Transfer, and Saleor gateway integration models.
- [CMS And Search](./tech/integrations/CMS%20And%20Search.md) - Saleor, ButterCMS, Algolia, and dummy provider options.
- [ACP And UCP](./tech/integrations/ACP%20And%20UCP.md) - Agentic Commerce Protocol and Universal Commerce Protocol endpoints.
- [Deployment And Observability](./tech/integrations/Deployment%20And%20Observability.md) - CI, Vercel, Terraform, environment, and telemetry surfaces.

## Saleor Schema

- [Saleor Schema (MOC)](./tech/saleor/Saleor%20Schema%20%28MOC%29.md) - Register and freshness workflow for version-stamped Saleor GraphQL schema notes.
- [Products & Variants](./tech/saleor/Products%20%26%20Variants.md) - Product, variant, pricing, and availability types.
- [Checkout & Payments](./tech/saleor/Checkout%20%26%20Payments.md) - Checkout, lines, payment gateways, and Transactions API types.
- [Orders & Fulfillment](./tech/saleor/Orders%20%26%20Fulfillment.md) - Orders, statuses, fulfillments, and payment status.
- [Account & Auth](./tech/saleor/Account%20%26%20Auth.md) - User, address, and JWT token types and mutations.
- [Shop, Channels & Warehouses](./tech/saleor/Shop%2C%20Channels%20%26%20Warehouses.md) - Shop, channel, warehouse, and money model.
- [Attributes & Metadata](./tech/saleor/Attributes%20%26%20Metadata.md) - Attribute inputs, metadata, and assignment surfaces.

## Product Strategy

- [Product Strategy 2026 (MOC)](./product/strategy/Product%20Strategy%202026%20%28MOC%29.md) - Research-derived strategy overlaid with current product and implementation knowledge.
- [Initiative Prioritization](./product/strategy/initiatives/Initiative%20Prioritization.md) - Original research ranking compared with current direction and implementation.
- [1 - Zero-to-Deploy CLI](./product/strategy/initiatives/1%20-%20Zero-to-Deploy%20CLI.md) - Planned CLI direction; no dedicated implementation observed on `main`.
- [2 - Stripe Connect Split Payments](./product/strategy/initiatives/2%20-%20Stripe%20Connect%20Split%20Payments.md) - Active Marketplace direction with substantial but partial payment/settlement code.
- [3 - UCP-MCP Agentic Discovery](./product/strategy/initiatives/3%20-%20UCP-MCP%20Agentic%20Discovery.md) - Established ACP/UCP scope, partial protocol implementation, and untracked MCP scope.
- [4 - Auto-Invoicing & Regional Tax](./product/strategy/initiatives/4%20-%20Auto-Invoicing%20%26%20Regional%20Tax.md) - Planned Stripe invoice/tax direction not observed as dedicated functionality.
- [5 - Provider-Agnostic Interface](./product/strategy/initiatives/5%20-%20Provider-Agnostic%20Interface.md) - Planned provider/Medusa direction compared with current capability-specific seams.
- [Marketplace & Agentic Commerce Bets](./product/strategy/Marketplace%20%26%20Agentic%20Commerce%20Bets.md) - Evaluation of marketplace and agentic-commerce bets.
- [Top-of-Funnel Adoption Moves](./product/strategy/Top-of-Funnel%20Adoption%20Moves.md) - Research proposals overlaid with active docs/OPS and planned CLI/E2E direction.
- [Do Not Pursue](./product/strategy/Do%20Not%20Pursue.md) - Strategic non-goals, including the unresolved conflict with active custom search.
- [Open Questions & Assumptions](./product/strategy/Open%20Questions%20%26%20Assumptions.md) - Assumptions and evidence that could change the strategy.

## Product Requirements

- [PRD Cookie Consent](./product/prds/PRD%20Cookie%20Consent.md) - Requirements for cookie consent and Google Consent Mode v2.
- [PRD-001 Natural-Language Product Discovery](./product/prds/PRD-001%20Natural-Language%20Product%20Discovery.md) - Market-parity hypothesis and MVP boundary for intent-heavy discovery.
- [PRD-001 Natural-Language Product Discovery - Grilling Log](./product/prds/grilling/PRD-001%20Natural-Language%20Product%20Discovery%20-%20Grilling%20Log.md) - Decisions and unresolved branches behind PRD-001.
- [PRD User Reviews](./product/prds/PRD%20User%20Reviews.md) - Requirements for verified-purchase user reviews.

## Market

- [Composable Commerce Market](./product/market/Composable%20Commerce%20Market.md) - Sector maturity and self-hosted open-source economics.
- [Competitor Landscape](./product/market/Competitor%20Landscape.md) - 2026 competitor positioning, architecture, momentum, and developer experience.
- [Table Stakes vs Differentiators](./product/market/Table%20Stakes%20vs%20Differentiators.md) - Commodity requirements versus proposed Nimara differentiators.
- [Emerging Trends 2026](./product/market/Emerging%20Trends%202026.md) - Agentic commerce, marketplaces, and deploy-in-minutes developer experience.
- [Developer Pain Points](./product/market/Developer%20Pain%20Points.md) - Research-derived ecosystem dissatisfaction and adoption friction.

## Personas

- [Storefront Developer](./product/personas/Storefront%20Developer.md) - Primary developer persona adopting Nimara.
- [Ecommerce Manager](./product/personas/Ecommerce%20Manager.md) - Business operator managing commerce operations.
- [Marketplace Vendor](./product/personas/Marketplace%20Vendor.md) - Third-party seller using vendor-panel workflows.
- [Shopper](./product/personas/Shopper.md) - Pre-purchase buyer persona.
- [Customer](./product/personas/Customer.md) - Post-purchase buyer persona.
- [QA Engineer (Test Agent)](./product/personas/QA%20Engineer%20%28Test%20Agent%29.md) - Agent persona verifying behavior from evidence.
- [Anti-Persona - No-Code Solo Merchant](./product/personas/Anti-Persona%20-%20No-Code%20Solo%20Merchant.md) - Explicitly excluded no-code segment.

## Quality

- [Quality & Testing (MOC)](./quality/Quality%20%26%20Testing%20%28MOC%29.md) - Entry point for quality knowledge.
- [Bug Retest & Triage Process](./quality/Bug%20Retest%20%26%20Triage%20Process.md) - Evidence-driven reported-defect verification flow.
- [Environments & Access Matrix](./quality/Environments%20%26%20Access%20Matrix.md) - Environments, channels, access assumptions, and backend-only limits.
- [Coverage Maps](./quality/Coverage%20Maps.md) - Equivalence partitions for important test surfaces.
- [Defect Taxonomy & Severity](./quality/Defect%20Taxonomy%20%26%20Severity.md) - Shared defect vocabulary.
- [Test Data & Fixtures](./quality/Test%20Data%20%26%20Fixtures.md) - Reusable verified test data and address rules.
- [Test Method Playbooks](./quality/Test%20Method%20Playbooks.md) - Verification technique by defect class.
- [Verdict & Evidence Policy](./quality/Verdict%20%26%20Evidence%20Policy.md) - Rules for defensible QA verdicts.
- [Known Flaky, Blocked & Backend-Only](./quality/Known%20Flaky%2C%20Blocked%20%26%20Backend-Only.md) - Areas where agents should not force a verdict.

## Sources

- [Main e32732e Snapshot](./sources/codebase/Main%20e32732e%20Snapshot.md) - Provenance manifest for the current implementation baseline.
- [LLM Wiki](./sources/LLM%20Wiki.md) - Upstream pattern for maintained wiki notes, indexing, and logs.
- [Strategic Product Report - Nimara.store (Gemini Deep Research)](./sources/Strategic%20Product%20Report%20-%20Nimara.store%20%28Gemini%20Deep%20Research%29.md) - Source stub for the research-derived 2026 strategy corpus.
- [Works Cited](./references/Works%20Cited.md) - Source register for the 2026 strategy research.

## Templates

- [ADR Template](./_templates/ADR.md) - Architecture decision record template.
- [RFC Design Doc Template](./_templates/RFC.md) - Design proposal template.
- [PRD Grilling Log Template](./_templates/prd-grilling-log.md) - Decision-log template used while shaping a PRD.
- [PRD Template](./_templates/prd.md) - Product requirements template.
- [Undefined Template](./_templates/Undefined.md) - Generic OKF concept template.
- [Saleor Schema Note Template](./_templates/saleor-schema-note.md) - Version-stamped Saleor schema note template.
