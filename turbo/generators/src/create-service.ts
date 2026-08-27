import { existsSync, readdirSync } from "node:fs";
import { cp, readdir, readFile, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";

import { NOT_COPIED } from "./create-app.ts";
import { TEMPLATE_SERVICE, toDirectoryName } from "./names.ts";
import { applyTenancy, detectTenancy } from "./tenancy.ts";

export type CreateServiceInput = {
  app: string;
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
 * `tsconfig.json` maps `@/*` onto `src/*`, so the copied files still reach into
 * the template's service by name until they are rewritten.
 */
const rewriteImports = async ({
  name,
  serviceDir,
}: {
  name: string;
  serviceDir: string;
}) => {
  const prefix = `@/services/${TEMPLATE_SERVICE}/`;
  const entries = await readdir(serviceDir, {
    recursive: true,
    withFileTypes: true,
  });

  for (const entry of entries) {
    if (!entry.isFile() || !/\.tsx?$/.test(entry.name)) {
      continue;
    }

    const path = join(entry.parentPath, entry.name);
    const contents = await readFile(path, "utf8");

    if (contents.includes(prefix)) {
      await writeFile(path, contents.replaceAll(prefix, `@/services/${name}/`));
    }
  }
};

/**
 * Adds a service to an app that already exists. The build and the dev server
 * scan `src/services/*`, so nothing outside the new directory names it.
 */
export const createService = async ({
  app,
  name,
  root,
}: CreateServiceInput) => {
  // `--args` skips the prompt that would have filtered this.
  const serviceName = toDirectoryName(name);
  const appDir = join(root, "apps", app);
  const serviceDir = join(appDir, "src", "services", serviceName);

  await cp(
    join(root, "templates", "app", "src", "services", TEMPLATE_SERVICE),
    serviceDir,
    {
      errorOnExist: true,
      filter: (entry) => !NOT_COPIED.has(basename(entry)),
      force: false,
      recursive: true,
    },
  );

  await rewriteImports({ name: serviceName, serviceDir });

  // Inherited, never asked again: the services share one `.env`.
  await applyTenancy({ appDir, tenancy: await detectTenancy(appDir) });

  return serviceDir;
};
