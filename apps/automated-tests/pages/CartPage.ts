import type { Locator, Page } from "@playwright/test";
import { URLS } from "utils/constants";

export class CartPage {
  readonly page: Page;
  readonly quatityInput: Locator;

  constructor(page: Page) {
    this.quatityInput = page.getByTestId("cart-product-line-qty");
    this.page = page;
  }

  async goto(url: string) {
    await this.page.goto(url);
  }

  async gotToCheckout() {
    await this.page.getByText("Go to checkout").click();
    await this.page.waitForURL(URLS().CHECKOUT_PAGE_SIGN_IN);
  }

  async isVisible() {
    const bagPageLocator = this.page.getByText("Add to bag");

    await bagPageLocator.waitFor();

    return bagPageLocator.isVisible();
  }

  async verifyProductInBag(productName: string) {
    const productLocator = this.page.locator(`text=${productName}`);

    await productLocator.waitFor();

    return productLocator.isVisible();
  }
}
