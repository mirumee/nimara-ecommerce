import { readdir, readFile, rename, writeFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * `tsconfig.json` maps `@/*` onto `src/*`, so the copied files still reach into
 * the template's service by name until they are rewritten. Scoped to the one
 * directory: a sibling service named after the template has imports of its own.
 */
export const rewriteServiceImports = async ({
  from,
  serviceDir,
  to,
}: {
  from: string;
  serviceDir: string;
  to: string;
}) => {
  const prefix = `@/services/${from}/`;
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
      await writeFile(path, contents.replaceAll(prefix, `@/services/${to}/`));
    }
  }
};

// A service's directory name is what it reports as `SERVICE`.
export const renameService = async ({
  appDir,
  from,
  to,
}: {
  appDir: string;
  from: string;
  to: string;
}) => {
  const services = join(appDir, "src", "services");
  const serviceDir = join(services, to);

  if (from !== to) {
    await rename(join(services, from), serviceDir);
  }

  await rewriteServiceImports({ from, serviceDir, to });
};
