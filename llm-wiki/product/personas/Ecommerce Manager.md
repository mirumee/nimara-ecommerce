---
type: "Persona"
title: "Ecommerce Manager"
description: "SECONDARY persona — the business operator of a Nimara-powered store who manages catalog, channels, content, taxes, and orders day-to-day through dashboards, not code."
tags:
  - "persona"
  - "secondary"
  - "store-owner"
  - "operations"
created: "2026-06-11T00:00:00+00:00"
timestamp: "2026-06-11T00:00:00+00:00"
knowledge_status: "reference"
source_status: "research_derived"
---

## Content

### Goals

- Run a multi-channel, multi-locale store (markets, languages, currencies) without developer intervention for every change.
- Trust the financial chain end-to-end: accurate taxes, invoices that generate and update automatically as orders change, clear visibility into customers and payments.

### Pain Points

- Channel and locale behavior surprises them: customers landing on the wrong channel, carts behaving unexpectedly on country switch, products leaking across channels.
- Financial operations are manual: invoicing, reconciling payments, and getting a customer overview all require workarounds or developer help.
- Content and brand tasks need developers: CMS pages, email templates, banners, logos.

### Behavior Patterns

- **Frequency:** Daily — orders, catalog, and content are their job.
- **Technical level:** Intermediate (comfortable in admin dashboards, payment providers, and a CMS; does not touch code).
- **Decision process:** Doesn't choose Nimara — inherits it from the developer/agency. But their frustration drives churn: if routine operations require developers, the business switches platforms.
- **Current solution:** Commerce dashboard + payment dashboard + spreadsheets, stitched together by asking developers.

### Key Quote

> "When I edit an order, the invoice should just update. I shouldn't need to know what a webhook is."

### Product Implications

- Build operational workflows into dashboards, not config files: invoice actions, customer views, store branding settings — and keep extending that pattern.
- Make channel and locale switching bulletproof; failures there destroy trust faster than anything else.
- Make content self-serve: CMS tutorials, an email template system, newsletter integration — every task that currently needs a developer is a roadmap item.
- Don't expect them to read technical docs; their surface is the dashboard.

## Related Notes

[Storefront Developer](./Storefront%20Developer.md)
[Marketplace Vendor](./Marketplace%20Vendor.md)
[Anti-Persona - No-Code Solo Merchant](./Anti-Persona%20-%20No-Code%20Solo%20Merchant.md)
