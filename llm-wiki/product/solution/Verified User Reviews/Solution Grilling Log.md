---
type: "Solution Grilling Log"
title: "Verified User Reviews — Solution Grilling Log"
description: "Technical grilling that shaped the default ReviewProvider storage decision (ADR-0001) — drivers, options, and why the alternatives lost."
tags:
  - "solution"
  - "grilling"
  - "decision-log"
  - "reviews"
created: "2026-07-13T00:00:00+00:00"
timestamp: "2026-07-13T00:00:00+00:00"
---

# Verified User Reviews — Solution Grilling Log

## Purpose

This is a durable record of the user-visible technical grilling that shaped the solution
design and the resulting ADR(s). It records questions, recommendations, answers, decisions,
and rejected options; it is not a raw transcript or a hidden reasoning trace. It is produced
by the `solution-author` skill and pairs with the epic's business grilling log.

## Session 1 — 2026-07-13

### Session Context

- Epic: [Verified User Reviews](product/epics/Epic%20User%20Reviews.md)
- Trigger: the epic mandates a swappable `ReviewProvider` with a default in-repo module that
  has its own storage — but leaves *where review data lives* open. Saleor has no native
  review entity, so the system-of-record choice is the forced decision.
- Base system: **Saleor + `apps/storefront`**; reviews added as a new swappable `reviews`
  capability (per code-docs `apps/docs/adr/0001-integration-provider-architecture.md`).
- Starting facts: the epic and its scope; code-docs ADR-0001 (swappable-provider convention,
  reviews reserved as a future capability); `tech/saleor/Content & Navigation.md` (Page/PageType
  capabilities, Saleor 3.23.17); the marketplace Postgres ledger as an app-owned-storage
  precedent; empty wiki ADR register (next number ADR-0001).
- Facilitator: `solution-author`
- Outcome: `shared-understanding-confirmed`

### Decision Drivers

Ranked; the dominant driver marked.

1. **Query capability (moderation + aggregation) — DOMINANT (breaks ties).**
2. Product-page read performance (must-have).
3. Operational burden before pilot evidence (must-have).
4. No SaaS fee / no vendor lock-in (settled by the epic).
5. Fit with Nimara layers, swappable-provider convention, `Result<T, E>` (settled by convention).
6. GDPR + audit trail (baseline must-haves, not tie-breakers).

### Decision Log

| ID    | Decision branch      | Question | Recommendation | User answer | Resulting decision |
| :---- | :------------------- | :------- | :------------- | :---------- | :----------------- |
| D-001 | Base system (gate)   | What is the base system and system of record for reviews? | Saleor + `apps/storefront`; reviews as a new swappable capability; SoR Nimara-owned, Saleor consulted only for purchase verification | "I don't know, let's start grilling" — delegated | Base system confirmed as Saleor + `apps/storefront`, reviews = new `reviews` capability. The system-of-record part left open and grilled as D-003. |
| D-002 | Decision drivers     | Which 2–3 drivers dominate (break ties)? | Query capability, page-read performance, operational burden | Query capability (moderation + aggregation) | Query capability is the sole dominant tie-breaker; others remain must-haves. |
| D-003 | System of record / storage | Where does the default provider's review data live? | Dedicated Nimara-owned Postgres store | Proposed Saleor Pages/Models instead ("is it called Models now?"); after verifying capabilities, chose **Saleor Models only, no Postgres path** | Default and sole store = **Saleor Models (`Page`/`PageType`)**, SoR = Saleor. No Postgres provider planned; `ReviewProvider` contract keeps it reversible in principle. |
| D-004 | Aggregate storage    | Where does the cached per-product average + count live? | Product public metadata, recomputed on publish | Proposed product **Attributes**, metadata as fallback | Aggregate stored as product **attributes** (`rating` avg + `review-count`), recomputed on publish; unlocks Saleor-native filter/sort for catalog surfaces. Metadata is the fallback. |
| D-005 | Audit trail          | Where are moderation actions recorded (Saleor-only)? | `reviews.audit` array in the review Page's private metadata | Private metadata on the review Page | Audit trail = ordered `reviews.audit` array in the review Page's **private metadata**. |

### Considered Options and Why Rejected

- **Saleor Models (`Page`/`PageType`)** — **chosen**: wins operational burden, stays in the
  base system, honours no-SaaS/no-lock-in, fits the provider convention. Aggregation +
  uniqueness gaps accepted and mitigated (precomputed attribute aggregate; app-enforced
  uniqueness).
- **Dedicated Nimara-owned Postgres store** — rejected because it fails the
  **operational-burden** driver for a pilot MVP (new infra/migrations/on-call before
  evidence), and the team chose to keep the system of record inside the base system. The
  aggregation edge it wins is neutralised by precomputing the aggregate.
