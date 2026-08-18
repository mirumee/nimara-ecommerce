---
type: "Architecture Decision Record"
title: "The Newsletter Subscribe Contract Is Provider-Neutral And Membership-Blind"
description: "No provider-shaped parameter crosses the newsletter subscribe boundary, and the response never varies with list membership, so the storefront cannot become a subscription oracle."
tags:
  - "adr"
  - "newsletter"
  - "storefront"
  - "api-contract"
  - "privacy"
  - "consent"
created: "2026-08-18T00:00:00+00:00"
status: "proposed"
owner: "engineering"
superseded_by: null
---

## Context

One operation crosses the newsletter provider boundary. Two properties of it decide whether the
capability's promises hold, and both invite a well-meant later change that would quietly remove
them.

The first concerns parameters. Providers disagree about list membership, how confirmation is
triggered, and where consent data can be attached. A "which list?" argument reads as flexibility,
and the request for one is easy to justify. But every caller that passes a list identifier holds
provider knowledge, and per-vendor lists are out of scope in
[PRD-004](../../prd/PRD-004%20Newsletter%20Subscription.md) — no marketplace home variant renders
the form, so the question has no surface today.

The second concerns the response. The form is public and the server action is reachable directly,
with no session. Providers distinguish a newly created contact from one already present, and an
operator can reasonably ask to see that distinction in the storefront. Surfacing it would let anyone
test an arbitrary address against the operator's list.

Both properties are cheap to hold now and expensive to restore later: a caller that has learned to
pass a list identifier cannot be made to forget it without changing every call site, and a response
that has distinguished duplicates cannot stop doing so without breaking whatever came to depend on
it.

## Decision

We will fix two properties of the subscribe contract.

**No provider-shaped parameter crosses the boundary.** The operation carries the address, an
optional name, the shopper's locale, and consent expressed as data — the moment consent was granted
and the absolute URL of the privacy policy the shopper was shown. List identifiers, template
identifiers and redirect URLs are configuration of the selected adapter, never arguments. Locale
crosses deliberately: the confirmation email is the provider's, and locale is the only way an
adapter can select the right template for the shopper.

**The response never varies with list membership.** The adapter collapses "accepted" and "already
present" into the same success, and the failure classes stay membership-blind.

The operation returns `Result`: on success a status the caller renders, whose first value states
that a confirmation step follows; on failure a non-empty array of typed errors. The error codes
distinguish at least two classes — the provider rejected this address, and the provider was
unreachable, slow, or out of quota — because one opaque code cannot produce both "check the address
you typed" and "try again shortly".

A response that reveals whether an address is already on the list is a defect, not a trade-off, and
so is an address written to any Nimara-side store, including a log line, a captured exception, or a
provider response body echoed into either.

This is the verdict [RFC-0001](../RFC/RFC-0001%20Newsletter%20Subscription.md) asks for on the two
contract properties most expensive to change later.

## Consequences

Easier or safer:

- The call site holds no provider knowledge, so replacing the adapter is one manifest entry and the
  form, validation, translations and outcome states are unchanged. This is what makes the
  provider-swap promise real rather than nominal, and what keeps the reference-adapter choice in
  [ADR-0004](ADR-0004%20Brevo%20Is%20The%20Reference%20Newsletter%20Provider%20Adapter.md) cheap to
  revisit.
- The storefront cannot be used as a membership oracle. Someone holding a list of addresses learns
  nothing about which of them are subscribed to the operator's list.
- Duplicates resolving to success is what makes the shopper's own resubmission a safe retry, and
  that is what lets the design carry no automatic retry at all. A timed-out request is ambiguous —
  the provider may have accepted it and already sent the confirmation email — so an automatic retry
  would re-send that email.

Harder or lost:

- The operator cannot see from the storefront whether a submission was new or a duplicate. That
  distinction lives in the provider's own dashboard, where new and existing contacts stay
  distinguished.
- A future per-vendor or per-placement list requirement cannot be met by adding an argument. It
  needs its own decision, which either introduces a selector per placement or supersedes the first
  property outright.
- Membership-blindness is invisible in code review. Collapsing the two provider outcomes into one
  success looks like a missing branch, and a contributor can "fix" it into an oracle without
  noticing what was removed. Nothing in the type system prevents that.

Neutral, and relevant to whoever revisits this:

- Collapsing duplicates does not weaken the delivery-honesty guarantee. A duplicate is neither a
  discarded submission nor a failure presented as success: the address is on the operator's list,
  which is the outcome the shopper asked for.
- Consent as data rather than a boolean means the provider holds what was agreed and when. PRD-004
  excludes consent record-keeping inside Nimara, so there is nowhere else for that record to live.
- Consent is enforced on the server. The action re-validates the submission before any outbound
  call; the client-side resolver is a courtesy, because the server action is a public endpoint.
- Abuse protection attaches at the server-side choke point every submission passes through. It stays
  out of this contract and out of the adapters, because the right mechanism is deployment-specific
  and an adapter-level implementation would have to be rebuilt per provider.

## Related Notes

[ADR MOC](ADR%20MOC.md)
[ADR-0003 Newsletter Subscription Is Configuration-Gated With No Default Provider](ADR-0003%20Newsletter%20Subscription%20Is%20Configuration-Gated%20With%20No%20Default%20Provider.md)
[ADR-0004 Brevo Is The Reference Newsletter Provider Adapter](ADR-0004%20Brevo%20Is%20The%20Reference%20Newsletter%20Provider%20Adapter.md)
[RFC-0001 Newsletter Subscription](../RFC/RFC-0001%20Newsletter%20Subscription.md)
[PRD-004 Newsletter Subscription](../../prd/PRD-004%20Newsletter%20Subscription.md)
