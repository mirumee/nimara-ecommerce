---
type: "Product Requirements Document"
title: "Newsletter Subscriptions"
description: "Product requirements for a provider-neutral newsletter subscription seam in the Nimara storefront."
tags:
  - "prd"
  - "newsletter"
  - "email"
  - "integration"
created: "2026-08-20T00:00:00+00:00"
status: "approved"
owner: "Łukasz Szewczyk"
prd_type: "business"
personas:
  - "[Storefront Developer](../market/personas/Storefront%20Developer.md)"
  - "[Ecommerce Manager](../market/personas/Ecommerce%20Manager.md)"
  - "[Shopper](../market/personas/Shopper.md)"
---

# Newsletter Subscriptions

## Value Hypothesis

**For** the [Storefront Developer](../market/personas/Storefront%20Developer.md) **who** must write an email-provider integration alone, because the storefront asks a shopper for an address and then discards it, **the** Newsletter Subscription capability **is a** provider-neutral subscription seam in the storefront **that** delivers a subscriber to the configured email provider through configuration only, **unlike** a bespoke integration per project or the dead form that ships today, **our solution** keeps the provider swappable, in the same shape as the swappable search and content providers.

## Business Goal & Value

Newsletter capture is a credibility floor for a commerce starter, not a differentiator. Nimara renders a subscribe box on the home page today. The action behind it returns success and stores nothing, so an evaluator who tests the form finds a dead end, and an adopter who needs the capability writes the integration alone. Nimara defines no contract for it. The strategic role of this PRD is market parity. Urgency is medium, because nothing fails in production and the gap is visible only during evaluation and early build.

The value path runs through three parties. A shopper subscribes on the storefront. The address reaches the merchant's email provider. The [Ecommerce Manager](../market/personas/Ecommerce%20Manager.md) then runs campaigns without a developer ticket, which is the self-serve gap that the persona already names. The [Storefront Developer](../market/personas/Storefront%20Developer.md) keeps Nimara instead of paying for a table-stakes gap in custom code. Demand is `[ASSUMPTION]`. The only written evidence is the persona roadmap line and the stub in the repository. No adopter request, support ticket, or community issue supports it.

## Success Metrics

- M-1 (business outcome, lagging): a Storefront Developer who did not build the seam connects the supported provider on a fresh clone with configuration only. Target: no application code file is changed, and the work takes under 15 minutes. Population: developers evaluating or adopting Nimara. Timeframe: measured at release and repeated for every later provider. Source: a timed walkthrough on a clean checkout. Owner: Łukasz Szewczyk. The 15-minute figure is an `[ASSUMPTION]` until the first walkthrough runs.
- M-2 (leading indicator, diagnostic): every address submitted on the demo store arrives in the connected provider list within one minute. Source: a QA run before release. Owner: Łukasz Szewczyk.
- M-3 (leading indicator, diagnostic): a forced provider failure produces a failure message and a logged event, and no submission reports success without a provider acknowledgement. Source: a QA run before release. Owner: Łukasz Szewczyk.

M-2 and M-3 prove that the capability works. They do not prove adopter value. Only M-1 carries the bet.

## MVP & Falsification

The MVP keeps the existing home-page section as the single capture point. The form collects an email address and nothing else. Klaviyo is the first supported provider. Klaviyo owns the confirmation mail, the unsubscribe link, the consent record, and the list. Nimara owns capture, validation, consent text, and result states. A deployment with no configured provider does not render the section, so configuration is the on switch and the release needs no feature flag. Rollout is a normal public release to `main`. The documentation carries the setup walkthrough that M-1 measures.

The MVP buys one thing: evidence that an adopter reaches a working subscription through configuration alone.

Falsification runs as a second-provider test. After the first provider ships, a developer who did not build the seam adds a second provider. The hypothesis is wrong if that work changes code outside the provider module, or if either timed walkthrough misses the target by a wide margin. Action after a negative result: keep one provider plus a documented extension point, drop the provider-neutral claim, and record the narrowed scope in the capability record. Validation window: 90 days after release.

Insufficient evidence is not a negative result. If the second-provider test does not run inside the window, the neutrality claim is untested and stays unproven. The action then is to run the test, not to narrow the scope.

Investment appetite is not set. See Q-4.

## Scope

- S-1: one subscription capture point, the existing home-page section.
- S-2: the email address is the only field the shopper fills in.
- S-3: a provider-neutral subscription contract, with one supported provider at release.
- S-4: configuration-driven activation. With no configured provider, the section is not rendered and no endpoint accepts a submission.
- S-5: consent text at the point of submit, with a link to the privacy policy. The provider holds the consent record through double opt-in.
- S-6: honest result states. Success appears only after the provider accepts the request. Any other outcome shows a failure message and logs an event.
- S-8: a setup walkthrough in the documentation, complete enough to satisfy M-1.

Klaviyo is named as the first provider by an explicit business decision of the owner, on reach within the composable commerce audience. The endpoint surface, key handling, package placement, and configuration validation stay with solution design.

## Personas

- P-1: [Storefront Developer](../market/personas/Storefront%20Developer.md) — primary. Chooses Nimara, configures the provider, owns the deployment.
- P-2: [Ecommerce Manager](../market/personas/Ecommerce%20Manager.md) — beneficiary. Runs campaigns on the filled list without a developer ticket.
- P-3: [Shopper](../market/personas/Shopper.md) — end user. Subscribes and expects a confirmation mail and a working unsubscribe link.

