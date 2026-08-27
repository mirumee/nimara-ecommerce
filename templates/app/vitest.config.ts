import { config } from "dotenv";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  /**
   * The build supplies these; a test imports the server without going through
   * it. Node is the target that serves assets off disk, so nothing is inlined.
   */
  define: {
    __BUILD_TARGET__: JSON.stringify("node"),
    __CLIENT_ASSETS__: JSON.stringify({}),
  },
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
    env: {
      // Enough for the app to boot in a test; a real value belongs in `.env`.
      ENVIRONMENT: "test",
      ALLOWED_DOMAINS: "saleor.example.com",
      CONFIG_PROVIDER: "file",
      ...process.env,
      ...config({ path: ".env.test", quiet: true }).parsed,
      NODE_ENV: "test",
    },
    setupFiles: ["@nimara/lib/test/setup"],
  },
});
