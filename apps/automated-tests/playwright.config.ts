import { defineConfig, devices } from "@playwright/test";
import { config as envConfig } from "dotenv";

envConfig();

if (process.env.TEST_ENV_URL === undefined) {
  throw new Error("Missing TEST_ENV_URL");
}

/**
 * See https://playwright.dev/docs/test-configuration.
 */
const config = defineConfig({
  testDir: "./tests",
  timeout: 90 * 1000, // 90 seconds
  expect: {
    timeout: 5 * 1000, //5 seconds
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,

  // Give failing tests 2 retry attempts on CI
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 1,
  reporter: process.env.CI ? "dot" : "list",
  use: {
    baseURL: process.env.TEST_ENV_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure", //-> test will take screenshot on failure  they will be placed in test-result folder
    //launchOptions: {slowMo:500}, -> uncomment to run test in slow motion (works for both headless and headed)
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
  ],
});

// eslint-disable-next-line import/no-default-export
export default config;
