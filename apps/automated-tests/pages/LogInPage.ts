import { expect, type Locator, type Page } from "@playwright/test";

import { BasePage } from "./BasePage";

export class LogInPage extends BasePage {
  readonly email: Locator;
  readonly password: Locator;
  readonly logInButton: Locator;
  readonly createAccountButton: Locator;
  readonly logInHeader: Locator;
  readonly createAccountHeader: Locator;
  readonly showHideIcon: Locator;
  readonly resetPasswordLink: Locator;

  constructor(page: Page) {
    super(page);
    this.email = page.getByRole("textbox", { name: "email" });
    this.password = page.getByRole("textbox", { name: "password" });
    this.logInButton = page.getByRole("button", { name: "Log in" });
    this.createAccountButton = page.getByRole("link", {
      name: "Create account",
    });
    this.logInHeader = page.getByRole("heading", { name: "Log in" });
    this.createAccountHeader = page.getByRole("heading", {
      name: "First time on Nimara Store?",
    });
    this.showHideIcon = page.getByRole("button", {
      name: "Show/hide password",
    });
    this.resetPasswordLink = page.getByRole("link", {
      name: "I forgot my password",
    });
  }

  async assertUIVisibility() {
    await expect(this.logInHeader).toBeVisible();
    await expect(this.email).toBeVisible();
    await expect(this.password).toBeVisible();
    await expect(this.logInButton).toBeVisible();
    await expect(this.createAccountHeader).toBeVisible();
    await expect(this.createAccountButton).toBeVisible();
    await expect(this.resetPasswordLink).toBeVisible();
  }

  async assertPasswordVisibility(visible: boolean) {
    if (visible) {
      await this.showHideIcon.click();
      await expect(this.password).toHaveAttribute("type", "text");
    } else {
      await expect(this.password).toHaveAttribute("type", "password");
    }
  }

  async logIn(password: string, email: string) {
    await this.email.fill(email);
    await this.password.fill(password);
    await this.logInButton.click();
  }

  async assertUserUIVisibility() {
    await expect(this.logInHeader).toBeVisible();
  }

  async clickCreateAccountButton() {
    await this.createAccountButton.click();
  }

  async clickResetPasswordLink() {
    await this.resetPasswordLink.click();
  }
}
