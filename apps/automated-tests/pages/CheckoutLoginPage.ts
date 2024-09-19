import type { Page } from "@playwright/test";
import { URLS, userEmail, userPassword } from "utils/constants";

export class CheckoutLoginPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async continueAsGuest() {
    await this.page.getByRole("link", { name: "Continue as a guest" }).click();
    await this.page.waitForURL(URLS().CHECKOUT_PAGE_USER_DETAILS);
  }

  async continueAsLoggedInUser() {
    await this.page.getByLabel("Email").fill(userEmail);
    await this.page.getByLabel("Password", { exact: true }).fill(userPassword);

    await this.page.getByRole("button", { name: "Log in" }).click();
    await this.page.waitForURL(URLS().CHECKOUT_PAGE_SHIPPING_ADDRESS);
  }
}
