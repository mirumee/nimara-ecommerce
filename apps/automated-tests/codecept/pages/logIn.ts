import { URLS, user } from "../../utils/constants";

const { I } = inject();

export default {
  email: { role: "textbox", name: "email" },
  password: { role: "textbox", name: "password" },
  logInButton: { role: "button", name: "Log in" },
  showHideIcon: { role: "button", name: "Show/hide password" },
  logInHeader: { role: "heading", name: "Log in" },
  createAccountHeader: { role: "heading", name: "First time on Nimara Store?" },
  createAccountButton: { role: "link", name: "Create account" },
  resetPasswordLink: { role: "link", name: "I forgot my password" },
  username: { role: "link", name: user.name },

  open() {
    I.amOnPage(`/${URLS().SIGN_IN_PAGE}`);
  },

  seeUI() {
    [
      this.logInHeader,
      this.email,
      this.password,
      this.logInButton,
      this.createAccountHeader,
      this.createAccountButton,
      this.resetPasswordLink,
    ].forEach((locator) => I.seeElement(locator));
  },

  seePasswordHidden() {
    I.seeAttributesOnElements(this.password, { type: "password" });
  },

  revealPassword() {
    I.click(this.showHideIcon);
    I.seeAttributesOnElements(this.password, { type: "text" });
  },

  logIn(email: string, password: string) {
    I.fillField(this.email, email);
    I.fillField(this.password, password);
    I.click(this.logInButton);
  },

  seeLoggedIn() {
    I.seeInCurrentUrl(`${URLS().SIGN_IN_PAGE_RESULT}true`);
    I.seeElement(this.username);
  },
};
