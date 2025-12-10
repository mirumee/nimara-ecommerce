import { test } from "fixtures/fixtures";

test.describe("Filters - Negative scenarios", () => {
  test.beforeEach(async ({ productsPage }) => {
    await productsPage.goto("clothing");
  });

  test("Closing filter dialog without applying does not save changes", async ({
    filtersPage,
  }) => {
    // Open filters and check a filter
    await filtersPage.openFilters();
    await filtersPage.checkIsDigital();
    await filtersPage.assertIsDigitalChecked(true);

    // Close without applying
    await filtersPage.closeFilters();

    // Reopen and verify filter is not applied
    await filtersPage.openFilters();
    await filtersPage.assertIsDigitalChecked(false);
  });

  test("Applying no filters shows all products", async ({
    filtersPage,
    page,
  }) => {
    // Get initial URL
    const initialUrl = page.url();

    // Open and close filters without changes
    await filtersPage.openFilters();
    await filtersPage.applyFilters();

    // URL should remain the same when no new filters are applied
    await page.waitForURL(initialUrl);
  });

  test("Cannot check already checked filter multiple times", async ({
    filtersPage,
  }) => {
    await filtersPage.openFilters();

    // Check filter once
    await filtersPage.checkIsDigital();
    await filtersPage.assertIsDigitalChecked(true);

    // Try to check again (should remain checked)
    await filtersPage.checkIsDigital();
    await filtersPage.assertIsDigitalChecked(true);
  });

  test("Opening filters dialog does not automatically apply changes", async ({
    filtersPage,
  }) => {
    // Initial state - no extra filters
    await filtersPage.assertFilterCount(1); // Only category

    // Open, make changes, but don't apply
    await filtersPage.openFilters();
    await filtersPage.checkIsDigital();
    await filtersPage.closeFilters();

    // Verify filter count hasn't changed
    await filtersPage.assertFilterCount(1);
  });
});
