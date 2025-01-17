import { defineConfig, devices } from "@playwright/test";

if (process.env.TEST_ENV_URL === undefined) {
  process.stderr.write(
    "Invalid or missing value for TEST_ENV_URL. Skipping.\n",
    process.env.TEST_ENV_URL,
  );
  process.exit(1);
}

/**
 * See https://playwright.dev/docs/test-configuration.
 */
const config = defineConfig({
  testDir: "./tests",
  timeout: 30 * 1000,
  expect: {
    timeout: 5 * 1000,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,

  // Give failing tests 2 retry attempts on CI
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "dot" : "list",
  use: {
    baseURL: process.env.TEST_ENV_URL,
    actionTimeout: 0,
    trace: "on-first-retry",
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
