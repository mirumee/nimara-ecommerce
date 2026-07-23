# GraphQL code generation

This package configures GraphQL Code Generator for Saleor, marketplace, and Stripe.

- `codegen.ts` is editable configuration. `schema.ts`, adjacent `generated.ts` files, and
  app `src/graphql/generated/` clients are generated outputs and must not be hand-edited.
- Root codegen commands load `NEXT_PUBLIC_SALEOR_API_URL` from `apps/storefront/.env`. When
  it is unset, generation is skipped; do not treat that as proof that outputs are current.
- The `saleor` project generates the shared schema and near-operation files. Marketplace
  and Stripe are separate projects to avoid fragment-name conflicts.
- Commit source `.graphql` changes and all regenerated outputs together.

## Commands

- All targets: `pnpm codegen`
- Shared Saleor: `pnpm codegen:saleor`
- Marketplace: `pnpm codegen:marketplace`
- Stripe: `pnpm codegen:stripe`
