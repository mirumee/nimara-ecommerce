# Business-first Product Requirements Document example

This is a fictional quality example. Its numbers illustrate the required specificity; never reuse them without evidence and user confirmation.

```markdown
---
id: PRD-002
type: Product Requirements Document
status: analyzing
owner: "Product"
prd_type: business
personas:
  - "[Storefront Developer](product/personas/Storefront%20Developer.md)"
  - "[Shopper](product/personas/Shopper.md)"
created: 2026-07-01
updated: 2026-07-01
---

# Verified User Reviews

## Value Hypothesis

**For** teams evaluating Nimara for consumer storefronts **who** expect credible social proof without buying and integrating another SaaS product, **the** Verified User Reviews capability **is a** built-in verified-purchase review capability **that** prevents a table-stake gap from disqualifying Nimara and gives shoppers trustworthy purchase evidence, **unlike** shipping no reviews or rebuilding a third-party integration per store, **our solution** is open-source, adopter-owned, and usable without a permanently staffed moderation operation.

## Evidence & Assumptions

- E-1: Three recorded solution assessments named reviews as a required capability; this proves demand but not that reviews alone decide platform selection.
- A-1 `[ASSUMPTION]`: A credible reference capability will improve qualified evaluation acceptance and reach independent deployments.

## Business Goal & Value

Close a storefront credibility gap so teams evaluate Nimara's differentiators instead of rejecting it for missing social proof. Shopper trust is the experience value; continued platform evaluation and deployment are Nimara's business value.

## Business Outcomes

- BO-1: At least 4 qualified solution assessments confirm the capability meets their review requirement within 6 months of public release — recorded by Product.
- BO-2: At least 2 independent external teams launch it without forking within the same window — confirmed through deployment review.

## Leading Indicators

- LI-1: A developer enables the reference flow in a working storefront within one business day — onboarding validation.
- LI-2: At least 80% of invited pilot buyers who start a review complete submission — preview telemetry.

## MVP & Falsification

MVP: verified-purchase star rating and text review, one invitation after fulfillment, safe default publication behavior, product-page display, configuration, and setup documentation. Preview first; the six-month clock starts at public release.

If at least 4 qualified assessments occur but fewer than 4 accept the capability, or two qualified external teams attempt adoption and neither can launch without a fork, stop expanding the built-in module and retain only the reusable integration seam. If too few opportunities occur, Product decides whether evidence is inconclusive or the investment stops before `ready`.

## Nonfunctional Requirements

- NFR-1: A review can be submitted only for a product in a fulfilled order owned by that customer.
- NFR-2: The default mode must remain useful without a continuously staffed moderation queue.
- NFR-3: Review display inherits storefront accessibility and performance standards.

## Scope

- S-1: Verified rating and text submission for fulfilled-order products.
- S-2: One configurable post-fulfillment invitation and documented enablement.
- S-3: Product-page rating summary and paginated review display.
- S-4: A safe publication and unpublish flow that works without a separate operator application.

## Out of Scope

- Photo reviews — fast-follow after the core contribution loop is validated because uploads add storage, moderation, and privacy scope.
- Vendor ratings and replies — separate marketplace PRD because the buyer, workflow, and value differ.
- Review imports and incentives — separate future bets requiring their own evidence.

## User Stories

- US-1 ([Storefront Developer](product/personas/Storefront%20Developer.md)): As a storefront developer, I want to enable and configure reviews without a fork, so that my store meets the expected social-proof baseline.
- US-2 ([Shopper](product/personas/Shopper.md)): As a shopper, I want to see verified ratings and comments on a product, so that I can judge purchase risk.

## Acceptance Criteria

- AC-1 (US-1): Given a working Nimara storefront, when the developer follows the setup guide, then the reference review flow can be enabled without modifying module internals.
- AC-2 (US-2): Given published verified reviews, when a shopper opens the product page, then the rating summary and review list are accessible and identify verified purchases.

## Risks

- R-1: Demand evidence may not translate into platform selection — mitigation: validate through qualified assessments and independent adoption rather than feature usage alone.
- R-2: Low review volume can make the experience look empty — mitigation: test invitation completion during preview before expanding moderation scope.

## Open Questions

- Q-1: How should insufficient qualified opportunities affect the stop decision? — Product — before `ready`.
- Q-2: Which account-deletion behavior meets privacy requirements? — Legal — before `in-progress`.

## Related Notes

[PRD-002 Verified User Reviews - Grilling Log](product/prds/grilling/PRD-002%20Verified%20User%20Reviews%20-%20Grilling%20Log.md)
[Table Stakes vs Differentiators](product/market/Table%20Stakes%20vs%20Differentiators.md)
[Storefront Developer](product/personas/Storefront%20Developer.md)
[Shopper](product/personas/Shopper.md)
```
