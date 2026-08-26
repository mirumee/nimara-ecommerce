---
type: "Product Capability"
title: "Storefront Newsletter Subscription"
description: "The storefront home page collects an email address and delivers it to the configured email provider, and renders nothing when no provider is configured."
tags:
  - "capability"
  - "storefront"
  - "newsletter"
  - "provider-selection"
created: "2026-08-20T00:00:00+00:00"
relations:
  integrations:
    - "[Newsletter Provider Selection](../integrations/INT-0008%20Newsletter%20Provider%20Selection.md)"
status: "candidate"
owner: "engineering"
availability:
  since: null
  deprecated_since: null
---

# Behavior

The storefront home page shows a newsletter subscribe section when a newsletter provider is
configured. The shopper reads the purpose of the subscription, reaches the privacy policy, submits
an email address, and learns whether the provider accepted it.

A deployment with no configured provider renders no subscribe section and accepts no submission.
A provider selected without its required configuration counts as no configured provider.
Configuration is therefore the on switch and the kill switch. There is no feature flag.

Success runs on the provider acknowledgement only. Every other outcome, including a timeout, shows
a failure message. The capability cannot report a success that no provider acknowledged.

Nimara stores no subscriber. The provider owns the subscriber, the list, the confirmation message,
the consent record, and the unsubscribe link.

# Actors

- **Shopper** — submits an email address on the home page and receives the provider's confirmation
  message.
- **Adopter or operator** — selects the provider and supplies its credentials through configuration
  only, with no application code change, and verifies the result with the integration preflight.

# Inputs and outputs

- Input: one email address. No other field is collected.
- Output to the shopper: a success message after the provider acknowledgement, or a failure message.
- Output to the provider: the address, added to the configured list.
- Output to the operator: a preflight row naming the selected provider and any missing keys, and a
  logged event on every failure.

# Constraints and failure behavior

- Data minimisation. The address is the only field collected. No layer of Nimara stores it, and no
  log entry contains it.
- An invalid address fails in the form and reaches no provider.
- A submission posted by a client that was rendered before the configuration changed is refused.
- A deployment that selects a provider without its required configuration is treated as having no
  provider: the section is not rendered, and a submission posted anyway is refused with a
  not-configured error and logged as a critical event naming the missing values. A shopper never
  meets a form that cannot succeed.
- The provider credential stays server-side and never reaches the client bundle.
- An unconfigured deployment constructs no provider and performs no network call.
- The submit path is public and unauthenticated, and carries no rate limit by decision. Provider
  double opt-in means that a fake address receives no mail, so the accepted cost is request volume
  against the merchant's provider account. See
  [ADR-0004](../../tech/ADR/ADR-0004%20Newsletter%20Capture%20Is%20A%20Selectable%20Provider%20Capability.md).
- The provider is selected at build time, so a change requires a new build.
