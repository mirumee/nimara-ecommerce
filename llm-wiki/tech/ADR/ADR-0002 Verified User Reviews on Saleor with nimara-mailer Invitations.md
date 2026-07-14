---
type: "ADR"
title: "Verified User Reviews on Saleor with nimara-mailer Invitations"
description: "Build verified-purchase reviews on Saleor as a swappable ReviewProvider — reviews stored as Saleor Pages, per-product aggregate as product attributes, privileged writes via an app-token Server Action, invitations sent by an extended nimara-mailer — Proposed."
tags:
  - "adr"
  - "reviews"
  - "saleor"
  - "mailer"
created: "2026-07-14T00:00:00+00:00"
timestamp: "2026-07-14T00:00:00+00:00"
status: "Proposed"
---

<!--
  DERBY-style design ADR. Self-contained: everything a reader needs — problem, chosen
  design, weighed alternatives and why they lost — is in this one file.
-->

## Recommendation

_Fill this section after the ADR is Final (status: `Accepted`)._

Implementation page: _link to the PR / task / implementation note, once it exists._

### Outcome

Briefly describe whether this was ever implemented and how it went.

## Problem

**Base system:** Nimara storefront (`apps/storefront`, Next.js App Router) on **Saleor** (v3.23.17) as the commerce backend and **system of record for review data**; email delivery through the already-installed **nimara-mailer** Saleor app. Reviews are added as a new swappable `reviews` capability, following the swappable-provider convention (`apps/docs/adr/0001-integration-provider-architecture.md`).

The storefront ships no real reviews — the product page renders a hardcoded placeholder ([product-reviews.tsx](../../../packages/features/src/product-detail-page/shared/components/product-reviews.tsx)) and there is no `reviews` capability in `infrastructure`. The [Verified User Reviews](../../product/epics/Epic%20User%20Reviews.md) epic wants a verified-purchase review system whose default is free and in-repo. Saleor has **no native review entity**, so the forced decision is *how review data maps onto Saleor primitives* and *how the invitation email is sent* without standing up new infrastructure.

## Requirements

### Functional requirements

1. **Verified-purchase submission** — 1–5 stars + comment, restricted to a customer whose fulfilled order contains the product; one review per product per order line.
2. **Product-page display** — average rating, review count, and a paginated review list; review structured data (schema markup).
3. **Catalog-surface aggregate** — average + count available on product cards and star-rating filtering across catalog surfaces (full-epic scope; MVP shows PDP only).
4. **Moderation modes** — auto-publish (default) and pre-moderation, switchable by configuration; every moderation action recorded in an audit trail.
5. **Invitation email** — sent a configurable delay (default 3 days) after fulfillment, via a customizable template; configurable submission window (default 30 days). The only notification in v1.
6. **Swappable contract** — all storefront review reads/writes go through a documented `ReviewProvider`; only the default module touches review storage.

### Non-functional requirements

These double as the **decision drivers** the alternatives are scored against; the dominant one breaks ties.

1. **No SaaS cost / in-repo — DOMINANT.** Zero per-store subscription; no new deployable datastore or service beyond what Nimara already runs.
2. **SSR performance on hot paths.** Review reads and the per-product aggregate must not add round-trips to the PDP or a PLP grid; paginated, SSR-safe.
3. **Swappable-provider & layer fit.** `domain` owns the types, `infrastructure` owns the Saleor integration, `apps/storefront` consumes a service; fallible ops return `Result<T, E>`; app/component code never imports `@nimara/codegen`.
4. **Data lifecycle / GDPR & audit.** Per-record deletion/anonymization on account deletion; moderation actions auditable.
5. **Security / authorization.** Review and aggregate writes are privileged Saleor mutations and must never be reachable with a customer token.

## Proposed solution

Reviews are a new swappable `reviews` capability with a single default provider, `saleor`. **Each review is a Saleor `Page`** of a dedicated `Review` `PageType`; **the per-product aggregate is stored as product attributes**; **privileged writes go through a storefront Server Action using a Saleor app token**; **invitations are sent by an extended nimara-mailer**.

### Data mapping (Saleor as system of record)

