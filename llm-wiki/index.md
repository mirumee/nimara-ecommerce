---
okf_version: "0.1"
---

# Root

- [Agent Instructions](AGENTS.md) - OKF schema, naming rules, maintenance workflow, and operating conventions for this bundle.

# Templates

- [ADR Template](_templates/ADR.md) - Reusable template for architecture decision records.
- [Epic Template](_templates/epic.md) - Reusable template for drafting Nimara epic hypothesis statements.
- [Undefined Template](_templates/Undefined.md) - Generic template for a new OKF concept document.

# Sources

- [LLM Wiki](sources/LLM%20Wiki.md) - Upstream LLM-wiki pattern describing raw sources, maintained wiki notes, schema files, indexing, and logs.
- [Strategic Product Report - Nimara.store (Gemini Deep Research)](sources/Strategic%20Product%20Report%20-%20Nimara.store%20%28Gemini%20Deep%20Research%29.md) - Raw source stub for the Deep Research report used by the 2026 strategy and market corpus.

# Product Strategy

- [Product Strategy 2026 (MOC)](product/strategy/Product%20Strategy%202026%20%28MOC%29.md) - Entry point and executive summary for 2026 product strategy.
- [Initiative Prioritization](product/strategy/initiatives/Initiative%20Prioritization.md) - Ranked scoring of recommended initiatives across impact, fit, timing, and effort/risk.
- [1 - Zero-to-Deploy CLI](product/strategy/initiatives/1%20-%20Zero-to-Deploy%20CLI.md) - Now-tier initiative to reduce the path from clone to a running, deployable storefront.
- [2 - Stripe Connect Split Payments](product/strategy/initiatives/2%20-%20Stripe%20Connect%20Split%20Payments.md) - Now-tier initiative for auditable vendor settlement through ledger batches and Transfers.
- [3 - UCP-MCP Agentic Discovery](product/strategy/initiatives/3%20-%20UCP-MCP%20Agentic%20Discovery.md) - Next-tier agentic-commerce discovery initiative for UCP and MCP compatibility.
- [4 - Auto-Invoicing & Regional Tax](product/strategy/initiatives/4%20-%20Auto-Invoicing%20%26%20Regional%20Tax.md) - Next-tier discovery for replaceable invoicing and regional tax workflows.
- [5 - Provider-Agnostic Interface](product/strategy/initiatives/5%20-%20Provider-Agnostic%20Interface.md) - Later-tier initiative for provider contracts at proven integration seams.
- [Marketplace & Agentic Commerce Bets](product/strategy/Marketplace%20%26%20Agentic%20Commerce%20Bets.md) - Evaluation of the marketplace and agentic-commerce bets.
- [Top-of-Funnel Adoption Moves](product/strategy/Top-of-Funnel%20Adoption%20Moves.md) - High-leverage moves to accelerate open-source developer adoption.
- [Do Not Pursue](product/strategy/Do%20Not%20Pursue.md) - Strategic non-goals and distractions to avoid.
- [Open Questions & Assumptions](product/strategy/Open%20Questions%20%26%20Assumptions.md) - Assumptions behind the strategy and evidence that could change it.

# Product Epics

- [Epic Cookie Consent](product/epics/Epic%20Cookie%20Consent.md) - Epic hypothesis for Cookie Consent and Google Consent Mode v2.
- [Epic User Reviews](product/epics/Epic%20User%20Reviews.md) - Epic hypothesis for verified-purchase user reviews.

# Product Solutions

- [Stripe Connect Split Payments Solution](product/solution/Stripe%20Connect%20Split%20Payments%20Solution.md) - Tracer from the active initiative through decision, runtime flow, code, and QA.

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
- [Stripe Connect Settlement Verification](quality/Stripe%20Connect%20Settlement%20Verification.md) - Evidence map and production-readiness gaps for marketplace settlement.

# Technical Architecture

- [Technical Architecture (MOC)](tech/Technical%20Architecture%20%28MOC%29.md) - Entry point for runtime flows, architectural boundaries, integrations, and decisions.
- [Storefront Data Flow](tech/flows/Storefront%20Data%20Flow.md) - Request composition through app, feature, use case, and Saleor infrastructure.
- [Checkout and Payment Flow](tech/flows/Checkout%20and%20Payment%20Flow.md) - Standard and marketplace checkout through payment and order completion.
- [Marketplace Ledger and Payout Flow](tech/flows/Marketplace%20Ledger%20and%20Payout%20Flow.md) - Paid-order ledger ingestion, settlement availability, batches, and Transfers.
- [Marketplace Authentication Flow](tech/flows/Marketplace%20Authentication%20Flow.md) - Session sources, authorization levels, and vendor isolation.
- [Cache and Webhook Invalidation Flow](tech/flows/Cache%20and%20Webhook%20Invalidation%20Flow.md) - Tagged reads and signed Saleor webhook revalidation.
- [ADR MOC](tech/ADR/ADR%20MOC.md) - Map of content and chronological register for architecture decision records.
- [ADR-0001 Use Separate Charges and Transfers for Marketplace Settlement](tech/ADR/ADR-0001%20Use%20Separate%20Charges%20and%20Transfers%20for%20Marketplace%20Settlement.md) - Accepted settlement-model decision.

# Operations

- [Operations (MOC)](operations/Operations%20%28MOC%29.md) - Entry point for operating and evaluating the maintained knowledge system.
- [LLM Wiki Usefulness Review](operations/LLM%20Wiki%20Usefulness%20Review.md) - One-month evidence gate before further ingestion automation.

# References

- [Works Cited](references/Works%20Cited.md) - Source list for the 2026 product strategy research.
