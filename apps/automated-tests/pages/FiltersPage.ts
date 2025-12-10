import { expect, type Locator, type Page } from "@playwright/test";

export class FiltersPage {
  readonly page: Page;
  readonly filtersButton: Locator;
  readonly filtersDialog: Locator;
  readonly filtersHeading: Locator;
  readonly closeButton: Locator;
  readonly clearButton: Locator;
  readonly showProductsButton: Locator;
  readonly sortByCombobox: Locator;
  readonly filtersCounter: Locator;

  // Checkboxes
  readonly isDigitalCheckbox: Locator;
  readonly isExclusiveCheckbox: Locator;
  readonly limitedEditionCheckbox: Locator;

  constructor(page: Page) {
    this.page = page;
    this.filtersButton = page.getByRole("button", { name: "Filters" });
    this.filtersDialog = page.getByRole("dialog", { name: "Filters" });
    this.filtersHeading = page.getByRole("heading", { name: "Filters" });
    this.closeButton = this.filtersDialog.getByRole("button", {
      name: "Close",
    });
    this.clearButton = this.filtersDialog.getByRole("button", {
      name: "Clear",
    });
    this.showProductsButton = this.filtersDialog.getByRole("button", {
      name: "Show products",
    });
    this.sortByCombobox = page.getByRole("combobox", { name: "Sort by" });
    this.filtersCounter = this.filtersButton.locator("div").last();

    // Checkboxes
    this.isDigitalCheckbox = this.filtersDialog.getByRole("checkbox", {
      name: "Is digital",
    });
    this.isExclusiveCheckbox = this.filtersDialog.getByRole("checkbox", {
      name: "Is exclusive",
    });
    this.limitedEditionCheckbox = this.filtersDialog.getByRole("checkbox", {
      name: "Limited edition",
    });
  }

  async openFilters() {
    await this.filtersButton.click();
    await expect(this.filtersDialog).toBeVisible();
  }

  async closeFilters() {
    await this.closeButton.click();
    await expect(this.filtersDialog).toBeHidden();
  }

  async clearFilters() {
    await this.clearButton.click();
  }

  async applyFilters() {
    await this.showProductsButton.click();
    await expect(this.filtersDialog).toBeHidden();
  }

  async assertFiltersDialogVisible() {
    await expect(this.filtersDialog).toBeVisible();
    await expect(this.filtersHeading).toBeVisible();
  }

  async assertFiltersDialogHidden() {
    await expect(this.filtersDialog).toBeHidden();
  }

  async assertFilterCount(count: number) {
    if (count === 0 || count === 1) {
      // When no filters or only category filter, counter may not be visible
      await expect(this.filtersButton).toContainText("Filters");
    } else {
      await expect(this.filtersButton).toContainText(`(${count})`);
    }
  }

  async checkIsDigital() {
    await this.isDigitalCheckbox.check();
  }

  async uncheckIsDigital() {
    await this.isDigitalCheckbox.uncheck();
  }

  async checkIsExclusive() {
    await this.isExclusiveCheckbox.check();
  }

  async checkLimitedEdition() {
    await this.limitedEditionCheckbox.check();
  }

  async assertIsDigitalChecked(shouldBeChecked: boolean) {
    if (shouldBeChecked) {
      await expect(this.isDigitalCheckbox).toBeChecked();
    } else {
      await expect(this.isDigitalCheckbox).not.toBeChecked();
    }
  }

  async assertIsExclusiveChecked(shouldBeChecked: boolean) {
    if (shouldBeChecked) {
      await expect(this.isExclusiveCheckbox).toBeChecked();
    } else {
      await expect(this.isExclusiveCheckbox).not.toBeChecked();
    }
  }

  async assertLimitedEditionChecked(shouldBeChecked: boolean) {
    if (shouldBeChecked) {
      await expect(this.limitedEditionCheckbox).toBeChecked();
    } else {
      await expect(this.limitedEditionCheckbox).not.toBeChecked();
    }
  }

  async selectSortOption(option: string) {
    await this.sortByCombobox.click();
    await this.page.getByRole("option", { name: option, exact: true }).click();
  }

  async assertSortOption(option: string) {
    await expect(this.sortByCombobox).toContainText(option);
  }

  async selectCategoryFilter(category: string) {
    const categoryButton = this.filtersDialog.getByRole("button", {
      name: category,
    });

    await categoryButton.click();
  }

  async selectCategoryOption(option: string) {
    await this.page.getByRole("option", { name: option }).click();
  }
}
