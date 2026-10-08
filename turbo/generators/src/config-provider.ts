import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { type BuildTarget } from "./names.ts";

// Both lines, so the replacement keeps the imports in alphabetical order.
const VERCEL_IMPORTS =
  'import { fileConfigItem } from "@nimara/infrastructure/config/file-config";\n' +
  'import { vercelEdgeConfigItem } from "@nimara/infrastructure/config/vercel-edge-config";';

const NODE_IMPORTS =
  'import { awsSecretsManagerConfigItem } from "@nimara/infrastructure/config/aws-secrets-manager-config";\n' +
  'import { fileConfigItem } from "@nimara/infrastructure/config/file-config";';

const VERCEL_STORE = `: vercelEdgeConfigItem({
              configKey: ctx.config.APP_CONFIG_STORE_PATH,
              schema: saleorMultiTenantAppConfig,
              logger: ctx.logger,
            }),`;

const NODE_STORE = `: awsSecretsManagerConfigItem({
              configKey: ctx.config.APP_CONFIG_STORE_PATH,
              encryptionKey: ctx.config.APP_CONFIG_ENCRYPTION_KEY,
              schema: saleorMultiTenantAppConfig,
              logger: ctx.logger,
            }),`;

export const DEV_BOOTSTRAP = `if (process.env.APP_CONFIG_STORE_PATH) {
  const { ensureSecretsManager } =
    await import("@nimara/tooling/aws/secrets-manager");

  await ensureSecretsManager({
    logger,
    storePath: process.env.APP_CONFIG_STORE_PATH,
  });
}

`;

const rewrite = async ({
  path,
  replacements,
}: {
  path: string;
  replacements: [from: string, to: string][];
}) => {
  let contents = await readFile(path, "utf8");

  for (const [from, to] of replacements) {
    if (!contents.includes(from)) {
      throw new Error(`Expected ${JSON.stringify(from)} in ${path}.`);
    }

    contents = contents.replace(from, to);
  }

  await writeFile(path, contents);
};

/**
 * Vercel Edge Config only exists on Vercel. A node build (Lambda) has no
 * store of its own, so its non-local branch goes to Secrets Manager —
 * rewritten rather than a third ternary branch, so the container stays a
 * plain two-way choice either way.
 *
 * The dev server bootstraps whichever store the container reads off `local`.
 * A Vercel app has none to create: Edge Config is written on Vercel, and its
 * local runs read the file store.
 */
export const applyConfigProvider = async ({
  appDir,
  target,
}: {
  appDir: string;
  target: BuildTarget;
}) => {
  if (target !== "node") {
    await rewrite({
      path: join(appDir, "src", "dev-server.ts"),
      replacements: [[DEV_BOOTSTRAP, ""]],
    });

    return;
  }

  await rewrite({
    path: join(appDir, "src", "container", "index.ts"),
    replacements: [
      [VERCEL_IMPORTS, NODE_IMPORTS],
      [VERCEL_STORE, NODE_STORE],
    ],
  });
};
