import { cp, readFile, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";

import { TEMPLATE_NAME, TEMPLATE_PORT, toDirectoryName } from "./names.ts";

// Copying `.env` would hand the new app someone else's Saleor token.
const NOT_COPIED = new Set([
  ".env",
  ".saleor-app-config.json",
  ".turbo",
  "dist",
  "node_modules",
  "tsconfig.tsbuildinfo",
]);

export type CreateAppInput = {
  description: string;
  name: string;
  port: string;
  root: string;
};

const copyTemplate = ({
  destination,
  source,
}: {
  destination: string;
  source: string;
}) =>
  cp(source, destination, {
    errorOnExist: true,
    filter: (entry) => !NOT_COPIED.has(basename(entry)),
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
}: {
  file: string;
  name: string;
  port: string;
}) => {
  const contents = await readFile(file, "utf8");

  await writeFile(
    file,
    contents.replaceAll(TEMPLATE_NAME, name).replaceAll(TEMPLATE_PORT, port),
  );
};

// An app reads the rest from its own package.json, so nothing else is substituted.
export const createApp = async ({
  description,
  name,
  port,
  root,
}: CreateAppInput) => {
  // `--args` skips the prompt that would have filtered this.
  const appName = toDirectoryName(name);
  const destination = join(root, "apps", appName);

  await copyTemplate({
    destination,
    source: join(root, "templates", "app"),
  });

  await rewritePackageJson({
    description,
    destination,
    name: appName,
    port,
  });

  for (const file of ["README.md", ".env.example"]) {
    await rewriteText({ file: join(destination, file), name: appName, port });
  }

  return destination;
};