- **Review = `Page`** (`PageType` slug `review`):
  - `rating` → `NUMERIC` attribute (1–5), `moderation-status` → `DROPDOWN` attribute (`published` / `pending` / `reported`), `product` → `SINGLE_REFERENCE`→`PRODUCT` attribute, comment → `PLAIN_TEXT` attribute (or `content`), author display name + `orderLineId` provenance → private metadata.
  - Moderation: `isPublished` mirrors publish state; auto-publish creates the Page published, pre-moderation creates it unpublished. `pageBulkPublish` / `pageUnpublish` drive the queue; `pageDelete` satisfies GDPR erasure.
  - Reads: `pages(filter, where, sortBy, first, after)` gives native pagination and per-product filtering; `totalCount` gives the count.
- **Aggregate = product attributes** on the product type: `review-rating-avg` (`NUMERIC`) and `review-count` (`NUMERIC`), read with the product in the same query (zero extra round-trips, works on PDP and PLP) and usable as a native Saleor filter/sort for catalog surfaces. Recomputed on every publish/unpublish/delete by the same app-token path.
  - **Known trade-off:** a continuously-changing `review-rating-avg` creates `AttributeValue` churn and a `product_updated` reindex on each change. Mitigation (deferred to implementation): round the stored average to reduce distinct values.
- **Audit trail** = an ordered `reviews.audit` array in each review Page's **private metadata** (actor, action, timestamp).

### Interface / DTO sketch

```ts
// packages/domain/src/reviews/types.ts
export type ReviewStatus = "PUBLISHED" | "PENDING" | "REPORTED";

export interface Review {
  id: string;
  productId: string;
  orderLineId: string;              // verified-purchase provenance
  rating: 1 | 2 | 3 | 4 | 5;
  comment: string;
  authorName: string;
  status: ReviewStatus;
  createdAt: string;
  vendorId?: string;                // optional vendor-attribution — schema-only in v1
}

export interface ReviewAggregate { productId: string; average: number; count: number }

export interface ReviewProvider {
  getProductReviews(args: { productId: string; first?: number; after?: string; rating?: 1|2|3|4|5 }):
    Promise<Result<{ reviews: Review[]; pageInfo: PageInfo; aggregate: ReviewAggregate }, ReviewError>>;
  getAggregate(productId: string): Promise<Result<ReviewAggregate, ReviewError>>;
  // privileged — app token only, called from a Server Action after verification
  canReview(args: { accessToken: string; productId: string }):
    Promise<Result<{ eligible: boolean; orderLineId?: string }, ReviewError>>;
  submitReview(args: { accessToken: string; productId: string; orderLineId: string; rating: number; comment: string }):
    Promise<Result<Review, ReviewError>>;
  moderate(args: { reviewId: string; action: "PUBLISH" | "UNPUBLISH" | "REPORT" }):
    Promise<Result<Review, ReviewError>>;
}
```

### Write path (privileged)

`pageCreate` and product-attribute writes require `MANAGE_PAGES` / `MANAGE_PRODUCTS`, which a customer token does not hold. So: a storefront **Server Action** (1) resolves the customer via `getAccessToken()`, (2) verifies via Saleor that the customer has a **fulfilled order line** for the product and no existing review for that order line, then (3) uses a **Saleor app token (service account)** held server-side in `infrastructure` to `pageCreate` (published or pending per moderation mode) and recompute the product-attribute aggregate. The app token is never exposed to the client. All operations return `Result<T, E>`.

### Invitation email (extended nimara-mailer)

nimara-mailer owns the invitation end-to-end. Saleor's `ORDER_FULFILLED` webhook hits the mailer's **events-receiver**; the mailer schedules the multi-day delay natively in its AWS stack (SQS message delay maxes at 15 min, so the delay uses **EventBridge Scheduler one-time schedule** or a **Step Functions `wait`** — the exact mechanism is a deferred sub-decision) and, when due, renders a new **`review_invitation`** React Email template (`TEMPLATES_MAP` + `CUSTOM_EVENTS` entry) and sends it via its existing transport (`EMAIL_PROVIDER` = SES or Nodemailer/SMTP). The epic's "pluggable email-provider adapter" is realised as **the mailer's own `EMAIL_PROVIDER` configuration**, not a new adapter in this repo. The submission window (default 30 days) is enforced at submit time by the Server Action.

