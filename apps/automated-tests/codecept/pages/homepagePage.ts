import {
  clothingImageLocator,
  musicRecordImageLocator,
  storeHeaders,
  URLS,
} from "../data/constants";

const { I } = inject();

export default {
  productsCarouselHeader: {
    role: "heading",
    name: storeHeaders.productsCarousel,
  },
  exploreProductsLink: { role: "link", name: "Explore products" },

  enterPage() {
    I.amOnPage(URLS.HOME_PAGE);
  },
  acceptCookies() {
    I.click(storeHeaders.cookieAccept);
    I.dontSee(storeHeaders.cookiePopup);
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
  clickOnProduct1(timeout: number) {
    I.scrollTo(clothingImageLocator);
    I.click(clothingImageLocator);
    I.waitUrlEquals(URLS.CLOTHING_PRODUCT_PAGE, timeout);
  },
  clickOnProduct2(timeout: number) {
    I.waitForText(storeHeaders.productAddedToCart, timeout); //wait until previous product is added to cart before proceeding
    I.amOnPage(URLS.HOME_PAGE);
    I.scrollTo(musicRecordImageLocator);
    I.click(musicRecordImageLocator);
    I.waitInUrl(URLS.MUSIC_RECORD_PRODUCT_PAGE, timeout);
  },
};
