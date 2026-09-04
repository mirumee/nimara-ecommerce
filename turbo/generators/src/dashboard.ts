import { existsSync } from "node:fs";
import { cp, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { TEMPLATE_SERVICE } from "./names.ts";

/**
 * What a service holds only to serve a dashboard, relative to its own
 * directory: the page and its bundle, and the settings API behind it.
 */
export const SERVICE_DASHBOARD_PATHS = [
  "api/rest/app",
  "client",
  "dashboard.test.ts",
  "dashboard.ts",
  "entry-client.tsx",
];

/**
 * What the app around it holds for the same reason: the styling its bundle
 * pulls.
 */
export const APP_DASHBOARD_PATHS = ["postcss.config.cjs", "tailwind.config.ts"];

export const DASHBOARD_DEPENDENCIES = [
  "@hookform/resolvers",
  "react",
  "react-dom",
  "react-hook-form",
];

export const DASHBOARD_DEV_DEPENDENCIES = [
  "@nimara/ui",
  "@tailwindcss/typography",
  "@types/react",
  "@types/react-dom",
  "autoprefixer",
  "postcss",
  "tailwindcss",
];

const isUnder = (path: string, prefix: string) =>
  path === prefix || path.startsWith(`${prefix}/`);

/**
 * Whether a path inside a copy is there only to serve a dashboard. `appPaths`
 * for a whole app, and the service's own paths otherwise.
 */
export const isDashboardPath = (
  path: string,
  { appPaths = false }: { appPaths?: boolean } = {},
) =>
  [
    ...(appPaths
      ? [
          ...APP_DASHBOARD_PATHS,
          ...SERVICE_DASHBOARD_PATHS.map(
            (servicePath) => `src/services/${TEMPLATE_SERVICE}/${servicePath}`,
          ),
        ]
      : SERVICE_DASHBOARD_PATHS),
  ].some((prefix) => isUnder(path, prefix));

type Cut = {
  file: string;
  lines?: string[];
  replacements?: { from: string; to: string }[];
};

/**
 * What mounts the dashboard. Whole lines wherever one will do, so the cut stays
 * a plain removal as the files around them grow.
 */
const SERVICE_CUTS: Cut[] = [
  {
    file: "entry-server.ts",
    lines: [
      'import { appRoutes } from "./api/rest/app";',
      'import { dashboard } from "./dashboard";',
      '  .route("/", dashboard)',
    ],
    replacements: [
      {
        from: '  .route("/api/saleor", saleorRoutes)\n  .route("/api/app", appRoutes);',
        to: '  .route("/api/saleor", saleorRoutes);',
      },
    ],
  },
];

/**
 * Throws rather than skipping what it cannot find: a file still importing one
 * that was not copied does not compile, and the message should name it.
 */
const applyCut = async ({
  dir,
  file,
  lines = [],
  replacements = [],
}: Cut & { dir: string }) => {
  const path = join(dir, file);
  let contents = await readFile(path, "utf8");

  for (const line of lines) {
    const target = `${line}\n`;

    if (!contents.includes(target)) {
      throw new Error(`Expected to find "${line}" in ${path}.`);
    }

    contents = contents.replace(target, "");
  }

  for (const { from, to } of replacements) {
    if (!contents.includes(from)) {
      throw new Error(`Expected to find "${from.split("\n")[0]}…" in ${path}.`);
    }

    contents = contents.replace(from, to);
  }

  await writeFile(path, contents);
};

// Unwires what the copy left out of one service.
export const removeServiceDashboard = (serviceDir: string) =>
  Promise.all(SERVICE_CUTS.map((cut) => applyCut({ ...cut, dir: serviceDir })));

/**
 * Drops what the app around it no longer needs. Only for an app whose every
 * service ships without a dashboard.
 */
export const removeAppDashboard = async (appDir: string) => {
  const path = join(appDir, "package.json");
  const pkg = JSON.parse(await readFile(path, "utf8")) as {
    dependencies: Record<string, string>;
    devDependencies: Record<string, string>;
  };

  for (const [field, names] of [
    ["dependencies", DASHBOARD_DEPENDENCIES],
    ["devDependencies", DASHBOARD_DEV_DEPENDENCIES],
  ] as const) {
    for (const name of names) {
      delete pkg[field][name];
    }
  }

  await writeFile(path, `${JSON.stringify(pkg, null, 2)}\n`);
};

/**
 * A dashboard service added to an app that never had one brings back the
 * styling and the dependencies its bundle pulls. Whatever is missing comes
 * from the template.
 */
export const restoreAppDashboard = async ({
  appDir,
  root,
}: {
  appDir: string;
  root: string;
}) => {
  const template = join(root, "templates", "app");

  for (const path of APP_DASHBOARD_PATHS) {
    if (!existsSync(join(appDir, path))) {
      await cp(join(template, path), join(appDir, path), { recursive: true });
    }
  }

  const packagePath = join(appDir, "package.json");
  const [pkg, templatePkg] = (await Promise.all(
    [packagePath, join(template, "package.json")].map(async (path) =>
      JSON.parse(await readFile(path, "utf8")),
    ),
  )) as Record<string, Record<string, string>>[];

  for (const [field, names] of [
    ["dependencies", DASHBOARD_DEPENDENCIES],
    ["devDependencies", DASHBOARD_DEV_DEPENDENCIES],
  ] as const) {
    for (const name of names) {
      pkg[field][name] ??= templatePkg[field][name];
    }

    pkg[field] = Object.fromEntries(
      Object.entries(pkg[field]).sort(([a], [b]) => a.localeCompare(b)),
    );
  }

  await writeFile(packagePath, `${JSON.stringify(pkg, null, 2)}\n`);
};
