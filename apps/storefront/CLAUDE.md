# Storefront

This app provides the customer-facing shopping experience and composes Nimara's shared
commerce capabilities into localized storefront routes.

## Local structure

- Localized App Router routes live under `src/app/[locale]/`, split into `(main)`,
  `(checkout)`, and `(auth)` route groups.
- Keep final integration selection and lazy service construction in `src/services/`.
  Shared provider implementations belong in `@nimara/infrastructure`.
- Keep app-only composition in `src/features/`, `src/foundation/`, or
  `src/infrastructure/`; promote code to a package only when it is reusable.
- Validate public variables in `src/envs/client.ts` and server-only variables in
  `src/envs/server.ts`. Never expose a server secret through a public variable.
- Use `getTranslations` in Server Components and `useTranslations` in Client Components.

## Commands

- Development: `pnpm dev:storefront`
- Unit tests: `pnpm --filter storefront test`
- Staged linting: `pnpm --filter storefront lint:staged`
- GraphQL changes: `pnpm codegen:saleor`
