---
type: "ADR"
title: "Default ReviewProvider Stores Reviews as Saleor Models"
description: "The default reviews provider persists verified reviews as Saleor Models (Page/PageType) with Saleor as the system of record — Proposed."
tags:
  - "adr"
  - "reviews"
  - "saleor"
created: "2026-07-13T00:00:00+00:00"
timestamp: "2026-07-13T00:00:00+00:00"
status: "Proposed"
adr_format: "MADR-legacy"
---

<!--
  Legacy MADR-style ADR — predates the DERBY-style template. Kept verbatim as a legacy record
  and linted against the MADR ruleset (`adr_format: "MADR-legacy"`). New ADRs use the
  DERBY structure in `_templates/ADR.md`.
-->


## Context and Problem Statement

**Base system:** Saleor commerce backend + the Next.js storefront (`apps/storefront`).
Reviews are introduced as a new swappable `reviews` capability behind the existing
manifest/registry provider convention (reviews are explicitly reserved as a future
capability in the code-docs ADR `apps/docs/adr/0001-integration-provider-architecture.md`).

The [Verified User Reviews epic](product/epics/Epic%20User%20Reviews.md) requires a
default, in-repo `ReviewProvider` with its own storage. Saleor has **no native review
entity**, so this decision must pick where the default provider's review data lives and
what the authoritative system of record is. This ADR settles only the storage/system-of-record
choice for the default provider; the swappable contract itself is assumed from the code-docs
provider ADR.

## Decision Drivers

- **Query capability for moderation + aggregation** — moderation queues, filter-by-rating,
  one-review-per-product-per-order enforcement, and per-product average/count are the hard
  part; this is the **dominant** driver and breaks ties.
- **Product-page read performance** — average rating, count, and paginated list render on
  the SSR hot path; reads must be fast and cacheable.
- **Operational burden before evidence exists** — the MVP is a pilot to prove buyers submit
  and reviews move conversion; avoid standing up new infra prematurely.
- **No SaaS fee / no vendor lock-in** — the epic's value proposition is free and in-repo;
  a paid review SaaS is out.
- **Fit with Nimara layers + swappable-provider convention + `Result<T, E>`** — reviews must
  be a capability provider, not a bespoke integration.
- **GDPR + audit** — account-deletion handling and a moderation audit trail are must-haves
  every option must satisfy (baseline, not tie-breakers).

## Considered Options

1. **Saleor Models (`Page` + `PageType`)** — each review is a Page of a "Review" Model Type
   with typed attributes; Saleor is the system of record. *(chosen)*
2. **Dedicated Nimara-owned Postgres store** — own tables (like the marketplace ledger),
   full SQL for aggregation, uniqueness, and moderation queues.
3. **Saleor raw metadata** — reviews stored as key-value JSON metadata on product/order/customer.

## Decision Outcome

**Chosen option: "Saleor Models (`Page`/`PageType`)", as the sole store for the default
provider.** We will persist each verified review as a Page of a dedicated "Review" Model
Type, with Saleor as the system of record. It wins **operational burden** (zero new infra
for the pilot), stays entirely inside the **base system**, honours **no-SaaS/no-lock-in**,
and slots cleanly into the **swappable-provider convention** as a `SaleorReviewProvider`.

On the **dominant** driver it is a deliberate, eyes-open compromise: Saleor's
`pages(filter/where/search)` plus `isPublished` cover moderation queues and filter-by-rating
natively, but Saleor's API has **no server-side aggregation and no uniqueness constraint**.
We accept both gaps and mitigate them (see Implementation Notes): the per-product aggregate
is **precomputed and stored as a product attribute**, and uniqueness is **enforced in the
submission Server Action**. The `ReviewProvider` contract is the reversibility seam — a
future ADR may introduce an alternative provider if volume or aggregation outgrows Saleor
Models. **No Postgres provider is planned in this ADR.**

## Pros and Cons of the Options

### Saleor Models (`Page`/`PageType`) *(chosen)*

