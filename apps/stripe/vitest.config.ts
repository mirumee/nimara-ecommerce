import { config } from "dotenv";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tsconfigPaths()],
  // Supplied per target by `vite.config.ts`; tests only need the module to load.
  define: { __CLIENT_ASSETS_DIR__: JSON.stringify("../../public/assets") },
  test: {
    environment: "node",
    env: {
      ...process.env,
      ...config({ path: ".env.test" }).parsed,
      NODE_ENV: "test",
    },
    setupFiles: ["./src/lib/test/setup"],
  },
});
