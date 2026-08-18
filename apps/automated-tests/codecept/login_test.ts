import { storeHeaders, timeout_seconds } from "./data/constants";

Feature("Login");

Scenario(
  "Login - positive, credentials from .env file",
  async ({ I, loginPage }) => {
    loginPage.enter_login_page();
    loginPage.login_as_user(timeout_seconds);
  },
);
