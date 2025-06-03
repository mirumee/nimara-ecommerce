import { expect, type Locator, type Page } from "@playwright/test";
import { user } from "utils/constants";

import { BasePage } from "./BasePage";

export class HeaderPage extends BasePage {
  readonly username: Locator;

  constructor(page: Page) {
    super(page);
    this.username = page.getByRole("link", { name: user.name });
  }

  async assertUserNameVisibility() {
    await expect(this.username).toBeVisible();
  }
}
