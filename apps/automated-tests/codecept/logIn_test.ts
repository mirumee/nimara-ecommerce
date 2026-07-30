import { URLS, userEmail, userPassword } from "../utils/constants";

Feature("Auth - Log in");

Before(({ logInPage }) => {
  logInPage.open();
});

Scenario("User is able to see UI elements of the page", ({ logInPage }) => {
  logInPage.seeUI();
});

Scenario(
  "User sees that password by default is hidden form view and can be seen after clicking on the eye icon",
  ({ logInPage }) => {
    logInPage.seePasswordHidden();
    logInPage.revealPassword();
  },
);

Scenario("User is able to log in using email and password", ({ logInPage }) => {
  logInPage.logIn(userEmail, userPassword);
  logInPage.seeLoggedIn();
});

Scenario(
  "User will be redirected to sign in page after clicking on the button",
  ({ I, logInPage }) => {
    I.click(logInPage.createAccountButton);
    I.seeInCurrentUrl(URLS().CREATE_ACCOUNT);
  },
);

Scenario(
  "User will be redirected to reset password page after clicking on the link",
  ({ I, logInPage }) => {
    I.click(logInPage.resetPasswordLink);
    I.seeInCurrentUrl(URLS().RESET_PASSWORD);
  },
);