### Component changes

#### Existing components

- [packages/features/src/product-detail-page/shared/components/product-reviews.tsx](../../../packages/features/src/product-detail-page/shared/components/product-reviews.tsx) — replace the hardcoded array with data from `getReviewsService()`; keep it a Server Component, add pagination + aggregate + JSON-LD structured data.
- `packages/infrastructure/src/types.ts` — add `reviews` to the `CapabilityServices` map (the `ServiceRegistry` derives from it).
- `apps/storefront/src/services` + `registry.ts` (`LOADERS`) — add `getReviewsService()`; storefront needs no other change (env-driven selection).
- Saleor dashboard config (one-time): create the `review` `PageType` + attributes and the two product attributes; a service-account app with `MANAGE_PAGES` / `MANAGE_PRODUCTS`.

#### New components

- `packages/domain/src/reviews/` — `Review`, `ReviewAggregate`, `ReviewProvider`, `ReviewError` types (leaf layer).
- `packages/infrastructure/src/reviews/saleor/` — the default provider (GraphQL for `pages`/`pageCreate`/attribute writes, verification query, aggregate recompute), plus `manifest.ts`, `providers.ts`, and `index.ts` per the manifest/registry convention.
- `apps/storefront/src/…/_forms/actions.ts` — the `submitReview` Server Action (react-hook-form + Zod) returning a Result-like object.
- `apps/storefront/src/app/api/webhooks/review-moderation` (or reuse an existing webhook route) — recompute aggregate on publish/unpublish/report and `revalidateTag` the product.
- nimara-mailer (separate repo): `review_invitation` template + `CUSTOM_EVENTS`/`TEMPLATES_MAP` entries + delay scheduler.
- Standalone moderation/admin app — **out of MVP** (auto-publish only); a separate ADR before the full build.

### API changes

- New GraphQL operations in `packages/infrastructure/src/reviews/saleor/graphql/` (regenerate with `pnpm codegen`; never hand-write generated types): review list/aggregate queries, purchase-verification query, `pageCreate` / publish / attribute-update mutations.
- Services and the Server Action return `Result<T, E>`; the client renders field errors from it.

### Database changes

**No new database.** All state lives in Saleor: review Pages (`Review` `PageType`), product attributes (`review-rating-avg`, `review-count`), and per-review private metadata (author, `orderLineId`, `reviews.audit`). Dedupe of invitations is handled by nimara-mailer per fulfillment event (optionally an `reviews.invitedAt` order-metadata flag). All changes are additive/back-compatible — new Saleor config objects, no migration of existing data.

## Cross-cutting considerations

### Security

The Saleor app token (`MANAGE_PAGES` / `MANAGE_PRODUCTS`) lives only server-side in `infrastructure` and is used exclusively after the Server Action verifies identity and a fulfilled purchase — customers can never set `isPublished`, `rating`, or the aggregate directly. The nimara-mailer custom-event endpoint must authenticate its caller (shared secret / signature) so invitations can't be spoofed.

### Monitoring and alerting

Log submission attempts, verification rejections, and app-token mutation failures. Alert on aggregate-recompute failures (display/attribute drift) and on invitation send failures from the mailer. Pre-moderation needs **queue-size visibility** — alert when the pending queue grows unattended (an epic-flagged risk).

### Failure cases and remediation

- Saleor write fails after verification → Server Action returns `err(...)`, no partial Page; client retries.
- Aggregate recompute fails → review Page still correct (system of record); a reconcile job recomputes attributes from Pages.
- Mailer down / delay mechanism fails → invitation missed (recoverable — no data loss); dedupe prevents double-sends on retry.
- `AttributeValue` churn / reindex storm from avg updates → mitigated by rounding the stored average.

### Alternative solutions

- **Dedicated Nimara-owned Postgres store** (like the marketplace ledger) — most engine-agnostic, best aggregation.
  - Good, because native SQL aggregation and querying.
  - Bad, because new datastore, migrations, backups, on-call.
  - **Rejected because** it fails the dominant **no-cost / in-repo** driver — new operational burden before any pilot evidence exists.
