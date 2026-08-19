---
type: "Implementation Record"
title: "Saleor Stored Payment Methods"
description: "Moves saved payment methods onto Saleor's stored payment methods protocol, behind a provider-neutral payment service, with the gateway key and customer mapping owned by the payment application."
tags:
  - "implementation"
  - "payments"
  - "stripe"
  - "stored-payment-methods"
created: "2026-07-30T00:00:00+00:00"
status: "in_progress"
owner: "engineering"
work_item:
  id: "736"
  url: "https://github.com/mirumee/nimara-ecommerce/pull/736"
relations:
  prds: []
  rfcs: []
  adrs: []
  product_records:
    - "[Stripe Payment Application](../../product/integrations/INT-0005%20Stripe%20Payment%20Application.md)"
    - "[Customer Account Self-Service](../../product/capabilities/CAP-0007%20Customer%20Account%20Self-Service.md)"
    - "[Cart to Confirmed Order](../../product/flows/FLOW-0001%20Cart%20to%20Confirmed%20Order.md)"
    - "[Stripe Payment Application Installation and Key Rotation](../../operations/OPS-0002%20Stripe%20Payment%20Application%20Installation%20and%20Key%20Rotation.md)"
  rolled_back_by: null
pull_requests:
  - "https://github.com/mirumee/nimara-ecommerce/pull/736"
verification:
  - criterion: "A stored method is mapped to the right gateway customer and cannot be reached by another shopper."
    tests:
      - "apps/stripe/src/infrastructure/customer/saleor/get-customer-id.test.ts"
      - "apps/stripe/src/apps/handler/api/rest/saleor/webhooks/transactions.test.ts"
  - criterion: "Only methods carrying an explicit redisplay consent are listed; unknown types stay listable so they remain deletable."
    tests:
      - "apps/stripe/src/infrastructure/payment-method/stripe/serializers.test.ts"
rollout: "Merged with the payment application redeployed first, because the storefront reads the gateway key from the session the application opens. Installing the application requires the user-management permission, so the Saleor installation is re-approved before the storefront ships."
rollback: "Restore the previous Vercel deployment for both surfaces and revert the change; see [Stripe Payment Application Installation and Key Rotation](../../operations/OPS-0002%20Stripe%20Payment%20Application%20Installation%20and%20Key%20Rotation.md). Saved methods created under this change stay attached to their gateway customer and reappear when it is rolled forward again."
---

# Implementation summary

Saved payment methods now run over Saleor's stored payment methods protocol. The payment
application answers `LIST_STORED_PAYMENT_METHODS`, `STORED_PAYMENT_METHOD_DELETE_REQUESTED`, and
the tokenization-session events, and it owns both the gateway customer mapping and the gateway
key. The storefront reaches all of it through one provider-neutral service contract.

The contract is a generic parameterized by a provider fill-in: a provider supplies its element,
gateway handle, gateway configuration, and its two session payloads, and every operation is
expressed against those. Nothing above the provider directory names a payment vendor, so a second
gateway is a new implementation of the same contract rather than a change in feature or route
code. Two files select the gateway: the service factory and the element components.

Three consequences of that arrangement are load-bearing:

- The storefront holds no gateway key. The application reports the publishable key for the
  channel with each session it opens, so per-channel gateway accounts work without rebuilding
  the storefront.
- The customer mapping lives in private metadata only. Saleor lets a shopper write their own
  public metadata, so the previous public-metadata mapping was shopper-controlled.
- A stored method is listed only when consent to redisplay it was captured as it was saved.

# Deviations

- No ADR was filed for the move onto the stored payment methods protocol, by request. The
  current-state records describe the resulting contract; the rationale and the rejected
  alternatives have no durable home.
- The record stays `in_progress` after merge because browser verification of the checkout and
  account surfaces is still incomplete, not because evidence is missing: the work landed as
  [PR 736](https://github.com/mirumee/nimara-ecommerce/pull/736), squash-merged to `main` as
  `f346b80465337bb5f7c5e900eb93748991dc9506`.
- There is no migration for customers of the storefront-owned integration that preceded this
  work. A carried-over shopper is issued a new gateway customer and re-enters a card once.

# Verification evidence

Unit coverage exists for the two rules that decide whether a shopper sees someone else's method
or loses their own: gateway-customer resolution and redisplay-consent filtering. Both run in
`pnpm test`.

Browser verification of the checkout and account surfaces is incomplete at this commit. The
defects found and fixed after it — saved-card submission, channel-scoped listing, locale-prefix
loss, and the billing-address guard — are not yet re-exercised end to end, and the `channel-uk`
test fixtures are out of stock, which blocks a full checkout run.

# Related Notes

[Implementation (MOC)](Implementation%20%28MOC%29.md)
[Stripe Payment Application](../../product/integrations/INT-0005%20Stripe%20Payment%20Application.md)
[Customer Account Self-Service](../../product/capabilities/CAP-0007%20Customer%20Account%20Self-Service.md)
[Cart to Confirmed Order](../../product/flows/FLOW-0001%20Cart%20to%20Confirmed%20Order.md)
