import { locate } from "codeceptjs";

import {
  card as cardConstants,
  timeout_seconds,
  URLS,
  userGB,
  userUS,
} from "../data/constants";
import { REQUESTED_LOCALE } from "../data/locales";

const { I } = inject();
// select locale-specific user data from constants
const selectedUser = REQUESTED_LOCALE === "us" ? userUS : userGB;
const customer = {
  firstName: selectedUser.name,
  lastName: selectedUser.lastName,
  companyName: selectedUser.companyName,
  email: selectedUser.email,
  city: selectedUser.city,
  zip: selectedUser.postCode,
  phone: selectedUser.phone,
  streetAddress: selectedUser.streetAddress,
  state: selectedUser.state || "",
};

// payment card data sourced from constants
const card = cardConstants;

export default {
  continue_as_guest(timeout: number = timeout_seconds) {
    I.waitForElement(locate("a").withText("Continue as a guest"), timeout);
    I.click({ role: "link", name: "Continue as a guest" });
    I.waitInUrl(URLS.CHECKOUT_PAGE_USER_DETAILS, timeout);
  },

  guest_step1_email(timeout: number = timeout_seconds) {
    I.waitForElement('input[aria-label="Email"]', timeout);
    I.fillField({ role: "textbox", name: "Email" }, customer.email);
    I.click({ role: "button", name: "Continue" });
    I.waitToHide('input[aria-label="Email"]', timeout);
  },
  async guest_step2_continue_as_guest() {
    const count = await I.grabNumberOfVisibleElements({
      role: "button",
      name: "Continue as a guest",
    });

    if (count > 0) {
      console.log(
        "Guest checkout step 2: Continue as guest button is visible, clicking it.",
      );
      I.click({ role: "button", name: "Continue as a guest" });
    }
  },
  guest_step3_shipping_address(timeout: number = timeout_seconds) {
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

  guest_step4_shipping_method_dhl_normal(timeout: number = timeout_seconds) {
    I.waitInUrl(URLS.CHECKOUT_PAGE_DELIVERY_METHOD, timeout);
    const dhlNormalOption = locate("label").withText("DHL Normal");

    I.waitForVisible(dhlNormalOption, timeout);
    I.click(dhlNormalOption);
    I.click("Continue");
  },

  guest_step5_payment_details(
    card_characteristics:
      | "valid"
      | "invalid"
      | "stolen"
      | "declined"
      | "expired",
    timeout: number = timeout_seconds,
  ) {
    I.waitInUrl(URLS.CHECKOUT_PAGE_PAYMENT, timeout);
    I.scrollPageToBottom();
    I.waitForElement(
      locate('iframe[title*="Secure payment input frame"]').first(),
      timeout,
    );
    I.switchTo(locate('iframe[title*="Secure payment input frame"]').first());
    I.waitForVisible('div[class="p-PaymentAccordionButtonView"]', timeout);
    const cardNumber = card.number[card_characteristics] || card.number.valid;

    I.fillField("Card number", cardNumber);
    I.fillField("MM / YY", card.expiration);
    I.fillField("Security code", card.CVC);
    I.switchTo();
  },

  click_place_order(timeout: number = timeout_seconds) {
    I.waitForClickable({ role: "button", name: "Place order" }, timeout);
    I.click({ role: "button", name: "Place order" });
  },
  click_billing_address_same_as_shipping_checkbox(
    timeout: number = timeout_seconds,
  ) {
    I.waitForClickable(
      { role: "checkbox", name: "Same as shipping address" },
      timeout,
    );
    I.click({ role: "checkbox", name: "Same as shipping address" });
  },
};
