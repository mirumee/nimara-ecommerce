import { existsSync } from "node:fs";
import { readdir, stat } from "node:fs/promises";
import { join } from "node:path";

import type { Plugin } from "vite";

export type AppEntry = { name: string; path: string };

export type BuildTarget = "node" | "vercel";

/**
 * Discovers per-app entry points under `src/apps/*`. Each app dir may hold an
 * `entry-server.ts` (Hono app + handler) and an `entry-client.tsx`
 * (React UI).
 */
export const getEntryPoints = async (appsDir: string) => {
  const items = await readdir(appsDir);
  const entryPoints: { client: AppEntry[]; server: AppEntry[] } = {
    client: [],
    server: [],
  };

  for (const item of items) {
    const appDir = join(appsDir, item);

    if (!(await stat(appDir)).isDirectory()) {
      continue;
    }

    const serverEntry = join(appDir, "entry-server.ts");
    const clientEntry = join(appDir, "entry-client.tsx");

    if (existsSync(serverEntry)) {
      entryPoints.server.push({ name: item, path: serverEntry });
    }

    if (existsSync(clientEntry)) {
      entryPoints.client.push({ name: item, path: clientEntry });
    }
  }

  return entryPoints;
};

/**
 * Emits a `{ "type": "module" }` package.json next to the server bundle so
 * AWS Lambda treats the emitted `.js` as ESM.
 */
export const generatePackageJson = (): Plugin => ({
  name: "generate-package-json",
  generateBundle() {
    this.emitFile({
      type: "asset",
      fileName: "package.json",
      source: JSON.stringify({ type: "module" }, null, 2),
    });
  },
});