- Good, because zero new infrastructure to run for the pilot (operational burden).
- Good, because it stays in the base system and carries no SaaS fee or lock-in.
- Good, because `isPublished` + `pageBulkPublish` give native publish/unpublish for both
  moderation modes, and `pages(filter/where/search)` covers moderation queues and
  filter-by-rating (query capability — moderation half).
- Good, because it fits the swappable-provider convention directly as one manifest.
- Bad, because Saleor has **no `AVG`/`GROUP BY`**: per-product average/count must be
  precomputed and cached rather than queried (query capability — aggregation half).
- Bad, because there is **no uniqueness constraint**; one-review-per-product-per-order is
  app-enforced (query-then-write, an accepted race at pilot volume).
- Neutral: user-generated reviews live in a CMS-document table — fine at pilot volume,
  revisit at scale.

### Dedicated Nimara-owned Postgres store

- Good, because full SQL wins the dominant driver outright — aggregation via `AVG`/`GROUP BY`,
  `UNIQUE` constraints for one-per-order, and rich moderation-queue queries.
- Good, because a precedent already exists in the repo (the marketplace ledger).
- Bad, because it stands up new infrastructure — migrations, connection management, backups,
  on-call — before any pilot evidence exists (operational burden).
- **Rejected because** it fails the **operational-burden** driver for a pilot MVP, and the
  team chose to keep the system of record inside the base system; the aggregation edge it
  wins is neutralised by precomputing the aggregate, which any option would cache anyway.

### Saleor raw metadata

- Good, because it needs no new infrastructure and stays in the base system.
- Bad, because metadata is unstructured key-value JSON with size limits, **no attribute
  typing, and no cross-entity querying or filtering** — moderation queues and filter-by-rating
  become full scans in application code.
- **Rejected because** it fails the **dominant query-capability** driver hardest: unlike
  Saleor Models, it offers no queryable/filterable structure for moderation or aggregation
  at all.

## Implementation Notes

Reviews are a new `reviews` capability provider. Fallible operations return
`Result<T, E>` from `@nimara/domain/objects/Result`; app/component code calls the service,
never `@nimara/codegen` directly.

```ts
// packages/domain/src/reviews/types.ts
export type ReviewStatus = "PUBLISHED" | "PENDING" | "UNPUBLISHED";

export interface Review {
  id: string;
  productId: string;
  orderId: string;
  authorId: string;        // Saleor user id; display name resolved separately
  rating: number;          // 1..5
  comment: string;
  status: ReviewStatus;
  createdAt: string;
}

export interface ReviewAggregate {
  productId: string;
  averageRating: number;   // cached, precomputed
  count: number;
}

export interface ReviewListInput {
  productId: string;
  first: number;
  after?: string;          // Saleor cursor pagination
}

export interface ReviewProvider {
  submit(input: {
    productId: string; orderId: string; authorId: string;
    rating: number; comment: string;
  }): Promise<Result<Review>>;                              // creates a Page, sets isPublished per mode
  listByProduct(input: ReviewListInput): Promise<Result<{ reviews: Review[]; endCursor?: string; hasNextPage: boolean }>>;
  getAggregate(productId: string): Promise<Result<ReviewAggregate>>;
  // moderation (admin surface)
  moderate(input: { reviewId: string; action: "APPROVE" | "REJECT" | "UNPUBLISH"; actor: string; note?: string }): Promise<Result<Review>>;
  report(input: { reviewId: string; actor: string; reason?: string }): Promise<Result<Review>>;
}
```

**Storage mapping (Saleor Models):**

- Each review = a `Page` of a **"Review" `PageType`** with typed attributes: `rating`
  (numeric), `comment` (rich text / plain), `product` (reference attribute → product),
  `order` (reference / plain), `author` (reference / plain). Moderation state uses the Page's
  native `isPublished` (published = live, unpublished = pending/rejected); a `status`
  attribute distinguishes pending vs rejected vs reported when needed.
