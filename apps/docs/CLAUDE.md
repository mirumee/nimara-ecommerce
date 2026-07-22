# Documentation site

This app builds and publishes Nimara's documentation from the repository's shared docs
source.

## Local structure

- Current documentation source lives in the repository-root `docs/` directory. This app
  contains Docusaurus configuration, theme code, static assets, and release snapshots.
- `sidebars.ts` uses filesystem autogeneration; organize source files and frontmatter
  instead of maintaining a manual sidebar list.
- Do not edit `versioned_docs/`, `versioned_sidebars/`, `versions.json`, or the version
  dropdown by hand. Create a snapshot with `pnpm version:docs <version>` only when
  explicitly requested.
- The build rejects broken internal links, Markdown links, and anchors.

## Commands

- Development: `pnpm dev:docs` (port 5000)
- Type check: `pnpm --filter docs typecheck`
- Production build and link validation: `pnpm build:docs`
