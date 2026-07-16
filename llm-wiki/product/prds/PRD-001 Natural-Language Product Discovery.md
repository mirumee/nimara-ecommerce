---
id: "PRD-001"
type: "Product Requirements Document"
title: "Natural-Language Product Discovery"
description: "Product Requirements Document for closing Nimara's natural-language discovery gap with a reusable, open-source storefront capability."
tags:
  - "prd"
  - "product-discovery"
  - "natural-language"
  - "open-source"
  - "developer-adoption"
  - "table-stakes"
created: "2026-07-10T00:00:00+00:00"
updated: "2026-07-10T00:00:00+00:00"
timestamp: "2026-07-10T00:00:00+00:00"
status: "analyzing"
owner: "Łukasz Szewczyk"
prd_type: "business"
personas:
  - "[Storefront Developer](product/personas/Storefront%20Developer.md)"
  - "[Shopper](product/personas/Shopper.md)"
---

# Natural-Language Product Discovery

## Value Hypothesis

**For** [Storefront Developers](product/personas/Storefront%20Developer.md) and agencies evaluating Nimara for storefronts whose catalogs are difficult to navigate with exact keywords **who** may reject Nimara when modern natural-language discovery would otherwise need to be built separately for every project, **the** Natural-Language Product Discovery capability **is a** fully open-source, shopper-facing guided-discovery capability **that** keeps Nimara credible during platform evaluation and lets adopters reach a working, grounded experience within one business day, **unlike** commercial commerce platforms with bundled AI discovery or bespoke integrations rebuilt for each store, **our solution** provides an adopter-owned, opt-in reference experience with one maintained adapter, a swappable provider boundary, catalog validation, classic-search fallback, and reusable documentation.

## Evidence & Assumptions

- E-1: One lost 2026 proposal specified shopper-facing AI Search as a `MUST` requirement and a primary UX differentiator. The proposal was rejected as a whole; there is no evidence that this single capability caused the loss.
- E-2: Nimara's [Table Stakes vs Differentiators](product/market/Table%20Stakes%20vs%20Differentiators.md) analysis classifies AI-assisted shopper recommendations as a credibility-floor capability, while UCP/MCP remains the separate strategic differentiator.
- A-1 `[ASSUMPTION]`: Closing this gap will help Nimara remain on the shortlist for intent-heavy catalogs and convert qualified technical evaluations into deployments. The six-month validation window tests this assumption.

## Business Goal & Value

This is a defensive market-parity bet, not a claim that on-site AI discovery is unique. Its purpose is to prevent an increasingly expected capability from disqualifying Nimara before teams can evaluate its genuine advantages: open-source ownership, composability, and replaceable integrations.

The primary business outcome belongs to Nimara: qualified evaluators accept the capability and independent teams deploy it without maintaining a fork. [Shopper](product/personas/Shopper.md) usefulness is the experience quality bar, but store-level conversion, revenue uplift, and catalog-specific relevance targets remain the responsibility of each deployment. No historical adoption baseline is used for this PRD.

## Success Metrics

- M-1 (business outcome): Qualified-evaluation acceptance — within six months of the public `ready for adoption` release, at least 3 qualified RFPs or solution assessments provide written confirmation that the reference capability satisfies the natural-language discovery requirement — recorded by the PRD owner. Silence or absence of an objection does not count.
- M-2 (business outcome): Independent adoption — within the same six-month window, at least 2 external teams run a public or customer-facing pilot using their own catalog and provider account without forking the module — confirmed through release feedback or deployment review. Internal demos and multiple storefronts owned by one team count as one proof at most.
- M-3 (leading indicator): Developer activation — a developer starting with a working Nimara storefront, a discovery-ready catalog, and provider credentials reaches the first grounded result within one business day — measured through the documented onboarding validation.
- M-4 (quality gate): Catalog validity — 100% of products displayed by the reference experience resolve to products that currently exist and satisfy the deployment's eligibility rules — enforced by the evaluation suite and runtime validation.

