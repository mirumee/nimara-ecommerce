import { locate } from "codeceptjs";

import { URLS } from "../data/constants";

const { I } = inject();

export default {
  add_example_tshirt_to_cart(timeout: number) {
    I.waitForVisible({ role: "radio", name: "L" }, timeout);
    I.click({ role: "radio", name: "L" });
    I.waitForVisible({ role: "combobox", name: "Variant select" }, timeout);
    I.click({ role: "combobox", name: "Variant select" });
    I.click("L regular");
    I.click(locate("button").withText("Add to bag"));
  },
  click_go_to_bag_popup(timeout: number) {
    //pause();
    I.waitForVisible({ role: "link", name: "Go to bag" }, timeout);
    I.waitForFunction(
      (selector: string) => {
        // waiting for the animation to finish before clicking
        const el = document.querySelector(selector);

        if (!el) {return false;}
        const animations = el.getAnimations();

        
return (
          animations.length === 0 ||
          animations.every((a: Animation) => a.playState === "finished")
        );
      },
      ['li[data-state="open"]'],
      timeout,
    );
    I.click({ role: "link", name: "Go to bag" });
  },

  go_to_bag(timeout: number) {
    I.click(locate("a").withText("Items in cart"));
    I.waitInUrl(URLS.CART_PAGE, timeout);
  },
};
