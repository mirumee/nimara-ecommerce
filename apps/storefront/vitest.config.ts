import { config } from "dotenv";
import { existsSync } from "fs";
import { resolve } from "path";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

// Debug: Load and log .env.test file
const envTestPath = resolve(process.cwd(), ".env.test");
const fileExists = existsSync(envTestPath);
const dotenvResult = config({ path: envTestPath });

console.log("=== Vitest Config Debug ===");
console.log("Looking for .env.test at:", envTestPath);
console.log(".env.test file exists:", fileExists);
console.log(".env.test parsed:", dotenvResult.parsed || "{}");
if (dotenvResult.error && fileExists) {
  console.log(".env.test error:", dotenvResult.error.message);
}

// Provide default test values if .env.test doesn't exist or in CI
const defaultTestEnv = {
  NEXT_PUBLIC_DEFAULT_CHANNEL:
    process.env.NEXT_PUBLIC_DEFAULT_CHANNEL || "default-channel",
  NEXT_PUBLIC_SALEOR_API_URL:
    process.env.NEXT_PUBLIC_SALEOR_API_URL ||
    "https://test.saleor.cloud/graphql/",
  NEXT_PUBLIC_PAYMENT_APP_ID:
    process.env.NEXT_PUBLIC_PAYMENT_APP_ID || "TEST.payment-app-id",
  NEXT_PUBLIC_STRIPE_PUBLIC_KEY:
    process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY ||
    "pk_test_placeholder_key_for_testing",
};

// Use .env.test if it exists and has content, otherwise use defaults
const envFromFile =
  fileExists &&
  dotenvResult.parsed &&
  Object.keys(dotenvResult.parsed).length > 0
    ? dotenvResult.parsed
    : defaultTestEnv;

// Debug: Show final merged env
const finalEnv = {
  ...process.env,
  ...envFromFile,
  NODE_ENV: "test" as const,
};

// Check for required test environment variables
const requiredVars = [
  "NEXT_PUBLIC_DEFAULT_CHANNEL",
  "NEXT_PUBLIC_SALEOR_API_URL",
  "NEXT_PUBLIC_PAYMENT_APP_ID", // Note: schema expects PAYMENT_APP_ID but reads NEXT_PUBLIC_PAYMENT_APP_ID
  "NEXT_PUBLIC_STRIPE_PUBLIC_KEY", // Note: schema expects STRIPE_PUBLIC_KEY but reads NEXT_PUBLIC_STRIPE_PUBLIC_KEY
];

const missingVars = requiredVars.filter(
  (key) => !(finalEnv as Record<string, string | undefined>)[key],
);

if (missingVars.length > 0) {
  console.log("\n⚠️  Missing required environment variables:");
  missingVars.forEach((key) => console.log(`  - ${key}`));
  console.log(
    "\n💡 Create a .env.test file in the storefront directory with these variables.",
  );
} else {
  console.log("\n✅ All required environment variables are present");
  if (!fileExists) {
    console.log("   (Using default test values since .env.test doesn't exist)");
  }
}

console.log("\nFinal merged env keys count:", Object.keys(finalEnv).length);
console.log("===========================");

// eslint-disable-next-line import/no-default-export
export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
    env: finalEnv,
    setupFiles: ["./src/foundation/tests/setup"],
  },
});
