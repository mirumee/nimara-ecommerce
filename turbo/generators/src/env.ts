import { readdir, readFile, rm, writeFile } from "node:fs/promises";
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
  const fragmentPaths = (
    await readdir(serviceDir, { recursive: true, withFileTypes: true })
  )
    .filter((entry) => entry.isFile() && entry.name === ".env.example")
    .map((entry) => join(entry.parentPath, entry.name))
    .sort();

  if (fragmentPaths.length === 0) {
    return;
  }

  const path = join(appDir, ".env.example");
  let contents = await readFile(path, "utf8");

  for (const fragmentPath of fragmentPaths) {
    const fragment = await readFile(fragmentPath, "utf8");

    contents = `${contents.trimEnd()}\n\n${fragment.trimStart()}`;
    await rm(fragmentPath);
  }

  await writeFile(path, contents);
};
