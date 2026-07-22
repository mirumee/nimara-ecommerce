---
paths:
  - "**/*.graphql"
  - "**/generated.ts"
  - "**/*.generated.ts"
  - "**/graphql/generated/**/*"
  - "packages/codegen/schema.ts"
---

# Generated GraphQL code

- Edit `.graphql` source documents, never generated TypeScript output.
- Run `pnpm codegen` after every `.graphql` change. It requires the storefront Saleor
  endpoint configuration.
- Use `pnpm codegen:saleor`, `pnpm codegen:marketplace`, or `pnpm codegen:stripe` only
  when intentionally checking one target.
- Commit regenerated outputs together with their source document changes.
- If codegen cannot run because configuration is missing, report the blocker; do not
  reconstruct or patch generated files manually.
