---
type: "Product Capability"
title: "Storefront Newsletter Subscription"
description: "The storefront can capture consented newsletter subscribers into a deployment's own email service provider, and is absent where no provider is configured."
tags:
  - "capability"
  - "storefront"
  - "newsletter"
  - "email-marketing"
  - "consent"
  - "integrations"
created: "2026-08-18T00:00:00+00:00"
status: "candidate"
owner: "engineering"
relations:
  integrations:
    - "[Newsletter Provider Selection](../integrations/INT-0008%20Newsletter%20Provider%20Selection.md)"
availability:
  since: null
  deprecated_since: null
---

# Behavior

The storefront home page renders a newsletter form when, and only when, the deployment has selected
an email service provider. The selector has no default, so an unconfigured deployment renders no
form, and nothing else about the page's behavior, layout or performance changes. Absence is decided
once on the server from configuration alone; the client never learns whether a provider exists, and
no provider round-trip happens while the page renders.

Submitting requires an explicit consent action alongside the name and address. The server
re-validates the submission, stamps the moment of consent and the absolute URL of the privacy policy
the shopper was shown, and hands all of it to the selected provider. The provider sends the
confirmation email, adds the contact to the configured lists only once the shopper confirms, holds
the consent record, and performs unsubscribe in its own campaign footer.

The shopper is told a confirmation step follows only for a submission the provider accepted.
Otherwise they get a failure they can act on: check the address, try again shortly, or subscriptions
are temporarily unavailable. No submission is silently discarded and no failure is presented as a
success.

Nimara persists no subscriber data anywhere — not in a store, a queue, a log line, or a captured
exception. The deployment is the data controller and the provider its processor. Where sample or
credential-free operation is wanted, a built-in provider satisfies the same path with no outbound
call.

# Actors

- Storefront operators configure a provider, own the account and its plan, and read subscribers in
  the provider's own dashboard.
- Storefront developers add or replace a provider adapter without changing the form, its validation,
  its translations, or its outcome states.
- Shoppers give consent, submit an address, and confirm from the provider's email.

# Inputs and outputs

- `NEWSLETTER_SERVICE` selects the provider and, when unset, turns the capability off.
- Provider-specific, server-side environment values supply credentials, list and template
  identifiers, the post-confirmation redirect, and the request timeout for the selected
  implementation only.
- A submission carries a name, an email address, and an explicit consent action; the server adds the
  consent timestamp, the privacy-policy URL, and the shopper's locale.
- The capability produces either a status stating that a provider-side confirmation follows, or a
  typed failure the storefront renders as an actionable message.
- The preflight produces a per-capability report naming the effective provider, or an explicit line
  when none is configured, plus any missing or invalid configuration keys.

# Constraints and failure behavior

- Provider selection is build-time configuration; enabling, disabling or changing it requires a
  rebuild and redeploy rather than a runtime toggle.
- A submission without consent never leaves the storefront. The check sits in front of every
  adapter, because the form's own validation is a courtesy and the underlying action is reachable
  directly with no session.
- With no provider configured, a direct invocation of that action returns an error rather than a
  fabricated success, so the render gate and the unconfigured service cannot disagree in the
  shopper's favour.
- The response never varies with list membership: an address already subscribed resolves to the same
  success as a new one, and failures stay membership-blind, so the public form is not a membership
  oracle.
- The outbound call has an explicit timeout and no retry. A timed-out request may already have sent
  a confirmation email, so the shopper's own resubmission is the retry — safe because duplicates
  succeed.
- Confirmation, unsubscribe, preference management, campaign composition and segmentation belong to
  the provider. The capability has no admin view, subscriber export, or per-vendor list.
- Two provider-side prerequisites fail quietly and are the operator's to satisfy: custom contact
  attributes must exist in the provider account before they accept consent values, and the
  post-confirmation redirect must point at a page the deployment owns, since none ships with the
  storefront.
- Abuse protection is deployment-specific and is not part of the capability. Every submission passes
  through one server-side choke point where a rate limit, challenge or edge rule attaches.
