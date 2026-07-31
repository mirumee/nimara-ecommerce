---
type: "Architecture Decision Record"
title: "Vouchers Are Disabled In Marketplace Checkout"
description: "Promo codes are hidden in the storefront checkout when marketplace mode is enabled, because a per-vendor checkout split cannot express a cart-wide Saleor voucher."
tags:
  - "adr"
  - "marketplace"
  - "checkout"
  - "discounts"
  - "saleor"
created: "2026-07-31T00:00:00+00:00"
timestamp: "2026-07-31T00:00:00+00:00"
id: "ADR-0001"
status: "proposed"
owner: "product-and-engineering"
superseded_by: null
---

## Context

In marketplace mode the storefront keeps one Saleor checkout per vendor. The checkout cookie
maps `vendorKey` to `checkoutId`, add-to-bag buckets by the product metafield `vendor.id`, and
payment confirmation converts every vendor checkout into its own order. A cart spanning N
vendors is therefore N checkouts and N orders, and the object the shopper calls "the cart" does
not exist in Saleor.

A Saleor voucher is an attribute of a single checkout: `Checkout.voucherCode` is a scalar, so a
second code replaces the first. Four properties of that model conflict with a cart-wide code:

- The discount is derived from the lines and subtotal of the checkout the code sits on. There is
  no aggregate for Saleor to compute a cart-level discount from.
- Thresholds measure one checkout. `minSpent` is that checkout's minimum subtotal and
  `minCheckoutItemsQuantity` behaves the same way, so a 120 GBP cart split 60/60 fails a 100 GBP
  threshold in both halves. `applyOncePerOrder` fires once per vendor rather than once per cart,
  and a `SHIPPING` voucher becomes free shipping N times.
- Voucher usage is counted when an order is created, not when a code is applied. Applying one
  code to every vendor checkout therefore succeeds, payment is captured for all of them, and only
  then does order creation fail for the checkouts beyond the usage limit — permanently, leaving a
  paid checkout with no order. Which vendor fails is non-deterministic because the order-creation
  calls race for the same counter.
- Fixed-amount codes multiply: 10 GBP off applied to four checkouts is 40 GBP of discount.
  Percentage codes happen to total correctly but remain subject to the three points above.

The behaviour before this decision was not dangerous, because exactly one code could ever be
applied. It was misleading: the code always landed on the first vendor bucket, so the discount
reduced a single vendor's subtotal while the summary presented it as a cart-wide "Discount" row,
and which vendor received it depended on whose product entered the cart first. That
misattribution was reported as NIM-34, where the missing remove control on the demo store turned
out to be the aggregate reporting no voucher code at all.

Saleor also has no vendor dimension for discounts. Vouchers are scoped to channels and can be
narrowed only to products, variants, categories, or collections, while a Nimara vendor is a
Saleor `Page` referenced from product metadata. Managing vouchers or promotions requires the
global `MANAGE_DISCOUNTS` permission, which cannot be scoped per vendor.

## Decision

We will hide the promo-code control in the storefront checkout whenever
`NEXT_PUBLIC_MARKETPLACE_ENABLED` is true, and leave it fully functional when marketplace mode is
off. No cart-wide or per-vendor voucher behaviour is introduced.

We will keep the aggregate checkout reporting the voucher code held by whichever vendor checkout
carries one, because GA4 purchase tracking reads that aggregate on the payment confirmation page
and would otherwise drop the `coupon` field while a discount was applied.

This decision is deliberately reversible and does not choose a discount model. Re-enabling
requires first answering who issues discount codes — the platform or the vendors — because that
answer determines the architecture, not the reverse.

## Consequences

Easier or safer:

- The checkout no longer presents a single vendor's discount as a cart-wide one, and no arbitrary
  vendor is selected to absorb a discount based on cart insertion order.
- The post-payment failure mode above becomes unreachable through the UI, since no code can be
  applied to any marketplace checkout.
- Standard, non-marketplace deployments are unaffected and keep a working discount code. This is
  the default configuration in `apps/storefront/.env.example`.

Harder or lost:

- Marketplace deployments lose discount codes entirely, including the demo store, which runs with
  marketplace mode enabled. NIM-34 is therefore resolved on the demo by removing the control
  rather than by fixing it.
- A marketplace checkout that already carries a voucher, from legacy state or from a direct API
  call, still shows its `Discount` row because the price reduction is real, but offers no UI path
  to remove it. Hiding a genuine price reduction was judged worse than this gap.
- Any future discount work carries the unanswered settlement question: whether a discount is
  funded by the vendor or the platform drives the ledger, commission calculation, and Stripe
  Connect payouts in `apps/marketplace`.

Neutral, and relevant to whoever revisits this:

- The vendor-issued route matches Saleor natively and has groundwork in place: vendor sign-up
  already creates a per-vendor collection carrying `vendor.id` and `vendor.default_collection`
  metadata, and the vendor product form pre-selects it. Collection membership is only a form
  default, so it would need server-side enforcement before a collection-scoped voucher or
  promotion could be trusted — a product whose metafield names a vendor but which is absent from
  that vendor's collection would be in the vendor's checkout yet skipped by the discount.
- The platform-issued route requires either one checkout per cart, which costs per-vendor
  shipping because Saleor allows one delivery method per checkout and moves the vendor order split
  out of Saleor, or a discount applied at the payment layer with vendors reimbursed in settlement,
  which means reimplementing code redemption, usage limits, per-customer limits, and date windows.
- Independently of this decision, a voucher can exhaust its usage limit between checkout and order
  creation because another shopper consumed it, producing the same post-payment failure with a
  single vendor. That is a payment-path resilience concern, not a marketplace one.

Implemented on branch `NIM-34-voucher-cant-be-deleted-in-checkout` in commits
`445fbf993b29d90cd87f9e66b5b56a66e4b6f897` and
`76e367e4a26e17c7a2e8270cab34a30a6701ea22`, touching
`apps/storefront/src/app/[locale]/(checkout)/checkout/page.tsx` and
`apps/storefront/src/features/checkout/aggregations.ts`. Tracked as NIM-52, with NIM-34 as the
originating defect. No automated test covers the change.

## Related Notes

[ADR MOC](ADR%20MOC.md)
[CAP-0003 Guided Storefront Checkout](../../product/capabilities/CAP-0003%20Guided%20Storefront%20Checkout.md)
[FLOW-0004 Marketplace Checkout to Vendor Orders](../../product/flows/FLOW-0004%20Marketplace%20Checkout%20to%20Vendor%20Orders.md)
[OPS-0005 Marketplace Payment Completion Incident Response](../../operations/OPS-0005%20Marketplace%20Payment%20Completion%20Incident%20Response.md)
[Checkout & Payments](../saleor/Checkout%20%26%20Payments.md)
