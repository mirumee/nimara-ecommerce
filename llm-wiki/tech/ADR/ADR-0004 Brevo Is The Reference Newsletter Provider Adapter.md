---
type: "Architecture Decision Record"
title: "Brevo Is The Reference Newsletter Provider Adapter"
description: "Brevo is the maintained reference adapter for newsletter subscription, called over fetch rather than its unlicensed SDK, chosen because confirmation is a property of its endpoint and its servers are in the EU."
tags:
  - "adr"
  - "newsletter"
  - "brevo"
  - "email-marketing"
  - "provider-selection"
  - "privacy"
created: "2026-08-18T00:00:00+00:00"
status: "proposed"
owner: "engineering"
superseded_by: null
---

## Context

[PRD-004](../../prd/PRD-004%20Newsletter%20Subscription.md) Q-3 asks which provider the core team
maintains as the reference adapter, and requires that provider to satisfy three criteria before the
solution design is approved: provider-side confirmation, an adequate free tier, and EU data
residency. The first criterion is structural — PRD-004 excludes a Nimara-implemented double opt-in
because it would require storing unconfirmed subscribers, so confirmation has to be the provider's
job rather than Nimara's.

The candidates and what separates them:

- **Brevo.** Its double-opt-in contact endpoint sends the confirmation email itself and adds the
  contact to the configured lists only after the recipient confirms
  ([Brevo API reference](https://developers.brevo.com/reference/create-doi-contact), captured
  2026-08-18). Confirmation is therefore a property of the endpoint being called.
- **MailerLite.** Double opt-in for API traffic is an account-level toggle, so provider-side
  confirmation could be switched off in the provider's dashboard without any Nimara change, and
  Nimara would have no way to observe it.
- **listmonk.** Confirms on its own side, but the adopter must host it. That is the worst outcome
  for configuration-only adoption and gives the public demo a running cost instead of a free tier.

Verified for Brevo against the vendor's own pages, both captured 2026-08-18 and both to be
re-verified at implementation time:

- The free plan is "Free forever, no credit card needed" and caps sending at **300 emails/day**; the
  page states "Upgrade to remove daily sending limit", that an account must be approved by Brevo
  before it can send at all — "Once we approve your account for sending, you can start sending up to
  300 emails per day" — and that removing the "Sent by Brevo" sticker is a paid add-on
  ([Brevo pricing](https://www.brevo.com/pricing/)).
- "Our servers are located in the EU, your account data is encrypted before being backed up", and
  the platform is ISO 27001:2022-certified
  ([Brevo data security](https://www.brevo.com/features/data-security/)).

One finding rules out the vendor SDK. `@getbrevo/brevo` 6.0.3 declares no license in its registry
metadata, its repository carries no license file, and GitHub detects none (checked 2026-08-18). Two
of its defaults also work against this design: retries are enabled with exponential backoff on
retryable status codes, and the default request timeout is an order of magnitude above the budget
this capability needs.

## Decision

We will maintain **Brevo** as the reference newsletter adapter, calling its double-opt-in contact
endpoint directly over `fetch` with an explicit timeout and no retries, rather than through the
vendor SDK. The operation is a single `POST`, so the SDK would buy nothing and would mean carrying
an unlicensed dependency in order to then disable its behaviour.

A dummy adapter ships alongside it, following the convention the search and content capabilities
already use. It satisfies the boundary, makes no outbound call, and lets both the test suite and a
developer without credentials exercise the whole path.

Everything Brevo-shaped — list identifiers, the confirmation-email template, the post-confirmation
redirect — is configuration of that adapter's manifest, validated only when the selector names it.
Provider failures are injected at the network level in tests rather than by teaching the dummy
adapter to fail on special input, because rejection, unavailability and timeout are transport
behaviour and stubbing the transport is what tests the real adapter's mapping into the error codes.

The public demo runs an isolated Brevo account on the free plan.

This answers PRD-004 Q-3 and is the verdict
[RFC-0001](../RFC/RFC-0001%20Newsletter%20Subscription.md) asks for on the reference adapter.

## Consequences

Easier or safer:

- Provider-side confirmation is a property of the endpoint rather than an account setting, so it
  cannot be switched off outside Nimara's view. This is what MailerLite could not offer.
- EU residency and ISO 27001:2022 are confirmed for the demo, where Mirumee is the data controller
  under PRD-004 R-5.
- No package dependency is added, and no unlicensed dependency enters the tree. The timeout and the
  absence of retries are properties of the adapter rather than of a client library's defaults, so a
  library upgrade cannot silently reintroduce either.
- Adopters who select another provider install nothing extra.

Harder or lost — the first two are what verifying Q-3 bought, and neither was visible in RFC-0001:

- **300 emails/day is a hard cap, and every subscription attempt spends one confirmation email.**
  Roughly three hundred submissions exhaust a day's quota. That turns PRD-004 R-2, the demo as an
  abuse vector, from a qualitative risk into a measurable one: without abuse protection the demo
  form is a few hundred requests away from denying its own capability for the rest of the day. It
  also makes PRD-004 Q-1 the hard gate it claims to be. Quota exhaustion is mapped to its own error
  class precisely so hitting this limit stays distinguishable from a provider outage.
- **A fresh Brevo account cannot send until Brevo approves it for sending.** The demo, and every
  adopter following the documentation, meets an approval step outside Nimara's control and outside
  its timing. The integration guide must state it, or PRD-004 M-1 — a delivered test subscription
  within one business day — fails at a step the guide never mentioned.
- The free plan keeps the "Sent by Brevo" sticker on outgoing mail, so the demo's confirmation email
  carries Brevo branding. Removing it is a paid add-on and is not worth buying for a demo.
- Custom contact attributes generally have to exist in the Brevo account before they accept values,
  so consent data would go nowhere while subscriptions appear to work. This is a documented
  provider-side prerequisite, not something the adapter can detect.
- Nimara now tracks one vendor's API and one vendor's free-tier terms. PRD-004 treats sustained
  upkeep against either as a falsification condition for the whole capability.
- Both figures above come from marketing pages captured on 2026-08-18 and can change without notice.
  They are re-verified at implementation time, not treated as durable.

Neutral, and relevant to whoever revisits this:

- Replacing Brevo does not supersede
  [ADR-0003](ADR-0003%20Newsletter%20Subscription%20Is%20Configuration-Gated%20With%20No%20Default%20Provider.md)
  or
  [ADR-0005](ADR-0005%20The%20Newsletter%20Subscribe%20Contract%20Is%20Provider-Neutral%20And%20Membership-Blind.md).
  It is one manifest entry behind a contract the call site does not see, which is the whole point of
  keeping the reference adapter a separate decision.
- listmonk remains the natural second adapter for adopters who self-host. A generic
  outbound-webhook adapter is the cheapest way to test whether the boundary stays neutral, which
  PRD-004 treats as a falsification condition. Neither is built by this decision.
- Should a future adapter genuinely need a vendor client library, the repository's convention is
  `optionalDependencies` in the shared infrastructure package, as used for the existing search and
  content providers.

## Related Notes

[ADR MOC](ADR%20MOC.md)
[ADR-0003 Newsletter Subscription Is Configuration-Gated With No Default Provider](ADR-0003%20Newsletter%20Subscription%20Is%20Configuration-Gated%20With%20No%20Default%20Provider.md)
[ADR-0005 The Newsletter Subscribe Contract Is Provider-Neutral And Membership-Blind](ADR-0005%20The%20Newsletter%20Subscribe%20Contract%20Is%20Provider-Neutral%20And%20Membership-Blind.md)
[RFC-0001 Newsletter Subscription](../RFC/RFC-0001%20Newsletter%20Subscription.md)
[PRD-004 Newsletter Subscription](../../prd/PRD-004%20Newsletter%20Subscription.md)
