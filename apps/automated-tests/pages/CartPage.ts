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

    page.on("load", async () => {
      // Wait for the cart page to load
      console.log(page.url());
    });
  }

  async goto() {
    console.log("Navigating to cart page...", { href: URLS().CART_PAGE });
    await this.page.goto(URLS().CART_PAGE);
  }

  async goToCheckout() {
    // Check if the cart is not empty, otherwise reload
    if (await this.page.getByText("Your bag is empty").isVisible()) {
      console.log("Cart is empty, reloading...");
      await this.goto();
    }

    await this.goToCheckoutButton.click();
    await this.page.waitForURL(URLS().CHECKOUT_PAGE_SIGN_IN);
  }
}
