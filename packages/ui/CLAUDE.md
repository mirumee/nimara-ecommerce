# UI

This package contains reusable presentational primitives and shared styles.

- Components accept data and callbacks through props; do not fetch external data, select
  providers, or contain feature business logic.
- Preserve accessibility behavior from the underlying Radix primitives, including labels,
  focus management, keyboard interaction, and ARIA attributes.
- Use named exports and expose new public modules through the `package.json` export map.
- Use shared Tailwind tokens and `cn()` for class composition. Keep app-specific styling in
  the consuming app or feature.
- `pnpm --filter @nimara/ui ui:add` can generate files and dependency changes. Run it only
  after explicit approval, then review every generated change.

## Commands

- Lint: `pnpm --filter @nimara/ui lint`
- Staged linting: `pnpm --filter @nimara/ui lint:staged`
