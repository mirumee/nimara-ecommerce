import { storeHeaders, TIMEOUTS } from "./data/constants";
const timeout_seconds = TIMEOUTS.timeout_seconds;

Feature("Login");

Scenario(
  "Login - positive, credentials from .env file",
  async ({ I, loginPage }) => {
    loginPage.enter_login_page();
    loginPage.login_as_user(timeout_seconds);
  },
);
