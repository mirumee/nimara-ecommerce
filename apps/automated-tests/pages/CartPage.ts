import { expect, type Locator, type Page } from "@playwright/test";
import { URLS } from "utils/constants";

export class CartPage {
  readonly page: Page;
  readonly quantityInput: Locator;
  readonly goToCheckoutButton: Locator;
  readonly productLinePrice: Locator;
  readonly cartHeading: Locator;

  constructor(page: Page) {
    this.page = page;
    this.quantityInput = page.getByTestId("cart-product-line-qty");
    this.goToCheckoutButton = page.getByRole("link", {
      name: "Go to checkout",
    });
    this.productLinePrice = page.getByTestId("shopping-bag-product-line-price");
    this.cartHeading = page.getByRole("heading", { name: "Your bag" });
  }

  async goto() {
    await this.page.goto(URLS().CART_PAGE);
  }

  async goToCheckout() {
    await this.goToCheckoutButton.click();
    await this.page.waitForURL(URLS().CHECKOUT_PAGE_SIGN_IN);
  }

  async assertProductInCart(
    productName: string,
    quantity: string,
    price: string,
  ) {
    await expect(this.page.getByText(productName)).toBeVisible();
    await expect(this.quantityInput).toHaveValue(quantity);
    await expect(this.productLinePrice).toContainText(price);
  }

  async assertCartPageLoaded() {
    await expect(this.page).toHaveURL(/\/cart$/);
    await expect(this.cartHeading).toBeVisible();
  }
}
