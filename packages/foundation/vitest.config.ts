import { config } from "dotenv";
import { resolve } from "path";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

// Load .env.test from repo root (2 levels up from packages/foundation)
const repoRoot = resolve(process.cwd(), "../..");
const envTestPath = resolve(repoRoot, ".env.test");

// eslint-disable-next-line import/no-default-export
export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
    env: {
      ...process.env,
      ...config({ path: envTestPath }).parsed,
      NODE_ENV: "test",
    },
    passWithNoTests: true,
  },
});
