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
  timeout: 60 * 1000,
  expect: {
    timeout: 5 * 1000,
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
    video: "retain-on-failure",
    screenshot: "only-on-failure",
    launchOptions: {},
  },
  projects: [
    {
      name: "Chrome",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
    {
      name: "Firefox",
      use: {
        ...devices["Desktop Firefox"],
      },
    },
    {
      name: "Safari",
      use: {
        ...devices["Desktop Safari"],
      },
    },
  ],
});

// eslint-disable-next-line import/no-default-export
export default config;
