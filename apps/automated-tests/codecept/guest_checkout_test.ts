import timeoutData from "./data/timeout.json";

export {};

Feature("Guest Checkout");
const testTimeout = timeoutData.timeout;

Scenario(
  "Full process from entry to checkout and payment - positive",
  async ({ I, homepagePage, productPage, bagPage, checkoutPage }) => {
    homepagePage.enter_page();
    homepagePage.accept_cookies();
    homepagePage.click_on_product(testTimeout);
    productPage.add_example_tshirt_to_cart(testTimeout);
    productPage.click_go_to_bag_popup(testTimeout);
    //productPage.go_to_bag(testTimeout);
    bagPage.go_to_checkout_from_bag(testTimeout);
    checkoutPage.continue_as_guest(testTimeout);
    checkoutPage.guest_step1_email(testTimeout);
    await checkoutPage.guest_step2_continue_as_guest(testTimeout);
    checkoutPage.guest_step3_shipping_address(testTimeout);
    checkoutPage.guest_step4_shipping_method_dhl_normal(testTimeout);
    checkoutPage.guest_step5_payment_details("valid", testTimeout);
    checkoutPage.click_place_order(testTimeout);
    I.waitForText("Your order has been successfully placed", testTimeout);
  },
);
