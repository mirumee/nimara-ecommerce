---
type: "Architecture Decision Record"
title: "Vendor Warehouses Are Platform-Provisioned And Vendor-Scoped"
description: "The marketplace app provisions one Saleor warehouse per vendor with the app token, joins it to the vendor by vendor.id metadata, and keeps the vendor panel read-only on warehouses."
tags:
  - "adr"
  - "marketplace"
  - "vendor"
  - "warehouse"
  - "saleor"
created: "2026-08-26T00:00:00+00:00"
status: "proposed"
owner: "Wojciech Gajda"
superseded_by: null
---

## Context

Saleor has no vendor entity. The marketplace models vendor ownership with the `vendor.id`
metadata key on products, orders, and customers, and the vendor panel filters its queries by
that key. Warehouses sit outside that contract.

Three facts describe the current build:

- The vendor panel allows the `warehouses` query and applies no vendor filter to it. Every
  vendor reads every marketplace warehouse, including the names.
- The vendor panel allows no warehouse mutation. A vendor depends on the marketplace owner for
  any warehouse change.
- Vendor registration creates a vendor profile page and a default collection. It creates no
  warehouse.

Requirement 7 of the DERBY Nimara Marketplace design asks for warehouses per vendor, and the
current build does not deliver it. Requirement 8 of the same design keeps channels, shipping
zones, and shipping methods with the marketplace owner.

Two properties of a Saleor warehouse constrain any solution. A warehouse carries an address, and
it must belong to a shipping zone before it can serve a shipment. The vendor sign-up form
collects a vendor name, a company name, a VAT id, and an email, but no address. The address
appears later on the Saleor customer account.

[PRD-004 Vendor-Owned Warehouses](../../prd/PRD-004%20Vendor-Owned%20Warehouses.md) states the
product requirement and its evidence limits: a developer found the gap in the code, and Nimara
runs no marketplace of its own, so no field evidence exists.
[RFC-0001 Vendor Warehouse Provisioning and Isolation](../RFC/RFC-0001%20Vendor%20Warehouse%20Provisioning%20and%20Isolation.md)
proposes the design and weighs four alternatives.

## Decision

We will provision one Saleor warehouse per vendor on the platform side, and we will scope the
vendor panel warehouse list to its owner. This resolves
[RFC-0001 Vendor Warehouse Provisioning and Isolation](../RFC/RFC-0001%20Vendor%20Warehouse%20Provisioning%20and%20Isolation.md).

The decision has five parts.

**The platform provisions, and the vendor does not.** A new warehouse provisioning module runs
on the server with the installed app token, the same credential that creates the vendor profile
page and the default collection. No warehouse mutation joins the vendor allowlist, so the vendor
stays read-only on warehouses, channels, shipping zones, and shipping methods.

**The trigger is the vendor address save, and there is no second entry point.** Provisioning
cannot run at sign-up, because no address exists at that moment. A vendor with no saved address
receives no warehouse, and the panel states that the address is required before the vendor can
hold stock.

**Metadata is the join key.** The warehouse carries `vendor.id` with the vendor profile page id.
The name comes from the vendor name and the slug from the vendor page slug, but neither is the
join. A renamed warehouse stays attached to its vendor. Provisioning reads by metadata first and
by slug second, so a failed metadata write is repaired instead of producing a second warehouse.

**Isolation lives in the vendor GraphQL layer, and enforcement lives in the stock write.** The
`warehouses` query gains the `vendor.id` metadata filter, built the same way as the existing
product and order filters. A variant stock write is validated against the vendor's own warehouse
ids before the mutation reaches Saleor, and a foreign warehouse id is refused with a field-level
error. The filter hides foreign warehouses. The guard stops a crafted mutation that names one.

**The shipping zone rule is the narrow one.** Provisioning assigns the warehouse to every
shipping zone of the marketplace channel whose country list contains the warehouse country. If
no zone matches, provisioning still creates the warehouse, records the gap, and raises an alert,
because a missing zone is an operator decision and not a vendor error.

This ADR stays `proposed` until the PRD owner closes Q-1 of
[PRD-004 Vendor-Owned Warehouses](../../prd/PRD-004%20Vendor-Owned%20Warehouses.md), the open
question behind the shipping zone rule. The rule above is the recommendation of RFC-0001, not a
closed answer.

## Consequences

