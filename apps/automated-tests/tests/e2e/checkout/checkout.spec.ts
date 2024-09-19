import { type Page, test } from "@playwright/test";
import { CartPage } from "pages/CartPage";
import { CheckoutLoginPage } from "pages/CheckoutLoginPage";
import { CheckoutPage } from "pages/CheckoutPage";
import { ProductPage } from "pages/ProductPage";
import { product } from "utils/constants";

let page: Page;

test.describe("Logged-in user checkout", () => {
  // Prepare checkout; Add product to the cart and navigate to checkout.
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();

    const productPage = new ProductPage(page);

    await productPage.goto(product.url);

    // Add to bag mutation must finished and set checkoutId cookie, thus
    // navigation to cart page is required - the cookie will be set by the time the page loads
    await productPage.addProductToBagAndGoToCart();

    const cartPage = new CartPage(page);

    // Set test product quantity to 1, if there are more than 1 items in the cart in current user's checkout
    if (Number(await cartPage.quatityInput.inputValue()) > 1) {
      await cartPage.quatityInput.fill("1");
    }

    await cartPage.gotToCheckout();

    const checkoutLoginPage = new CheckoutLoginPage(page);

    await checkoutLoginPage.continueAsLoggedInUser();
  });

  test("C11619: Logged in user is able to purchase single item using Credit Card as payment (creating new data)", async () => {
    const checkoutPage = new CheckoutPage({
      page,
      product,
      checkoutType: "registered",
    });

    await checkoutPage.checkUserDetails();
    await checkoutPage.checkPageSections();
    await checkoutPage.useSavedShippingAddress();
    await checkoutPage.selectDeliveryOption();
    await checkoutPage.checkOrderSummary();
    await checkoutPage.payAndConfirmOrderAsUser();
  });
});
