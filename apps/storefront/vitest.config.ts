import { config } from "dotenv";
import { resolve } from "path";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

// Load .env.test from repo root (2 levels up from apps/storefront)
const repoRoot = resolve(process.cwd(), "../..");
const envTestPath = resolve(repoRoot, ".env.test");

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
    env: {
      ...process.env,
      ...config({ path: envTestPath }).parsed,
      NODE_ENV: "test",
    },
    setupFiles: ["./src/foundation/tests/setup"],
    server: {
      deps: {
        inline: ["next-intl"],
      },
    },
  },
});
