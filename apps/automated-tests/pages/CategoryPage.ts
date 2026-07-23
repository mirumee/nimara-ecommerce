import { expect, type Locator, type Page } from "@playwright/test";
import { URLS } from "utils/constants";

import { BasePage } from "./BasePage";

export class CategoryPage extends BasePage {
  readonly heading: Locator;
  readonly breadcrumbHomeLink: Locator;
  readonly breadcrumbCurrentPage: Locator;
  readonly productCards: Locator;
  readonly sortBySelect: Locator;
  readonly filtersButton: Locator;
  readonly filtersHeading: Locator;
  readonly showProductsButton: Locator;
  readonly nextPageLink: Locator;
  readonly previousPageLink: Locator;
  readonly notFoundHeading: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole("heading", { level: 1 });
    this.breadcrumbHomeLink = page.getByRole("link", {
      name: "Home",
      exact: true,
    });
    this.breadcrumbCurrentPage = page.locator('[aria-current="page"]');
    this.productCards = page.locator('a[href*="/products/"]');
    this.sortBySelect = page.getByRole("combobox", { name: "Sort by" });
    this.filtersButton = page.getByRole("button", { name: "Filters" });
    this.filtersHeading = page.getByRole("heading", { name: "Filters" });
    this.showProductsButton = page.getByRole("button", {
      name: "Show products",
    });
    this.nextPageLink = page.getByRole("link", { name: "Go to next page" });
    this.previousPageLink = page.getByRole("link", {
      name: "Go to previous page",
    });
    this.notFoundHeading = page.getByRole("heading", { name: "Not found" });
  }

  async navigate(slug: string) {
    await this.page.goto(`${URLS().CATEGORY_PAGE}/${slug}`);
    await this.dismissCookieBanner();
    // Ensure client-side hydration (e.g. Link click handlers) has settled
    // before any interaction, otherwise the first click can be a no-op.
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await this.page.waitForTimeout(800);
  }

  // Dismiss the cookie consent banner so it doesn't intercept later clicks
  // (e.g. pagination), and wait for it to fully close before continuing.
  async dismissCookieBanner() {
    const acceptAllButton = this.page.getByRole("button", {
      name: "Accept all",
    });

    if (await acceptAllButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await acceptAllButton.click();
      await acceptAllButton.waitFor({ state: "hidden" }).catch(() => {});
    }
  }

  async clickBreadcrumbHome() {
    await this.breadcrumbHomeLink.click();
  }

  async clickFirstProduct() {
    const firstProduct = this.productCards.first();

    await firstProduct.scrollIntoViewIfNeeded();
    await expect(firstProduct).toBeInViewport();
    await firstProduct.click();
  }

  async selectSortOption(optionName: string) {
    await this.sortBySelect.click();
    await this.page.getByRole("option", { name: optionName }).click();
  }

  async openFilters() {
    await this.filtersButton.click();
    await expect(this.filtersHeading).toBeVisible();
  }

  async assertProductsVisible() {
    await expect(this.productCards.first()).toBeVisible();
  }
}
