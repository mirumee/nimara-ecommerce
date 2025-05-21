import type { Locator, Page } from "@playwright/test";
import { URLS } from "utils/constants";

export class CheckoutLoginPage {
  readonly page: Page;
  readonly continueAsGuestButton: Locator;
  readonly logInButton: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;

  constructor(page: Page) {
    this.page = page;
    this.continueAsGuestButton = page.getByRole("link", {
      name: "Continue as a guest",
    });
    this.logInButton = page.getByRole("button", { name: "Log in" });
    this.emailInput = page.getByLabel("Email");
    this.passwordInput = page.getByLabel("Password", { exact: true });
  }

  async continueAsGuest() {
    await this.continueAsGuestButton.click();
    await this.page.waitForURL(URLS().CHECKOUT_PAGE_USER_DETAILS);
  }

  async continueAsLoggedInUser(userEmail: string, userPassword: string) {
    await this.emailInput.fill(userEmail);
    await this.passwordInput.fill(userPassword);

    await this.logInButton.click();
    await this.page.waitForURL(URLS().CHECKOUT_PAGE_SHIPPING_ADDRESS);
  }
}
