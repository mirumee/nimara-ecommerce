import { builtinModules } from "node:module";

import devServer, { defaultOptions } from "@hono/vite-dev-server";
import react from "@vitejs/plugin-react";
import { config } from "dotenv";
import { defineConfig, type UserConfig } from "vite";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";

import { generatePackageJson, readBuildTarget } from "./etc/vite.ts";

config({ path: ".env.local", quiet: true });
config({ quiet: true });

const PORT = Number(process.env.PORT || 4000);

export const BUILD_TARGET = readBuildTarget();

/**
 * Base config for dev + build. `etc/build.ts` runs one build per app, passing
 * the entry input and per-app output names; this file provides the shared
 * plugins/SSR settings.
 */
export default defineConfig(({ mode }): UserConfig => {
  if (mode === "client") {
    return {
      resolve: { tsconfigPaths: true },
      publicDir: false,
      // `@saleor/app-sdk` still emits Node-style `global`; without this the
      // browser bundle throws `ReferenceError: global is not defined` on load.
      define: { global: "globalThis" },
      plugins: [react(), cssInjectedByJsPlugin()],
      build: {
        emptyOutDir: false,
        minify: true,
        rollupOptions: { output: { codeSplitting: false } },
      },
    };
  }

  return {
    resolve: { tsconfigPaths: true },
    publicDir: false,
    // `etc/build.ts` overrides the assets with the real ones on `vercel`.
    define: {
      __BUILD_TARGET__: JSON.stringify(BUILD_TARGET),
      __CLIENT_ASSETS__: "{}",
    },
    server: {
      port: PORT,
      allowedHosts: [".ngrok.io", ".ngrok.app"],
    },
    plugins: [
      react(),
      generatePackageJson(),
      {
        ...devServer({
          entry: "./src/dev-server.ts",
          exclude: [...defaultOptions.exclude, /^\/assets\/.*/],
        }),
        apply: "serve",
      },
    ],
    ssr: {
      target: "node",
      // Workspace packages ship TS sources — bundle them; node_modules stay
      // external and are traced at deploy time.
      noExternal: [/^@nimara\//],
    },
    build: {
      ssr: true,
      emptyOutDir: false,
      minify: false,
      rollupOptions: {
        external: [...builtinModules, /^node:/],
        output: { codeSplitting: false },
      },
    },
  };
});
