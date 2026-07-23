# Features

This package is the reusable composition layer for feature UI, state, and orchestration.

- Organize each feature as a self-contained directory with shared contracts separated from
  concrete variants such as `shop-basic-*` or `shop-marketplace-*`.
- Compose `@nimara/infrastructure` services and `@nimara/ui` primitives; keep pure business
  rules in `@nimara/domain` and generic helpers in `@nimara/foundation`.
- Keep app routing, app configuration, and provider selection in the consuming app.
- Prefer small named component exports and keep server/client boundaries explicit.
- Place non-trivial logic tests next to the feature and cover expected Result failures.

## Commands

- Unit tests: `pnpm --filter @nimara/features test`
- Lint: `pnpm --filter @nimara/features lint`
