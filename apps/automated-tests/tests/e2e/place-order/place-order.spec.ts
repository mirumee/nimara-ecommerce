import { expect, test } from "@playwright/test";
import { HomePage } from "pages/HomePage";
import { ProductPage } from "pages/ProductPage";
import { ProductsPage } from "pages/ProductsPage";

test.skip("C10560. Place new order single item as a non-registered user.", async ({
  page,
}) => {
  const homePage = new HomePage(page);
  const productsPage = new ProductsPage(page);
  const productPage = new ProductPage(page);

  // Navigate to home page
  await homePage.navigate();

  // Click on 'See all products' button
  await homePage.clickSeeAllProducts();

  // Verify the products page is visible
  await expect(productsPage.productsSection).toBeVisible();

  // Click on a random product
  await productsPage.clickRandomProduct();

  // Verify the product page is visible
  await expect(productPage.addToBagButton).toBeVisible();

  // WIP - lack of testing products should be resolved first
  // // Verify the 'Add to bag' button is present
  // expect(await productPage.verifyProductPage()).toBe(true);
  //
  // // Select Vinyl format
  // await productPage.selectVinylFormat();
  //
  // // Choose Vinyl from the dropdown
  // await productPage.chooseVinylValue();
  //
  // // Click on 'Add to bag' button
  // await productPage.clickAddToBag();
  //
  // // Click on 'Bag' button in the top right corner
  // await productPage.clickBagButton();
  //
  // // Verify the bag page is visible
  // expect(await bagPage.isVisible()).toBe(true);
  //
  // // Verify the product is in the bag
  // expect(await bagPage.verifyProductInBag('Jazz Odyssey')).toBe(true);
});

test.skip("C10556. Place new order multiple items as a non-registered user", async ({
  page,
}) => {
  const homePage = new HomePage(page);

  // Navigate to home page
  await homePage.navigate();
});

test.skip("C10561. Place repeated order multiple items as a non-registered user", async ({
  page,
}) => {
  const homePage = new HomePage(page);

  // Navigate to home page
  await homePage.navigate();
});

test.skip("C10562. Place repeated order single item as a non-registered user", async ({
  page,
}) => {
  const homePage = new HomePage(page);

  // Navigate to home page
  await homePage.navigate();
});

test.skip("C10578. Place repeated order single item as a non-registered user with Expired Payment Method", async ({
  page,
}) => {
  const homePage = new HomePage(page);

  // Navigate to home page
  await homePage.navigate();
});

test.skip("C10582. Place repeated order multiple items with Different Shipping and Billing Addresses as a non-registered user", async ({
  page,
}) => {
  const homePage = new HomePage(page);

  // Navigate to home page
  await homePage.navigate();
});

test.skip("C10583. Place new order single item with Special Characters in Address Fields as a non-registered user", async ({
  page,
}) => {
  const homePage = new HomePage(page);

  // Navigate to home page
  await homePage.navigate();
});