GitHub stars, demo traffic, raw query volume, hero clicks, and store-level conversion may be observed diagnostically but do not determine PRD success.

## MVP & Falsification

The MVP is the smallest credible proof that Nimara can meet the market expectation rather than merely document an integration point: an opt-in, fully open-source, single-turn reference experience; one maintained provider adapter behind a replaceable boundary; grounded product suggestions with concise explanations and standard product-page links; honest no-match behavior; required classic-search fallback; deployment-owned credentials and costs; usage controls; privacy-conscious telemetry; a prominent, budget-limited public demo; and developer documentation that supports one-day activation.

The rollout begins as opt-in preview and becomes `ready for adoption` only when the reference experience, demo, documentation, safety controls, and observability are complete. The six-month validation clock starts with that public release. Recruiting a design partner is not a prerequisite or deliverable.

The hypothesis is falsified if at least 3 qualified evaluations occur during the validation window but fewer than 3 provide positive written confirmation, or if at least 2 independent external teams make qualified adoption attempts but cannot reach a customer-facing deployment without forking the module. In that case, stop expanding the built-in experience and retain only the reusable integration boundary, reference example, and evaluation guidance. The treatment of a validation window with too few market opportunities remains Q-1.

## Nonfunctional Requirements

- NFR-1: A shopper must never see a product that does not exist or fails current deployment eligibility; an honest no-match outcome is preferable to an invalid suggestion.
- NFR-2: When disabled, the capability must not change storefront behavior or performance. When enabled, provider latency or failure must not block page rendering or classic search.
- NFR-3: The reference experience inherits Nimara's accessibility standard, including keyboard operation, assistive-technology status announcements, and understandable loading, error, and fallback states.
- NFR-4: Anonymous shoppers can use the capability without creating an account. Abuse and cost are controlled through configurable limits rather than mandatory authentication.
- NFR-5: The experience clearly identifies suggestions as AI-assisted and does not present them as objective advice.
- NFR-6: Raw natural-language queries are not persisted by default. Any deployment that enables raw-query analytics owns its consent, redaction, retention, deletion, and provider-data-transfer policy.
- NFR-7: Universal latency and cost targets are not set by this PRD; every deployment must be able to observe and set its own limits with a safe fallback.

## Scope

- S-1: A fully open-source, opt-in natural-language discovery capability that is disabled by default in new installations.
- S-2: A prominent, active reference experience in the public Nimara demo, protected by a dedicated provider account, explicit budget limits, and fallback behavior.
- S-3: A single-turn interaction that accepts a natural-language need and returns a configurable short list with catalog-grounded why-it-fits explanations and links to standard product pages.
- S-4: Runtime catalog and eligibility validation, neutral relevance-first ranking by default, honest no-match behavior, and zero tolerance for displaying invented or currently ineligible products.
- S-5: A required integration with the deployment's existing classic search for no-match results, provider failures, timeouts, and usage or cost limits.
- S-6: One core-maintained reference adapter and a documented provider-swap boundary; adopters use their own provider accounts, credentials, and operating budgets.
- S-7: Extension points for placement, composition, theming, locale, shortlist size, catalog fields, eligibility, and deployment-specific ranking policies without forking the core module.
- S-8: Structured events for result, no-match, fallback, error, latency, provider usage, and cost metadata; raw query text remains off by default and no Nimara-specific analytics dashboard is included.
- S-9: Developer documentation for setup, provider and data disclosure, configuration, privacy, cost controls, evaluation, and extension. The reference path is validated on Saleor, a neutral Nimara demo catalog, and one reference locale.

## Out of Scope

