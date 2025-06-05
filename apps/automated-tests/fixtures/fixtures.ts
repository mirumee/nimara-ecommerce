import { test as base } from "@playwright/test";
import { BasePage } from "pages/BasePage";
import { CartPage } from "pages/CartPage";
import { CheckoutLoginPage } from "pages/CheckoutLoginPage";
import { CheckoutPage } from "pages/CheckoutPage";
import { HomePage } from "pages/HomePage";
import { LogInPage } from "pages/LogInPage";
import { ProductPage } from "pages/ProductPage";
import { ProductsPage } from "pages/ProductsPage";

type Fixtures = {
  basePage: BasePage;
  cartPage: CartPage;
  checkoutLoginPage: CheckoutLoginPage;
  checkoutPage: CheckoutPage;
  homePage: HomePage;
  logInPage: LogInPage;
  productPage: ProductPage;
  productsPage: ProductsPage;
};

export const test = base.extend<Fixtures>({
  basePage: async ({ page }, use) => {
    await use(new BasePage(page));
  },
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },
  checkoutLoginPage: async ({ page }, use) => {
    await use(new CheckoutLoginPage(page));
  },
  checkoutPage: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  },
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  productPage: async ({ page, context }, use) => {
    await use(new ProductPage(page, context));
  },
  productsPage: async ({ page }, use) => {
    await use(new ProductsPage(page));
  },
  logInPage: async ({ page }, use) => {
    await use(new LogInPage(page));
  },
});

export { expect } from "@playwright/test";
