import { test } from "@playwright/test";
import { HomePage } from "pages/HomePage";

test.skip("C10499. Verify region and language settings functionality", async ({
  page,
}) => {
  const homePage = new HomePage(page);

  // Navigate to home page
  await homePage.navigate();
});
