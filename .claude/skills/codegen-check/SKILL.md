---
name: codegen-check
description: Regenerate GraphQL types and verify generated outputs are synchronized. Use after changing GraphQL documents or codegen configuration.
---

# Verify GraphQL generated code

1. Run `pnpm codegen`. For an intentionally scoped check, use `pnpm codegen:saleor`,
   `pnpm codegen:marketplace`, or `pnpm codegen:stripe`.
2. If output says generation was skipped because `NEXT_PUBLIC_SALEOR_API_URL` is unset,
   report the blocker and stop. A successful exit after a skip does not prove outputs are
   current.
3. Run `git status --short` and inspect `git diff` for `schema.ts`, adjacent `generated.ts`
   files, and app `graphql/generated/` clients.
4. Confirm regenerated outputs are included with their source `.graphql` changes.

Never reconstruct or patch generated files manually.