- **Saleor raw metadata** — rejected because it fails the **dominant query-capability**
  driver hardest: unstructured key-value JSON with no attribute typing, filtering, or
  aggregation.

### Deferred to Implementation

- Exact method/attribute slugs, comment format (EditorJS vs plain text), pagination page
  size, test structure — do not change the storage decision. Owner: implementer — build phase.

### Unresolved Sub-Decisions

- **U-1** — Invitation email scheduling mechanism (depends on a separate `notifications`
  capability; trigger = Saleor order-fulfilled webhook + configurable delay). Owner: Lead
  Developer — before MVP ships.
- **U-2** — GDPR on account deletion (anonymize vs delete). Owner: Lead Developer — before GA.
- **U-3** — Moderation/admin UI home (standalone app vs operator console). Owner: Lead
  Developer — a separate ADR, before the full (non-MVP) build.

### Chosen Architecture

Base system Saleor + `apps/storefront`; reviews a new swappable `reviews` capability. Default
and sole store = **Saleor Models (`Page`/`PageType`)**, Saleor as system of record. Per-product
aggregate precomputed into product **attributes** (`rating`, `review-count`); moderation via
native `isPublished`; audit trail in the review Page's private metadata; submission via a
storefront Server Action that verifies a fulfilled order line and enforces uniqueness; all
fallible operations return `Result<T, E>`. Env: `REVIEW_SERVICE`, `REVIEW_MODERATION_MODE`,
`REVIEW_INVITATION_DELAY_DAYS`, `REVIEW_SUBMISSION_WINDOW_DAYS`. Reversibility seam = the
`ReviewProvider` contract; a superseding ADR may add an alternative provider if volume or
aggregation outgrows Saleor Models.

### Resulting ADR(s)

- [ADR-0001 Default ReviewProvider Stores Reviews as Saleor Models](tech/ADR/ADR-0001%20Default%20ReviewProvider%20Stores%20Reviews%20as%20Saleor%20Models.md) — Proposed

## Session 2 — 2026-07-14

### Session Context

- Epic: [Verified User Reviews](product/epics/Epic%20User%20Reviews.md)
- Trigger: the user asked for a **completely new ADR built from the epic**, explicitly *not*
  taking cues from the existing ADR-0001 — a fresh, whole-system design run (not just storage).
- Base system: **Saleor + `apps/storefront`**; email via the installed **nimara-mailer** Saleor
  app. Reviews as a new swappable `reviews` capability.
- Starting facts (read before grilling; ADR-0001 body deliberately *not* re-read to avoid
  anchoring): the epic and scope; `apps/docs/adr/0001-integration-provider-architecture.md`
  (reviews reserved as a future swappable capability); `tech/saleor/Content & Navigation.md`
  and `tech/saleor/Attributes.md` (Page/PageType + attribute capabilities, Saleor 3.23.17);
  the storefront placeholder `product-reviews.tsx`; existing email path (Saleor sends
  transactional mail; no in-repo mailer) corrected by the user to the **nimara-mailer** repo
  (`github.com/mirumee/nimara-mailer` — serverless TS app, Saleor + custom events, React Email,
  SES/SMTP). Wiki register held ADR-0001 → next number **ADR-0002**.
- Facilitator: `solution-author`
- Outcome: `shared-understanding-confirmed`

### Decision Drivers

Ranked; the dominant driver marked.

1. **No SaaS cost / in-repo — DOMINANT (breaks ties).**
2. SSR performance on hot paths (PDP/PLP) — must-have.
3. Swappable-provider & layer fit (`Result<T, E>`, no `@nimara/codegen` in app) — must-have.
4. Data lifecycle / GDPR + audit trail — baseline must-have.
5. Security / authorization at the write boundary — baseline must-have.

### Decision Log

