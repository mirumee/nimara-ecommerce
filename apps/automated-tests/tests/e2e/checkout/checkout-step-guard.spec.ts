import { test } from "fixtures/fixtures";
import {
  digitalProduct,
  product,
  user,
  userEmail,
  userPassword,
} from "utils/constants";

test.describe("Checkout step guard, guest shopper", () => {
  test.beforeEach(async ({ productPage, cartPage, checkoutLoginPage }) => {
    await productPage.goto(product.url);

    await productPage.addProductToBagAndGoToCart();

    await cartPage.goToCheckout();

    await checkoutLoginPage.continueAsGuest();
  });

  test("a checkout with no email sends every later step back to user details", async ({
    checkoutPage,
  }) => {
    await checkoutPage.assertStepRedirect({
      from: "payment",
      to: "user-details",
    });
    await checkoutPage.assertPaymentSectionClosed();

    await checkoutPage.assertStepRedirect({
      from: "shipping-address",
      to: "user-details",
    });
    await checkoutPage.assertStepRedirect({
      from: "delivery-method",
      to: "user-details",
    });
  });

  test("a missing or unknown step falls back to the first incomplete one", async ({
    checkoutPage,
  }) => {
    await checkoutPage.gotoCheckoutWithoutStep();
    await checkoutPage.assertOnStep("user-details");

    await checkoutPage.assertStepRedirect({
      from: "not-a-step",
      to: "user-details",
    });
  });

  test("with the email given, payment and delivery fall back to the shipping address", async ({
    checkoutPage,
  }) => {
    await checkoutPage.provideUserDetails(user.email);

    await checkoutPage.assertStepRedirect({
      from: "payment",
      to: "shipping-address",
    });
    await checkoutPage.assertPaymentSectionClosed();

    await checkoutPage.assertStepRedirect({
      from: "delivery-method",
      to: "shipping-address",
    });
    await checkoutPage.assertStepStays("user-details");
  });

  test("with the address given, payment falls back to the delivery method", async ({
    checkoutPage,
  }) => {
    await checkoutPage.provideUserDetails(user.email);
    await checkoutPage.provideShippingAddress(user);

    await checkoutPage.assertStepRedirect({
      from: "payment",
      to: "delivery-method",
    });
    await checkoutPage.assertPaymentSectionClosed();

    await checkoutPage.assertStepStays("shipping-address");
    await checkoutPage.assertStepStays("user-details");
  });

  test("a complete checkout opens payment and keeps the answered steps reachable", async ({
    checkoutPage,
  }) => {
    await checkoutPage.provideUserDetails(user.email);
    await checkoutPage.provideShippingAddress(user);
    await checkoutPage.selectDeliveryOption(product.deliveryMethod.name);

    await checkoutPage.assertStepStays("payment");
    await checkoutPage.assertPaymentSectionOpen();

    await checkoutPage.assertStepStays("delivery-method");
    await checkoutPage.assertStepStays("shipping-address");
    await checkoutPage.assertStepStays("user-details");
  });
});

test.describe("Checkout step guard, logged-in shopper", () => {
  test.beforeEach(async ({ productPage, cartPage, checkoutLoginPage }) => {
    await productPage.goto(product.url);
    await productPage.addProductToBagAndGoToCart();

    await cartPage.goToCheckout();

    await checkoutLoginPage.continueAsLoggedInUser(userEmail, userPassword);
  });

  test("logging in fills the email only, so payment still falls back to the shipping address", async ({
    checkoutPage,
  }) => {
    await checkoutPage.assertStepRedirect({
      from: "payment",
      to: "shipping-address",
    });
    await checkoutPage.assertPaymentSectionClosed();

    await checkoutPage.assertStepRedirect({
      from: "delivery-method",
      to: "shipping-address",
    });
  });
});

test.describe("Checkout step guard, checkout that needs no shipping", () => {
  test.skip(
    !digitalProduct.url,
    "No shipping-free product configured. Set `digitalProduct.url` in utils/constants.ts.",
  );

  test.beforeEach(async ({ productPage, cartPage, checkoutLoginPage }) => {
    await productPage.goto(digitalProduct.url);
    await productPage.addProductToBagAndGoToCart();

    await cartPage.goToCheckout();

    await checkoutLoginPage.continueAsGuest();
  });

  test("payment is still blocked before the email is given", async ({
    checkoutPage,
  }) => {
    await checkoutPage.assertStepRedirect({
      from: "payment",
      to: "user-details",
    });
    await checkoutPage.assertPaymentSectionClosed();
  });

  test("the email alone completes the checkout, so payment opens next", async ({
    checkoutPage,
  }) => {
    await checkoutPage.provideUserDetails(user.email, "payment");

    await checkoutPage.assertShippingSectionsHidden();
    await checkoutPage.assertPaymentSectionOpen();
  });

  test("the shipping steps it never renders are unreachable", async ({
    checkoutPage,
  }) => {
    await checkoutPage.provideUserDetails(user.email, "payment");

    await checkoutPage.assertStepRedirect({
      from: "shipping-address",
      to: "payment",
    });
    await checkoutPage.assertStepRedirect({
      from: "delivery-method",
      to: "payment",
    });
  });
});
