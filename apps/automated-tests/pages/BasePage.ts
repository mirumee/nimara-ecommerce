import { expect, type Locator, type Page } from "@playwright/test";
import { user } from "utils/constants";

export class BasePage {
  protected page: Page;
  readonly username: Locator;

  constructor(page: Page) {
    this.page = page;
    this.username = page.getByRole("link", { name: user.name });
  }

  async navigate(url: string) {
    await this.page.goto(url);
  }

  async expectPageToHaveUrl(url: string) {
    await expect(this.page).toHaveURL(url);
  }

  async assertUserNameVisibility() {
    await expect(this.username).toBeVisible();
  }
}
