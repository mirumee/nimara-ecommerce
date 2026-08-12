/// <reference types='codeceptjs' />
type homepage = typeof import("./codecept/pages/homepage").default;
type homepagePage = typeof import("./codecept/pages/homepagePage").default;
type productPage = typeof import("./codecept/pages/productPage").default;
type checkoutPage = typeof import("./codecept/pages/checkoutPage").default;
type bagPage = typeof import("./codecept/pages/cartPage").default;

declare namespace CodeceptJS {
  interface SupportObject {
    I: I;
    bagPage: bagPage;
    checkoutPage: checkoutPage;
    current: any;
    homepage: homepage;
    homepagePage: homepagePage;
    productPage: productPage;
  }
  interface Methods extends Playwright {}
  interface I extends WithTranslation<Methods> {}
  namespace Translation {
    interface Actions {}
  }
}
