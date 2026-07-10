---
type: "Technical Reference"
title: "Translations"
description: "Saleor i18n — TranslatableContent/Translation types per entity, the translation/translations queries, and the *Translate mutation family keyed by LanguageCodeEnum."
tags:
  - "saleor"
  - "graphql"
  - "i18n"
  - "translations"
  - "reference"
resource: "/sources/saleor/schema.graphql"
saleor_version: "3.23.17"
created: "2026-07-10T00:00:00+00:00"
timestamp: "2026-07-10T00:00:00+00:00"
---

## Content

> **Saleor version:** 3.23.17 — these notes are synthesized from the archived [schema.graphql](/sources/saleor/schema.graphql) at this version. Re-synthesize them if the schema is bumped to a different Saleor version.

Multi-language content. Each translatable entity has a `*TranslatableContent` object (source
fields + stored translations) and `*Translation` objects, read/written per `LanguageCodeEnum`.
(source: [schema.graphql](/sources/saleor/schema.graphql))

### Queries
- `translation(id, kind: TranslatableKinds!): TranslatableItem`
- `translations(kind: TranslatableKinds!, …): TranslatableItemConnection`
- Per-object `translation(languageCode: LanguageCodeEnum!): *Translation` fields on Product,
  Category, Collection, Attribute, Page, MenuItem, Voucher, Promotion, ShippingMethod, etc.

### Key types
- **`union TranslatableItem`** = `ProductTranslatableContent | CollectionTranslatableContent |
  CategoryTranslatableContent | AttributeTranslatableContent | AttributeValueTranslatableContent |
  ProductVariantTranslatableContent | PageTranslatableContent | ShippingMethodTranslatableContent |
  VoucherTranslatableContent | MenuItemTranslatableContent | PromotionTranslatableContent |
  PromotionRuleTranslatableContent | SaleTranslatableContent`.
- **`*TranslatableContent`** (`Node`) — source fields + `<entity>Id` + nested
  `translation(languageCode): *Translation` (e.g. `ProductTranslatableContent`: `productId`,
  `name`, `description`, `seoTitle`, `seoDescription`, `slug`).
- **`*Translation`** (`Node`) — `language: LanguageDisplay` + translated fields + back-ref
  `translatableContent`.

### Mutations
- The `*Translate` family, one per entity: `productTranslate`, `productVariantTranslate`,
  `categoryTranslate`, `collectionTranslate`, `attributeTranslate`, `attributeValueTranslate`,
  `pageTranslate`, `menuItemTranslate`, `shippingPriceTranslate`, `voucherTranslate`,
  `saleTranslate`, `promotionTranslate`, `promotionRuleTranslate`, `shopSettingsTranslate`.
  Each takes an id/identifier, `languageCode: LanguageCodeEnum!`, and a translation input.

### Enums
- `TranslatableKinds`: `ATTRIBUTE`, `ATTRIBUTE_VALUE`, `CATEGORY`, `COLLECTION`, `MENU_ITEM`,
  `PAGE`, `PRODUCT`, `PROMOTION`, `PROMOTION_RULE`, `SALE`, `SHIPPING_METHOD`, `VARIANT`, `VOUCHER`.
- `LanguageCodeEnum` — large locale list (hundreds of ISO language/region codes).

### Storefront relevance
Localized storefronts request the per-object `translation(languageCode:)` alongside the base
entity, falling back to source fields when a translation is missing.

## Related Notes
[Saleor GraphQL API (MOC)](/tech/saleor/Saleor%20GraphQL%20API%20%28MOC%29.md)
[Products & Variants](/tech/saleor/Products%20%26%20Variants.md)
[Content & Navigation](/tech/saleor/Content%20%26%20Navigation.md)
[Attributes](/tech/saleor/Attributes.md)
