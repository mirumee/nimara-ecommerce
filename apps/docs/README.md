# Nimara Docs

The public documentation site for Nimara, built with [Docusaurus](https://docusaurus.io/) and published at [docs.nimara.store](https://docs.nimara.store).

## Local development

Run from the repo root:

```bash
pnpm dev:docs
```

The site is served at `http://localhost:3000`. Hot reload picks up changes in `versioned_docs/`, `src/`, and `docusaurus.config.ts`.

## Build

```bash
pnpm build:docs
```

The static output is written to `apps/docs/build/`. The build fails on broken internal links, broken Markdown links, or broken anchors (`onBrokenLinks: "throw"` in `docusaurus.config.ts`).

## Link checking

Internal links and anchors are validated by the Docusaurus build itself. External `http(s)` links are checked in CI by [lychee](https://github.com/lycheeverse/lychee) on every PR that touches `apps/docs/**` — see `.github/workflows/docs-link-check.yml` and `apps/docs/lychee.toml`.

## Deployment

Pushes to `main`, `staging`, or `develop` that touch `apps/docs/**` trigger `.github/workflows/docs-deploy.yml`, which publishes the site to GitHub Pages.

## Docs Versioning

The Docusaurus docs site uses `apps/docs/versions.json` as the source of truth for published documentation versions. `apps/docs/docusaurus.config.ts` derives `lastVersion` and the version dropdown from that file, so do not update versions in the config manually.

When releasing a new docs version, add the new version to the beginning of `apps/docs/versions.json` and make sure the matching `apps/docs/versioned_docs/version-<version>/` and `apps/docs/versioned_sidebars/version-<version>-sidebars.json` files are included.
