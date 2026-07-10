---
type: "Technical Reference"
title: "Attributes"
description: "Saleor's typed metadata system — Attribute and AttributeValue definitions assigned to product types and page types, then selected on products, variants, and pages."
tags:
  - "saleor"
  - "graphql"
  - "catalog"
  - "attributes"
  - "reference"
resource: "/sources/saleor/schema.graphql"
saleor_version: "3.23.17"
created: "2026-07-10T00:00:00+00:00"
timestamp: "2026-07-10T00:00:00+00:00"
---

## Content

> **Saleor version:** 3.23.17 — these notes are synthesized from the archived [schema.graphql](/sources/saleor/schema.graphql) at this version. Re-synthesize them if the schema is bumped to a different Saleor version.

Typed metadata definitions (`Attribute`) and their possible/assigned values
(`AttributeValue`), attached to product types / page types and then selected on products,
variants, and pages. This is how the catalog gets structured, filterable properties
(color, size, material, spec sheets).
(source: [schema.graphql](/sources/saleor/schema.graphql))

### Queries
- `attribute(id, slug, externalReference): Attribute`
- `attributes(filter, where, search, sortBy, …): AttributeCountableConnection`

### Key types
- **Attribute** (`Node & ObjectWithMetadata`) — `name`, `slug`, `type: AttributeTypeEnum`,
  `inputType: AttributeInputTypeEnum`, `entityType: AttributeEntityTypeEnum`,
  `unit: MeasurementUnitsEnum`, `choices`, `valueRequired`, `visibleInStorefront`,
  `filterableInDashboard`, `referenceTypes`, `productTypes`.
- **AttributeValue** (`Node`) — `name`, `slug`, `value`, `inputType`, and type-specific
  payloads: `reference: ID`, `file: File`, `richText: JSONString`, `plainText`, `boolean`,
  `date`, `dateTime`.
- **SelectedAttribute** — an assignment as seen on a product/variant: `attribute` + `values`
  (returned by the deprecated `attributes` fields).
- **AssignedAttribute** — the newer assignment type returned by `assignedAttributes`.
- **AssignedVariantAttribute** — `attribute` + `variantSelection: Boolean!` (whether it
  distinguishes variants).

### Mutations
- Definitions: `attributeCreate/Update/Delete`, `attributeBulkCreate/BulkUpdate/BulkDelete`,
  `attributeReorderValues`, `attributeTranslate`.
- Values: `attributeValueCreate/Update/Delete`, `attributeValueBulkDelete`, `attributeValueTranslate`.
- Assignment to product types: `productAttributeAssign`, `productAttributeAssignmentUpdate`,
  `productAttributeUnassign` (page-type assignment via page-type mutations — see
  [Content & Navigation](/tech/saleor/Content%20%26%20Navigation.md)).

### Enums
- `AttributeInputTypeEnum`: `DROPDOWN`, `MULTISELECT`, `FILE`, `REFERENCE`, `SINGLE_REFERENCE`,
  `NUMERIC`, `RICH_TEXT`, `PLAIN_TEXT`, `SWATCH`, `BOOLEAN`, `DATE`, `DATE_TIME`.
- `AttributeTypeEnum`: `PRODUCT_TYPE`, `PAGE_TYPE`.
- `AttributeEntityTypeEnum` (reference targets): `PAGE`, `PRODUCT`, `PRODUCT_VARIANT`,
  `CATEGORY`, `COLLECTION`.
- `MeasurementUnitsEnum`: large unit-of-measure list (used with `NUMERIC` attributes).

### Unions / interfaces
- `union ReferenceType = ProductType | PageType` — narrows reference-attribute choices.

### Storefront relevance
Attributes drive faceted filtering on the PLP and spec display on the PDP. Prefer the newer
`assignedAttributes` over the deprecated `attributes`/`SelectedAttribute` fields when reading.

## Related Notes
[Saleor GraphQL API (MOC)](/tech/saleor/Saleor%20GraphQL%20API%20%28MOC%29.md)
[Products & Variants](/tech/saleor/Products%20%26%20Variants.md)
[Content & Navigation](/tech/saleor/Content%20%26%20Navigation.md)
[Translations](/tech/saleor/Translations.md)
