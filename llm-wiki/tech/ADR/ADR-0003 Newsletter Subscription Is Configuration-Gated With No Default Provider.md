---
type: "Architecture Decision Record"
title: "Newsletter Subscription Is Configuration-Gated With No Default Provider"
description: "Newsletter subscription is a swappable storefront capability whose selector has no default; an unset selector is the capability's off state and the form is absent, not inert."
tags:
  - "adr"
  - "newsletter"
  - "storefront"
  - "provider-selection"
  - "configuration"
created: "2026-08-18T00:00:00+00:00"
status: "accepted"
owner: "engineering"
superseded_by: null
---

## Context

The storefront renders a newsletter form whose submit action returns a fixed success and stores
nothing, and whose client shows a success toast on that result. The form appears only in the
`shop-basic` home variant. The repository therefore publishes a capability it does not have, and a
shopper who submits an address is told it worked.

[PRD-004](../../prd/PRD-004%20Newsletter%20Subscription.md) asks for a working capability under two
constraints that shape every mechanism available: Nimara persists no subscriber data, and where no
provider is configured the capability changes no storefront behavior, layout, or performance, with
the form absent rather than inert.

Two properties of the existing provider-selection mechanism matter here.

The first is that both capabilities already using it — search and content selection — default to
`saleor`. They are therefore always present and always render UI. Their `null` resolution exists as
a production safety net for an unconfigured backend, not as an off state anyone selects on purpose.

The second is that no equivalent default exists for newsletter. Nimara cannot pick an email service
provider on an adopter's behalf: the adopter holds the account, the plan, the credentials, and the
data-controller obligation. A default would either mandate a vendor or reinstate a stub that lies
again.

## Decision

We will add newsletter subscription as a swappable storefront capability on the existing
provider-selection mechanism, with **no default provider**. An unset selector resolves to nothing,
and that resolution is the capability's designed off state rather than a fallback.

The home page's server component reads the resolution and omits the form entirely, so absence is
decided once, on the server, and the client never learns whether a provider exists. The home view
renders the form only when the app passed it a subscribe action, so the gate and the action are one
fact rather than a boolean and a callback that could disagree.

The stub submit action is removed rather than left beside the working one. The service registry's
empty implementation for this capability returns an error result rather than a success, so a direct
invocation of the server action cannot be answered with a fabricated success even if the render gate
is ever bypassed.

The gate stays a configuration read. Implementing it as a provider health check at render time is
excluded: it would put a provider round-trip in the home page's critical path and let the provider's
uptime decide whether the form exists.

This is the verdict [RFC-0001](../RFC/RFC-0001%20Newsletter%20Subscription.md) asks for on the shape
of the capability. Its reference adapter is decided in
[ADR-0004](ADR-0004%20Brevo%20Is%20The%20Reference%20Newsletter%20Provider%20Adapter.md) and its
boundary contract in
[ADR-0005](ADR-0005%20The%20Newsletter%20Subscribe%20Contract%20Is%20Provider-Neutral%20And%20Membership-Blind.md).

## Consequences

Easier or safer:

- A deployment that never sets the selector is unaffected by any of this. Enabling the capability is
  adding configuration; disabling it is removing configuration, with no code change either way.
- The dishonest path is deleted rather than deprecated. Leaving a second submission path in the tree
  is how the current problem arose.
- The integration preflight picks the capability up without new reporting code, because it derives
  its report from the manifests and already prints an explicit line for a capability with no
  provider configured.
- The demo's exposure is bounded by configuration: removing the provider configuration removes the
  form.

Harder or lost:

- This is the first storefront capability whose unconfigured state is absence rather than a default
  provider. The selection mechanism now carries two meanings for "no provider" — safety net for
  search and content, off switch here — and a contributor who later adds a default to this
  capability would silently turn the off state into a fallback.
- Two things have to agree that the form is absent: the render gate and the empty service. They are
  kept as one fact by passing the action as a prop, but the empty service exists precisely because
  the gate can be bypassed by calling the action directly.
- The selector is read the way the existing ones are, so enabling, disabling, or changing the
  provider requires a rebuild and redeploy rather than a runtime toggle.
- End-to-end coverage of the form has to become configuration-aware. PRD-004 R-8 overstates that
  cost: the suite's newsletter presence assertions already sit behind a configuration flag that is
  off, so this replaces a dormant assertion and makes configured absence an asserted scenario for
  the first time.

Neutral, and relevant to whoever revisits this:

- Nothing is persisted, so there is no schema change, no migration, and no stored state to roll
  back. Reversal is a configuration removal or one manifest entry.
- No public HTTP API is added. The capability is reached through one internal service operation and
  one server action.
- Only `apps/storefront` and the shared packages change. The marketplace and payment applications,
  the commerce backend, and its schema are untouched.
- Whether Nimara ships a "subscription confirmed" page as the post-confirmation redirect target is
  deferred by RFC-0001 and gated before implementation is merged. PRD-004 Q-1 and Q-2 gate enabling
  the demo form, not this decision.

## Related Notes

[ADR MOC](ADR%20MOC.md)
[ADR-0004 Brevo Is The Reference Newsletter Provider Adapter](ADR-0004%20Brevo%20Is%20The%20Reference%20Newsletter%20Provider%20Adapter.md)
[ADR-0005 The Newsletter Subscribe Contract Is Provider-Neutral And Membership-Blind](ADR-0005%20The%20Newsletter%20Subscribe%20Contract%20Is%20Provider-Neutral%20And%20Membership-Blind.md)
[RFC-0001 Newsletter Subscription](../RFC/RFC-0001%20Newsletter%20Subscription.md)
[PRD-004 Newsletter Subscription](../../prd/PRD-004%20Newsletter%20Subscription.md)
