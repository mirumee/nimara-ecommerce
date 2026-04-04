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

  constructor(page: Page, context: BrowserContext) {
    this.context = context;
    this.page = page;
    this.addToBagButton = page.getByRole("button", { name: "Add to bag" });
    this.goToBagButton = page.getByRole("link", { name: "Go to bag" });
    this.bagIcon = page.getByRole("link", { name: "Items in cart:" });
    this.goToCheckoutButton = page.getByRole("link", {
      name: "Go to checkout",
    });
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
    // Wait for cart badge to update - check aria-label contains a number > 0
    await this.page.waitForFunction(
      () => {
        const cartLink = document.querySelector(
          'a[aria-label^="Items in cart:"]',
        );

        if (!cartLink) {return false;}
        const ariaLabel = cartLink.getAttribute("aria-label");

        if (!ariaLabel) {return false;}
        const match = ariaLabel.match(/Items in cart: (\d+)/);

        if (!match) {return false;}
        const count = parseInt(match[1], 10);

        
return count > 0;
      },
      { timeout: 10000 },
    );
  }

  async goToCartPage() {
    await this.bagIcon.click();
    await this.page.waitForURL(URLS().CART_PAGE);
    await expect(this.goToCheckoutButton).toBeVisible();
  }

  async addProductToBagAndGoToCart() {
    await this.clickAddToBag();
    await this.checkCart();
    await this.goToCartPage();
  }
}
