import { type CMSPage } from "@nimara/domain/objects/CMSPage";

/** Same-origin placeholder asset (next/image only allows saleor.cloud / buttercms hosts). */
const BANNER_IMAGE_URL = "/og-hp.png";

/**
 * Sample CMS pages keyed by slug. The `home` entry's fields mirror the slugs the
 * storefront home components read (see packages/features/src/home-page).
 */
export const SAMPLE_PAGES: Record<string, CMSPage> = {
  home: {
    id: "dummy-home",
    title: "Welcome to Nimara",
    content: null,
    pageTypeSlug: "homepage",
    fields: [
      { slug: "homepage-banner-header", text: "Dummy storefront, real layout" },
      { slug: "homepage-banner-button-text", text: "Browse products" },
      { slug: "homepage-banner-image", imageUrl: BANNER_IMAGE_URL },
      { slug: "homepage-grid-item-header", text: "Featured" },
      { slug: "homepage-grid-item-subheader", text: "Sample picks for you" },
      { slug: "homepage-button-text", text: "Shop all" },
      { slug: "homepage-grid-item-header-font-color", text: "#111111" },
      { slug: "homepage-grid-item-subheader-font-color", text: "#444444" },
      { slug: "homepage-grid-item-image", imageUrl: BANNER_IMAGE_URL },
      { slug: "carousel-products", reference: [] },
    ],
  },
  about: {
    id: "dummy-about",
    title: "About",
    content:
      "<p>This is dummy content rendered by the built-in demo CMS provider.</p>",
    pageTypeSlug: "static_page",
    fields: [],
  },
  terms: {
    id: "dummy-terms",
    title: "Terms & Conditions",
    content:
      "<p>Sample terms served by the dummy CMS provider for local development.</p>",
    pageTypeSlug: "static_page",
    fields: [],
  },
};
