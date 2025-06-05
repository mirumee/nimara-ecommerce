import { test } from "fixtures/fixtures";
import { URLS, userEmail, userPassword } from "utils/constants";

test.describe(
  "Auth - Log in",
  {
    tag: "@CI",
  },
  () => {
    const testEnvUrl = process.env.TEST_ENV_URL ?? "";

    test.beforeEach(async ({ logInPage }) => {
      await logInPage.navigate(testEnvUrl + "/" + URLS().SIGN_IN_PAGE);
    });

    test("User is able to see UI elements of the page", async ({
      logInPage,
    }) => {
      await logInPage.assertUIVisibility();
    });

    test("User sees that password by default is hidden form view and can be seen after clicking on the eye icon", async ({
      logInPage,
    }) => {
      await logInPage.assertPasswordVisibility(false);
      await logInPage.assertPasswordVisibility(true);
    });

    test("User is able to log in using email and password", async ({
      logInPage,
    }) => {
      await logInPage.logIn(userPassword, userEmail);
      await logInPage.expectPageToHaveUrl(
        testEnvUrl + "/" + URLS().SIGN_IN_PAGE_RESULT + true,
      );
      await logInPage.assertUserNameVisibility();
    });

    test("User will be redirected to sing in page after clicking on the button", async ({
      logInPage,
    }) => {
      await logInPage.clickCreateAccountButton();
      await logInPage.expectPageToHaveUrl(
        testEnvUrl + "/" + URLS().CREATE_ACCOUNT,
      );
    });

    test("User will ne redirected to reset password page after clicking on the link", async ({
      logInPage,
    }) => {
      await logInPage.clickResetPasswordLink();
      await logInPage.expectPageToHaveUrl(
        testEnvUrl + "/" + URLS().RESET_PASSWORD,
      );
    });
  },
);
