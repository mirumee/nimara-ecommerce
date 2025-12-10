import { expect, type Locator, type Page } from "@playwright/test";
import { URLS } from "utils/constants";

export class CartPage {
  readonly page: Page;
  readonly quantityInput: Locator;
  readonly goToCheckoutButton: Locator;
  readonly productLinePrice: Locator;
  readonly cartHeading: Locator;
  readonly removeButton: Locator;
  readonly emptyCartMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.quantityInput = page.getByTestId("cart-product-line-qty");
    this.goToCheckoutButton = page.getByRole("link", {
      name: "Go to checkout",
    });
    this.productLinePrice = page.getByTestId("shopping-bag-product-line-price");
    this.cartHeading = page.getByRole("heading", { name: "Your bag" });
    this.removeButton = page.getByRole("button", { name: "Remove button" });
    this.emptyCartMessage = page.getByText("Your bag is empty");
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

  async updateQuantity(quantity: string) {
    await this.quantityInput.clear();
    await this.quantityInput.fill(quantity);
    await this.quantityInput.blur();
  }

  async removeProduct() {
    await this.removeButton.click();
  }

  async assertCartIsEmpty() {
    await expect(this.emptyCartMessage).toBeVisible();
    await expect(this.goToCheckoutButton).toBeHidden();
  }

  async assertQuantityValue(expectedValue: string) {
    await expect(this.quantityInput).toHaveValue(expectedValue);
  }

  async assertCheckoutButtonState(shouldBeVisible: boolean) {
    if (shouldBeVisible) {
      await expect(this.goToCheckoutButton).toBeVisible();
    } else {
      await expect(this.goToCheckoutButton).toBeHidden();
    }
  }
}
