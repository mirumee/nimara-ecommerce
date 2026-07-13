---
type: "Technical Reference"
title: "Saleor CMS"
description: "Managing the Nimara storefront's homepage, navigation, footer, and static pages through Saleor content — the required homepage attributes, page types, and menus."
tags:
  - "nimara"
  - "cms"
  - "content"
  - "navigation"
  - "reference"
resource: "/sources/nimara-docs/saleor-cms.mdx"
nimara_version: "2.0.x"
created: "2026-07-13T00:00:00+00:00"
timestamp: "2026-07-13T00:00:00+00:00"
---

## Content

> **Nimara version:** 2.0.x — these notes are synthesized from the archived [Nimara platform docs](/sources/nimara-docs/saleor-cms.mdx) at this version. Re-synthesize them if the docs are bumped to a different Nimara version.

Saleor CMS manages the storefront's **homepage**, **footer**, and **navigation** (source: [saleor-cms](/sources/nimara-docs/saleor-cms.mdx)). It builds on Saleor [Attributes](/tech/saleor/Attributes.md), page types, and [menus](/tech/saleor/Content%20%26%20Navigation.md).

### Homepage
The homepage is content-driven and relies on specific attributes. Create these attributes (Configuration → Attributes and Product Types → Attributes):

- **Carousel products** — up to 8 products in the homepage carousel.
- **Homepage banner header / banner button text / banner image** — the banner section's header, button label, and background image.
- **Homepage button text** — button text at the page bottom.
- **Homepage grid item header / subheader** and their **font color** — text and colors on featured carousel elements.
- **Homepage grid item image** — background image of a featured carousel element.

Then create a **Page Type** named **Homepage** (Configuration → Content Management → Page Types) and assign all these attributes to it. Finally create the actual homepage content (Content → Create content → select **Homepage** page type → fill attributes).

### Navigation & footer
Configuration → Miscellaneous → Navigation → Create menu:

- Name one menu **navbar** for the header navigation.
- Name another **footer** for the footer links.

Menu items can link to a **Category**, **Collection**, **Static Page** (a page created under Content), or a **URL** (external or internal).

### Static pages
For standalone content ("About Us", "Contact"). Unlike the Homepage page type, a **Static page** page type needs **no attributes**. Create a **Static page** page type, then create content with a **Title**, **Slug** (determines the URL, e.g. `/about-us`), and rich-text **Content**.

## Related Notes
[Nimara Platform (MOC)](/tech/nimara/Nimara%20Platform%20%28MOC%29.md)
[Storefront](/tech/nimara/Storefront.md)
[Content & Navigation](/tech/saleor/Content%20%26%20Navigation.md)
[Attributes](/tech/saleor/Attributes.md)
