import { URLS } from "codecept/data/constants";
import { locate } from "codeceptjs";

const { I } = inject();

export default {
  go_to_checkout_from_bag(timeout: number) {
    I.waitInUrl(URLS.CART_PAGE, timeout);
    I.waitForElement(locate("a").withText("Go to checkout"), timeout);
    I.click({ role: "link", name: "Go to checkout" });
    I.waitInUrl(URLS.CHECKOUT_PAGE_SIGN_IN, timeout);
  },
};
