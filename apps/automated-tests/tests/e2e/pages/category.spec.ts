import { expect, test } from "fixtures/fixtures";
import { category, URLS } from "utils/constants";

test.describe(
  "Category page",
  {
    tag: "@CI",
  },
  () => {
    test.beforeEach(async ({ categoryPage }) => {
      await categoryPage.navigate(category.slug);
    });

    test("displays category name and breadcrumb", async ({ categoryPage }) => {
      await expect(categoryPage.heading).toHaveText(category.name);
      await expect(categoryPage.breadcrumbHomeLink).toBeVisible();
      await expect(categoryPage.breadcrumbCurrentPage).toHaveText(
        category.name,
      );
    });

    test("breadcrumb Home link redirects to Homepage", async ({
      categoryPage,
      page,
    }) => {
      await categoryPage.clickBreadcrumbHome();
      await expect(page).toHaveURL(new RegExp(`${URLS().HOME_PAGE}$`));
    });

    test("products list is visible", async ({ categoryPage }) => {
      await categoryPage.assertProductsVisible();
    });

    test("clicking a product redirects to Product Page", async ({
      categoryPage,
      page,
    }) => {
      await categoryPage.clickFirstProduct();
      // Product page SSR can be slower than the default 5s assertion timeout.
      await expect(page).toHaveURL(new RegExp(`${URLS().PRODUCT_PAGE}/`), {
        timeout: 10_000,
      });
    });

    test("sorting products updates the URL", async ({ categoryPage, page }) => {
      // "Alphabetically" is picked because it differs from the default sort
      // (price-asc), which Radix Select treats as a no-op and never fires onValueChange.
      await categoryPage.selectSortOption("Alphabetically");
      await expect(page).toHaveURL(/sortBy=/);
    });

    test("filters panel opens and can be closed with Show products", async ({
      categoryPage,
    }) => {
      await categoryPage.openFilters();
      await categoryPage.showProductsButton.click();
      await expect(categoryPage.filtersHeading).toBeHidden();
    });

    test("pagination navigates to the next page", async ({
      categoryPage,
      page,
    }) => {
      await expect(categoryPage.nextPageLink).toBeVisible();
      await categoryPage.nextPageLink.click();
      await expect(page).toHaveURL(/after=/);
      await categoryPage.assertProductsVisible();
    });

    test("non-existent category slug shows a not found page", async ({
      categoryPage,
    }) => {
      await categoryPage.navigate("this-category-does-not-exist");
      await expect(categoryPage.notFoundHeading).toBeVisible();
    });
  },
);
