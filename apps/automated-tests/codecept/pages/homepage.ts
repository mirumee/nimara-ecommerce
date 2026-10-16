import { locate } from "codeceptjs";

import { newsletterCopy, storeHeaders, URLS } from "../data/constants";

const { I } = inject();

const newsletterHeading = locate("h2").withText(storeHeaders.newsletter);
const newsletterEmailField = locate('input[name="email"]');
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
  newsletterEmailField,
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

  async dismissCookieBannerIfPresent() {
    const banners = await I.grabNumberOfVisibleElements(
      this.cookieAcceptButton,
    );

    if (banners > 0) {
      I.click(this.cookieAcceptButton);
      I.dontSee(storeHeaders.cookiePopup);
    }
  },

  async newsletterSectionIsPresent() {
    I.scrollPageToBottom();

    const headings = await I.grabNumberOfVisibleElements(
      this.newsletterHeading,
    );

    return headings > 0;
  },

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
