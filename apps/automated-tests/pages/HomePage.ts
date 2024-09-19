import { type Page } from "@playwright/test";
import { URLS } from "utils/constants";

import { BasePage } from "./BasePage";

export class HomePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async navigate() {
    await this.page.goto(URLS().HOME_PAGE);
  }

  async clickSeeAllProducts() {
    await this.page.click("text=See all products");
  }
}
