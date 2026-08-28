import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { BUILD_TARGETS, type BuildTarget } from "./names.ts";

/**
 * Synchronous because plop builds a prompt's choices before it runs it. Falls
 * back to the target that can run anything: the build refuses what the platform
 * cannot serve, so a wrong guess fails loudly later.
 */
export const detectBuildTarget = ({
  app,
  root,
}: {
  app: string;
  root: string;
}): BuildTarget => {
  const path = join(root, "apps", app, ".env.example");

  if (!existsSync(path)) {
    return "node";
  }

  const [, value] =
    /^BUILD_TARGET=(.*)$/m.exec(readFileSync(path, "utf8")) ?? [];

  return BUILD_TARGETS.find((target) => target === value?.trim()) ?? "node";
};