- Classic keyword search, autocomplete, catalog browsing, filters, facets, sorting, and product-card foundations — existing capabilities and a required dependency; gaps belong in separate discovery work.
- UCP/MCP discovery and checkout for external agents — an independent strategic initiative with different consumers, protocols, and trust boundaries.
- Operator dashboards, manual merchandising-rule editors, raw-query review, and demand-insight workflows — a separate follow-up only if adoption demonstrates operator demand.
- Multi-turn conversation, a required "show more" interaction, direct shopper ratings of suggestions, personalization, and voice input — future experience enhancements after the single-turn capability is validated.
- SEO pages generated from prompts or answers — ephemeral discovery is not indexable content; product SEO and external-agent visibility remain separate concerns.
- Commercial ranking boosts in the default implementation — deployments may add transparent policies through extension points, while Nimara's reference ranking remains neutral.
- A core-supported self-hosted model, multiple first-party provider adapters, or validation across multiple commerce engines — future or community work; the MVP maintains one adapter and validates the Saleor reference path.
- Cart, checkout, or purchasing inside the AI experience — responsibility ends at the standard product page.
- Ecommerce Manager or merchandiser documentation — deferred until a corresponding operator workflow exists.
- Recruiting a design partner — explicitly outside the PRD; validation relies on future qualified evaluations and independent adopters.
- Store-level conversion experiments and revenue guarantees — measured by individual deployments, not used as Nimara's PRD outcome.
- Implementation task breakdown, estimates, provider selection, hosting topology, or concrete API signatures — downstream solution design and planning after the PRD is accepted.

## User Stories

- US-1 ([Storefront Developer](product/personas/Storefront%20Developer.md)): As a developer or agency evaluating Nimara, I want to see working natural-language discovery in the public demo, so that I can judge whether Nimara meets this modern storefront expectation before selecting it.
- US-2 ([Storefront Developer](product/personas/Storefront%20Developer.md)): As a storefront developer, I want to enable the reference capability with my own catalog and provider account within one business day, so that I can validate it without building the full experience or maintaining a fork.
- US-3 ([Storefront Developer](product/personas/Storefront%20Developer.md)): As a storefront developer, I want to replace the provider and adapt placement, presentation, locale, eligibility, and ranking through supported extension points, so that the capability fits different storefronts while remaining upgradeable.
- US-4 ([Shopper](product/personas/Shopper.md)): As a shopper, I want to describe my need in natural language and receive a concise list of current products with understandable reasons, so that I can reach relevant product pages without knowing the catalog's terminology.
- US-5 ([Shopper](product/personas/Shopper.md)): As a shopper, I want an honest no-match response and a useful classic-search fallback when guided discovery cannot help, so that I never reach a dead end or see an invented product.
- US-6 ([Storefront Developer](product/personas/Storefront%20Developer.md)): As a storefront developer, I want standard visibility into outcomes, failures, latency, provider usage, and cost, so that I can operate the capability within my deployment's budget and privacy policy.

## Acceptance Criteria

- AC-1 (US-1): Given the public Nimara demo, when an evaluator visits its primary discovery surface, then an active, clearly identified AI-assisted natural-language experience is visible and protected by demo-specific usage limits and fallback.
- AC-2 (US-2): Given a working Nimara storefront, a catalog that passes readiness validation, and provider credentials, when a developer follows the reference guide, then a grounded discovery result can be reached within one business day without forking the module.
- AC-3 (US-3): Given a deployment chooses a supported provider adapter or extension point, when it changes provider, placement, theme, locale, shortlist size, eligibility, or ranking policy, then the change does not require a fork of the core module; no commercial boost is applied by default.
- AC-4 (US-4): Given a shopper submits one natural-language request, when the module returns suggestions, then each item links to its standard product page and includes a concise explanation derived only from catalog data exposed by the deployment.
- AC-5 (US-4): Given suggestions are ready for display, when runtime validation runs, then every displayed product still exists and satisfies current eligibility; any invalid suggestion is removed and never shown.
- AC-6 (US-5): Given there is no credible eligible match, the provider fails or times out, or a configured limit is reached, when discovery completes, then the shopper receives an understandable state and can continue through classic search using the original request.
- AC-7 (US-4): Given an anonymous shopper uses the reference experience, when it loads, accepts input, returns results, or reports status, then it remains keyboard-accessible, exposes assistive-technology status, does not block page rendering, and identifies the suggestions as AI-assisted.
- AC-8 (US-6): Given standard telemetry is enabled, when discovery is used, then structured events expose outcome, returned product identifiers, fallback reason, latency, and provider usage or cost metadata without persisting raw query text by default.
- AC-9 (US-6): Given a configured usage or cost limit is reached, when another request is submitted, then the provider is not called, the fallback path remains available, and the limit event is observable.
- AC-10 (US-2): Given no discovery provider is configured, when the storefront renders, then natural-language discovery remains absent and classic storefront behavior and performance remain unchanged.

