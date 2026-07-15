---
type: "Product Requirements Document"
title: "Verified User Reviews"
description: "Product Requirements Document for a verified-purchase user reviews system in Nimara."
tags:
  - "prd"
  - "reviews"
  - "customer"
  - "conversion"
created: "2026-07-09T00:00:00+00:00"
timestamp: "2026-07-15T11:10:59+02:00"
status: "analyzing"
owner: "Michał Ociepka"
prd_type: "business"
knowledge_status: "mixed"
implementation_status: "partial"
direction_status: "planned"
verified_at: "2026-07-15T09:50:07+00:00"
code_branch: "main"
code_commit: "e32732ea85f7e6cfb807b462c7bbc47e6f569603"
scope_paths:
  - "packages/features/src/product-detail-page/shared/components/product-reviews.tsx"
  - "packages/features/src/product-detail-page/shop-custom-pdp/custom.tsx"
---

> **Evidence status:** this PRD is directional and the verified-review capability is planned.
> `main` contains only a hard-coded, delayed review placeholder in one custom PDP variant, not
> the verified-purchase system specified below.

## Value Statement

**For** [Customer](../personas/Customer.md)
**who** lack the social proof shoppers expect — no ratings on product pages costs conversion, organic visibility, and catalog quality feedback
**the** Verified User Reviews capability
**is a** built-in verified-purchase review system
**that** publishes trustworthy reviews from confirmed buyers
**unlike** SaaS review services (Yotpo, Judge.me, Trustpilot) that cost a per-store subscription and integration work, or shipping no reviews at all
**our solution** is free, in-repo, engine-agnostic, and swappable

## Business Outcomes

- No cost for SaaS solutions,

## Current Implementation Evidence

The custom PDP renders eight hard-coded example reviews after an artificial two-second delay.
There is no observed provider, storage, verified-purchase submission, invitation, aggregation,
moderation, reporting, or administration implementation. See
[Product Reviews](../../system/capabilities/Product%20Reviews.md).
Current product direction is `planned`, not active or delivered.

## MVP

The core loop only, in a pilot store: review invitation email after configurable delay from fulfillment (default 3 days), submission (1–5 stars + comment) restricted to customers whose fulfilled order contains the product, one review per product per order, configurable submission window (default 30 days), auto-publish mode only, product page showing average rating, review count, and paginated review list, plus review structured data.

Deliberately excluded from MVP: standalone admin app, pre-moderation mode, reporting flow, bulk actions, rating on product cards, star-rating filtering, vendor-attribution schema.

Buys: evidence that invited verified buyers actually submit reviews (volume) and that displayed reviews move conversion (value) — before funding the moderation tooling and admin-app build.

## Nonfunctional Requirements (NFRs)

- All storefront review reads/writes go through the documented ReviewProvider interface; only the default module touches review storage.
- Review display must not degrade product-page load (paginated, SSR-safe in Next.js App Router).
- Every moderation action recorded in an audit trail.
- GDPR: review handling on customer account deletion (anonymize vs. delete) resolved before GA.
- Enable/disable and all settings (moderation mode, invitation delay, review window) configurable via environment/code and documented; invitation email template customizable; email sent through pluggable email-provider adapter.

## Constraints, Dependencies & Risks

- Standalone admin app: seed of a general Nimara operator console or reviews-only tool? **Decided before implementation of the full build starts**, not implicitly by the first commit.
- Invitation timing depends on stores reliably marking orders fulfilled; sloppy fulfillment data distorts invitation delays and windows. Fulfillment + delay is the deliberate delivery proxy — carrier tracking integrations are out.
- Pre-moderation stores that never staff the queue silently kill the feature — needs queue-size visibility (open: what alerting).
- Auto-publish default means occasional bad review is public before an admin reacts — recoverable via report/unpublish; stores must know the switch exists.
- Low review volume risk: single invitation email, no reminders or incentives in v1.
- Open: should v1 ship a second ReviewProvider adapter (SaaS service) to prove the contract, or is interface + default module enough?
- Open: photo fast-follow — target release, storage-provider abstraction, image moderation approach.

## In Scope

- ReviewProvider interface: all review reads/writes through a documented, swappable provider contract
- Default implementation: Nimara-owned reviews module with its own storage — engine-agnostic, supporting moderation queues, filtering, rating aggregation
- Verified-purchase submission: 1–5 stars + comment, fulfilled-order buyers only, one review per product per order
- Review invitation email after configurable delay (default 3 days) via pluggable email-provider adapter; configurable submission window (default 30 days) — the only notification in v1
- Both moderation modes: auto-publish with post-moderation (default) and pre-moderation, switchable by configuration
- Standalone admin app: pending/reported queue, approve/reject/unpublish, filter by rating and product, bulk actions
- Reporting a published review returns it to the moderation queue
- Product page: average rating, review count, paginated list, star-rating filtering; rating + count on product cards across catalog surfaces
- Vendor-attributable schema: optional seller/vendor reference on reviews, per-vendor aggregates — no marketplace UX, no future schema migration
- Review structured data (schema markup) for SEO
- Audit trail of moderation actions
- Documented environment/code configuration

## Out of Scope

- Photo attachments (deliberate fast-follow: removes upload pipeline, object storage, image compression/moderation, GDPR surface from v1)
- Reminder emails and moderation-outcome notifications (fast-follow)
- Automated content screening (profanity, spam)
- Marketplace UX: per-vendor rating display, vendor dashboards, vendor replies (schema readiness only)
- Merchant public replies to reviews
- Review import/syndication (Google, Trustpilot)
- Review incentives or rewards
- Carrier-confirmed delivery as verification trigger
