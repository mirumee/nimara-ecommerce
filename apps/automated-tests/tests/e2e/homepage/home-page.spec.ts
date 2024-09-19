import { test } from "@playwright/test";
import { HomePage } from "pages/HomePage";

test.skip("C10401. View New Arrivals and Featured Products Section", async ({
  page,
}) => {
  const homePage = new HomePage(page);

  // Navigate to home page
  await homePage.navigate();
});

test.skip("C10402. Personalized Recommendations Display", async ({ page }) => {
  const homePage = new HomePage(page);

  // Navigate to home page
  await homePage.navigate();
});

test.skip("C10403. Access Promotions and Discounts on Homepage", async ({
  page,
}) => {
  const homePage = new HomePage(page);

  // Navigate to home page
  await homePage.navigate();
});

test.skip("C10462. Verify subcategory menu opens on category click", async ({
  page,
}) => {
  const homePage = new HomePage(page);

  // Navigate to home page
  await homePage.navigate();
});