### The marketplace keeps the logistics topology, and the vendor gains stock autonomy

A vendor reaches a sellable product without an action by the marketplace owner, which is
condition W-2 of the PRD. The marketplace owner keeps every channel, shipping zone, and shipping
method, which is requirement 8 of the DERBY design. The two hold together only because the
platform, and never the vendor, places a warehouse in the shipping topology.

The alternative that grants the vendor warehouse mutations was rejected for this reason. It
gives full autonomy and breaks requirement 8 in the same step.

### One warehouse per vendor is an MVP limit, not a model limit

A vendor with several depots is not served. The metadata join key assumes no single warehouse,
so one warehouse per vendor per shipping zone remains reachable as a later slice. The panel
shows one warehouse instead of a list, so the variant stock section changes shape and not only
its contents.

### Vendors that registered before this change lose the ability to hold stock

No backfill path exists. Such a vendor sees an empty warehouse list and cannot hold stock, and
the marketplace owner deletes the vendor from Saleor. The PRD accepts this as R-3, and the
acceptance rests on one fact: no production marketplace runs on this code. A deployment that
already carries vendors must not take this change without a backfill of its own.

The saved cost is a backfill path and an operator screen that would be used once.

### A warehouse in no shipping zone is a new operational state

Provisioning creates the warehouse and does not fail. The vendor catalog stays unsellable until
an operator acts, so the alert is the only thing that closes the gap. This adds an operator duty
that the shared-warehouse model did not have.

Three further signals need somewhere to arrive: a provisioning failure with the vendor id and
the failing step, vendors that hold stock but own no warehouse, and the total warehouse count.
The last one matters because warehouse count grows with vendor count and affects stock
allocation in Saleor, which the PRD records as R-4 and asks to measure before the model opens to
many vendors.

### The change is contained, and that is the reason to prefer it

No new external endpoint, no new service, no new environment variable, and no schema migration.
The payable ledger database gains no table, because all state lives on the Saleor warehouse and
its metadata. The marketplace app starts to use three Saleor mutations that it does not use
today: warehouse creation, warehouse metadata update, and warehouse-to-shipping-zone assignment.
All three run with the app token, outside the vendor allowlist. The storefront does not change.

### A small information leak closes

Today a vendor reads the name of every marketplace warehouse. The metadata filter ends that,
which the PRD records as R-5.

### The rejected alternatives, and what each one costs

- **Keep shared marketplace warehouses.** It costs nothing to build and suits a marketplace that
  holds the goods and ships for the vendor. It leaves requirement 7 unmet and the vendor pain in
  place.
- **Let the vendor create its own warehouse.** It breaks requirement 8, as stated above.
- **One warehouse per vendor per shipping zone.** It removes the zone-matching rule and
  multiplies the warehouse count. Deferred, not refused.
- **Provision at sign-up with a placeholder address.** It keeps all setup in one place and feeds
  false address data into shipping calculations.

### Records that must change when this ships

- `product/capabilities/CAP-0004 Marketplace Vendor Operations.md` states that a vendor can
  inspect available warehouses. It must state ownership and the filter.
- `docs/06-Advanced/01-Marketplace.md` must describe warehouse provisioning in the vendor
  onboarding flow.
- The DERBY Nimara Marketplace design must record that platform provisioning delivers
  requirement 7, and not vendor self-service.

### Named follow-ups

- Close Q-1 and move this ADR to `accepted`, or write the rule that replaces it.
- Move existing stock out of the shared marketplace warehouses. The PRD puts the migration plan
  outside the MVP.
- Answer the vendor courier question. A fixed set of marketplace shipping methods tells a vendor
  which couriers to use, and the PRD records the concern without addressing it.
- Automate the first five QA scenarios of RFC-0001. The zone-mismatch case needs a prepared
  Saleor configuration and starts as a manual check.

## Related Notes

[ADR MOC](ADR%20MOC.md)
[RFC-0001 Vendor Warehouse Provisioning and Isolation](../RFC/RFC-0001%20Vendor%20Warehouse%20Provisioning%20and%20Isolation.md)
[PRD-004 Vendor-Owned Warehouses](../../prd/PRD-004%20Vendor-Owned%20Warehouses.md)
[CAP-0004 Marketplace Vendor Operations](../../product/capabilities/CAP-0004%20Marketplace%20Vendor%20Operations.md)
