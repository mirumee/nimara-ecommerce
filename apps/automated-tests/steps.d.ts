/// <reference types='codeceptjs' />
type homepagePage = typeof import("./codecept/pages/homepagePage").default;
type productPage = typeof import("./codecept/pages/productPage").default;
type checkoutPage = typeof import("./codecept/pages/checkoutPage").default;
type cartPage = typeof import("./codecept/pages/cartPage").default;
type loginPage = typeof import("./codecept/pages/loginPage").default;

declare namespace CodeceptJS {
  interface SupportObject {
    I: I;
    cartPage: cartPage;
    checkoutPage: checkoutPage;
    current: any;
    homepagePage: homepagePage;
    loginPage: loginPage;
    productPage: productPage;
  }
  interface Methods extends Playwright {}
  interface I extends WithTranslation<Methods> {}
  namespace Translation {
    interface Actions {}
  }
}
