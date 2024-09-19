import { test } from "@playwright/test";
import { HomePage } from "pages/HomePage";

test.skip("C10334. It should be possible for a user to have a secure and straightforward login process.", async ({
  page,
}) => {
  const homePage = new HomePage(page);

  // Navigate to home page
  await homePage.navigate();
});

test.skip("C10338. User should be able to manage their email subscription preferences.", async ({
  page,
}) => {
  const homePage = new HomePage(page);

  // Navigate to home page
  await homePage.navigate();
});

test.skip("C10339. User should be able to review and edit their personal data within their profile.", async ({
  page,
}) => {
  const homePage = new HomePage(page);

  // Navigate to home page
  await homePage.navigate();
});

test.skip("C10355. Attempt to Login with Incorrect Credentials", async ({
  page,
}) => {
  const homePage = new HomePage(page);

  // Navigate to home page
  await homePage.navigate();
});

test.skip("C10357. Registration with Already Used Email", async ({ page }) => {
  const homePage = new HomePage(page);

  // Navigate to home page
  await homePage.navigate();
});

test.skip("C10342. User should encounter an error when entering invalid personal data.", async ({
  page,
}) => {
  const homePage = new HomePage(page);

  // Navigate to home page
  await homePage.navigate();
});
