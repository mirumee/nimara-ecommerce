import type { Locator, Page } from "@playwright/test";
import { URLS } from "utils/constants";

export class ProductPage {
  readonly page: Page;
  readonly addToBagButton: Locator;
  readonly goToBagButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.addToBagButton = page.getByRole("button", { name: "Add to bag" });
    this.goToBagButton = page.getByRole("link", { name: "Go to bag" });
  }

  async goto(url: string) {
    await this.page.goto(`${URLS().PRODUCT_PAGE}/${url}`);
  }

  async clickAddToBag() {
    await this.addToBagButton.click();
  }

  async clickGoToBag() {
    await this.goToBagButton.click();
  }

  async addProductToBagAndGoToCart() {
    await this.clickAddToBag();
    await this.clickGoToBag();
    await this.page.waitForURL(URLS().CART_PAGE);
  }
}
