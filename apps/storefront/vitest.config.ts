import { config } from "dotenv";
import { resolve } from "path";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

// Debug: Load and log .env.test file
const envTestPath = resolve(process.cwd(), ".env.test");
const dotenvResult = config({ path: envTestPath });

console.log("=== Vitest Config Debug ===");
console.log("Looking for .env.test at:", envTestPath);
console.log(".env.test exists:", dotenvResult.parsed !== undefined);
console.log(".env.test parsed:", dotenvResult.parsed || "{}");
if (dotenvResult.error) {
  console.log(".env.test error:", dotenvResult.error.message);
}

// Debug: Show final merged env
const finalEnv = {
  ...process.env,
  ...dotenvResult.parsed,
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
