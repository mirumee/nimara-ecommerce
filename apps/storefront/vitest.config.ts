import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
    env: {
      ...process.env,
      NODE_ENV: "test",
    },
    setupFiles: ["./src/foundation/tests/setup"],
    passWithNoTests: true,
    server: {
      deps: {
        inline: ["next-intl"],
      },
    },
  },
});
