---
type: "Technical Reference"
title: "Taxes"
description: "Saleor tax handling — per-channel/per-country tax configuration, named tax classes with country rates, and flat-rate vs tax-app calculation."
tags:
  - "saleor"
  - "graphql"
  - "taxes"
  - "reference"
resource: "/sources/saleor/schema.graphql"
saleor_version: "3.23.17"
created: "2026-07-10T00:00:00+00:00"
timestamp: "2026-07-10T00:00:00+00:00"
---

## Content

> **Saleor version:** 3.23.17 — these notes are synthesized from the archived [schema.graphql](/sources/saleor/schema.graphql) at this version. Re-synthesize them if the schema is bumped to a different Saleor version.

Tax configuration per channel and per country, named `TaxClass`es with country-specific
rates, and the calculation strategy (flat rates vs. a tax app). Tax classes attach to product
types, products, and shipping methods.
(source: [schema.graphql](/sources/saleor/schema.graphql))

### Queries
- `taxConfiguration(id): TaxConfiguration` · `taxConfigurations(filter, …): TaxConfigurationCountableConnection`
- `taxClass(id): TaxClass` · `taxClasses(sortBy, filter, …): TaxClassCountableConnection`
- `taxCountryConfiguration(countryCode): TaxCountryConfiguration` · `taxCountryConfigurations: [TaxCountryConfiguration!]`
- `taxTypes: [TaxType!]` (deprecated — use `taxClasses`)

### Key types
- **TaxConfiguration** (`Node & ObjectWithMetadata`) — `channel`, `chargeTaxes`,
  `taxCalculationStrategy: TaxCalculationStrategy`, `displayGrossPrices`,
  `pricesEnteredWithTax`, `countries: [TaxConfigurationPerCountry!]`, `taxAppId`,
  `useWeightedTaxForShipping`.
- **TaxConfigurationPerCountry** — `country`, `chargeTaxes`, `taxCalculationStrategy`,
  `displayGrossPrices`, `taxAppId`.
- **TaxClass** (`Node & ObjectWithMetadata`) — `name`, `countries: [TaxClassCountryRate!]`.
- **TaxClassCountryRate** — `country`, `rate: Float`, `taxClass` (null = country default rate).
- **TaxCountryConfiguration** — `country`, `taxClassCountryRates`.

### Mutations
- Config: `taxConfigurationUpdate`.
- Classes: `taxClassCreate/Update/Delete`.
- Country rates: `taxCountryConfigurationUpdate/Delete`.
- Exemption: `taxExemptionManage`.

### Enums
- `TaxCalculationStrategy`: `FLAT_RATES`, `TAX_APP`.

### Storefront relevance
Whether prices are shown gross or net is driven by `displayGrossPrices`/`pricesEnteredWithTax`
per channel/country; storefront price display should honor these. `TAX_APP` strategy delegates
calculation to a tax app via sync webhooks (`CHECKOUT_CALCULATE_TAXES`, `ORDER_CALCULATE_TAXES`)
— relevant to the regional-tax initiative in the 2026 roadmap.

## Related Notes
[Saleor GraphQL API (MOC)](/tech/saleor/Saleor%20GraphQL%20API%20%28MOC%29.md)
[Channels](/tech/saleor/Channels.md)
[Shipping](/tech/saleor/Shipping.md)
[Products & Variants](/tech/saleor/Products%20%26%20Variants.md)
[Apps, Webhooks & Extensibility](/tech/saleor/Apps%20Webhooks%20%26%20Extensibility.md)
