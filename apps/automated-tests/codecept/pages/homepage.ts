import { locate } from "codeceptjs";

import { newsletterCopy, storeHeaders, URLS } from "../data/constants";

const { I } = inject();

/*
 * Newsletter assertions use element locators and scope every text check to the
 * section. Storefront copy is also shipped in the client message catalogue, so a
 * page-wide text assertion passes on the serialized payload even when nothing
 * rendered.
 */
const newsletterHeading = locate("h2").withText(storeHeaders.newsletter);
const newsletterEmailField = locate('input[name="email"]');
/*
 * The subscribe section sits inside another `section` on the home page, so a
 * `section` locator also matches the outer one and its links. These anchor on
 * the form and the consent paragraph instead.
 */
const newsletterForm = locate("form").withDescendant(newsletterEmailField);
const newsletterConsent = locate("p").withText(newsletterCopy.consent);

export default {
  productsCarouselHeader: {
    role: "heading",
    name: storeHeaders.productsCarousel,
  },
  exploreProductsLink: { role: "link", name: "Explore products" },
  newsletterHeading,
  newsletterForm,
  newsletterConsent,
  // The newsletter form holds the only email input on the home page.
  newsletterEmailField,
  // The name field was removed under data minimisation; it must not come back.
  newsletterNameField: locate('input[name="name"]'),
  newsletterSubmitButton: locate("button").withText(newsletterCopy.cta),
  newsletterPrivacyLink: newsletterConsent.find("a"),
  cookieAcceptButton: locate("button").withText(storeHeaders.cookieAccept),
  subscribeSuccessToast: locate("li").withText(newsletterCopy.subscribeSuccess),

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

  /**
   * The consent banner is configuration-dependent, so it is absent on some
   * deployments. Where it is present it covers the page bottom, which is where
   * the newsletter section lives.
   */
  async dismissCookieBannerIfPresent() {
    const banners = await I.grabNumberOfVisibleElements(
      this.cookieAcceptButton,
    );

    if (banners > 0) {
      I.click(this.cookieAcceptButton);
      I.dontSee(storeHeaders.cookiePopup);
    }
  },

  /**
   * The section renders only where a newsletter provider is configured, so every
   * newsletter step starts here.
   */
  seeNewsletterSection(timeout: number) {
    I.scrollPageToBottom();
    I.waitForElement(this.newsletterHeading, timeout);
  },

  seeNewsletterPurposeAndSingleField() {
    I.seeElement(this.newsletterConsent);
    I.seeElement(this.newsletterEmailField);
    I.dontSeeElement(this.newsletterNameField);
    I.seeElement(this.newsletterPrivacyLink);
  },

  openPrivacyPolicyFromNewsletter(timeout: number) {
    I.click(this.newsletterPrivacyLink);
    I.waitInUrl(URLS.PRIVACY_POLICY_PAGE, timeout);
  },

  submitNewsletterAddress(email: string) {
    I.fillField(this.newsletterEmailField, email);
    I.click(this.newsletterSubmitButton);
  },

  seeAddressRejectedInForm(timeout: number) {
    I.waitForText(newsletterCopy.invalidEmail, timeout, this.newsletterForm);
    I.dontSeeElement(this.subscribeSuccessToast);
  },
};
