# @nimara/tooling

Build-time only: the vite config every Saleor app shares, the build driver
behind `pnpm bundle`, and the entry-point discovery both read.

## Rules

- **Nothing here may import a runtime package.** Node loads this package while
  it reads an app's `vite.config.ts`, before any `@/*` alias or bundler
  resolution exists. Runtime code belongs in `@nimara/lib`.
- **Relative imports carry the `.ts` extension**, for the same reason — node
  resolves it literally.
- `vite` is a peer dependency: the config has to be the one the app's own vite
  runs, not a second copy.
- An app that needs a plugin or alias only it uses passes `overrides` to
  `createViteConfig`. Do not add a parameter to the factory for it.
