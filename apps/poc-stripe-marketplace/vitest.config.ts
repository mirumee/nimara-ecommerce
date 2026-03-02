import { config } from "dotenv";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tsconfigPaths()],
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
