import {
  black_sandImagelocator,
  storeHeaders,
  tshirtImagelocator,
  URLS,
} from "../data/constants";

const { I } = inject();

export default {
  enter_page() {
    I.amOnPage(URLS.HOME_PAGE);
  },
  accept_cookies() {
    I.click(storeHeaders.cookieAccept);
    I.dontSee(storeHeaders.cookiePopup);
  },
  click_on_product1(timeout: number) {
    I.scrollTo(tshirtImagelocator);
    I.click(tshirtImagelocator);
    I.waitUrlEquals(URLS.TSHIRT_PRODUCT_PAGE, timeout);
  },
  click_on_product2(timeout: number) {
    I.scrollTo(black_sandImagelocator);
    I.click(black_sandImagelocator);
    I.waitInUrl(URLS.BLACK_SAND_PRODUCT_PAGE, timeout);
  },
};
