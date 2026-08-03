/// <reference types='codeceptjs' />
type homepage = typeof import("./codecept/pages/homepage").default;

declare namespace CodeceptJS {
  interface SupportObject {
    I: I;
    current: any;
    homepage: homepage;
  }
  interface Methods extends Playwright {}
  interface I extends WithTranslation<Methods> {}
  namespace Translation {
    interface Actions {}
  }
}
