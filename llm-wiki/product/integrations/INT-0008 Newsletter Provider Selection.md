---
type: "Integration Contract"
title: "Newsletter Provider Selection"
description: "Build-time contract for selecting and configuring the storefront newsletter subscription implementation."
tags:
  - "integration"
  - "storefront"
  - "newsletter"
  - "provider-selection"
created: "2026-08-20T00:00:00+00:00"
status: "candidate"
owner: "engineering"
availability:
  since: null
  deprecated_since: null
---

# Purpose

`NEWSLETTER_SERVICE` selects the storefront's newsletter subscription implementation at build time.
The only supported provider ID is `klaviyo`. The variable carries no default, because the commerce
backend has no newsletter capability. An absent value means no provider, and the storefront then
renders no subscribe section and accepts no submission. A selected provider whose namespaced
configuration is incomplete is treated the same way: the section is gated on the provider being
selected _and_ its configuration schema validating, so selection alone never puts a form on the page
that cannot succeed.

Provider manifests own their configuration schema, configuration mapping, and lazy factory. The
provider catalog, the allowed values of `NEWSLETTER_SERVICE`, and the integration preflight row are
derived from those manifests rather than from separate hand-maintained lists. A second provider is
one manifest entry and changes no caller.

# Authentication and permissions

- Selection and provider configuration are read on the server. No value reaches the client bundle.
- The `klaviyo` provider requires `NEWSLETTER_KLAVIYO_PRIVATE_API_KEY` and
  `NEWSLETTER_KLAVIYO_LIST_ID`.
- The private key needs the `lists:write`, `profiles:write`, and `subscriptions:write` scopes.
- The configured Klaviyo list must have double opt-in enabled. The preflight cannot verify that
  setting, so it is an adopter obligation.

# Events and operations

The contract states one operation: subscribe an email address. It answers the repository `Result`
type, so a caller cannot read a payload without handling failure. The success payload carries the
provider acknowledgement and nothing else, because Nimara holds no subscription state.

The `klaviyo` provider calls `POST https://a.klaviyo.com/api/profile-subscription-bulk-create-jobs`
with a dated API revision header. A `202 Accepted` response is the acknowledgement, and it is the
only success condition.

Nimara persists nothing. The provider is the system of record for the subscriber, the list, the
consent record, the confirmation message, and the unsubscribe link.

# Failure handling and idempotency

- The provider call has a 5-second timeout and performs no retry.
- A timeout answers a timeout error code. A timeout after the provider accepted the request still
  shows the shopper a failure, and the confirmation message can still arrive. This is deliberate:
  the design refuses to report a success that no provider acknowledged.
- A provider rejection answers a subscribe error code carrying the response status.
- An unselected provider answers a not-configured error code rather than a payload, so a submit
  path that skipped the selection check degrades to a refusal.
- A malformed address is refused before any provider call.
- A failure event records the provider, the response status, and the error code. It never records
  the submitted address.
- Submitting the same address again is safe. The subscribe endpoint removes `UNSUBSCRIBE`,
  `SPAM_REPORT`, and `USER_SUPPRESSED` suppressions from the submitted profile, so a resubscribe
  undoes an earlier unsubscribe on the merchant's list.

# Limitations

- Selection offers no runtime failover. A change requires a new build.
- The submit path is public, unauthenticated, and carries no rate limit. See
  [ADR-0004](../../tech/ADR/ADR-0004%20Newsletter%20Capture%20Is%20A%20Selectable%20Provider%20Capability.md).
- The preflight reports the selection and the presence of the provider keys. It cannot report
  whether the Klaviyo list has double opt-in enabled.
- Klaviyo publishes a burst limit of 75 requests per second and a steady limit of 750 requests per
  minute on this endpoint. A single storefront form does not approach either.
