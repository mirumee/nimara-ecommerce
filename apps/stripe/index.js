/**
 * Vercel entrypoint (Hono framework preset). Re-exports the built handler
 * app's Hono instance as the default export. Each app is bundled by
 * `vite build` into `dist/<app>/entry-server.js` — see vite.config.ts.
 */

// eslint-disable-next-line import/no-default-export
export { app as default } from "./dist/handler/entry-server.js";
