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
  retries: process.env.CI ? 2 : 2,
  workers: process.env.CI ? 1 : undefined,

  reporter: process.env.CI ? "dot" : "list",
  use: {
    baseURL: process.env.TEST_ENV_URL,
    trace: "on-first-retry",
    video: "on", // Highly recommended for debugging
    screenshot: "on",
    navigationTimeout: 30 * 1000, // Good general timeout for navigation
    launchOptions: {},
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
    {
      name: "firefox",
      use: {
        ...devices["Desktop Firefox"],
      },
    },
    {
      name: "webkit",
      use: {
        ...devices["Desktop Safari"],
      },
    },
  ],
});

// eslint-disable-next-line import/no-default-export
export default config;
