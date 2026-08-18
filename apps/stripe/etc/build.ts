import { rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { build } from "vite";

import { BUILD_TARGET } from "../vite.config.ts";
import { getEntryPoints } from "./vite.ts";

const ROOT_DIR = join(dirname(fileURLToPath(import.meta.url)), "..");
const APPS_DIR = join(ROOT_DIR, "src", "apps");
const ASSETS_PATH = "assets/";

const { client, server } = await getEntryPoints(APPS_DIR);

await rm(join(ROOT_DIR, "dist"), { recursive: true, force: true });
await rm(join(ROOT_DIR, "public", "assets"), { recursive: true, force: true });

/**
 * One build pass per app so every app bundles into a single self-contained
 * file. The browser path `/assets/<app>-entry-client.js` is identical across targets;
 * only the on-disk layout differs (see `BUILD_TARGET`).
 */
for (const { name, path } of client) {
  await build({
    root: ROOT_DIR,
    mode: "client",
    build: {
      outDir: BUILD_TARGET === "node" ? `dist/${name}` : "public",
      rollupOptions: {
        input: path,
        output: {
          entryFileNames: `${ASSETS_PATH}${name}-entry-client.js`,
          assetFileNames: `${ASSETS_PATH}[name][extname]`,
        },
      },
    },
  });
}

for (const { name, path } of server) {
  // Always `dist/<app>/entry-server.js` (both targets) so the app name is just
  // the parent dir — see APP_NAME in entry-server.
  await build({
    root: ROOT_DIR,
    build: {
      outDir: `dist/${name}`,
      rollupOptions: {
        input: path,
        output: { entryFileNames: "entry-server.js" },
      },
    },
  });
}
