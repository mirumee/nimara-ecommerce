import { readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * The template keeps a service's variables beside it, which is how the
 * generator knows which kind needs what. A generated app has one `.env.example`
 * and one `.env`, so the fragment is folded in and removed.
 */
export const mergeServiceEnv = async ({
  appDir,
  serviceDir,
}: {
  appDir: string;
  serviceDir: string;
}) => {
  const fragmentPath = join(serviceDir, ".env.example");
  const fragment = await readFile(fragmentPath, "utf8").catch(() => null);

  if (fragment === null) {
    return;
  }

  const path = join(appDir, ".env.example");
  const contents = await readFile(path, "utf8");

  await writeFile(path, `${contents.trimEnd()}\n\n${fragment.trimStart()}`);
  await rm(fragmentPath);
};
