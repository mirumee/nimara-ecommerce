import { builtinModules } from "node:module";
import { join } from "node:path";

import devServer, { defaultOptions } from "@hono/vite-dev-server";
import react from "@vitejs/plugin-react";
import { config } from "dotenv";
import { defineConfig, mergeConfig, type UserConfig } from "vite";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";

import { hasClientEntry, readBuildTarget } from "../entry-points.ts";
import { generatePackageJson, loadDevServerEntry } from "./plugins.ts";

/**
 * Shared dev and build config for apps under `src/apps/*`.
 * When app needs to use custom config it goes through `overrides`, never a new parameter here.
 */
export const createViteConfig = ({
  devServerEntry = "./src/dev-server.ts",
  overrides,
  port: defaultPort,
}: {
  devServerEntry?: string;
  overrides?: UserConfig | ((opts: { mode: string }) => UserConfig);
  port: number;
}) =>
  defineConfig(({ mode }): UserConfig => {
    config({ path: ".env.local", quiet: true });
    config({ quiet: true });

    // An app with no dashboard has no React installed to load.
    const clientPlugins = hasClientEntry(join(process.cwd(), "src", "services"))
      ? [react()]
      : [];

    const withOverrides = (base: UserConfig) =>
      mergeConfig(
        base,
        (typeof overrides === "function" ? overrides({ mode }) : overrides) ??
          {},
      );

    if (mode === "client") {
      return withOverrides({
        resolve: { tsconfigPaths: true },
        publicDir: false,
        // `@saleor/app-sdk` still emits Node-style `global`; without this the
        // browser bundle throws `ReferenceError: global is not defined` on load.
        define: { global: "globalThis" },
        plugins: [...clientPlugins, cssInjectedByJsPlugin()],
        build: {
          emptyOutDir: false,
          minify: true,
          rollupOptions: { output: { codeSplitting: false } },
        },
      });
    }

    return withOverrides({
      resolve: { tsconfigPaths: true },
      publicDir: false,
      // `buildApps` overrides the assets with the real ones on `vercel`.
      define: {
        __BUILD_TARGET__: JSON.stringify(readBuildTarget()),
        __CLIENT_ASSETS__: "{}",
      },
      server: {
        port: Number(process.env.PORT || defaultPort),
        allowedHosts: [".ngrok.io", ".ngrok.app"],
      },
      plugins: [
        ...clientPlugins,
        generatePackageJson(),
        {
          ...devServer({
            entry: devServerEntry,
            exclude: [...defaultOptions.exclude, /^\/assets\/.*/],
          }),
          apply: "serve",
        },
        loadDevServerEntry({ entry: devServerEntry }),
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
    });
  });
