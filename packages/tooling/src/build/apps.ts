import { rm } from "node:fs/promises";
import { join } from "node:path";

import { build } from "vite";

import {
  type BuildTarget,
  getEntryPoints,
  readBuildTarget,
} from "../entry-points.ts";
import { nodeTarget } from "./node.ts";
import { type BuildTargetAdapter } from "./types.ts";
import { vercelTarget } from "./vercel.ts";

const ASSETS_PATH = "assets/";

const TARGETS: Record<BuildTarget, BuildTargetAdapter> = {
  node: nodeTarget,
  vercel: vercelTarget,
};

/**
 * One build pass per app, so each bundles into a single self-contained file
 * under `dist/<app>/`.
 */
export const buildApps = async ({ rootDir }: { rootDir: string }) => {
  const target = TARGETS[readBuildTarget()];
  const { client, server } = await getEntryPoints(
    join(rootDir, "src", "services"),
  );

  await rm(join(rootDir, "dist"), { recursive: true, force: true });

  for (const { name, path } of client) {
    await build({
      root: rootDir,
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
    // Always `dist/<app>/entry-server.js`, so the app name is the parent dir.
    await build({
      root: rootDir,
      define: {
        __CLIENT_ASSETS__: JSON.stringify(
          await target.clientAssets({
            assetsDir: join(rootDir, "dist", name, ASSETS_PATH),
            hasClient: client.some((entry) => entry.name === name),
          }),
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

  await target.finalize({ rootDir, server });
};
