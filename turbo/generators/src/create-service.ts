import { existsSync, readdirSync } from "node:fs";
import { cp } from "node:fs/promises";
import { basename, join, relative, sep } from "node:path";

import { NOT_COPIED } from "./create-app.ts";
import {
  isDashboardPath,
  removeServiceDashboard,
  restoreAppDashboard,
} from "./dashboard.ts";
import { mergeServiceEnv } from "./env.ts";
import {
  type AppKind,
  requireKindForTarget,
  TEMPLATE_SERVICES,
  toDirectoryName,
} from "./names.ts";
import { renameQueue } from "./queue.ts";
import { rewriteServiceImports } from "./rename-service.ts";
import { detectBuildTarget } from "./target.ts";
import { applyTenancy, detectTenancy } from "./tenancy.ts";

export type CreateServiceInput = {
  app: string;
  kind: AppKind;
  name: string;
  root: string;
};

/**
 * `etc/build.ts` is what tells a Saleor app apart from the Next.js apps beside
 * it: only the former is built from `src/services/*`.
 */
const isApp = (appDir: string) => existsSync(join(appDir, "etc", "build.ts"));

/**
 * The apps a service can be added to. Synchronous because plop matches a
 * bypassed `--args` answer against a list of choices, not a promise of one.
 */
export const listApps = (root: string) => {
  const apps = join(root, "apps");

  if (!existsSync(apps)) {
    return [];
  }

  return readdirSync(apps, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && isApp(join(apps, entry.name)))
    .map((entry) => entry.name)
    .sort();
};

/**
 * Adds a service to an app that already exists. The build and the dev server
 * scan `src/services/*`, so nothing outside the new directory names it.
 */
export const createService = async ({
  app,
  kind,
  name,
  root,
}: CreateServiceInput) => {
  requireKindForTarget({ kind, target: detectBuildTarget({ app, root }) });

  // `--args` skips the prompt that would have filtered this.
  const serviceName = toDirectoryName(name);
  const appDir = join(root, "apps", app);
  const serviceDir = join(appDir, "src", "services", serviceName);

  const templateService = TEMPLATE_SERVICES[kind];
  const source = join(
    root,
    "templates",
    "app",
    "src",
    "services",
    templateService,
  );

  await cp(source, serviceDir, {
    errorOnExist: true,
    filter: (entry) => {
      if (NOT_COPIED.has(basename(entry))) {
        return false;
      }

      const path = relative(source, entry).split(sep).join("/");

      return kind === "dashboard" || !isDashboardPath(path);
    },
    force: false,
    recursive: true,
  });

  // Before the rewrite: the lines it cuts still name the template's service.
  if (kind === "http") {
    await removeServiceDashboard(serviceDir);
  }

  // A dashboard needs what the app around it may never have had.
  if (kind === "dashboard") {
    await restoreAppDashboard({ appDir, root });
  }

  if (kind === "queue") {
    await renameQueue({ app, service: serviceName, serviceDir });
  }

  await rewriteServiceImports({
    from: templateService,
    serviceDir,
    to: serviceName,
  });

  await mergeServiceEnv({ appDir, serviceDir });

  // Inherited, never asked again: the services share one `.env`.
  await applyTenancy({ appDir, tenancy: await detectTenancy(appDir) });

  return serviceDir;
};
