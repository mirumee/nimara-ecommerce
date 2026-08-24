---
type: "Product Capability"
title: "Storefront Discovery and Cart"
description: "Shoppers can discover products through search, collections, product and vendor pages, then maintain a standard or vendor-aware cart."
tags:
  - "capability"
  - "storefront"
  - "catalog"
  - "search"
  - "cart"
created: "2026-07-21T00:00:00+00:00"
status: "active"
owner: "product-and-engineering"
relations:
  integrations:
    - "[Search Provider Selection](../integrations/INT-0001%20Search%20Provider%20Selection.md)"
    - "[Saleor Commerce Backend](../integrations/INT-0006%20Saleor%20Commerce%20Backend.md)"
availability:
  since: "v2.0.0"
  deprecated_since: null
---

# Behavior

The storefront exposes a region-aware catalog journey. The home surface can feature product
results, while the search surface accepts a text query, facets, sorting, limits, and cursor or page
navigation. Collection pages combine collection content with a paginated product list. Product
detail pages show localized product data, media, regional price and availability, selectable
variants and attributes, related products, and an add-to-cart action.

When marketplace mode is enabled, a product can show its vendor and link to a vendor storefront.
That storefront combines vendor branding from an active vendor-profile page with a product listing
scoped by vendor metadata. The product detail and cart views also expose vendor context.

Adding an available variant creates a backend cart when necessary or appends a line to the existing
cart. Shoppers can change quantities, remove lines, see stock or variant problems, and continue to
checkout only while the cart is valid. Standard mode maintains one cart. Marketplace mode maintains
separate cart identifiers per vendor, then aggregates their lines, prices, problems, and vendor
labels into one cart view while routing each mutation back to the owning cart.

# Actors

- Guest shoppers and authenticated customers browse the catalog and maintain carts.
- Marketplace shoppers can move between a product, its vendor storefront, and a vendor-grouped
  cart.
- Storefront operators configure the region, catalog channel, search provider, and optional
  marketplace mode.

# Inputs and outputs

- Locale and region select language, channel, country, currency, pricing, and availability.
- Search inputs include query text, selected facets, sort order, result limit, and pagination
  cursors; outputs include product cards, facets, sort options, and page information.
- The offered facets are scoped to the browsed categories and collections, so a category surface
  proposes only the attributes its products carry rather than every storefront attribute.
- Alongside the attribute facets, the search surface offers category and collection filters built
  from the catalog itself rather than from product attributes that mirror it, so a category or
  collection becomes filterable as soon as it exists. The category choices are the root categories;
  the collection choices are the channel's collections excluding vendor-owned ones, because the
  marketplace mints one collection per vendor. A category surface omits the category filter, because
  the page itself is already the category scope.
- Settling a facet dropdown — closing it, or removing a selected value from its collapsed
  trigger — re-reads the offered facets for the selections made so far, so the filters menu
  narrows before the shopper applies them. A filter that the narrowed set no longer offers is
  dropped from the applied filters when the menu is submitted.
- Collection and product slugs resolve the corresponding catalog detail; a vendor slug resolves an
  active vendor-profile page and its vendor metadata identifier.
- A selected variant, quantity, and optional current cart identifier produce an updated cart
  identifier and line state.
- Cart line quantity and deletion actions return structured success or provider errors and refresh
  the affected cart.

# Constraints and failure behavior

- Search behavior follows the selected search provider. A failed search, facet, or sort-options
  request currently renders the corresponding result as empty rather than presenting a dedicated
  upstream-error state.
- Facet scoping needs a category or collection to narrow against. A text query alone offers every
  storefront attribute on the Saleor provider, which derives facets from the catalog rather than
  from the matched products.
- Missing or unreadable collection and product details resolve to the storefront not-found state.
- Vendor storefronts exist only when marketplace mode is enabled and a vendor-profile page has an
  identifier, the expected page type, and `vendor-status=active`; publish or draft state is not the
  visibility gate.
- Vendor product isolation depends on the selected search provider honoring the fixed product
  metadata filter. The current Algolia adapter discards that filter, so it does not enforce vendor
  scoping; the Saleor search adapter does.
- An unconfigured commerce backend prevents real collection, product, cart, and vendor behavior
  even when a sample or alternate search provider can still render search results.
- Marketplace aggregation ignores a vendor cart that cannot be loaded or has no lines. Vendor-name
  lookup failures leave the backend vendor identifier as the cart label fallback.
- Insufficient stock and unavailable variants block progression to checkout. Line-mutation failures
  remain in the cart and are surfaced through structured error toasts.
