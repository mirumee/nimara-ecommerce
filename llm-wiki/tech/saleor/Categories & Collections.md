---
type: "Technical Reference"
title: "Categories & Collections"
description: "Saleor's catalog navigation — the hierarchical Category tree and curated, per-channel-published Collections."
tags:
  - "saleor"
  - "graphql"
  - "catalog"
  - "categories"
  - "collections"
  - "reference"
resource: "/sources/saleor/schema.graphql"
saleor_version: "3.23.17"
created: "2026-07-10T00:00:00+00:00"
timestamp: "2026-07-10T00:00:00+00:00"
---

## Content

> **Saleor version:** 3.23.17 — these notes are synthesized from the archived [schema.graphql](/sources/saleor/schema.graphql) at this version. Re-synthesize them if the schema is bumped to a different Saleor version.

Two ways to group products. `Category` is a hierarchical taxonomy (tree via
`parent`/`children`/`ancestors`/`level`) that each product belongs to. `Collection` is a
curated, per-channel-publishable grouping, controlled by `CollectionChannelListing`.
(source: [schema.graphql](/sources/saleor/schema.graphql))

### Queries
- `category(id, slug): Category` · `categories(filter, where, sortBy, level, …): CategoryCountableConnection`
- `collection(id, slug, channel): Collection` · `collections(filter, where, sortBy, channel, …): CollectionCountableConnection`

### Key types
- **Category** (`Node & ObjectWithMetadata`) — `name`, `slug`, `description: JSONString`,
  `seoTitle`, `seoDescription`, `level`, `parent`, `ancestors`, `children`,
  `products(…, channel): ProductCountableConnection`, `backgroundImage`, `translation`.
- **Collection** (`Node & ObjectWithMetadata`) — `name`, `slug`, `description`, `seoTitle`,
  `seoDescription`, `products(…): ProductCountableConnection`, `channelListings`,
  `backgroundImage`, `translation`.
- **CollectionChannelListing** (`Node`) — `channel`, `isPublished`, `publishedAt`.

### Mutations
- Category: `categoryCreate/Update/Delete/BulkDelete`, `categoryTranslate`.
- Collection: `collectionCreate/Update/Delete/BulkDelete`, `collectionAddProducts`,
  `collectionRemoveProducts`, `collectionReorderProducts`, `collectionChannelListingUpdate`,
  `collectionTranslate`.

### Enums
- `CollectionPublished` (filter): `PUBLISHED`, `HIDDEN`.

### Storefront relevance
Categories power the primary browse tree and breadcrumb; collections power merchandising
(featured, seasonal). Collection visibility is per-channel — read `collection(slug, channel)`
and expect a collection to be absent/hidden in channels where it isn't published.

## Related Notes
[Saleor GraphQL API (MOC)](/tech/saleor/Saleor%20GraphQL%20API%20%28MOC%29.md)
[Products & Variants](/tech/saleor/Products%20%26%20Variants.md)
[Channels](/tech/saleor/Channels.md)
[Content & Navigation](/tech/saleor/Content%20%26%20Navigation.md)
