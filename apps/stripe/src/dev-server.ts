import { Hono } from "hono";

/**
 * DEV only: groups every app under one Hono instance for @hono/vite-dev-server.
 * Apps are auto-discovered from `src/apps/*` (vite`import.meta.glob`) and imported
 * one at a time so each can be given its own `BASE_PATH`
 * A single app is served at `/`, if multiple - under `/<app>`.
 */
const importers = import.meta.glob<{ app?: Hono }>("./apps/*/entry-server.ts");

const paths = Object.keys(importers).sort();
const server = new Hono();

for (const path of paths) {
  const name = path.split("/").at(-2) ?? ""; // `./apps/<name>/entry-server.ts`

  process.env.BASE_PATH = paths.length > 1 ? `/${name}` : "";

  const { app } = await importers[path]();

  if (app) {
    server.route("/", app);
  }
}

// eslint-disable-next-line import/no-default-export
export default server;
