import type { Plugin } from "vite";

/**
 * Emits a `{ "type": "module" }` package.json next to the server bundle so
 * AWS Lambda treats the emitted `.js` as ESM.
 */
export const generatePackageJson = (): Plugin => ({
  name: "generate-package-json",
  generateBundle() {
    this.emitFile({
      type: "asset",
      fileName: "package.json",
      source: JSON.stringify({ type: "module" }, null, 2),
    });
  },
});

/**
 * `@hono/vite-dev-server` loads the entry from its request middleware. An app
 * whose services are all queue-driven never gets a request, so without this its
 * entry — and the proxies it starts — would never run. Vite caches the SSR
 * module, so the first request still gets this instance.
 */
export const loadDevServerEntry = ({ entry }: { entry: string }): Plugin => ({
  name: "load-dev-server-entry",
  apply: "serve",
  configureServer: (server) => () => {
    void server.ssrLoadModule(entry).catch((cause: unknown) => {
      const error = cause instanceof Error ? cause : new Error(String(cause));

      server.ssrFixStacktrace(error);

      // Not fatal: an HTTP service still reports this per request, with the
      // overlay and the recovery on save that come with it.
      server.config.logger.error(`Failed to load ${entry}`, { error });
    });
  },
});
