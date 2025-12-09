import { test } from "fixtures/fixtures";

test.describe("Cart - Negative scenarios", () => {
  test.beforeEach(async ({ productsPage, productPage }) => {
    // Add a product to cart before each test
    await productsPage.goto("clothing");
    await productsPage.clickProduct("Abstract Tshirt Ultra Black");
    await productPage.assertProductTitle("Abstract Tshirt Ultra Black");
    await productPage.addToBagWithOptions("L", "L regular");
    await productPage.goToCartPage();
  });

  test("User cannot set quantity to zero - quantity reverts to 1", async ({
    cartPage,
  }) => {
    await cartPage.assertCartPageLoaded();

    // Try to set quantity to 0
    await cartPage.updateQuantity("0");

    // Verify quantity reverts to 1
    await cartPage.assertQuantityValue("1");
  });

  test("User cannot set negative quantity - quantity reverts to 1", async ({
    cartPage,
  }) => {
    await cartPage.assertCartPageLoaded();

    // Try to set negative quantity
    await cartPage.updateQuantity("-5");

    // Verify quantity reverts to 1
    await cartPage.assertQuantityValue("1");
  });

  test("User cannot enter non-numeric quantity - quantity reverts to 1", async ({
    cartPage,
  }) => {
    await cartPage.assertCartPageLoaded();

    // Try to set non-numeric quantity
    await cartPage.updateQuantity("abc");

    // Verify quantity reverts to 1
    await cartPage.assertQuantityValue("1");
  });

  test("Removing product shows empty cart message", async ({ cartPage }) => {
    await cartPage.assertCartPageLoaded();

    // Remove the product
    await cartPage.removeProduct();

    // Verify cart is empty
    await cartPage.assertCartIsEmpty();
  });

  test("Empty cart does not show checkout button", async ({ cartPage }) => {
    await cartPage.assertCartPageLoaded();

    // Remove the product
    await cartPage.removeProduct();

    // Verify checkout button is not visible
    await cartPage.assertCheckoutButtonState(false);
  });

  test("Navigating directly to empty cart shows empty state", async ({
    cartPage,
  }) => {
    // Remove product first
    await cartPage.removeProduct();

    // Navigate to cart again
    await cartPage.goto();

    // Verify cart is empty
    await cartPage.assertCartIsEmpty();
  });
});
