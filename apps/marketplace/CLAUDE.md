# Marketplace

This app provides vendor operations for products, orders, configuration, Stripe Connect,
and settlement against Saleor. It runs on port 3001.

## Local structure

- Routes are split between `src/app/(public)` and `src/app/(authenticated)`. Preserve the
  JWT checks in `src/lib/auth/` and the authenticated layout.
- Marketplace GraphQL documents live in `src/graphql/`; never edit
  `src/graphql/generated/` directly.
- Keep app-specific Saleor, Stripe Connect, email, and GraphQL-server code in `src/lib/`.
- The Postgres ledger is optional and activated by `DATABASE_URL`. Schema migrations live
  in `db/drizzle/`; use the migration command instead of changing a deployed migration.
- Settlement code creates Stripe Connect transfers. Do not model bank payouts as ledger
  transfers unless the product contract changes.

## Commands

- Development: `pnpm dev:marketplace`
- Unit tests: `pnpm --filter marketplace test`
- Type check: `pnpm --filter marketplace type-check`
- Ledger migration: `pnpm migrate:ledger`
- GraphQL changes: `pnpm codegen:marketplace`
