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
 */
export const applyConfigProvider = async ({
  appDir,
  target,
}: {
  appDir: string;
  target: BuildTarget;
}) => {
  if (target !== "node") {
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
