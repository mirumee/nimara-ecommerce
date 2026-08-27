---
type: "Map of Content"
title: "ADR MOC"
description: "Map of Content for architecture decision records (ADRs) — the chronological register of significant technical decisions and their rationale."
tags:
  - "adr"
  - "moc"
created: "2026-07-08T00:00:00+00:00"
---

## Content

Architecture Decision Records capture **why** the system looks the way it does. Each ADR
is one standalone note following the [Michael Nygard template](https://github.com/architecture-decision-record/architecture-decision-record/tree/main/locales/en/templates/decision-record-template-by-michael-nygard):
**Status → Context → Decision → Consequences** (see `_templates/ADR.md`).

**Conventions**

- **One decision per note.** File name is `ADR-NNNN <Title>` (zero-padded, monotonically
  increasing, never reused) — e.g. `ADR-0001 Use RAG over fine-tuning`.
- **ADRs are immutable once `accepted`.** Don't rewrite a decision — supersede it: create a
  new ADR, set the old one's `status` to `superseded`, and link the new ADR in
  `superseded_by`.
- Register every new ADR in the register below in the same change.

## Register

<!-- Newest last. Format: - ADR-NNNN Title - Status - one-line summary -->

- [ADR-0001 Vouchers Are Disabled In Marketplace Checkout](ADR-0001%20Vouchers%20Are%20Disabled%20In%20Marketplace%20Checkout.md) - proposed - Promo codes are hidden in the storefront checkout when marketplace mode is enabled, because a per-vendor checkout split cannot express a cart-wide Saleor voucher.
- [ADR-0002 Payment Application Configuration Storage Is Selectable](ADR-0002%20Payment%20Application%20Configuration%20Storage%20Is%20Selectable.md) - proposed - Storage sits behind one read/write seam and is chosen by configuration: a deployment keeps the hosted store, a developer machine may keep an on-disk file holding tokens and provider keys in readable text.
- [ADR-0003 CodeceptJS Is The End-To-End Test Engine](ADR-0003%20CodeceptJS%20Is%20The%20End-To-End%20Test%20Engine.md) - accepted - CodeceptJS becomes the only end-to-end engine, the Playwright runner is removed while its library stays as the browser driver, and the Playwright coverage is deleted rather than ported.
- [ADR-0004 Vendor Warehouses Are Platform-Provisioned And Vendor-Scoped](ADR-0004%20Vendor%20Warehouses%20Are%20Platform-Provisioned%20And%20Vendor-Scoped.md) - proposed - The platform provisions one Saleor warehouse per vendor with the app token, `vendor.id` metadata joins it to its owner, and the vendor panel stays read-only on warehouses.

## Related Notes

[Product Strategy 2026 (MOC)](../../market/strategy/Product%20Strategy%202026%20%28MOC%29.md)
