import type { Locator, Page } from "@playwright/test";
import { URLS } from "utils/constants";

export class CartPage {
  readonly page: Page;
  readonly quantityInput: Locator;
  readonly goToCheckoutButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.quantityInput = page.getByTestId("cart-product-line-qty");
    this.goToCheckoutButton = page.getByRole("link", {
      name: "Go to checkout",
    });
  }

  async goto() {
    await this.page.goto(URLS().CART_PAGE);
  }

  async goToCheckout() {
    await this.goToCheckoutButton.click();
    await this.page.waitForURL(URLS().CHECKOUT_PAGE_SIGN_IN);
  }
}
