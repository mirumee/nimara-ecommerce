---
type: "Product Requirements Document"
title: "Newsletter Subscription"
description: "Product Requirements Document for storefront newsletter subscription in Nimara, delivered through a swappable email-provider boundary that Nimara does not store subscribers behind."
tags:
  - "prd"
  - "newsletter"
  - "email-marketing"
  - "storefront"
  - "table-stakes"
  - "consent"
created: "2026-08-18T00:00:00+00:00"
updated: "2026-08-18T00:00:00+00:00"
status: "draft"
owner: "Wojciech Gajda"
prd_type: "business"
personas:
  - "[Storefront Developer](../market/personas/Storefront%20Developer.md)"
  - "[Ecommerce Manager](../market/personas/Ecommerce%20Manager.md)"
  - "[Shopper](../market/personas/Shopper.md)"
---

# Newsletter Subscription

## Value Hypothesis

**For** [Storefront Developers](../market/personas/Storefront%20Developer.md) building Nimara storefronts whose [Ecommerce Manager](../market/personas/Ecommerce%20Manager.md) needs an owned email channel **who** today have to hand-roll subscriber capture in every project because Nimara ships a newsletter form that reports success and stores nothing, **the** Newsletter Subscription capability **is a** configuration-gated storefront form wired to the deployment's own email service provider through a swappable boundary **that** delivers consented subscribers into the tool where the operator already runs campaigns, while Nimara stores no marketing data at all, **unlike** writing a server action per project or pasting a provider's embed snippet outside Nimara's form, validation, translation, and theming, **our solution** ships one maintained provider adapter behind a documented replaceable boundary, hides the form wherever no provider is configured, and delegates subscriber confirmation and unsubscribe to the provider.

## Evidence & Assumptions

