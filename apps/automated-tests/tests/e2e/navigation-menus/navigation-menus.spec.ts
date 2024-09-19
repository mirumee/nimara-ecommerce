import { test } from "@playwright/test";
import { HomePage } from "pages/HomePage";

test.skip("C10406. Breadcrumbs for Easy Navigation", async ({ page }) => {
  const homePage = new HomePage(page);

  // Navigate to home page
  await homePage.navigate();
});
