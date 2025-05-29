import { test } from "fixtures/fixtures";
import { paymentDetails, product, user } from "utils/constants";

test.describe("Guest checkout", () => {
  // Prepare checkout; Add product to the cart and navigate to checkout.
  test.beforeEach(async ({ productPage, cartPage, checkoutLoginPage }) => {
    await productPage.goto(product.url);

    // Add to bag mutation must finished and set checkoutId cookie, thus
    // navigation to cart page is required - the cookie will be set by the time the page loads
    await productPage.addProductToBagAndGoToCart();

    await cartPage.goToCheckout();

    await checkoutLoginPage.continueAsGuest();
  });

  test("CHE-01001: Guest user completes checkout with credit card payment and same shipping/billing address", async ({
    checkoutPage,
  }) => {
    await checkoutPage.provideUserDetails(user.email);
    await checkoutPage.assertPageSections("guest");
    await checkoutPage.provideShippingAddress(user);
    await checkoutPage.selectDeliveryOption(product.deliveryMethod.name);
    await checkoutPage.providePaymentMethod("guestPayment", paymentDetails);
    await checkoutPage.provideBillingAddress("sameAsShipping");
    await checkoutPage.assertOrderSummary(product);
    await checkoutPage.placeOrder();
  });
});