## Out of Scope

- Footer, checkout opt-in, and account preference capture points — the seam must hold first — a later PRD after the second-provider test.
- Nimara-owned subscription state, unsubscribe handling, and preference management — the provider owns them — rejected under [Do Not Pursue](../market/strategy/Do%20Not%20Pursue.md).
- Mail sending from Nimara, including a Nimara-implemented double opt-in — same reason, same destination.
- The name field and any other profile attribute — data minimisation — revisit only when a merchant need is evidenced.
- Rate limiting and bot protection on the public endpoint — removed from this PRD by owner decision in [ADR-0004](../tech/ADR/ADR-0004%20Newsletter%20Capture%20Is%20A%20Selectable%20Provider%20Capability.md) — the research is held in [Rate Limiting for Public Storefront Endpoints](../market/strategy/initiatives/Rate%20Limiting%20for%20Public%20Storefront%20Endpoints.md).
- Campaign, welcome series, abandoned-cart mail, and campaign metrics — a marketing-engine bet — a separate PRD, if ever.
- A second provider adapter — it is the falsification test after release, not MVP content.
- The marketplace and payment applications — they carry no shopper capture surface — no destination.

## User Stories

- US-1 (Storefront Developer): As a Storefront Developer, I want to connect an email provider through configuration, so that I ship newsletter capture without writing an integration.
- US-2 (Storefront Developer): As a Storefront Developer, I want the section to disappear when no provider is configured, so that no shopper meets a form that leads nowhere.
- US-3 (Shopper): As a Shopper, I want to subscribe with my email address and see what I sign up for, so that I consent to the mail I receive.
- US-4 (Shopper): As a Shopper, I want an honest result after I submit, so that I know whether my subscription worked.
- US-5 (Ecommerce Manager): As an Ecommerce Manager, I want new subscribers to appear in my email provider, so that I run a campaign without a developer ticket.

## Acceptance Criteria

- AC-1 (US-1): Given a fresh clone and provider credentials, when the developer follows the documented walkthrough, then submissions reach the provider, and no application code file is changed.
- AC-2 (US-2): Given a deployment with no configured provider, when a shopper opens the home page, then the newsletter section is not rendered.
- AC-3 (US-3): Given the rendered form, when a shopper reads it before submitting, then the purpose text and a link to the privacy policy are visible, and the email address is the only input.
- AC-4 (US-3): Given a valid address, when the shopper submits, then the provider records a pending subscription and sends the confirmation mail.
- AC-5 (US-4): Given the provider accepts the request, when the response returns, then the shopper sees a success message.
- AC-6 (US-4): Given the provider returns an error or the call times out, when the response returns, then the shopper sees a failure message and the application logs the failure. No success message appears.
- AC-7 (US-4): Given an invalid address, when the shopper submits, then the form shows a validation message on the field and calls no provider.
- AC-8 (US-5): Given a shopper who confirms the subscription, when the manager opens the provider list, then the subscriber is present within one minute of the confirmation.

## Risks

- R-1: demand rests on one persona line — mitigation: the MVP is small, the falsification test is named, and the stop action is defined.
- R-2: a public endpoint calls a paid third-party API, and nothing bounds the request rate — mitigation: provider double opt-in only, so a fake address receives no mail. Accepted residual risk: a script can inflate the request count against the provider API and the provider bill. Accepted by owner decision in [ADR-0004](../tech/ADR/ADR-0004%20Newsletter%20Capture%20Is%20A%20Selectable%20Provider%20Capability.md).
- R-3: a seam designed against one provider can encode that provider's assumptions — mitigation: the second-provider test inside the validation window.
- R-4: default consent wording without legal review can be wrong for EEA and UK deployments — mitigation: Q-1 before release, and adopters can replace the text.
- R-5: removing the name field breaks existing translations and end-to-end fixtures — mitigation: update the storefront message files and `apps/automated-tests/codecept/data/constants.ts` in the same change.
- R-6: the demo store publishes a real form, so it collects real personal data into a real provider account — mitigation: Q-5. Either the project owns the account and its privacy policy names it, or the demo leaves the provider unconfigured and the section stays hidden.

## Open Questions

- Q-1: what is the default consent wording and the lawful basis behind it — owner: Łukasz Szewczyk — before release.
- Q-3: which provider serves as the second-provider falsification test, and who runs it — owner: Łukasz Szewczyk — before the 90-day validation window closes.
- Q-4: what investment appetite bounds this work — owner: Łukasz Szewczyk — before implementation starts.
- Q-5: does the Nimara demo store configure a provider account — owner: Łukasz Szewczyk — before release.

## Related Notes

[Storefront Developer](../market/personas/Storefront%20Developer.md)
[Ecommerce Manager](../market/personas/Ecommerce%20Manager.md)
[Shopper](../market/personas/Shopper.md)
[PRD-003 Cookie Consent & Google Consent Mode v2](PRD-003%20Cookie%20Consent.md)
[CAP-0001 Swappable Storefront Search and Content Providers](../product/capabilities/CAP-0001%20Swappable%20Storefront%20Search%20and%20Content%20Providers.md)
[Table Stakes vs Differentiators](../market/research/Table%20Stakes%20vs%20Differentiators.md)
[Do Not Pursue](../market/strategy/Do%20Not%20Pursue.md)
[Coverage Maps](../quality/Coverage%20Maps.md)
