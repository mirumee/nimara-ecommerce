import { basename, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { type Context } from "hono";

import { container } from "@/container";

const APP_NAME = basename(dirname(fileURLToPath(import.meta.url)));

/**
 * HTML shell for the React config UI. In dev the vite dev server serves the
 * TS entry (plus the react-refresh preamble); in prod the shell points at the
 * built bundle, which `BUILD_TARGET` decides how to deliver.
 */
const IS_DEV = typeof import.meta.env !== "undefined" && !!import.meta.env.DEV;

const getDevScripts = () => {
  if (!IS_DEV) {
    return "";
  }

  /**
   * Required since we are not using the vite html template for the dev
   * server and vite is not able to inject this automatically.
   */
  return `
    <script type="module" src="/@vite/client"></script>
    <script type="module">
      import RefreshRuntime from "/@react-refresh"
      RefreshRuntime.injectIntoGlobalHook(window)
      window.$RefreshReg$ = () => {}
      window.$RefreshSig$ = () => (type) => type
      window.__vite_plugin_react_preamble_installed__ = true
    </script>
  `;
};

export const clientEntryPoint = ({ context }: { context: Context }) => {
  // Dev serves modules from vite's root; prod assets sit under the base path.
  const script = IS_DEV
    ? `/src/apps/${APP_NAME}/entry-client.tsx`
    : `${context.req.basePath}/assets/${APP_NAME}-entry-client.js`;

  return context.html(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta content="width=device-width, initial-scale=1" name="viewport" />
    <title>Nimara Stripe</title>
    ${getDevScripts()}
    <script>
      window.env = ${JSON.stringify({
        BASE_PATH: context.req.basePath,
        VERSION: container.get("config").VERSION,
      })}
    </script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="${script}"></script>
  </body>
</html>
`);
};
