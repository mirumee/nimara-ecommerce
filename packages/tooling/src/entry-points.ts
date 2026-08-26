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
export const getEntryPoints = async (servicesDir: string) => {
  const items = await readdir(servicesDir);
  const entryPoints: { client: AppEntry[]; server: AppEntry[] } = {
    client: [],
    server: [],
  };

  for (const item of items) {
    const serviceDir = join(servicesDir, item);

    if (!(await stat(serviceDir)).isDirectory()) {
      continue;
    }

    const serverEntry = join(serviceDir, "entry-server.ts");
    const clientEntry = join(serviceDir, "entry-client.tsx");

    if (existsSync(serverEntry)) {
      entryPoints.server.push({ name: item, path: serverEntry });
    }

    if (existsSync(clientEntry)) {
      entryPoints.client.push({ name: item, path: clientEntry });
    }
  }

  return entryPoints;
};
