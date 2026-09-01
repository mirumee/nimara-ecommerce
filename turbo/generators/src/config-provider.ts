import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { type BuildTarget } from "./names.ts";

const VERCEL_IMPORTS =
  'import { fileConfigItem } from "@nimara/infrastructure/config/file-config";\n' +
  'import { vercelEdgeConfigItem } from "@nimara/infrastructure/config/vercel-edge-config";';

const NODE_IMPORTS =
  'import { awsSecretsManagerConfigItem } from "@nimara/infrastructure/config/aws-secrets-manager-config";\n' +
  'import { fileConfigItem } from "@nimara/infrastructure/config/file-config";';

const rewrite = async ({
  from,
  path,
  to,
}: {
  from: string;
  path: string;
  to: string;
}) => {
  const contents = await readFile(path, "utf8");

  if (!contents.includes(from)) {
    throw new Error(`Expected ${JSON.stringify(from)} in ${path}.`);
  }

  await writeFile(path, contents.replace(from, to));
};

/**
 * Vercel Edge Config only exists on Vercel. A node build (Lambda) has no
 * store of its own, so its non-`file` branch goes to Secrets Manager —
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

  const containerPath = join(appDir, "src", "container", "index.ts");
  const containerContents = await readFile(containerPath, "utf8");

  if (!containerContents.includes(VERCEL_IMPORTS)) {
    throw new Error(`Expected Vercel Edge Config imports in ${containerPath}.`);
  }

  await writeFile(
    containerPath,
    containerContents
      .replace(VERCEL_IMPORTS, NODE_IMPORTS)
      .replaceAll("vercelEdgeConfigItem", "awsSecretsManagerConfigItem"),
  );

  await rewrite({
    from: '.enum(["edge", "file"])',
    path: join(appDir, "src", "domain", "app-config.ts"),
    to: '.enum(["aws-secrets-manager", "file"])',
  });

  await rewrite({
    from: "`file` or `edge`",
    path: join(appDir, ".env.example"),
    to: "`file` or `aws-secrets-manager`",
  });
};
