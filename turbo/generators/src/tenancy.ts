import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { type Tenancy } from "./names.ts";

const HELPERS: Record<Tenancy, string> = {
  multi: "prepareServiceConfig",
  single: "prepareSingleTenantServiceConfig",
};

const configFiles = async (servicesDir: string) => {
  const entries = await readdir(servicesDir, {
    recursive: true,
    withFileTypes: true,
  });

  return entries
    .filter((entry) => entry.isFile() && entry.name === "config.ts")
    .map((entry) => join(entry.parentPath, entry.name));
};

/**
 * A single-tenant app calls a different helper, which is what publishes
 * `SALEOR_DOMAIN`. Rewritten rather than templated so the generated file names
 * the helper it actually calls.
 */
export const applyTenancy = async ({
  appDir,
  tenancy,
}: {
  appDir: string;
  tenancy: Tenancy;
}) => {
  if (tenancy === "multi") {
    return;
  }

  const paths = await configFiles(join(appDir, "src", "services"));
  let rewritten = 0;

  /**
   * Idempotent: a service added to an app that is already single-tenant finds
   * its siblings converted, and only itself left to convert.
   */
  for (const path of paths) {
    const contents = await readFile(path, "utf8");

    if (!contents.includes(HELPERS.multi)) {
      continue;
    }

    await writeFile(path, contents.replaceAll(HELPERS.multi, HELPERS.single));
    rewritten += 1;
  }

  if (rewritten === 0) {
    throw new Error(`No service under ${appDir} calls ${HELPERS.multi}.`);
  }
};

/**
 * What the app already decided. A service added later inherits it: the services
 * share one `.env`, so one enforcing the rule and another not would leave the
 * app half-guarded.
 */
export const detectTenancy = async (appDir: string): Promise<Tenancy> => {
  const paths = await configFiles(join(appDir, "src", "services"));

  for (const path of paths) {
    if ((await readFile(path, "utf8")).includes(HELPERS.single)) {
      return "single";
    }
  }

  return "multi";
};
