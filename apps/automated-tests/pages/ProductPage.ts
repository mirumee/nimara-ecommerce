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
  readonly confirmationPopup: Locator;

  constructor(page: Page, context: BrowserContext) {
    this.context = context;
    this.page = page;
    this.addToBagButton = page.getByRole("button", { name: "Add to bag" });
    this.goToBagButton = page.getByRole("link", { name: "Go to bag" });
    this.bagIcon = page.getByRole("link", { name: "Items in cart:" });
    this.confirmationPopup = page.getByRole("button", { name: "Go to bag" });
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
    // await expect(async()=>{}).toPass(); - this function will perform set action in loop until success
    // we can set intervals {intervals: [1 * 1000, 2 * 1000, 10 * 1000]  (time in ms)
    await expect(async () => {
      console.log("check icon");
      await expect(this.bagIcon).not.toHaveText("");
    }).toPass();
  }

  async goToCartPage() {
    //console.log("clicking on cart icon"); -> used for tracking in console
    //await this.page.waitForTimeout(30 * 1000); -> set hard timeout before clicking
    //console.log("after wait")
    await this.bagIcon.click();
    await this.page.waitForURL(URLS().CART_PAGE);
    //await expect(async()=>{
    //console.log("check if goToCheckoutButton is visible");
    await expect(this.goToCheckoutButton).toBeVisible();
    //}).toPass();
  }

  async addProductToBagAndGoToCart() {
    await this.clickAddToBag();
    //await this.confirmationPopup.isVisible; -> I tried to wait for popup to be visible but need to be tested more
    await this.checkCart();
    await this.goToCartPage();
  }
}
