import { locate } from "codeceptjs";

const { I } = inject();

const tshirtImage = locate("img").withAttr({
  "aria-label": "Abstract Tshirt Ultra Black",
});

export default {
  enter_page() {
    I.amOnPage("/");
  },
  accept_cookies() {
    I.click("Accept all");
    I.dontSee("We use cookies");
  },
  click_on_product(timeout: number) {
    I.scrollTo(tshirtImage);
    I.click(tshirtImage);
    I.waitUrlEquals("/products/abstract-tshirt-black", timeout);
  },
};