| ID    | Decision branch | Question | Recommendation | User answer | Resulting decision |
| :---- | :-------------- | :------- | :------------- | :---------- | :----------------- |
| D-006 | Base system / SoR (gate) | What is the base system and system of record for reviews? | Dedicated Postgres store, Saleor consulted only for purchase verification | **Saleor as SoR** | Base system = Nimara storefront on Saleor; **Saleor is the system of record** for review data. |
| D-007 | Decision drivers | Which drivers dominate (break ties)? | No-cost/in-repo, time-to-value, SSR-perf | **No-cost / in-repo** | No-cost/in-repo is the sole dominant tie-breaker; SSR-perf, GDPR, swappable-fit remain must-haves. |
| D-008 | Saleor mapping | Which Saleor primitive maps a single review? | Review = Saleor Page (`Review` PageType, attributes + metadata) | **Saleor Page (Review PageType)** | Each review is a Page typed `review`; rating/status/product as attributes, author + order-line ref in metadata; `isPublished` = moderation state. Metadata-blob rejected. |
| D-009 | Aggregate storage | Where does the per-product average + count live? | Hybrid — bucket `DROPDOWN` attribute (filter) + precise avg/count in product metadata | **Product attributes only** | Aggregate = product attributes `review-rating-avg` + `review-count` (native filter/sort). `AttributeValue` churn/reindex accepted as known risk; rounding mitigation deferred. Metadata-only and hybrid rejected. |
| D-010 | Write path / authz | How are privileged Page/attribute writes done (customer token lacks `MANAGE_*`)? | Server Action + Saleor app token (service account) | **Server Action + app token** | Storefront Server Action verifies identity + fulfilled-order purchase, then an app token (server-side in `infrastructure`) performs `pageCreate` and aggregate writes. Direct-customer-write and a separate Saleor App rejected. |
| D-011 | Capability scope (epic open Q) | Full swappable capability, second adapter, or single loader? | Full capability scaffold + single `saleor` provider | **Scaffold + only `saleor`** | Full manifest/registry/env-selector convention with the sole default provider `saleor`; a second (SaaS) adapter deferred. |
| D-012 | Invitation email | How is the delayed invitation triggered/sent, reusing existing infra? | Vercel Cron scan + in-repo pluggable email adapter | **Extend nimara-mailer** | Saleor `ORDER_FULFILLED` webhook → nimara-mailer, which owns the multi-day delay (AWS-native: EventBridge Scheduler / Step Functions `wait`) and sends a `review_invitation` React Email template via its transport. Epic's "pluggable email-provider adapter" = the mailer's `EMAIL_PROVIDER`. Storefront cron + in-repo adapter rejected. |

### Considered Options and Why Rejected

- **Saleor Pages + product-attribute aggregate + app-token writes + extended nimara-mailer** —
  **chosen**: stays entirely in the base system and installed infra (dominant no-cost/in-repo),
  native pagination/filter/sort/moderation via Pages + attributes, privileged writes contained
  server-side, invitations reuse nimara-mailer.
- **Dedicated Nimara-owned Postgres store** — rejected because it fails **no-cost / in-repo**:
  new datastore, migrations, backups, on-call before pilot evidence.
- **Reviews as a Product-metadata blob** — rejected because it fails **SSR-perf** and moderation:
  no server-side pagination/filter, unqueryable queue, concurrent-write clobber.
- **Aggregate in metadata / bucket+metadata hybrid** — rejected in favour of attributes for
  native catalog-surface filter/sort (user decision); churn accepted + mitigated.
- **Direct customer write of the review Page** — rejected: impossible under Saleor permissions
  and a security hole (customer could set `isPublished`/`rating`).
- **Storefront Vercel Cron + new in-repo email adapter** — rejected because it duplicates
  scheduling/email that nimara-mailer already provides (reuse).
- **Second SaaS ReviewProvider in v1** — rejected on cost / time-to-value; the scaffold already
  proves swappability.

### Deferred to Implementation

- Exact delay mechanism inside nimara-mailer (EventBridge Scheduler vs Step Functions `wait`) —
  owner: nimara-mailer maintainer — before the invitation build.
- Average-rounding strategy to bound `AttributeValue` churn/reindex — owner: implementer —
  before the aggregate build.
- Attribute/PageType slugs, comment format (plain text vs EditorJS), pagination size — owner:
  implementer — build phase.

### Unresolved Sub-Decisions

- **U-4** — GDPR on account deletion: anonymize vs delete review Pages. Owner: Lead Developer —
  before GA.
- **U-5** — Pre-moderation queue-size alerting. Owner: DevOps — before enabling pre-moderation.
- **U-6** — Standalone moderation/admin app (vs operator console). Owner: Lead Developer —
  a separate ADR, before the full (non-MVP) build.

### Chosen Architecture (Session 2)

Reviews = a swappable `reviews` capability with the single default provider `saleor`. Each
review is a Saleor `Page` (`Review` PageType; rating/status/product attributes, author +
order-line ref in metadata; `isPublished` = moderation). Per-product aggregate stored as product
attributes `review-rating-avg` + `review-count` (native filter/sort; churn mitigated by
rounding). Privileged writes via a storefront Server Action + Saleor app token after
fulfilled-purchase verification; all fallible ops return `Result<T, E>`. Invitations owned by an
extended nimara-mailer (`ORDER_FULFILLED` → AWS-native delay → `review_invitation` template,
SES/SMTP). No new database; audit trail in each review Page's private metadata. Reversibility
seam = the `ReviewProvider` contract.

### Resulting ADR(s)

- [ADR-0002 Verified User Reviews on Saleor with nimara-mailer Invitations](tech/ADR/ADR-0002%20Verified%20User%20Reviews%20on%20Saleor%20with%20nimara-mailer%20Invitations.md) — Proposed

## Related Notes

[Verified User Reviews](product/epics/Epic%20User%20Reviews.md)
[ADR MOC](tech/ADR/ADR%20MOC.md)
