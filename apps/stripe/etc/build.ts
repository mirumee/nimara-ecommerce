import { readdir, readFile, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { build } from "vite";

import { BUILD_TARGET } from "../vite.config.ts";
import { getEntryPoints } from "./vite.ts";

const ROOT_DIR = join(dirname(fileURLToPath(import.meta.url)), "..");
const APPS_DIR = join(ROOT_DIR, "src", "apps");
const ASSETS_PATH = "assets/";

const { client, server } = await getEntryPoints(APPS_DIR);

/**
 * Reads a built app's assets as base64, for `__CLIENT_ASSETS__`. Vercel ships
 * into the function only what it can trace through imports, so there the assets
 * travel inside the server bundle; base64 keeps binaries intact.
 */
const readClientAssets = async (dir: string) =>
  Object.fromEntries(
    await Promise.all(
      (await readdir(dir)).map(
        async (file) =>
          [file, (await readFile(join(dir, file))).toString("base64")] as const,
      ),
    ),
  );

await rm(join(ROOT_DIR, "dist"), { recursive: true, force: true });

/**
 * One build pass per app so every app bundles into a single self-contained
 * file, served from `dist/<app>/` — the server bundle plus the `assets/` its
 * HTML shell points at.
 */
for (const { name, path } of client) {
  await build({
    root: ROOT_DIR,
    mode: "client",
    build: {
      outDir: `dist/${name}`,
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
  const assetsDir = join(ROOT_DIR, "dist", name, ASSETS_PATH);
  const hasClient = client.some((entry) => entry.name === name);

  // Always `dist/<app>/entry-server.js` (both targets) so the app name is just
  // the parent dir — see APP_NAME in entry-server.
  await build({
    root: ROOT_DIR,
    define: {
      __CLIENT_ASSETS__: JSON.stringify(
        BUILD_TARGET === "vercel" && hasClient
          ? await readClientAssets(assetsDir)
          : {},
      ),
    },
    build: {
      outDir: `dist/${name}`,
      rollupOptions: {
        input: path,
        output: { entryFileNames: "entry-server.js" },
      },
    },
  });
}
