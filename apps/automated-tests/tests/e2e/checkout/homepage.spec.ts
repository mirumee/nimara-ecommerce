import { test } from "fixtures/fixtures";
import { URLS } from "utils/constants";
import { enabledHomepageElements } from "utils/testConfiguration";

test.describe(
  "Homepage",
  {
    tag: "@CI",
  },
  () => {
    const testEnvUrl = process.env.TEST_ENV_URL ?? ""; //get testEnvUrl from .env

    test.beforeEach(async ({ homePage }) => {
      await homePage.navigate();
    });

    test("Hero banner elements are present", async ({ homePage }) => {
      await homePage.assertHeroBannerPresence(
        enabledHomepageElements.heroBannerImage,
      );
    });

    test("Hero Banner button redirect to Listing Page", async ({
      homePage,
    }) => {
      await homePage.heroBannerButton.click();
      await homePage.expectPageToHaveUrl(
        testEnvUrl + "/" + URLS().PRODUCTS_PAGE,
      );
    });

    test("Product Carousel elements are present", async ({ homePage }) => {
      await homePage.assertProductCarouselPresence(
        enabledHomepageElements.productsCarouselList,
      );
    });

    test("Product Carousel button redirects to Listing Page", async ({
      homePage,
    }) => {
      await homePage.clickAllProductCarouselButton();
      await homePage.expectPageToHaveUrl(
        testEnvUrl + "/" + URLS().PRODUCTS_PAGE,
      );
    });

    test('Button "All Nimara’s best products" redirects to Listing Page', async ({
      homePage,
    }) => {
      await homePage.clickSeeAllProducts();
      await homePage.expectPageToHaveUrl(
        testEnvUrl + "/" + URLS().PRODUCTS_PAGE,
      );
    });

    test("Newsletter elements are present", async ({ homePage }) => {
      await homePage.assertNewsletterPresence(
        enabledHomepageElements.newsletter,
      );
    });
  },
);