## Risks

- R-1: The evidence base is one lost proposal and current market positioning, not proof that this gap caused a lost deployment — mitigation: label the adoption effect as an assumption and validate it through M-1 and M-2.
- R-2: Too few qualified evaluations or adoption attempts may make the six-month result inconclusive — mitigation: resolve the portfolio response in Q-1 before the public validation window starts.
- R-3: Catalog quality varies and may make a valid module appear irrelevant — mitigation: define and validate minimum catalog readiness before counting an adoption attempt; Nimara does not promise to repair merchant content.
- R-4: Provider cost, latency, or outages may make deployments operationally unattractive — mitigation: adopter-owned accounts, configurable limits, non-blocking behavior, observable usage, and required classic-search fallback.
- R-5: Queries may contain personal or sensitive information — mitigation: no raw-query persistence by default, explicit data-transfer documentation, and deployment-owned privacy controls for any opt-in analytics.
- R-6: Customer-specific requests may expand the PRD into a search platform, admin product, or conversational assistant — mitigation: enforce the explicit out-of-scope boundaries and require separate evidence for follow-up PRDs.
- R-7: A public demo can create unbounded project cost or abuse exposure — mitigation: use an isolated provider account, a defined operating budget, rate limits, and automatic fallback.
- R-8: Supporting many providers would create an open-ended maintenance obligation — mitigation: core maintains one reference adapter and a stable extension boundary; additional adapters are future or community work.

## Open Questions

- Q-1: If fewer than 3 qualified evaluations or fewer than 2 qualified adoption attempts occur during the six-month window, is the hypothesis considered inconclusive with investment frozen, or does the portfolio apply the same stop decision as a negative result? — Product — must be answered before `ready`.
- Q-2: What monthly operating budget and limit policy apply to the public Nimara demo? — Product — must be answered before the public preview is enabled.
- Q-3: Which provider should the core team maintain as the reference adapter while preserving adopter ownership and provider replaceability? — Architecture — must be answered before solution design is approved.
- Q-4: What minimum product content and eligibility semantics constitute a discovery-ready catalog and a qualified adoption attempt? — Product and Architecture — must be answered before solution design is approved.

## Related Notes

[RFC-0001 Natural-Language Product Discovery](tech/RFC/RFC-0001%20Natural-Language%20Product%20Discovery.md)
[RFC-0002 Provider-Native Natural-Language Product Discovery](tech/RFC/RFC-0002%20Provider-Native%20Natural-Language%20Product%20Discovery.md)
[PRD-001 Natural-Language Product Discovery - Grilling Log](product/prds/grilling/PRD-001%20Natural-Language%20Product%20Discovery%20-%20Grilling%20Log.md)
[Table Stakes vs Differentiators](product/market/Table%20Stakes%20vs%20Differentiators.md)
[Product Strategy 2026 (MOC)](product/strategy/Product%20Strategy%202026%20%28MOC%29.md)
[Top-of-Funnel Adoption Moves](product/strategy/Top-of-Funnel%20Adoption%20Moves.md)
[Marketplace & Agentic Commerce Bets](product/strategy/Marketplace%20%26%20Agentic%20Commerce%20Bets.md)
[Storefront Developer](product/personas/Storefront%20Developer.md)
[Shopper](product/personas/Shopper.md)
