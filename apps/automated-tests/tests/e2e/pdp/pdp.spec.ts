import { test } from "@playwright/test";
import { HomePage } from "pages/HomePage";

test.skip("C10440. Detailed Product Information Should Be Available", async ({
  page,
}) => {
  const homePage = new HomePage(page);

  // Navigate to home page
  await homePage.navigate();
});

test.skip("C10442. Customer Reviews and Ratings Should Be Accessible", async ({
  page,
}) => {
  const homePage = new HomePage(page);

  // Navigate to home page
  await homePage.navigate();
});

test.skip("C10443. Size Charts and Measurement Details Should Be Available", async ({
  page,
}) => {
  const homePage = new HomePage(page);

  // Navigate to home page
  await homePage.navigate();
});

test.skip("C10466. Check 'Add to bag' functionality", async ({ page }) => {
  const homePage = new HomePage(page);

  // Navigate to home page
  await homePage.navigate();
});

test.skip("C10490. Verify notification after adding product to shopping bag", async ({
  page,
}) => {
  const homePage = new HomePage(page);

  // Navigate to home page
  await homePage.navigate();
});
