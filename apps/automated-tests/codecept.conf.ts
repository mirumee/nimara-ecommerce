import { config as envConfig } from "dotenv";

envConfig();

if (process.env.TEST_ENV_URL === undefined) {
  throw new Error("Missing TEST_ENV_URL");
}

/**
 * CodeceptJS trial configuration. Scoped to `codecept/` so it can never pick up
 * the Playwright specs in `tests/`. See docs/adr/0001-codeceptjs-spike.md.
 */
export const config = {
  name: "automated-tests",
  // The v4 default for new projects. Feature/Scenario/Before and inject() are
  // still available unimported, so this costs nothing at the call site.
  noGlobals: true,
  tests: "./codecept/**/*_test.ts",
  output: "./output",
  // Transpiles the TypeScript test files; see https://codecept.io/typescript/
  // `tsx/esm` (not the docs' `tsx/cjs`) because this workspace is "type": "module".
  require: ["tsx/esm"],
  helpers: {
    Playwright: {
      url: process.env.TEST_ENV_URL,
      browser: "chromium",
      show: !process.env.CI,
    },
  },
  include: {
    homepage: "./codecept/pages/homepage.ts",
    homepagePage: "./codecept/pages/homepagePage.ts",
    productPage: "./codecept/pages/productPage.ts",
    checkoutPage: "./codecept/pages/checkoutPage.ts",
    bagPage: "./codecept/pages/cartPage.ts",
  },
};
