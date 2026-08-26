import { Hono } from "hono";

/**
 * DEV only: groups every service under one Hono instance for
 * `@hono/vite-dev-server`. Services are auto-discovered from `src/services/*`
 * and imported one at a time so each can be given its own `BASE_PATH`.
 * A single service is served at `/`, several under `/<service>`.
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

// eslint-disable-next-line import/no-default-export
export default server;
