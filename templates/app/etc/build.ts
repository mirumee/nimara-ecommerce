import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { buildApps } from "@nimara/tooling/build/apps";

await buildApps({
  rootDir: join(dirname(fileURLToPath(import.meta.url)), ".."),
});
