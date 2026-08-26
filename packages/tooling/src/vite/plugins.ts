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
