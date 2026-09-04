import { Hono } from "hono";

import { getLogger } from "@nimara/infrastructure/logging/service";

const logger = getLogger({ name: "dev" });

if (process.env.APP_CONFIG_STORE_PATH) {
  const { ensureParameterStore } = await import("@nimara/tooling/aws/ssm");

  await ensureParameterStore({
    logger,
    storePath: process.env.APP_CONFIG_STORE_PATH,
  });
}

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

    logger.info(`Serving ${name} at ${process.env.BASE_PATH || "/"}`);
  }
}

const queues = import.meta.glob("./services/*/entry-queue.ts");

// Imported only where there is a queue, so an app without one loads no AWS SDK.
if (Object.keys(queues).length > 0) {
  const { startQueueProxies } = await import("@nimara/tooling/sqs/dev");

  await startQueueProxies({ logger, queues });
}

const events = import.meta.glob("./services/*/entry-event.ts") as Record<
  string,
  () => Promise<{
    handler?: (
      event: unknown,
      invocation: { getRemainingTimeInMillis: () => number },
    ) => Promise<unknown>;
  }>
>;

const LOCAL_INVOCATION_BUDGET_MS = 60_000;

for (const path of Object.keys(events).sort()) {
  const name = path.split("/").at(-2) ?? "";
  const { handler } = await events[path]();

  if (handler) {
    server.post(`/${name}/invoke`, async (context) => {
      const deadline = Date.now() + LOCAL_INVOCATION_BUDGET_MS;

      await handler(await context.req.json().catch(() => ({})), {
        getRemainingTimeInMillis: () => deadline - Date.now(),
      });

      return context.body(null, 202);
    });

    logger.info(`Invoking ${name} at POST /${name}/invoke`);
  }
}

// eslint-disable-next-line import/no-default-export
export default server;