- **Per-product aggregate** is stored as **product attributes** — a numeric `rating`
  (average) and `review-count` — recomputed on every publish/unpublish/report transition via
  an attribute-update mutation. The product page reads them in the *same* GraphQL query it
  already makes for the product; they are filterable/sortable in Saleor's `products` query,
  which keeps the door open for the epic's (post-MVP) "rating on cards" and "star-rating
  filtering" scope without a search-provider dependency. Public metadata is the fallback if
  attribute management proves too heavy.
- **Audit trail** is an ordered `reviews.audit` array of `{ action, actor, at, note? }` in
  the review Page's **private metadata** — travels with the review, no extra store, hidden
  from storefront reads.

**Monorepo paths:**

- Types: `packages/domain/src/reviews/`.
- Provider: `packages/infrastructure/src/reviews/saleor/` with a manifest
  `{ id: "saleor", configSchema, create(env, logger) }`, plus `reviews/select.ts` and
  `reviews/types.ts` — mirroring `search/` and `cms-page/`.
- Wiring: add `getReviewService` to `CapabilityServices` in
  `packages/infrastructure/src/types.ts`; loader in `apps/storefront/src/services/registry.ts`.
- Consumer: a storefront service + the submission **Server Action** (`_actions/`), which calls
  `getAccessToken()`, verifies the customer has a **fulfilled** order line for the product via
  a Saleor order query, enforces one-review-per-product-per-order, then submits. Product page
  is a Server Component; the review list uses SSR-safe cursor pagination.

**Env schema** (Zod-validated in the manifest; forwarded via a `REVIEW_*` wildcard in
`turbo.json`):

- `REVIEW_SERVICE=saleor` — capability selector.
- `REVIEW_MODERATION_MODE=auto|pre` — sets `isPublished` on create (default `auto`).
- `REVIEW_INVITATION_DELAY_DAYS=3`, `REVIEW_SUBMISSION_WINDOW_DAYS=30`.

**What to build first (thin vertical slice):** the "Review" Model Type + the submission
Server Action (verify fulfilled order → `pageCreate` → recompute aggregate attribute) and the
product-page read of aggregate + first page of published reviews. Moderation UI, invitation
email, and structured data follow.

**Deferred to implementation:** exact method/attribute slugs, comment format (EditorJS vs
plain text), pagination page size, and test structure.

**Deferred sub-decisions (owned):**

- **U-1 — Invitation email:** depends on a separate `notifications` capability; trigger is a
  Saleor order-fulfilled webhook + configurable delay. The *scheduling mechanism* is
  unresolved — owner Lead Developer, before MVP ships.
- **U-2 — GDPR on account deletion (anonymize vs delete):** owner Lead Developer, before GA.
- **U-3 — Moderation/admin UI home (standalone app vs operator console):** a separate ADR,
  before the full (non-MVP) build.

## Consequences

**Positive** — a working, swappable review capability with zero new infrastructure for the
pilot; everything stays in Saleor; native publish/unpublish drives both moderation modes;
rating-as-attribute keeps catalog filter/sort reachable later. **Negative** — aggregation and
uniqueness are not free: the aggregate must be recomputed on every moderation write, and
one-per-order uniqueness is app-enforced and race-prone at high concurrency; user-generated
content accumulating in the Page table is a scale question deferred to the reversibility seam.
**Neutral** — the `ReviewProvider` contract is the blast-radius container: if volume or
aggregation needs outgrow Saleor Models, a superseding ADR can add an alternative provider
with no storefront feature-code change.

## Related Notes

[ADR MOC](tech/ADR/ADR%20MOC.md)
[Verified User Reviews (epic)](product/epics/Epic%20User%20Reviews.md)
[Verified User Reviews — Solution Grilling Log](product/solution/Verified%20User%20Reviews/Solution%20Grilling%20Log.md)
[Content & Navigation](tech/saleor/Content%20%26%20Navigation.md)
