# Stripe payment app

This app connects Saleor's Payment Gateway protocol to Stripe payment processing. It runs
on port 4000.

## Local structure

- Saleor manifest, registration, and payment webhook routes live under
  `src/app/api/saleor/`; Stripe webhook routes live under `src/app/api/stripe/`.
- Verify Saleor and Stripe signatures before processing webhook payloads. Keep private
  keys and configuration in server-only code.
- GraphQL source documents live in `src/graphql/`. Never edit `generated.ts` files or
  `src/graphql/generated/` directly.
- Keep gateway protocol logic in `src/lib/saleor/` and Stripe integration logic in
  `src/lib/stripe/`; route handlers should remain thin.

## Commands

- Development: `pnpm dev:stripe`
- Unit tests: `pnpm --filter stripe test`
- Build: `pnpm --filter stripe build`
- GraphQL changes: `pnpm codegen:stripe`