- **Reviews as a blob in Product private metadata** — a JSON array per product.
  - Good, because zero new Saleor config.
  - Bad, because no server-side pagination/filtering, unqueryable moderation queue, concurrent-write clobber, metadata size limits.
  - **Rejected because** it fails **SSR performance** and moderation requirements — the display and queue cannot scale.
- **Aggregate in product metadata (or a bucket-attribute + metadata hybrid)** instead of product attributes.
  - Good, because no `AttributeValue` churn.
  - Bad, because metadata is not a native Saleor filter/sort axis, so catalog-surface star filtering must be built outside Saleor.
  - **Rejected because** the team chose native attribute filtering/sorting for catalog surfaces; the churn cost is accepted and mitigated by rounding.
- **Storefront Vercel Cron scan + a new in-repo pluggable email adapter** for invitations.
  - Good, because no dependency on the mailer's AWS stack.
  - Bad, because it duplicates scheduling and email logic Nimara already runs in nimara-mailer.
  - **Rejected because** it fails **no-cost / in-repo (reuse)** — it adds a scheduler and an email path instead of reusing the installed mailer.
- **Second (SaaS) ReviewProvider adapter in v1** to prove the contract empirically.
  - Good, because it validates the interface against a real second implementation.
  - Bad, because per-store SaaS cost and build time with no pilot evidence it is needed.
  - **Rejected because** it fails **no-cost / time-to-value** — the manifest/registry structure already proves swappability; the adapter is deferred.

### Dependencies

No new package dependency in this repo (all Saleor GraphQL via existing infrastructure clients). Work in nimara-mailer adds a React Email template and an AWS scheduling primitive (EventBridge Scheduler / Step Functions) — proposed and approved on the mailer side, not added automatically here. A one-time Saleor service-account app with `MANAGE_PAGES` / `MANAGE_PRODUCTS` is required.

### System Impacts

Saleor gains a `Review` `PageType`, review Pages, and two product attributes; product-update webhooks fire on aggregate changes (search reindex impact — see churn mitigation). nimara-mailer gains a custom event and template. Storefront PDP switches from placeholder to live data.

### Documentation Changes

Document the new env vars in `apps/storefront/.env.example` and `tech/nimara/Environment Variables.md`; document the `reviews` capability and the service-account/app-token setup; document the nimara-mailer `review_invitation` event/template and its scheduling.

### QA Validation

- Verified-purchase gate: non-buyer blocked; buyer of a fulfilled order can submit once per order line (Vitest on the Server Action + provider).
- Moderation modes: auto-publish shows immediately; pre-moderation holds until published.
- Aggregate correctness after publish/unpublish/delete; PDP pagination + structured data.
- E2E (Playwright): submit → display flow; invitation link → submission.

### DevOps / Infrastructure

Env schema (namespaced, Zod-validated per provider in `infrastructure`, wildcards passed through `turbo.json`):

- `REVIEWS_SERVICE` = `saleor` (capability selector).
- `REVIEWS_SALEOR_APP_TOKEN`, `REVIEWS_SALEOR_PAGE_TYPE_SLUG`, `REVIEWS_SALEOR_ATTR_*` (attribute slugs).
- `REVIEWS_MODERATION_MODE` (`auto` | `pre`), `REVIEWS_INVITATION_DELAY_DAYS` (default `3`), `REVIEWS_SUBMISSION_WINDOW_DAYS` (default `30`).
- nimara-mailer side: `SALEOR_EVENTS` (add `ORDER_FULFILLED`), `CUSTOM_EVENTS` (add `review_invitation`), `EMAIL_PROVIDER`, and the delay-scheduler config.

Saleor `ORDER_FULFILLED` webhook must target the mailer's events-receiver; the review-moderation webhook must target the storefront.

## Related Notes

[Verified User Reviews](../../product/epics/Epic%20User%20Reviews.md)
[Verified User Reviews — Solution Grilling Log](../../product/solution/Verified%20User%20Reviews/Solution%20Grilling%20Log.md)
[ADR MOC](../ADR%20MOC.md)
