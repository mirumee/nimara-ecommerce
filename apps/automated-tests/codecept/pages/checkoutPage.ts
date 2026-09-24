import { locate } from "codeceptjs";

import {
  card as cardConstants,
  customer,
  timeoutSeconds,
  URLS,
} from "../data/constants";
import { REQUESTED_LOCALE } from "../data/locales";

const { I } = inject();

// payment card data sourced from constants
const card = cardConstants;

export default {
  continueAsGuest(timeout: number = timeoutSeconds) {
    I.waitForElement(locate("a").withText("Continue as a guest"), timeout);
    I.click({ role: "link", name: "Continue as a guest" });
    I.waitInUrl(URLS.CHECKOUT_PAGE_USER_DETAILS, timeout);
  },

  enterGuestEmail(timeout: number = timeoutSeconds) {
    I.waitForElement('input[aria-label="Email"]', timeout);
    I.fillField({ role: "textbox", name: "Email" }, customer.email);
    I.click({ role: "button", name: "Continue" });
    I.waitToHide('input[aria-label="Email"]', timeout);
  },
  async confirmContinueAsGuestIfPrompted() {
    const count = await I.grabNumberOfVisibleElements({
      role: "button",
      name: "Continue as a guest",
    });

    if (count > 0) {
      console.log("Continue as guest button is visible, clicking it.");
      I.click({ role: "button", name: "Continue as a guest" });
    }
  },
  fillShippingAddress(timeout: number = timeoutSeconds) {
    I.waitInUrl(URLS.CHECKOUT_PAGE_SHIPPING_ADDRESS, timeout);
    I.waitForElement('input[aria-label="First Name"]', timeout);
    I.fillField({ role: "textbox", name: "First Name" }, customer.firstName);
    I.fillField({ role: "textbox", name: "Last Name" }, customer.lastName);
    I.fillField(
      { role: "textbox", name: "Company name" },
      customer.companyName,
    );
    I.fillField(
      { role: "textbox", name: "Street address" },
      customer.streetAddress,
    );
    I.fillField({ role: "textbox", name: "Phone" }, customer.phone);
    I.scrollPageToBottom();

    // Locale specific form filling
    switch (REQUESTED_LOCALE?.toLowerCase()) {
      case "gb":
        I.fillField({ role: "textbox", name: "Post town" }, customer.city);
        I.fillField({ role: "textbox", name: "Postal" }, customer.zip);
        break;

      case "us":
        // 'State' combobox exists only for some locales (e.g., US). Fill it conditionally.
        I.fillField({ role: "textbox", name: "City" }, customer.city);
        I.fillField({ role: "textbox", name: "Zip" }, customer.zip);
        I.click({ role: "combobox", name: "State" });
        I.click(customer.state as string);
        break;

      default:
        console.warn(
          `No specific form filling logic for locale: ${REQUESTED_LOCALE}`,
        );
        break;
    }
    I.click("Continue");
  },

  selectDhlNormalShippingMethod(timeout: number = timeoutSeconds) {
    I.waitInUrl(URLS.CHECKOUT_PAGE_DELIVERY_METHOD, timeout);
    const dhlNormalOption = locate("label").withText("DHL Normal");

    I.waitForVisible(dhlNormalOption, timeout);
    I.click(dhlNormalOption);
    I.click("Continue");
  },

  fillPaymentDetails(
    cardCharacteristics:
      "valid" | "invalid" | "stolen" | "declined" | "expired",
    timeout: number = timeoutSeconds,
  ) {
    I.waitInUrl(URLS.CHECKOUT_PAGE_PAYMENT, timeout);
    I.scrollPageToBottom();
    I.waitForElement(
      locate('iframe[title*="Secure payment input frame"]').first(),
      timeout,
    );
    I.switchTo(locate('iframe[title*="Secure payment input frame"]').first());
    I.waitForVisible('div[class="p-PaymentAccordionButtonView"]', timeout);
    const cardNumber = card.number[cardCharacteristics] || card.number.valid;

    I.fillField("Card number", cardNumber);
    I.fillField("MM / YY", card.expiration);
    I.fillField("Security code", card.CVC);
    I.switchTo();
  },

  clickPlaceOrder(timeout: number = timeoutSeconds) {
    I.click({ role: "button", name: "Place order" });
  },
  clickBillingAddressSameAsShippingCheckbox(timeout: number = timeoutSeconds) {
    I.waitForClickable(
      { role: "checkbox", name: "Same as shipping address" },
      timeout,
    );
    I.click({ role: "checkbox", name: "Same as shipping address" });
  },
};
