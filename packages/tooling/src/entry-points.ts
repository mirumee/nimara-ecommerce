import { existsSync } from "node:fs";
import { readdir, stat } from "node:fs/promises";
import { join } from "node:path";

import { z } from "zod";

export const BUILD_TARGETS = ["node", "vercel"] as const;

export type BuildTarget = (typeof BUILD_TARGETS)[number];

export type AppEntry = { name: string; path: string };

const SERVICE_TRIGGERS = ["http", "queue"] as const;

// What starts an invocation: a request, or a message on a queue.
type ServiceTrigger = (typeof SERVICE_TRIGGERS)[number];

export type ServiceEntry = AppEntry & { trigger: ServiceTrigger };

/**
 * The file a service is recognised by. Read off the file name, so nothing has
 * to evaluate app code to know what drives the service.
 */
const ENTRY_FILES: Record<ServiceTrigger, string> = {
  http: "entry-server.ts",
  queue: "entry-queue.ts",
};

export const readBuildTarget = (): BuildTarget => {
  const parsed = z.enum(BUILD_TARGETS).safeParse(process.env.BUILD_TARGET);

  if (!parsed.success) {
    throw new Error(
      `BUILD_TARGET must be one of: ${BUILD_TARGETS.join(", ")}. Received: ${process.env.BUILD_TARGET ?? "(unset)"}.`,
    );
  }

  return parsed.data;
};

// A service dir holds one entry file, plus `entry-client.tsx` if it ships a UI.
export const getEntryPoints = async (servicesDir: string) => {
  const items = await readdir(servicesDir);
  const entryPoints: { client: AppEntry[]; services: ServiceEntry[] } = {
    client: [],
    services: [],
  };

  for (const item of items) {
    const serviceDir = join(servicesDir, item);

    if (!(await stat(serviceDir)).isDirectory()) {
      continue;
    }

    const found = SERVICE_TRIGGERS.filter((trigger) =>
      existsSync(join(serviceDir, ENTRY_FILES[trigger])),
    );

    /**
     * One service is one deployed unit, and a unit is either answered over HTTP
     * or driven by a queue. Two entries side by side leave no single handler to
     * point a deployment at.
     */
    if (found.length > 1) {
      throw new Error(
        `${item} has both ${Object.values(ENTRY_FILES).join(" and ")}. A service is served over HTTP or driven by a queue; split it in two.`,
      );
    }

    const [trigger] = found;

    // A directory with neither entry file is not a service.
    if (trigger) {
      entryPoints.services.push({
        name: item,
        path: join(serviceDir, ENTRY_FILES[trigger]),
        trigger,
      });
    }

    const clientEntry = join(serviceDir, "entry-client.tsx");

    if (existsSync(clientEntry)) {
      entryPoints.client.push({ name: item, path: clientEntry });
    }
  }

  return entryPoints;
};
