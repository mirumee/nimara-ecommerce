import type { Locator, Page } from "@playwright/test";
import { URLS } from "utils/constants";

export class ProductPage {
  readonly page: Page;
  readonly addToBagButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.addToBagButton = page.getByText("Add to bag");
  }

  async goto(url: string) {
    await this.page.goto(`${URLS().PRODUCT_PAGE}/${url}`);
  }

  async verifyProductPage() {
    return this.addToBagButton.isVisible();
  }

  async selectVinylFormat() {
    await this.page.click('button:has-text("Vinyl")');
  }

  async chooseVinylValue() {
    await this.page.click("text=Vinyl");
  }

  async clickAddToBag() {
    await this.addToBagButton.click();
  }

  async addProductToBagAndGoToCart() {
    await this.clickAddToBag();
    await this.page.getByRole("link", { name: "Go to bag" }).click();
    await this.page.waitForURL(URLS().CART_PAGE);
  }

  async clickBagButton() {
    await this.page.click('button:has-text("Bag")');
  }
}
