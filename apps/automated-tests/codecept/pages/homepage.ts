import { storeHeaders, URLS } from "../data/constants";

const { I } = inject();

export default {
  productsCarouselHeader: {
    role: "heading",
    name: storeHeaders.productsCarousel,
  },
  exploreProductsLink: { role: "link", name: "Explore products" },

  open() {
    I.amOnPage(URLS.HOME_PAGE);
  },

  seeStorefrontLoaded() {
    I.seeInTitle("Nimara Storefront");
    I.seeElement(this.productsCarouselHeader);
  },

  openProductListing() {
    I.click(this.exploreProductsLink);
    // Client-side App Router navigation, so wait rather than assert immediately.
    I.waitInUrl(URLS.PRODUCTS_PAGE, 10);
  },
};
