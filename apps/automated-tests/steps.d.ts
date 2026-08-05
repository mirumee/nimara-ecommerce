/// <reference types='codeceptjs' />
type homepage = typeof import("./codecept/pages/homepage").default;

declare namespace CodeceptJS {
  interface SupportObject {
    I: I;
    bagPage: any;
    checkoutPage: any;
    current: any;
    homepage: homepage;
    homepagePage: any;
    productPage: any;
  }
  interface Methods extends Playwright {}
  interface I extends WithTranslation<Methods> {}
  namespace Translation {
    interface Actions {}
  }
}
