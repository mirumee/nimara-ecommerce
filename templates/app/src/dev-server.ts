import { Hono } from "hono";

import { getLogger } from "@nimara/infrastructure/logging/service";

/**
 * DEV only. Imported one at a time so each service can be given its own
 * `BASE_PATH`: one service answers at `/`, several under `/<service>`.
 */
const importers = import.meta.glob("./services/*/entry-server.ts") as Record<
  string,
  () => Promise<{ app?: Hono }>
>;

const paths = Object.keys(importers).sort();
const server = new Hono();

for (const path of paths) {
  const name = path.split("/").at(-2) ?? ""; // `./services/<name>/entry-server.ts`

  process.env.BASE_PATH = paths.length > 1 ? `/${name}` : "";

  const { app } = await importers[path]();

  if (app) {
    server.route("/", app);
  }
}

const queues = import.meta.glob("./services/*/entry-queue.ts");

// Imported only where there is a queue, so an app without one loads no AWS SDK.
if (Object.keys(queues).length > 0) {
  const { startQueueProxies } = await import("@nimara/tooling/sqs/dev");

  await startQueueProxies({ logger: getLogger({ name: "dev" }), queues });
}

// eslint-disable-next-line import/no-default-export
export default server;
