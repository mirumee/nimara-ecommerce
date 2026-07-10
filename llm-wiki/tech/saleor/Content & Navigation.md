---
type: "Technical Reference"
title: "Content & Navigation"
description: "Saleor's CMS and storefront navigation — Pages typed by PageType with attributes/rich text, and Menu/MenuItem trees linking to categories, collections, and pages."
tags:
  - "saleor"
  - "graphql"
  - "cms"
  - "pages"
  - "menus"
  - "reference"
resource: "/sources/saleor/schema.graphql"
saleor_version: "3.23.17"
created: "2026-07-10T00:00:00+00:00"
timestamp: "2026-07-10T00:00:00+00:00"
---

## Content

> **Saleor version:** 3.23.17 — these notes are synthesized from the archived [schema.graphql](/sources/saleor/schema.graphql) at this version. Re-synthesize them if the schema is bumped to a different Saleor version.

Editorial/static content and storefront navigation. `Page`s are CMS documents typed by
`PageType` (which, like a product type, defines their attribute set) with rich-text `content`.
`Menu` → `MenuItem` trees power navigation, each item linking to a category, collection, page,
or raw URL.
(source: [schema.graphql](/sources/saleor/schema.graphql))

### Queries
- `page(id, slug, channel): Page` · `pages(sortBy, filter, where, search, channel, …): PageCountableConnection`
- `pageType(id): PageType` · `pageTypes(sortBy, filter, …): PageTypeCountableConnection`
- `menu(id, name, slug, channel): Menu` · `menus(…): MenuCountableConnection`
- `menuItem(id, channel): MenuItem` · `menuItems(…): MenuItemCountableConnection`

### Key types
- **Page** (`Node & ObjectWithMetadata & ObjectWithAttributes`) — `title`, `slug`,
  `content: JSONString` (EditorJS), `isPublished`, `publishedAt`, `pageType`, `seoTitle`,
  `seoDescription`, `assignedAttributes` (+ deprecated `attributes`), `translation`.
- **PageType** (`Node & ObjectWithMetadata`) — `name`, `slug`, `attributes`,
  `availableAttributes`, `hasPages`.
- **Menu** (`Node & ObjectWithMetadata`) — `name`, `slug`, `items: [MenuItem!]`.
- **MenuItem** (`Node & ObjectWithMetadata`) — `name`, `menu`, `parent`, `level`, `children`,
  and exactly one target of `category` / `collection` / `page` / `url`, `translation`.

### Mutations
- Page: `pageCreate/Update/Delete/BulkDelete/BulkPublish`, `pageTranslate`,
  `pageAttributeAssign/Unassign`, `pageReorderAttributeValues`.
- PageType: `pageTypeCreate/Update/Delete/BulkDelete`, `pageTypeReorderAttributes`.
- Menu: `menuCreate/Update/Delete/BulkDelete`.
- MenuItem: `menuItemCreate/Update/Delete/BulkDelete/Move`, `menuItemTranslate`.

### Storefront relevance
Menus drive header/footer navigation — read `menu(slug, channel)` and walk `items`/`children`,
resolving each item's `category`/`collection`/`page`/`url`. Pages back static/marketing
content (about, policies), rendered from `content` (rich text) plus page-type attributes.

## Related Notes
[Saleor GraphQL API (MOC)](/tech/saleor/Saleor%20GraphQL%20API%20%28MOC%29.md)
[Attributes](/tech/saleor/Attributes.md)
[Categories & Collections](/tech/saleor/Categories%20%26%20Collections.md)
[Translations](/tech/saleor/Translations.md)
