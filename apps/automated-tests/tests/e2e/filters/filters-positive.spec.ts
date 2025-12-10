import { test } from "fixtures/fixtures";

test.describe("Filters - Positive scenarios", () => {
  test.beforeEach(async ({ productsPage }) => {
    await productsPage.goto("clothing");
  });

  test("User can open and close filters dialog", async ({ filtersPage }) => {
    // Open filters
    await filtersPage.openFilters();
    await filtersPage.assertFiltersDialogVisible();

    // Close filters
    await filtersPage.closeFilters();
    await filtersPage.assertFiltersDialogHidden();
  });

  test("User can apply single checkbox filter", async ({ filtersPage }) => {
    // Open filters and check "Is digital"
    await filtersPage.openFilters();
    await filtersPage.checkIsDigital();

    // Verify checkbox is checked
    await filtersPage.assertIsDigitalChecked(true);

    // Apply filters
    await filtersPage.applyFilters();
    await filtersPage.assertFiltersDialogHidden();

    // Verify filter count
    await filtersPage.assertFilterCount(2); // 1 for category + 1 for checkbox
  });

  test("User can apply multiple checkbox filters", async ({ filtersPage }) => {
    await filtersPage.openFilters();

    // Check multiple filters
    await filtersPage.checkIsDigital();
    await filtersPage.checkIsExclusive();
    await filtersPage.checkLimitedEdition();

    // Verify all are checked
    await filtersPage.assertIsDigitalChecked(true);
    await filtersPage.assertIsExclusiveChecked(true);
    await filtersPage.assertLimitedEditionChecked(true);

    // Apply filters
    await filtersPage.applyFilters();

    // Verify filter count
    await filtersPage.assertFilterCount(4); // 1 for category + 3 for checkboxes
  });

  test("User can uncheck a previously checked filter", async ({
    filtersPage,
  }) => {
    await filtersPage.openFilters();

    // Check and then uncheck
    await filtersPage.checkIsDigital();
    await filtersPage.assertIsDigitalChecked(true);

    await filtersPage.uncheckIsDigital();
    await filtersPage.assertIsDigitalChecked(false);
  });

  test("User can change sort order", async ({ filtersPage }) => {
    // Check default sort
    await filtersPage.assertSortOption("Price (Ascending)");

    // Change sort order
    await filtersPage.selectSortOption("Price (Descending)");

    // Verify sort changed
    await filtersPage.assertSortOption("Price (Descending)");
  });

  test("User can apply multiple filters in sequence", async ({
    filtersPage,
  }) => {
    // First application
    await filtersPage.openFilters();
    await filtersPage.checkIsDigital();
    await filtersPage.applyFilters();

    // Verify first filter
    await filtersPage.assertFilterCount(2);

    // Add another filter
    await filtersPage.openFilters();
    await filtersPage.checkIsExclusive();
    await filtersPage.applyFilters();

    // Verify both filters are active
    await filtersPage.assertFilterCount(3);
  });
});
