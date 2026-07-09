
**Summary**: Reviews live in a standalone service with its own Postgres; the storefront stays stateless and reaches reviews only through the ReviewProvider contract over HTTP — Accepted.

**Tags**: #adr #reviews #architecture
**Created**: 2026-07-08T00:00:00+00:00
**Last Updated**: 2026-07-08T00:00:00+00:00

**Status**: Accepted <!-- Proposed | Accepted | Rejected | Deprecated | Superseded by [[ADR-NNNN Title]] -->

---
## Context

The User Reviews epic (`epics/epic-user-reviews.json`) adds the **first stateful component**
(a database + migrations) to an otherwise stateless storefront stack, while **Zero-to-Deploy**
is the roadmap's #1 priority — the deploy path must absorb the datastore invisibly.

The epic requires reviews to be **engine-agnostic**: a Nimara-owned module with its own
storage, "deliberately not commerce-engine metadata", that **survives a commerce-engine swap**
and is reached only through a documented `ReviewProvider` contract. That contract is described
as the reference implementation of provider-swap — the thing the [[Storefront Developer]]
persona judges Nimara by. Reviews are also table stakes (see [[Table Stakes vs Differentiators]]).

The codebase constrains the options:
- Every storefront data provider (search, cms, store, marketplace-vendor) is consumed
  **in-process via `ServiceRegistry`** and ultimately hits Saleor GraphQL. There is **no
  precedent for the storefront holding a database connection**.
- `apps/marketplace` is the standing precedent for a **standalone app that owns its own
  Postgres** (Drizzle), its own transactional email (nodemailer + React Email), auth, and
  Saleor webhook handlers. The storefront never touches that database.
- The only storefront↔app runtime seam is a **single narrow HTTP call** (checkout →
  marketplace `/api/payments/payment-intent`); all other coupling flows through Saleor as the
  shared source of truth.
- There is **no job queue and no cron** in the stack; the only reactive mechanism is Saleor
  webhooks, and `ORDER_FULFILLED` is not currently subscribed.

Reviews cannot use "Saleor as the shared source of truth" the way vendor data does, because
the epic deliberately keeps review data out of the commerce engine.

## Decision

We will implement reviews as a **standalone application (`apps/reviews`)** that owns its own
Postgres (via Drizzle), the moderation admin, the `ORDER_FULFILLED` webhook, the invitation
scheduler, and the audit trail — mirroring the `apps/marketplace` precedent.

The **storefront will remain stateless** (no database connection). It will read and write
reviews **exclusively through the `ReviewProvider` contract** (`ReviewsService` in
`packages/infrastructure`), registered in `ServiceRegistry` and resolved by a lazy-loader
exactly like every other provider. The **default implementation is an HTTP client** to
`apps/reviews` — analogous to how the marketplace provider is a GraphQL client and the
payment-intent seam is a single HTTP POST. Storefront reads are cached with Next.js
`revalidate`/tags, the same way product data is cached.

v1 ships **only the default implementation** (no second adapter). The contract is kept
DB/engine-agnostic and sanity-checked on paper against a real SaaS review API so the
provider-swap guarantee holds without building a second backend now.

## Consequences

**Positive**
- The storefront stays stateless: with reviews disabled (feature flag / no `DATABASE_URL`),
  the Zero-to-Deploy story is unchanged.
- Reviews are engine-agnostic and survive a commerce-engine swap; the `ReviewProvider`
  contract is a genuine reference implementation of provider-swap — a future SaaS backend is
  just another provider implementation behind the same interface.
- Reuses established patterns end-to-end (marketplace DB/email/webhook conventions, the
  `ServiceRegistry` provider pattern), adding little net-new architecture.
- The provider contract looks identical to search/cms/store from the storefront's side, so it
  is idiomatic and easy to restyle or swap.

**Negative / neutral**
- Introduces a **second deploy target** with its own Postgres, auth, and migrations to operate
  — the epic already flags "a standalone admin app is heavy for a single workflow".
- Review reads on the **hottest path** (product page + product cards) now cross an HTTP
  boundary; acceptable latency depends on caching, and it adds an availability dependency
  (mitigated by degrading to an empty/So-far-no-reviews state).
- A new `ORDER_FULFILLED` webhook and a **scheduler** (a `pending_invitations` table polled by
  a cron route) must be built and operated, since no queue/cron exists today.
- Whether the standalone moderation admin later generalizes into a shared **operator console**
  is deferred (tracked as an epic open question); building it reviews-only risks some rework if
  that question is answered differently.

## Related Notes

[[Decisions MOC]]
[[Storefront Developer]]
[[Table Stakes vs Differentiators]]

Supports: `epics/epic-user-reviews.json` · `tasks/epic-user-reviews.json`
