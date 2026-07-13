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

## Related Notes

[Verified User Reviews](product/epics/Epic%20User%20Reviews.md)
[ADR MOC](tech/ADR/ADR%20MOC.md)
