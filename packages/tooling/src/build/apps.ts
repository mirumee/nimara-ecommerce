import { rm } from "node:fs/promises";
import { basename, join } from "node:path";

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
 * One build pass per service, so each bundles into a single self-contained file
 * under `dist/<service>/`.
 */
export const buildApps = async ({ rootDir }: { rootDir: string }) => {
  const target = TARGETS[readBuildTarget()];
  const { client, services } = await getEntryPoints(
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

  for (const { name, path } of services) {
    // The entry file keeps its name, so the bundle still says what drives it.
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
          output: { entryFileNames: `${basename(path, ".ts")}.js` },
        },
      },
    });
  }

  await target.finalize({ rootDir, services });
};
