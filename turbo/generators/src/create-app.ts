import { cp, readFile, writeFile } from "node:fs/promises";
import { basename, join, relative, sep } from "node:path";

import {
  isDashboardPath,
  removeAppDashboard,
  removeServiceDashboard,
} from "./dashboard.ts";
import {
  type AppKind,
  type BuildTarget,
  requireKindForTarget,
  TEMPLATE_NAME,
  TEMPLATE_PORT,
  TEMPLATE_SERVICE_DIRS,
  TEMPLATE_SERVICES,
  type Tenancy,
  toDirectoryName,
} from "./names.ts";
import { renameQueue } from "./queue.ts";
import { renameService } from "./rename-service.ts";
import { applyTenancy } from "./tenancy.ts";

// Copying `.env` would hand the new app someone else's Saleor token.
export const NOT_COPIED = new Set([
  ".env",
  ".app-config.json",
  ".turbo",
  "dist",
  "node_modules",
  "tsconfig.tsbuildinfo",
]);

export type CreateAppInput = {
  description: string;
  kind: AppKind;
  name: string;
  port: string;
  root: string;
  service: string;
  target: BuildTarget;
  tenancy: Tenancy;
};

// An app deployed elsewhere should not carry another platform's config.
const TARGET_ONLY = new Set(["vercel.json"]);

// Left behind, not cut down: another template service is a different program.
const unusedServicePaths = (kind: AppKind) =>
  TEMPLATE_SERVICE_DIRS.filter((dir) => dir !== TEMPLATE_SERVICES[kind]).map(
    (dir) => `src/services/${dir}`,
  );

const ALLOWED_DOMAINS_DOC = {
  multi: `# Comma-separated Saleor domains allowed to install the app, e.g.
# store.saleor.cloud. Empty allows none. Wildcards (\`*\`, \`*.saleor.cloud\`)
# widen it and belong in local development only.`,
  single: `# The one Saleor this app serves, e.g. store.saleor.cloud. Exactly one
# concrete domain: a wildcard names no host, and this app has to know which
# Saleor it is working with when nothing is asking it.`,
};

const copyTemplate = ({
  destination,
  kind,
  source,
  target,
}: {
  destination: string;
  kind: AppKind;
  source: string;
  target: BuildTarget;
}) =>
  cp(source, destination, {
    errorOnExist: true,
    filter: (entry) => {
      const name = basename(entry);

      if (
        NOT_COPIED.has(name) ||
        (target !== "vercel" && TARGET_ONLY.has(name))
      ) {
        return false;
      }

      const path = relative(source, entry).split(sep).join("/");

      if (
        unusedServicePaths(kind).some(
          (prefix) => path === prefix || path.startsWith(`${prefix}/`),
        )
      ) {
        return false;
      }

      return kind === "dashboard" || !isDashboardPath(path, { appPaths: true });
    },
    force: false,
    recursive: true,
  });

const rewritePackageJson = async ({
  description,
  destination,
  name,
  port,
}: {
  description: string;
  destination: string;
  name: string;
  port: string;
}) => {
  const path = join(destination, "package.json");
  const pkg = JSON.parse(await readFile(path, "utf8")) as {
    [key: string]: unknown;
    scripts: Record<string, string>;
  };

  pkg.name = name;
  pkg.description = description;

  // The template is private so it is never published; a real app is not.
  delete pkg.private;

  pkg.scripts.dev = pkg.scripts.dev.replaceAll(TEMPLATE_PORT, port);

  await writeFile(path, `${JSON.stringify(pkg, null, 2)}\n`);
};

const rewriteText = async ({
  file,
  name,
  port,
  target,
  tenancy,
}: {
  file: string;
  name: string;
  port: string;
  target: BuildTarget;
  tenancy: Tenancy;
}) => {
  const contents = await readFile(file, "utf8");

  await writeFile(
    file,
    contents
      .replaceAll(TEMPLATE_NAME, name)
      .replaceAll(TEMPLATE_PORT, port)
      .replace(/^BUILD_TARGET=.*$/m, `BUILD_TARGET=${target}`)
      .replace(ALLOWED_DOMAINS_DOC.multi, ALLOWED_DOMAINS_DOC[tenancy]),
  );
};

// An app reads the rest from its own package.json, so nothing else is substituted.
export const createApp = async ({
  description,
  kind,
  name,
  port,
  root,
  service,
  target,
  tenancy,
}: CreateAppInput) => {
  requireKindForTarget({ kind, target });

  // `--args` skips the prompts that would have filtered these.
  const appName = toDirectoryName(name);
  const serviceName = toDirectoryName(service);
  const destination = join(root, "apps", appName);
  const serviceDir = join(destination, "src", "services", serviceName);

  await copyTemplate({
    destination,
    kind,
    source: join(root, "templates", "app"),
    target,
  });

  // Ahead of the rest, so everything after it names the service the app has.
  await renameService({
    appDir: destination,
    from: TEMPLATE_SERVICES[kind],
    to: serviceName,
  });

  await rewritePackageJson({
    description,
    destination,
    name: appName,
    port,
  });

  for (const file of ["README.md", ".env.example"]) {
    await rewriteText({
      file: join(destination, file),
      name: appName,
      port,
      target,
      tenancy,
    });
  }

  // Unwires what the copy left out. A queue service never had a dashboard.
  if (kind === "http") {
    await removeServiceDashboard(serviceDir);
  }

  if (kind !== "dashboard") {
    await removeAppDashboard(destination);
  }

  if (kind === "queue") {
    await renameQueue({ app: appName, service: serviceName, serviceDir });
  }

  await applyTenancy({ appDir: destination, tenancy });

  return destination;
};
