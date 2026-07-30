/// <reference types='codeceptjs' />
type logInPage = typeof import("./codecept/pages/logIn").default;

declare namespace CodeceptJS {
  interface SupportObject {
    I: I;
    current: any;
    logInPage: logInPage;
  }
  interface Methods extends Playwright {}
  interface I extends WithTranslation<Methods> {}
  namespace Translation {
    interface Actions {}
  }
}
