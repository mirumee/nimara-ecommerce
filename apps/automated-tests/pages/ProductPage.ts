import {
  type BrowserContext,
  expect,
  type Locator,
  type Page,
} from "@playwright/test";
import { URLS } from "utils/constants";

export class ProductPage {
  readonly page: Page;
  readonly context: BrowserContext;
  readonly addToBagButton: Locator;
  readonly goToBagButton: Locator;
  readonly bagIcon: Locator;
  readonly goToCheckoutButton: Locator;
  readonly variantSelect: Locator;
  readonly productTitle: Locator;
  readonly addedToBagNotification: Locator;

  constructor(page: Page, context: BrowserContext) {
    this.context = context;
    this.page = page;
    this.addToBagButton = page.getByRole("button", { name: "Add to bag" });
    this.goToBagButton = page.getByRole("link", { name: "Go to bag" });
    this.bagIcon = page.getByRole("link", { name: "Items in cart:" });
    this.goToCheckoutButton = page.getByRole("link", {
      name: "Go to checkout",
    });
    this.variantSelect = page.getByRole("combobox", { name: "Variant select" });
    this.productTitle = page.getByRole("heading", { level: 1 });
    this.addedToBagNotification = page.getByText(
      "Product has been added to your bag.",
      { exact: true },
    );
  }

  async goto(url: string) {
    await this.page.goto(`${URLS().PRODUCT_PAGE}/${url}`);
  }

  async clickAddToBag() {
    await this.addToBagButton.click();

    await expect(this.addToBagButton).toBeEnabled();
    await expect(this.goToBagButton).toBeVisible();
  }

  async checkCart() {
    await expect(this.bagIcon).not.toHaveText("");
  }

  async goToCartPage() {
    await this.bagIcon.click();
    await this.page.waitForURL(/\/cart$/);
    await expect(this.goToCheckoutButton).toBeVisible();
  }

  async addProductToBagAndGoToCart() {
    await this.clickAddToBag();
    await this.checkCart();
    await this.goToCartPage();
  }

  async selectSize(size: string) {
    await this.page.getByRole("radio", { name: size, exact: true }).click();
  }

  async selectVariant(variant: string) {
    await expect(this.variantSelect).toBeVisible();
    await this.variantSelect.click();
    await this.page.getByRole("option", { name: variant }).click();
  }

  async assertProductTitle(title: string) {
    await expect(this.productTitle).toHaveText(title);
  }

  async addToBagWithOptions(size: string, variant: string) {
    await this.selectSize(size);
    await this.selectVariant(variant);
    await expect(this.addToBagButton).toBeEnabled();
    await this.addToBagButton.click();
    await expect(this.addedToBagNotification).toBeVisible();
  }
}
