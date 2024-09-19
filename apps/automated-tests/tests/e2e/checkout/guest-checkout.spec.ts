import { type Page, test } from "@playwright/test";
import { CartPage } from "pages/CartPage";
import { CheckoutLoginPage } from "pages/CheckoutLoginPage";
import { CheckoutPage } from "pages/CheckoutPage";
import { ProductPage } from "pages/ProductPage";
import { product } from "utils/constants";

let page: Page;

test.describe("Guest checkout", () => {
  // Prepare checkout; Add product to the cart and navigate to checkout.
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();

    const productPage = new ProductPage(page);

    await productPage.goto(product.url);

    // Add to bag mutation must finished and set checkoutId cookie, thus
    // navigation to cart page is required - the cookie will be set by the time the page loads
    await productPage.addProductToBagAndGoToCart();

    const cartPage = new CartPage(page);

    await cartPage.gotToCheckout();

    const checkoutLoginPage = new CheckoutLoginPage(page);

    await checkoutLoginPage.continueAsGuest();
  });

  test("C11615: Guest user is able to purchase single item using credit card as payment", async () => {
    const checkoutPage = new CheckoutPage({
      page,
      product,
      checkoutType: "guest",
    });

    await checkoutPage.provideUserDetails();
    await checkoutPage.checkPageSections();
    await checkoutPage.provideShippingAddress();
    await checkoutPage.selectDeliveryOption();
    await checkoutPage.checkOrderSummary();
    await checkoutPage.payAndConfirmOrderAsGuest();
  });
});
