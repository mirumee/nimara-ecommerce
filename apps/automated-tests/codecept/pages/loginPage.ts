import { URLS, userEmail, userPassword } from "../data/constants";

const { I } = inject();

export default {
  enter_login_page() {
    I.amOnPage(URLS.LOGIN_PAGE);
  },
  login_as_user(timeout: number) {
    I.fillField({ role: "textbox", name: "Email" }, userEmail);
    I.fillField({ role: "textbox", name: "Password" }, userPassword);
    I.click({ role: "button", name: "Log in" });
    I.waitInUrl(URLS.LOGIN_PAGE_RESULT, timeout);
  },
};
