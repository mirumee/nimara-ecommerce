---
type: "Product Requirements Document"
title: "Vendor-Owned Warehouses"
description: "Product Requirements Document for giving each marketplace vendor its own Saleor warehouse instead of shared marketplace warehouses."
tags:
  - "prd"
  - "marketplace"
  - "vendor"
  - "warehouse"
  - "fulfillment"
created: "2026-08-26T00:00:00+00:00"
status: "draft"
owner: "Wojciech Gajda"
prd_type: "business"
personas:
  - "[Storefront Developer](../market/personas/Storefront%20Developer.md)"
  - "[Marketplace Vendor](../market/personas/Marketplace%20Vendor.md)"
---

# Vendor-Owned Warehouses

## Value Hypothesis

**For** [Storefront Developer](../market/personas/Storefront%20Developer.md) **who** adopts Nimara
to build a marketplace and finds that the starter models vendor ownership for products and orders
but not for stock, **the** vendor stock location **is a** built-in part of vendor onboarding
**that** delivers vendor-owned inventory without extra work, **unlike** the shared marketplace
warehouse list the starter ships today, **our solution** provisions the location for the vendor and
keeps the marketplace in control of channels and delivery.

End-user value is separate. For [Marketplace Vendor](../market/personas/Marketplace%20Vendor.md),
the value is autonomy: stock sits in a location the vendor owns, and no request to the marketplace
owner is needed to hold it.

## Business Goal & Value

Every vendor picks from the same list of marketplace warehouses, so stock rows sit in a location
the vendor does not own and cannot change. This is a fact of the current build, verified in the
vendor panel query layer and in the vendor registration flow.

### Evidence and its limits

The evidence is thin and must not be overstated:

- **Hard evidence.** Requirement 7 of the DERBY Nimara Marketplace design asks for warehouses per
  vendor. The current build does not deliver it.
- **Hard evidence.** The vendor persona names the pain: warehouse, channel, and store settings the
  vendor cannot manage mean waiting on the marketplace owner.
- **Origin of the finding.** A developer found the gap while reading the marketplace code. There
  is no market signal, no vendor request, and no usage data.
- **No field evidence exists and none can exist today.** Nimara is an open-source project and runs
  no marketplace of its own. There are no live vendors to ask and no support queue to count.

`[ASSUMPTION]` A team that adopts Nimara to build a marketplace expects the starter to model
vendor-owned stock, and must build that model itself when the starter omits it.

`[ASSUMPTION]` A vendor stores goods in its own building rather than in a location the platform
operates. This holds for a marketplace where the vendor ships. It does not hold for a marketplace
that fulfills on the vendor's behalf.

### Counterfactual

If nothing is done, the build keeps a model where the marketplace owner holds every stock
location. Every team that adopts Nimara for a vendor-ships marketplace hits the same gap and
solves it privately, and requirement 7 of the design stays unmet. Nothing breaks and no customer
is harmed today, because no production marketplace runs on this code.

## Strategic role

**Market parity, the credibility floor.** `Table Stakes vs Differentiators` places inventory counts
in the commoditized column of core commerce logic, and states that a missing item from that column
loses an adopter before the adopter evaluates any differentiator. The marketplace differentiator in
the same table, split payments and per-vendor payouts, is already built. Vendor-owned stock is a
hole in the floor underneath it.

This PRD is not a cost improvement. Cost would be counted in marketplace-owner time, and no
marketplace owner exists to measure.

**Urgency is low.** Nothing is broken for a live user. This is a gap in the model, not an incident.

## Success Metrics

No numeric target is set. This is an explicit decision by the PRD owner, not an omission. Nimara
runs no marketplace of its own, so every business outcome below has no population to measure and
no source to read.

### Release conditions

These conditions are binary and verifiable in a test environment. They replace a numeric target
for this release.

- W-1: requirement 7 of the DERBY Nimara Marketplace design is met. A new vendor finishes onboarding
  with a stock location of its own.
- W-2: a vendor reaches a sellable product without any action by the marketplace owner.
- W-3: the vendor panel shows the vendor no stock location that belongs to another vendor.

Each condition maps to an acceptance criterion, so it adds no second list to maintain.

### Metrics to switch on later

The following metrics stay unmeasured until a live marketplace runs on this code. Do not treat a
blank value as a failure.

- M-1: requests from vendors to the marketplace owner about stock-location setup — lagging —
  source: the channel that tracks vendor requests — no population today.
- M-2: time from vendor registration to the vendor's first sellable product — lagging — source: the
  registration to first-order funnel — no population today.
- M-3: share of vendor stock that sits in a location owned by that vendor — leading, diagnostic —
  source: the stock location record.
- M-4: number of vendors that own a location but cannot ship from it — leading, diagnostic —
  source: the delivery configuration.

## MVP & Falsification

The smallest slice is one stock location per vendor, provisioned for the vendor, plus a panel that
shows only that location. Existing marketplace locations stay in place and existing stock is not
moved.

Rollout: a plain release to `main`, with no feature flag and no validation window. The change
closes a model gap and has no half-built state to hide, so the flag rule in the repository
guidelines does not apply here. The three release conditions replace a validation window.

