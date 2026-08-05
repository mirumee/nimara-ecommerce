import { locate } from "codeceptjs";

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
    I.waitForElement('a[data-radix-toast-announce-alt="Go to bag"]', timeout);
    I.click("Go to bag");
  },
  /* DO POPRAWKI
  go_to_bag(timeout: number) {
    I.click(locate('a').withText('Items in cart'));
    I.waitInUrl('/cart', timeout);
  },
  */
};
