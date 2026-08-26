import { type Context } from "hono";

const IS_DEV = typeof import.meta.env !== "undefined" && !!import.meta.env.DEV;

const getDevScripts = () => {
  if (!IS_DEV) {
    return "";
  }

  // No vite html template here, so vite cannot inject the preamble itself.
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

/**
 * In dev the shell points at the TS entry vite serves, in prod at the built
 * bundle. `appName` is the `src/apps/<name>` the build names its entry after.
 */
export const createHtmlShell =
  ({
    appName,
    title,
    version,
  }: {
    appName: string;
    title: string;
    version: string;
  }) =>
  (context: Context) => {
    // Dev serves modules from vite's root; prod assets sit under the base path.
    const script = IS_DEV
      ? `/src/apps/${appName}/entry-client.tsx`
      : `${context.req.basePath}/assets/${appName}-entry-client.js`;

    return context.html(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta content="width=device-width, initial-scale=1" name="viewport" />
    <title>${title}</title>
    ${getDevScripts()}
    <script>
      window.env = ${JSON.stringify({
        BASE_PATH: context.req.basePath,
        VERSION: version,
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
