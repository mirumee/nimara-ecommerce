import { storeHeaders, timeoutSeconds } from "./data/constants";

Feature("Login");

Scenario(
  "Login - positive, credentials from .env file",
  async ({ I, loginPage }) => {
    loginPage.enterLoginPage();
    loginPage.loginAsUser(timeoutSeconds);
  },
);
