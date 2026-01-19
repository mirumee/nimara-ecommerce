import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

// eslint-disable-next-line import/no-default-export
export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
    passWithNoTests: true,
  },
});
