---
type: "Architecture Decision Record"
title: "Newsletter Capture Is A Selectable Provider Capability"
description: "Newsletter capture layers over the storefront provider-selection machinery instead of holding a bespoke integration, and the public submit path ships with no rate limiting."
tags:
  - "adr"
  - "newsletter"
  - "storefront"
  - "provider-selection"
  - "configuration"
  - "abuse-protection"
created: "2026-08-20T00:00:00+00:00"
status: "accepted"
owner: "Łukasz Szewczyk"
superseded_by: null
---

## Context

The storefront home page renders a subscribe box whose action returns success and stores nothing.
No layer of the repository defines a contract for newsletter capture, so an adopter who needs the
capability writes the whole integration alone.

The repository already solves provider neutrality once, for search and for content. A capability
states a use-case contract, one manifest per provider owns that provider's configuration schema and
its lazy factory, a selector resolves the manifest, a cached loader constructs the service on first
use, and an integration preflight reports the effective provider and any missing keys. That
machinery exists and carries two providers each today.

Two forces make newsletter capture different from those two capabilities.

The commerce backend serves both search and content, so both default to it. It has no newsletter
capability. Newsletter therefore has no default provider, and an unconfigured deployment has no
provider at all rather than a fallback.

The capability is also a write path that a shopper reaches without authenticating, and it calls a
paid third-party API. No rate limiting exists anywhere in this repository. The storefront target
host is serverless, so a counter held in one function instance sees only the traffic that reaches
that instance. A firewall rule counts across instances but answers at the edge, which means the
application cannot render a message that names the limit. Every option therefore costs either a
dependency, a platform commitment in an open-source starter, or a user-visible behavior.

[RFC-0001](../RFC/RFC-0001%20Newsletter%20Subscription%20Provider%20Seam.md) designed the capability
against those forces and left the rate-limiting branch open as its deferred item D-1, gated on this
record.

## Decision

We will accept
[RFC-0001 Newsletter Subscription Provider Seam](../RFC/RFC-0001%20Newsletter%20Subscription%20Provider%20Seam.md)
as written, and we will ship newsletter capture with no rate limiting on the submit path.

Newsletter becomes a selectable capability in the shape that search and content already use. It
states one use-case operation, subscribes an address, and answers the repository `Result` type.
`NEWSLETTER_SERVICE` selects the implementation and carries no default, so an absent value means no
provider. Provider resolution is the single answer to the question "is a provider configured": the
home view reads it to decide whether to render the section, and the submit path reads it again and
refuses early. Klaviyo is the first provider, on its server endpoint with a private key, and a
`202 Accepted` response is the only success condition.

We accept that the public submit path is unbounded. The exposure is on record here rather than
mitigated in the design. Provider double opt-in still means that a fake address receives no mail, so
what an unbounded path costs is request volume against the provider API and the provider bill, not
mail sent to people who did not ask for it.

PRD-004 loses the three requirements that asked for the missing behavior. Requirement S-7, user
story US-6, and acceptance criterion AC-9 are removed, risk R-2 now records the accepted exposure
rather than a mitigation, and open question Q-2 is closed as moot. Rate limiting joins bot
protection under the PRD's out-of-scope list. The research that produced this decision is held in
[Rate Limiting for Public Storefront Endpoints](../../market/strategy/initiatives/Rate%20Limiting%20for%20Public%20Storefront%20Endpoints.md)
so a later design does not repeat it.

Release is not blocked and no feature flag is added. Removing the configuration removes both the
section and the submit behavior, so configuration is the kill switch.

## Consequences

A second email provider costs one manifest entry and touches no caller, because the manifest, the
selector, and the preflight row all derive from one array. That is the property the PRD
falsification test measures, so the bet is now testable rather than asserted.

An adopter reaches a working subscription through configuration alone, which is what the PRD success
metric M-1 measures. The preflight reports the newsletter selection beside search and content, so a
missing key is visible before a build rather than at the first submission.

Provider resolution is now read by a view and not only by the service registry. That is a small
widening of what the presentation layer knows: it reads selection policy, not just services. The
alternative forced service construction on every home-page render, including deployments that never
use the capability.

The capability cannot fail silently. Success runs only on a provider acknowledgement, the empty
service answers an error instead of a payload, and a failure produces a logged event that carries
the provider, the response status, and the error code. It never carries the address, so an operator
cannot tell which submission failed. Nimara stores no subscription state and cannot retry one
subscriber, so that trade costs diagnosis of an individual case and nothing operational.

A timeout is ambiguous by construction. A request that times out after the provider accepted it
shows the shopper a failure message, and the confirmation mail can still arrive. This is the cost of
refusing to report a success the provider never acknowledged.

The unbounded submit path is the negative consequence that outlives this record. A script can drive
request volume against the merchant's provider API and their bill. Nothing in the repository detects
it, and no alert fires on it, because the design adds no counter to alert on. A deployment that needs
protection today configures it outside the application, at its firewall.

Two obligations pass to whoever implements this. The Klaviyo list must have double opt-in enabled,
otherwise the provider subscribes immediately and sends no confirmation mail, and the preflight
cannot verify that. The subscribe endpoint also clears prior unsubscribe and spam-report
suppressions on a submitted profile, so a resubscribe can undo an earlier unsubscribe. RFC-0001
holds both as deferred items D-2 and D-3.

## Related Notes

[ADR MOC](ADR%20MOC.md)
[RFC-0001 Newsletter Subscription Provider Seam](../RFC/RFC-0001%20Newsletter%20Subscription%20Provider%20Seam.md)
[PRD-004 Newsletter Subscriptions](../../prd/PRD-004%20Newsletter%20Subscriptions.md)
[Rate Limiting for Public Storefront Endpoints](../../market/strategy/initiatives/Rate%20Limiting%20for%20Public%20Storefront%20Endpoints.md)
[CAP-0001 Swappable Storefront Search and Content Providers](../../product/capabilities/CAP-0001%20Swappable%20Storefront%20Search%20and%20Content%20Providers.md)
