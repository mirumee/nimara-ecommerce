import { test } from "fixtures/fixtures";

test.describe("Add to cart", () => {
  test("User can add Abstract Tshirt Ultra Black (L regular) to cart", async ({
    productsPage,
    productPage,
    cartPage,
  }) => {
    // Navigate to Clothing category and select product
    await productsPage.goto("clothing");
    await productsPage.clickProduct("Abstract Tshirt Ultra Black");

    // Verify product page loaded
    await productPage.assertProductTitle("Abstract Tshirt Ultra Black");

    // Select size L and variant L regular, then add to bag
    await productPage.addToBagWithOptions("L", "L regular");

    // Navigate to cart
    await productPage.goToCartPage();

    // Verify cart page and product details
    await cartPage.assertCartPageLoaded();
    await cartPage.assertProductInCart(
      "Abstract Tshirt Ultra Black • L",
      "1",
      "$13.99",
    );
  });
});
