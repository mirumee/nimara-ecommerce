import { storeHeaders,timeout_seconds  } from "./data/constants";

export {};

Feature("Guest Checkout");

Scenario(
  "Full process from entry to checkout and payment - positive",
  async ({ I, homepagePage, productPage, bagPage, checkoutPage }) => {
    homepagePage.enter_page();
    homepagePage.accept_cookies();
    homepagePage.click_on_product(timeout_seconds);
    productPage.add_example_tshirt_to_cart(timeout_seconds);
    productPage.click_go_to_bag_popup(timeout_seconds);
    //productPage.go_to_bag(timeout_seconds);
    bagPage.go_to_checkout_from_bag(timeout_seconds);
    checkoutPage.continue_as_guest(timeout_seconds);
    checkoutPage.guest_step1_email(timeout_seconds);
    await checkoutPage.guest_step2_continue_as_guest(timeout_seconds);
    checkoutPage.guest_step3_shipping_address(timeout_seconds);
    checkoutPage.guest_step4_shipping_method_dhl_normal(timeout_seconds);
    checkoutPage.guest_step5_payment_details("valid", timeout_seconds);
    checkoutPage.click_place_order(timeout_seconds);
    I.waitForText(storeHeaders.orderSuccess, timeout_seconds);
  },
);