- E-1: The storefront newsletter form is a stub. `newsletterSubscribeAction` in `packages/features/src/home-page/shared/actions/newsletter-subscribe.ts` returns `{ ok: true }` and stores nothing, while `newsletter-form.tsx` shows a success toast on that result. It shipped deliberately as a placeholder in [PR 257](https://github.com/mirumee/nimara-ecommerce/pull/257), titled "prepare a newsletter component" on branch `MS-955-develop-newsletter-component-for-future-use`, merged 2025-04-15. Only presentation changed afterwards, in [PR 264](https://github.com/mirumee/nimara-ecommerce/pull/264) and [PR 371](https://github.com/mirumee/nimara-ecommerce/pull/371).
- E-2: The form is rendered only by the `shop-basic` home variant. No marketplace home variant exists, so per-vendor list questions have no surface to appear on today.
- E-3: No capability, flow, or integration contract for newsletter or email marketing is recorded in the current-product register at this ref.
- E-4: In the sixteen months since the placeholder shipped, no GitHub issue has asked for the capability. This proves absent inbound pull; it does not prove absent need, and in an open-source distribution model adopter usage is not observable at all.
- E-5: [Ecommerce Manager](../market/personas/Ecommerce%20Manager.md) names newsletter integration as a roadmap item under making content self-serve. That is a persona implication drawn from research, not measured demand.
- A-1 `[ASSUMPTION]`: Operators of Nimara stores want an owned email channel, and the absence of requests reflects a placeholder nobody expected to work rather than an absence of need. No demand-side target is set against this assumption; see Business Goal & Value.
- A-2 `[ASSUMPTION]`: At least one email service provider performs subscriber confirmation on its own side and offers a free tier sufficient for the public demo. If none does, the confirmation decision reopens; see R-3.

## Business Goal & Value

This is a market-parity bet with an unusually cheap entry price, not a claim that newsletter capture wins adopters. Subscriber capture is a commoditized expectation of any storefront; its absence makes Nimara look incomplete during evaluation, and the unfinished placeholder makes that gap worse than plain absence would, because the repository publicly promises a capability it does not have. The [Table Stakes vs Differentiators](../market/research/Table%20Stakes%20vs%20Differentiators.md) reading applies directly: the credibility floor decides whether an evaluator ever reaches Nimara's real advantages. This PRD sits below every initiative in [Initiative Prioritization](../market/strategy/initiatives/Initiative%20Prioritization.md) and must not be staffed against them.

The value path runs through the adopter, not through Nimara's own marketing. A [Shopper](../market/personas/Shopper.md) leaves an address; it lands on a list inside the provider the [Ecommerce Manager](../market/personas/Ecommerce%20Manager.md) already uses to send campaigns, so the operator gains an owned channel without a developer ticket per campaign; the [Storefront Developer](../market/personas/Storefront%20Developer.md) spends configuration time instead of build time and sees the provider-swap contract hold for one more integration; the adopter stays on Nimara. Nimara deliberately captures none of that data and gains no list of its own. Because adopter deployments are not observable, this PRD sets no demand-side outcome target — that exclusion is an explicit decision, recorded rather than replaced with a manufactured number.

## Success Metrics

- M-1 (leading indicator): Developer activation — a developer starting with a working Nimara storefront and their own provider account reaches a delivered test subscription within one business day, following the documented configuration path and without reading the integration's source — measured through the documented onboarding validation and recorded by the PRD owner.
- M-2 (quality gate): Delivery honesty — 100% of accepted submissions either reach the configured provider or surface a failure to the subscriber. No submission is silently discarded and no failure is ever presented as success — enforced by the automated end-to-end suite.
- M-3 (quality gate): Consent integrity — no address is sent to the provider without an explicit consent action taken in the same submission — enforced by the automated end-to-end suite.

No business-outcome target is set, by explicit decision: adopter deployments are not observable and no demand evidence exists to calibrate one. GitHub stars, demo traffic, and demo subscriber counts may be observed diagnostically but do not determine PRD success.

## MVP & Falsification

The MVP is the smallest slice that turns the published promise into a working capability: the existing home-page form submitting to one maintained provider adapter behind a replaceable boundary; an explicit consent action with a link to the deployment's privacy policy, carried to the provider; subscriber confirmation and unsubscribe owned by the provider rather than reimplemented; honest success and failure states; the form absent wherever no provider is configured; and one documentation page covering configuration and provider replacement. Nimara stores no subscriber record in any deployment.

Rollout is an ordinary release to `main` behind provider configuration, with no preview tier and no design partner, because an open-source distribution has nobody to pilot with. The public demo runs a configured provider on its free tier so the capability is visible where evaluators actually look. What the MVP buys is the single fact worth learning first: whether a provider-neutral boundary can be configured by an adopter within a working day, before anything larger is funded.

The hypothesis is falsified if maintaining a first-party integration stops paying for itself against the alternative of adopters wiring their own provider — for example if provider API or free-tier terms shift enough to demand continuous upkeep, or if the boundary cannot be held provider-neutral and each provider drags its own semantics into the contract. The condition is event-triggered rather than time-boxed: it is assessed when provider terms or API changes force upkeep, and when a second provider is integrated against the boundary, not on a fixed validation clock. In that case stop developing the built-in integration and retain only the documented boundary and a reference example; because the form is configuration-gated, no deployment is left showing a promise it cannot keep. Absence of adoption is explicitly not a falsifying result, and no validation window is opened against it: usage in adopter projects cannot be observed, so silence carries no information either way.

## Nonfunctional Requirements

- NFR-1: With no provider configured, the capability changes no storefront behavior, layout, or performance, and the form is absent rather than inert.
- NFR-2: Provider latency or failure must not block home-page rendering, and the subscriber must reach a resolved state instead of an indefinite pending one.
- NFR-3: The form inherits Nimara's accessibility standard: keyboard operation, labelled fields, and validation and submission errors exposed to assistive technology.
- NFR-4: Nimara persists no subscriber data. The adopter is the data controller and the provider its processor; on the public demo that controller is Mirumee.
- NFR-5: All subscriber-facing copy remains translatable through the existing message catalogue, with no hardcoded strings.
- NFR-6: The public demo runs on an isolated provider account within its free tier, and the demo privacy policy covers the subscriber data it collects.

## Scope

- S-1: A storefront newsletter subscription capability, configured per deployment and absent unless a provider is configured.
- S-2: The existing home-page form as the single entry point, extended with an explicit consent action and a link to the deployment's privacy policy.
- S-3: One core-maintained provider adapter behind a documented replaceable boundary; adopters use their own provider accounts, credentials, and plans.
- S-4: Consent carried to the provider with the subscription, so the provider holds the record of what was agreed and when.
- S-5: Subscriber confirmation and unsubscribe delegated to the provider, which must perform them on its own side.
- S-6: Honest outcome states: a success message only for a delivered subscription, a failure message the subscriber can act on otherwise.
- S-7: One documentation page covering configuration, the provider-swap boundary, and the data responsibility the adopter takes on.
- S-8: A configured provider on the public demo, on an isolated account within its free tier.
- S-9: End-to-end coverage of the configured, unconfigured, consent-refused, and provider-failure paths, authored in the repository's current test approach.

## Out of Scope

- Per-vendor or marketplace-scoped subscriber lists — no marketplace home variant renders the form, so the question has no surface and no evidence behind it; belongs in a separate PRD if marketplace vendors ask for it.
- A Nimara-owned subscriber store, admin view, or CSV export — the provider owns the list, and a list Nimara cannot send campaigns from would leave the operator exporting spreadsheets by hand; belongs in a separate PRD only if a real need appears.
- A Nimara-implemented double opt-in mechanism — it requires storing unconfirmed subscribers, which contradicts holding no subscriber data; becomes a provider selection requirement in solution design instead.
- Unsubscribe and preference management surfaces — the provider performs them in its campaign footer and thereby satisfies the legal requirement; belongs to the provider's capability.
- Newsletter opt-in during checkout or account registration — a different journey with its own consent and identity questions; a fast-follow slice once the single entry point is validated.
- Additional form placements such as the footer or product pages — not needed to test the hypothesis; a fast-follow slice.
- Campaign composition, email templates, segmentation, and automation — outside Nimara's role, on the same reasoning [Do Not Pursue](../market/strategy/Do%20Not%20Pursue.md) applies to rebuilding commoditized infrastructure; belongs to the provider's tooling.
- Transactional email such as order confirmations and vendor lifecycle notifications — an unrelated concern already served elsewhere in the repository; stays separate.
- Consent record-keeping inside Nimara — the provider stores the opt-in record; belongs to the provider's capability.
- Tracking and cookie consent — governed by [PRD-003 Cookie Consent & Google Consent Mode v2](PRD-003%20Cookie%20Consent.md) on a different legal basis and mechanism; the two must stay independent and must not be merged.
- Provider selection, layer placement, operation contracts, environment-variable names, and effort estimates — downstream solution design, which is where the research task that seeded this PRD is closed.

## User Stories

- US-1 ([Storefront Developer](../market/personas/Storefront%20Developer.md)): As a developer adopting Nimara, I want to connect my own email provider through documented configuration, so that subscriber capture works in my store without me building it.
- US-2 ([Storefront Developer](../market/personas/Storefront%20Developer.md)): As a developer whose client uses a different provider, I want to replace the adapter behind a documented boundary, so that my choice of provider does not require forking Nimara.
- US-3 ([Storefront Developer](../market/personas/Storefront%20Developer.md)): As a developer who has not configured a provider, I want the form to be absent rather than pretending to work, so that my storefront never promises a subscription it cannot deliver.
- US-4 ([Ecommerce Manager](../market/personas/Ecommerce%20Manager.md)): As the operator of the store, I want subscribers to arrive on my list inside the tool where I already send campaigns, so that I can run email marketing without a developer ticket for each campaign.
- US-5 ([Shopper](../market/personas/Shopper.md)): As a shopper, I want to know whether my subscription actually went through and what I agreed to, so that I can trust the store with my address.
- US-6 ([Storefront Developer](../market/personas/Storefront%20Developer.md)): As a developer evaluating Nimara, I want to see the capability working in the public demo, so that I can judge it before adopting.

## Acceptance Criteria

- AC-1 (US-1): Given a configured provider, when a shopper submits the form with consent given, then the address and consent reach the provider's list and the shopper sees a success message only after delivery is confirmed.
- AC-2 (US-1): Given a working Nimara storefront and the developer's own provider account, when the developer follows the documentation, then a delivered test subscription is reached within one business day without reading the integration's source.
- AC-3 (US-2): Given a deployment replaces the provider adapter through the documented boundary, when it does so, then no fork of the shared implementation is required and the form, validation, translations, and outcome states are unchanged.
- AC-4 (US-3): Given no provider is configured, when the home page renders, then the newsletter form is absent and no other storefront behavior or performance characteristic changes.
- AC-5 (US-5): Given the provider rejects the request, fails, or times out, when submission completes, then the shopper sees an actionable failure message, never a success message, and the submission is not silently discarded.
- AC-6 (US-5): Given the consent action is not taken, when the shopper attempts to submit, then no address is sent to the provider and the required consent is explained in the form.
- AC-7 (US-5): Given a subscription is delivered and the provider performs confirmation, when the shopper submits, then the storefront states that a confirmation step follows, and the storefront itself neither confirms nor stores the address.
- AC-8 (US-4): Given a delivered subscription, when the operator opens their provider account, then the subscriber is present on the configured list with the consent record attached, with no export or manual step in Nimara.
- AC-9 (US-6): Given the public demo, when an evaluator submits the form, then the subscription is delivered to the demo's isolated provider account within its free tier, and the demo privacy policy covers that collection.

## Risks

- R-1: The demand assumption rests on a persona implication and sixteen months of silence — mitigation: label it `A-1`, set no demand target, and keep the appetite at one adapter behind a boundary so a wrong assumption costs little.
- R-2: A public demo with a real provider is a spam and abuse vector; bots can exhaust the free tier and pollute the list — mitigation: unresolved, tracked as `Q-1`; the demo must not be enabled before it is answered.
- R-3: If no provider performs subscriber confirmation on its own side, either confirmation is lost or Nimara has to store unconfirmed subscribers, which the scope excludes — mitigation: make provider-side confirmation a selection requirement in solution design and reopen the boundary decision rather than quietly storing data.
- R-4: Free-tier limits on the demo account can be exceeded, turning a parity feature into a running cost — mitigation: isolated account, an explicit limit policy, and a documented decision to disable the demo form rather than pay.
- R-5: Mirumee becomes the data controller for demo subscribers, taking on privacy-policy coverage and erasure requests for a list of no business value — mitigation: accepted deliberately in exchange for evaluator visibility; ownership of requests tracked as `Q-2`.
- R-6: Provider-specific semantics can leak into the boundary and make the swap promise hollow — mitigation: validate the boundary against a second provider on paper during solution design; a boundary that cannot stay neutral is a falsifying result.
- R-7: Requests to grow this into email marketing — dashboards, templates, segments, per-vendor lists — would turn a parity slice into a platform — mitigation: enforce the out-of-scope list and require separate evidence for any follow-up PRD.
- R-8: Making the form configuration-gated invalidates existing end-to-end coverage that asserts the form is always present — mitigation: `S-9` replaces that coverage in the repository's current test approach as part of the same change.

## Open Questions

- Q-1: How is the public demo's form protected against automated abuse, and does that protection belong in this capability or in the demo deployment? — Product and Architecture — must be answered before the demo form is enabled.
- Q-2: Who receives and executes erasure and access requests from demo subscribers, given Mirumee is their data controller? — Product — must be answered before the demo form is enabled.
- Q-3: Which provider does the core team maintain as the reference adapter, and does it satisfy provider-side confirmation, an adequate free tier, and EU data residency? — Architecture — must be answered before solution design is approved.
- Q-4: Does the consent action stay a storefront concern only, or does an existing account-level privacy surface need to reflect a marketing subscription? — Product — must be answered before solution design is approved.

## Related Notes

[Table Stakes vs Differentiators](../market/research/Table%20Stakes%20vs%20Differentiators.md)
[Initiative Prioritization](../market/strategy/initiatives/Initiative%20Prioritization.md)
[Do Not Pursue](../market/strategy/Do%20Not%20Pursue.md)
[PRD-003 Cookie Consent & Google Consent Mode v2](PRD-003%20Cookie%20Consent.md)
[Storefront Developer](../market/personas/Storefront%20Developer.md)
[Ecommerce Manager](../market/personas/Ecommerce%20Manager.md)
[Shopper](../market/personas/Shopper.md)
