import { storeHeaders, timeout_seconds } from "./data/constants";

Feature("Guest Checkout - positive");

Scenario(
  "Full process from entry to checkout and payment (proceed to the cart through the 'item added to cart' popup)",
  async ({ I, homepagePage, productPage, cartPage, checkoutPage }) => {
    homepagePage.enter_page();
    homepagePage.accept_cookies();
    homepagePage.click_on_product1(timeout_seconds);
    productPage.add_example_tshirt_to_cart(timeout_seconds);
    productPage.click_go_to_bag_popup(timeout_seconds);
    cartPage.go_to_checkout_from_bag(timeout_seconds);
    checkoutPage.continue_as_guest(timeout_seconds);
    checkoutPage.guest_step1_email(timeout_seconds);
    await checkoutPage.guest_step2_continue_as_guest();
    checkoutPage.guest_step3_shipping_address(timeout_seconds);
    checkoutPage.guest_step4_shipping_method_dhl_normal(timeout_seconds);
    checkoutPage.guest_step5_payment_details("valid", timeout_seconds);
    checkoutPage.click_place_order(timeout_seconds);
    I.waitForText(storeHeaders.orderSuccess, timeout_seconds);
  },
);

Scenario(
  "Full process from entry to checkout and payment (proceed to the cart through the menu button)",
  async ({ I, homepagePage, productPage, cartPage, checkoutPage }) => {
    homepagePage.enter_page();
    homepagePage.accept_cookies();
    homepagePage.click_on_product1(timeout_seconds);
    productPage.add_example_tshirt_to_cart(timeout_seconds);
    productPage.go_to_bag(timeout_seconds);
    cartPage.go_to_checkout_from_bag(timeout_seconds);
    checkoutPage.continue_as_guest(timeout_seconds);
    checkoutPage.guest_step1_email(timeout_seconds);
    await checkoutPage.guest_step2_continue_as_guest();
    checkoutPage.guest_step3_shipping_address(timeout_seconds);
    checkoutPage.guest_step4_shipping_method_dhl_normal(timeout_seconds);
    checkoutPage.guest_step5_payment_details("valid", timeout_seconds);
    checkoutPage.click_place_order(timeout_seconds);
    I.waitForText(storeHeaders.orderSuccess, timeout_seconds);
  },
);

Scenario(
  "Full process from entry to checkout and payment  - 2 items (proceed to the cart through the menu button)",
  async ({ I, homepagePage, productPage, cartPage, checkoutPage }) => {
    homepagePage.enter_page();
    homepagePage.accept_cookies();
    homepagePage.click_on_product1(timeout_seconds);
    productPage.add_example_tshirt_to_cart(timeout_seconds);
    homepagePage.click_on_product2(timeout_seconds);
    productPage.add_black_sand_to_cart(timeout_seconds);
    productPage.go_to_bag(timeout_seconds);
    cartPage.go_to_checkout_from_bag(timeout_seconds);
    checkoutPage.continue_as_guest(timeout_seconds);
    checkoutPage.guest_step1_email(timeout_seconds);
    await checkoutPage.guest_step2_continue_as_guest();
    checkoutPage.guest_step3_shipping_address(timeout_seconds);
    checkoutPage.guest_step4_shipping_method_dhl_normal(timeout_seconds);
    checkoutPage.guest_step5_payment_details("valid", timeout_seconds);
    checkoutPage.click_place_order(timeout_seconds);
    I.waitForText(storeHeaders.orderSuccess, timeout_seconds);
  },
);

Feature("Guest Checkout - negative");

Scenario(
  "Full process from entry to checkout and payment (proceed to the cart through the menu button) - fraudulent/stolen card",
  async ({ I, homepagePage, productPage, cartPage, checkoutPage }) => {
    homepagePage.enter_page();
    homepagePage.accept_cookies();
    homepagePage.click_on_product1(timeout_seconds);
    productPage.add_example_tshirt_to_cart(timeout_seconds);
    productPage.go_to_bag(timeout_seconds);
    cartPage.go_to_checkout_from_bag(timeout_seconds);
    checkoutPage.continue_as_guest(timeout_seconds);
    checkoutPage.guest_step1_email(timeout_seconds);
    await checkoutPage.guest_step2_continue_as_guest();
    checkoutPage.guest_step3_shipping_address(timeout_seconds);
    checkoutPage.guest_step4_shipping_method_dhl_normal(timeout_seconds);
    checkoutPage.guest_step5_payment_details("stolen", timeout_seconds);
    checkoutPage.click_place_order(timeout_seconds);
    I.waitForText(storeHeaders.cardDeclined, timeout_seconds);
  },
);

Scenario(
  "Full process from entry to checkout and payment (proceed to the cart through the menu button) - expired card",
  async ({ I, homepagePage, productPage, cartPage, checkoutPage }) => {
    homepagePage.enter_page();
    homepagePage.accept_cookies();
    homepagePage.click_on_product1(timeout_seconds);
    productPage.add_example_tshirt_to_cart(timeout_seconds);
    productPage.go_to_bag(timeout_seconds);
    cartPage.go_to_checkout_from_bag(timeout_seconds);
    checkoutPage.continue_as_guest(timeout_seconds);
    checkoutPage.guest_step1_email(timeout_seconds);
    await checkoutPage.guest_step2_continue_as_guest();
    checkoutPage.guest_step3_shipping_address(timeout_seconds);
    checkoutPage.guest_step4_shipping_method_dhl_normal(timeout_seconds);
    checkoutPage.guest_step5_payment_details("expired", timeout_seconds);
    checkoutPage.click_place_order(timeout_seconds);
    I.waitForText(storeHeaders.cardDeclined, timeout_seconds);
  },
);
