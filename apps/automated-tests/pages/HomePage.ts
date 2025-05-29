import { expect, type Locator, type Page } from "@playwright/test";
import { storeHeaders, storeParagraphs, URLS } from "utils/constants";

import { BasePage } from "./BasePage";

export class HomePage extends BasePage {
  readonly heroBannerButton: Locator;
  readonly heroBannerHeader: Locator;
  readonly heroBannerImg: Locator;
  readonly newsletter: Locator;
  readonly newsletterDescription: Locator;
  readonly newsletterEmail: Locator;
  readonly newsletterName: Locator;
  readonly newsletterButton: Locator;
  readonly productsCarousel: Locator;
  readonly productsCarouselDescription: Locator;
  readonly allProductsCarouselButton: Locator;
  readonly seeAllProductsButton: Locator;
  readonly productPrice: Locator;

  constructor(page: Page) {
    super(page);
    this.heroBannerButton = page.getByRole("link", {
      name: "Explore products",
    });
    this.heroBannerHeader = page.getByRole("heading", {
      name: storeHeaders.heroBanner,
    });
    this.heroBannerImg = page.getByAltText("Nimara's hero banner");
    this.newsletter = page.getByRole("heading", {
      name: storeHeaders.newsletter,
    });
    this.newsletterDescription = page.getByText(storeParagraphs.newsletter);
    this.newsletterEmail = page.getByPlaceholder("john.doe@example.com");
    this.newsletterName = page.getByPlaceholder("John Doe");
    this.newsletterButton = page.getByRole("button", { name: "Subscribe" });
    this.productsCarousel = page.getByRole("heading", {
      name: storeHeaders.productsCarousel,
    });
    this.productsCarouselDescription = page.getByRole("heading", {
      name: storeHeaders.productsCarouselDescription,
    });
    this.allProductsCarouselButton = page.getByLabel("All products link");
    this.seeAllProductsButton = page.getByRole("link", {
      name: "All Nimara's best products",
    });
    this.productPrice = page.getByRole("heading", { name: "Price" });
  }

  async navigate() {
    await this.page.goto(URLS().HOME_PAGE);
  }

  async clickSeeAllProducts() {
    await this.seeAllProductsButton.click();
  }

  async clickHeroBannerButton() {
    await this.heroBannerButton.click();
  }

  async clickAllProductCarouselButton() {
    await this.allProductsCarouselButton.click();
  }

  async assertNewsletterPresence(enabledHomepageElements: boolean) {
    if (enabledHomepageElements) {
      await expect(this.newsletter).toBeVisible();
      await expect(this.newsletterDescription).toBeVisible();
      await expect(this.newsletterEmail).toBeVisible();
      await expect(this.newsletterName).toBeVisible();
      await expect(this.newsletterButton).toBeVisible();
    }
  }

  async assertProductCarouselPresence(productsCarouselList: boolean) {
    await expect(this.productsCarousel).toBeVisible();
    await expect(this.productsCarouselDescription).toBeVisible();
    if (productsCarouselList) {
      expect(await this.productPrice.count()).toBeGreaterThan(0);
    }
  }

  async assertHeroBannerPresence(heroBannerImage: boolean) {
    await expect(this.heroBannerHeader).toBeVisible();
    await expect(this.heroBannerButton).toBeVisible();
    if (heroBannerImage) {
      await expect(this.heroBannerImg).toBeVisible();
    }
  }
}
