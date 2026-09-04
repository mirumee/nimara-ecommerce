import { rm } from "node:fs/promises";
import { join } from "node:path";

import { type BuildTargetAdapter } from "./types.ts";

// Assets are served from `dist/<service>/assets/`.
export const nodeTarget: BuildTargetAdapter = {
  clientAssets: async () => ({}),

  finalize: async ({ rootDir }) => {
    // Leaving it behind would point Vercel at bundles this build replaced.
    await rm(join(rootDir, "index.js"), { force: true });
  },
};