The work ships as one merge. Provisioning and the vendor filter go out together, because nothing
needs protection between them: a vendor registered before this change is deleted rather than
repaired, see Out of Scope.

Investment appetite is not recorded for this PRD. This is a deliberate omission. No other PRD in
this wiki records appetite, and the open size driver is the shipping-zone rule in Q-1, not the code.

Negative result: vendors keep asking the marketplace owner for access to shared locations, or
provisioning cannot make a vendor location shippable without manual work for every vendor. Either
outcome means the slice failed.

Action after failure: stop, and keep the shared-location model. The metadata join key stays, so a
later attempt is not blocked.

Insufficient evidence is not a negative result. If too few vendors register inside the validation
window, the window extends rather than the hypothesis failing.

## Scope

- S-1: every vendor owns exactly one stock location, provisioned for it and not created by it.
- S-2: the vendor panel shows only the stock location that belongs to the signed-in vendor.
- S-3: the vendor sets stock quantities only in its own location, and keeps no access to a shared
  marketplace location.
- S-4: a new vendor reaches a sellable product without an action by the marketplace owner.

Where the location comes from, how it is tagged, and how it joins the delivery configuration are
solution design. They live in the RFC.

## Personas

- P-1: [Storefront Developer](../market/personas/Storefront%20Developer.md) — the adopter. Decides
  whether Nimara is a credible starting point for a marketplace, and pays in build time for every
  model the starter omits.
- P-2: [Marketplace Vendor](../market/personas/Marketplace%20Vendor.md) — the end user. Holds
  stock, sets quantities, and fulfills orders.
- P-3: marketplace owner — the operator role in a deployed marketplace. It owns channels, shipping
  zones, and shipping methods, and must keep that control. No wiki persona records this role today.

## Out of Scope

- Vendor-defined shipping methods and courier choice — the marketplace keeps shipping under
  requirement 8 of the DERBY design. The team raised a real concern here: a fixed set of shipping
  methods tells a vendor which couriers to use. The concern is recorded, not addressed, and needs
  a separate PRD.
- Moving existing stock out of shared marketplace warehouses — a migration plan belongs to the
  RFC and can ship after the MVP.
- More than one warehouse per vendor — a later slice, once single-warehouse provisioning holds.
- Click-and-collect and warehouse pickup settings.
- Vendor-created warehouses. The platform provisions them, so the marketplace keeps control of
  the logistics topology.
- Provisioning for vendors that registered before this change. The marketplace owner deletes such a
  vendor from Saleor instead. This keeps the release free of a backfill path and an operator screen
  that would be used once. The decision is safe only while no production marketplace runs on this
  code.

## User Stories

- US-1 (Marketplace Vendor): As a vendor, I want my own warehouse, so that my stock sits in a
  location I own.
- US-2 (Marketplace Vendor): As a vendor, I want to see only my warehouse in the panel, so that I
  do not pick the wrong location by mistake.
- US-3 (Marketplace Vendor): As a vendor, I want my warehouse ready without asking anyone, so
  that I can publish a sellable product on my first day.
- US-4 (marketplace owner): As the marketplace owner, I want to keep channels and shipping under
  my control, so that the delivery offer stays consistent for customers.

## Acceptance Criteria

- AC-1 (US-1): Given a vendor that has completed its address details, when provisioning runs, then
  the vendor owns exactly one stock location.
- AC-2 (US-2): Given a signed-in vendor, when the vendor views stock locations, then only its own
  location appears.
- AC-3 (US-2): Given a signed-in vendor, when the vendor tries to set stock in a location it does
  not own, then the attempt is refused.
- AC-4 (US-3): Given a vendor with stock in its own location, when a customer opens that product,
  then a delivery method is available.
- AC-5 (US-1): Given a vendor that already owns a location, when provisioning runs again, then no
  second location appears.
- AC-6 (US-4): Given a signed-in vendor, when the vendor tries to change channels, delivery
  methods, or stock locations, then the attempt is refused.

## Risks

- R-1: a warehouse that is not attached to a marketplace shipping zone makes the vendor's
  products unshippable — provisioning must attach the warehouse to the zones the marketplace owner
  defines, and the RFC must state the rule.
- R-2: a vendor without an address cannot get a warehouse address — provisioning must run when
  the address appears, not at sign-up, and the panel must tell the vendor what is missing.
- R-3: a vendor that registered before this change loses the ability to hold stock — accepted. The
  marketplace owner deletes such a vendor. This is acceptable only because no production
  marketplace runs on this code.
- R-4: warehouse count grows with vendor count and affects stock allocation performance in Saleor
  — measure before opening the model to many vendors.
- R-5: a vendor learns the names of every marketplace warehouse today, which is a small
  information leak that the filter in S-2 closes.

## Open Questions

- Q-1: which shipping zones does a new vendor warehouse join, and on what rule — Wojciech Gajda —
  must be answered before the RFC is final.

## Related Notes

[Storefront Developer](../market/personas/Storefront%20Developer.md)
[Marketplace Vendor](../market/personas/Marketplace%20Vendor.md)
