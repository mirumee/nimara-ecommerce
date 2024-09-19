import { type Locator, type Page } from "@playwright/test";

export class ProductsPage {
  readonly page: Page;
  readonly productsSection: Locator;

  constructor(page: Page) {
    this.page = page;
    this.productsSection = page.locator("//html/body/main/div/section/div[2]");
  }

  async clickSeeAllProducts() {
    await this.page.click("text=See all products");
  }

  async clickRandomProduct() {
    const productLocators = this.page.locator(
      "a.grid.gap-4.rounded-lg.bg-white",
    );
    const count = await productLocators.count();
    const randomIndex = Math.floor(Math.random() * count);

    await productLocators.nth(randomIndex).click();
  }
}
