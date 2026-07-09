# Example epic at the expected quality bar

Notice: honest risks with mitigations, out-of-scope items that say *why* and *where they go*, ACs mapped to stories, metrics with sources, kill criterion, open questions with owners and deadlines.

---

```markdown
---
id: EPIC-002
type: epic
status: draft
owner: "Product"
epic_type: business
personas:
  - "[[Customer]]"
  - "[[Shopper]]"
  - "[[Ecommerce Manager]]"
  - "[[Storefront Developer]]"
created: 2026-07-01
updated: 2026-07-01
---

# User Reviews

## Value Hypothesis

**For** shoppers deciding on a purchase **who** don't trust catalogs without social proof, **the** User Reviews epic **is a** verified-buyer review system built into the storefront **that** lifts product-page conversion through trustworthy ratings, **unlike** unverified review widgets or SaaS review services bolted on per store, **our solution** ships in-repo behind a swappable ReviewProvider contract and "fails alive" — reviews publish even in stores that never staff a moderation queue.

## Business Goal & Value

Reviews are table stakes: every mature storefront has them, and their absence loses adopters before Nimara's differentiators get evaluated. This epic closes that credibility gap and doubles as a reference implementation of the provider-swap architecture — the contract the primary Storefront Developer persona judges Nimara by. Verified social proof lifts product-page conversion, review structured data improves organic visibility, and rating aggregates give store operators direct quality feedback.

## Success Metrics

- M-1: review submission rate — ≥ 10% of invitation emails lead to a published review within the window — reviews module aggregates
- M-2: product-page conversion uplift on products with ≥ 5 reviews vs. none — measured in store analytics after 3 months
- M-3: adopter enablement — reviews enabled in ≥ 50% of new Nimara deployments within 6 months — telemetry/config survey

## MVP & Falsification

MVP: verified-purchase reviews (1–5 stars + text), invitation email after fulfillment, auto-publish with post-moderation, product-page display. Kill criterion: if after 3 months submission rate stays under 2% despite invitation tuning, stop investing in the custom module and evaluate a SaaS review integration behind the same ReviewProvider contract.

## Scope

- S-1: ReviewProvider interface — all review reads/writes go through a documented contract, so the default implementation can be swapped and survives a commerce-engine swap
- S-2: Default Nimara-owned reviews module with its own storage — engine-agnostic, supporting moderation queues, filtering, rating aggregation
- S-3: Review submission — 1–5 stars + comment, only for customers whose fully fulfilled order contains the product; one review per product per order
- S-4: Invitation email after fulfillment with configurable delay (default 3 days) and submission window (default 30 days), via pluggable email adapter
- S-5: Both moderation modes in v1 — auto-publish with post-moderation (default) and pre-moderation, as a configuration switch
- S-6: Moderation admin — pending/reported queue, approve/reject/unpublish, filters, bulk actions, audit trail
- S-7: Reporting a published review returns it to the moderation queue
- S-8: Product page — average rating, review count, paginated list, star-rating filter; rating + count on product cards
- S-9: Vendor-attributable schema — optional seller reference so the marketplace initiative needs no migration
- S-10: Review structured data (schema markup) for SEO
- S-11: Configuration via environment/code, documented — enable/disable, mode, delay, window

## Out of Scope

- Photo attachments — deliberate fast-follow; deferring removes the upload pipeline, image moderation, and GDPR surface from v1
- Reminder emails and moderation-outcome notifications — fast-follow once the core loop is proven
- Automated content screening (profanity/spam) — future enhancement
- Marketplace UX (per-vendor ratings, vendor replies) — schema readiness only; separate marketplace epic
- Importing reviews from external platforms (Google, Trustpilot) — not planned
- Incentives for writing reviews — not planned; risks trust

## User Stories

- US-1 ([[Customer]]): As a customer, a few days after my order is fulfilled I receive an email inviting me to review the products I bought, so that I can share my experience while it's fresh.
- US-2 ([[Customer]]): As a customer, I can rate a product 1–5 stars with a comment and (by default) see it published immediately, so that contributing feels worthwhile.
- US-3 ([[Shopper]]): As a shopper, I see average rating, review count, and a paginated, filterable review list on the product page, so that I can make an informed decision.
- US-4 ([[Shopper]]): As a shopper, I can report an inappropriate review, so that harmful content gets pulled back for re-checking.
- US-5 ([[Ecommerce Manager]]): As a store administrator, I can unpublish any review and work a queue of reported or pending reviews with filters and bulk actions, so that I keep published content trustworthy.
- US-6 ([[Storefront Developer]]): As a developer, I can enable, configure, and theme reviews through documented configuration and the ReviewProvider contract, so that I can fit the feature to my store without forking.

## Acceptance Criteria

- AC-1 (US-2): Given an order that is fully fulfilled and contains the product, when the customer submits a review, then it is accepted; one review per product per order.
- AC-2 (US-1): Given fulfillment happened, when the configured delay passes, then the invitation email is sent; submission is possible only within the configured window.
- AC-3 (US-2): Given auto-publish mode (default), when a review is submitted, then it is publicly visible immediately; given pre-moderation mode, then nothing is visible before approval; switching modes is one configuration change.
- AC-4 (US-4): Given a published review is reported, when the report is submitted, then the review returns to the moderation queue without deletion.
- AC-5 (US-5): Given the moderation queue, when the admin works it, then approve, reject, unpublish, rating/product filters, and bulk actions are available, and every action lands in the audit trail.
- AC-6 (US-3): Given a product page, when it renders, then average rating, review count, and a paginated star-filterable list are shown; product cards show rating and count.
- AC-7 (US-6): Given the storefront, when any review data is read or written, then it flows through the ReviewProvider interface only.
- AC-8 (US-6): Given published reviews, when the product page renders, then review structured data is emitted.

## Risks

- R-1: First stateful component in a stateless stack — adds a database to Zero-to-Deploy, the roadmap's #1 priority — mitigation: deploy path must absorb it invisibly; validate in the CLI epic.
- R-2: Pre-moderation stores that never staff the queue silently kill the feature — mitigation: auto-publish default + queue-size visibility.
- R-3: Low review volume with a single invitation email — accepted for v1; reminders are a fast-follow.
- R-4: Invitations depend on stores reliably marking orders fulfilled — mitigation: document; distorted timing degrades gracefully.

## Open Questions

- Q-1: Is the standalone admin app the seed of a general operator console or a reviews-only tool? — Product — before `ready`
- Q-2: GDPR: anonymize or delete reviews on account deletion? — Legal — before `in-progress`
- Q-3: Should v1 ship a second ReviewProvider adapter to prove the contract? — Architecture — before solution design

## Related Notes

[[Table Stakes vs Differentiators]]
[[Customer]]
[[Shopper]]
```
