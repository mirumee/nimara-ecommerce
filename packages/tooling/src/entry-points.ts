import { existsSync } from "node:fs";
import { readdir, stat } from "node:fs/promises";
import { join } from "node:path";

import { z } from "zod";

export const BUILD_TARGETS = ["node", "vercel"] as const;

export type BuildTarget = (typeof BUILD_TARGETS)[number];

export type AppEntry = { name: string; path: string };

export const readBuildTarget = (): BuildTarget => {
  const parsed = z.enum(BUILD_TARGETS).safeParse(process.env.BUILD_TARGET);

  if (!parsed.success) {
    throw new Error(
      `BUILD_TARGET must be one of: ${BUILD_TARGETS.join(", ")}. Received: ${process.env.BUILD_TARGET ?? "(unset)"}.`,
    );
  }

  return parsed.data;
};

// An app dir holds
// - `entry-server.ts`
// - `entry-client.tsx`* only if it ships a UI.
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
