import { locate } from "codeceptjs";

const { I } = inject();

export default {
  go_to_checkout_from_bag(timeout: number) {
    I.waitInUrl("/cart", timeout);
    I.waitForElement(locate("a").withText("Go to checkout"), timeout);
    I.click({ role: "link", name: "Go to checkout" });
    I.waitInUrl("/checkout/sign-in", timeout);
  },
};
