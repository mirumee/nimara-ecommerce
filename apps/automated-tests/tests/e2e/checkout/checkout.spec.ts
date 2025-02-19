import { test } from "fixtures/fixtures";
import { product, user, userEmail, userPassword } from "utils/constants";

test.describe("Logged-in user checkout", () => {
  // Prepare checkout; Add product to the cart and navigate to checkout.
  test.beforeEach(async ({ productPage, cartPage, checkoutLoginPage }) => {
    await productPage.goto(product.url);

    // Add to bag mutation must finished and set checkoutId cookie, thus
    // navigation to cart page is required - the cookie will be set by the time the page loads
    await productPage.addProductToBagAndGoToCart();

    await cartPage.goToCheckout();

    await checkoutLoginPage.continueAsLoggedInUser(userEmail, userPassword);
  });

  test("CHE-02001: Logged-in user completes checkout using saved shipping address and saved payment method", async ({
    checkoutPage,
  }) => {
    await checkoutPage.assertUserDetails(user, userEmail);
    await checkoutPage.assertPageSections("registered");
    await checkoutPage.useSavedShippingAddress();
    await checkoutPage.selectDeliveryOption(product.deliveryMethod.name);
    await checkoutPage.providePaymentMethod("savedMethod");
    await checkoutPage.provideBillingAddress("sameAsShipping");
    await checkoutPage.assertOrderSummary(product);
    await checkoutPage.placeOrder();
  });
});
