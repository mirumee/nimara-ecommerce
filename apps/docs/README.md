# Nimara Docs

The public documentation site for Nimara, built with [Docusaurus](https://docusaurus.io/) and published at [docs.nimara.store](https://docs.nimara.store).

## Local development

Run from the repo root:

```bash
pnpm dev:docs
```

The site is served at `http://localhost:3000`. Hot reload picks up changes in `docs/` (repo root), `versioned_docs/`, `src/`, and `docusaurus.config.ts`.

## Build

```bash
pnpm build:docs
```

The static output is written to `apps/docs/build/`. The build fails on broken internal links, broken Markdown links, or broken anchors (`onBrokenLinks: "throw"` in `docusaurus.config.ts`).

## Link checking

Internal links and anchors are validated by the Docusaurus build itself. External `http(s)` links are checked in CI by [lychee](https://github.com/lycheeverse/lychee) on a daily schedule — see `.github/workflows/docs-link-check.yml` and `apps/docs/lychee.toml`. When the build or lychee detects a broken link, the workflow opens (or updates) a GitHub issue labeled `docs`, `link-check`, `automated`. The workflow can also be triggered manually from the Actions tab.

To reproduce the CI check locally (requires `brew install lychee`), from the repo root:

```bash
pnpm build:docs
lychee --config apps/docs/lychee.toml \
  --root-dir "$(pwd)/apps/docs/build" \
  --no-progress \
  'apps/docs/build/**/*.html'
```

## Deployment

Pushes to `main`, `staging`, or `develop` that touch `apps/docs/**` trigger `.github/workflows/docs-deploy.yml`, which publishes the site to GitHub Pages.

## Docs Versioning

The live, editable source of truth is `/docs/` at the repo root. Versioned snapshots live in `apps/docs/versioned_docs/`. `apps/docs/versions.json` is the authoritative list of published versions — do not update it or `docusaurus.config.ts` manually.

### Editing docs

Edit files directly in `/docs/` (repo root). The site picks them up as the `latest` version. Folder structure drives the sidebar — no manual sidebar config needed.

### Cutting a new version

When ready to snapshot the current `/docs/` as a named release:

```bash
pnpm version:docs <version>
# example: pnpm version:docs 2.1.0
```

Run from the repo root. This command:

1. Copies `/docs/` → `apps/docs/versioned_docs/version-<version>/`
2. Creates `apps/docs/versioned_sidebars/version-<version>-sidebars.json`
3. Prepends `<version>` to `apps/docs/versions.json`

The new version immediately becomes the default shown in the version dropdown. The previous latest is demoted to a versioned path (e.g. `/2.0.0/`). Older versions get an "unmaintained" banner.

After cutting, commit all changed files:

```bash
git add docs/ apps/docs/versioned_docs/ apps/docs/versioned_sidebars/ apps/docs/versions.json
git commit -m "docs: release version <version>"
```
