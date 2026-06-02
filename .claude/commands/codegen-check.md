---
description: Regenerate GraphQL types and confirm generated files are in sync.
allowed-tools: Bash(pnpm codegen), Bash(git status), Bash(git diff*)
---

Regenerate GraphQL types and verify they are committed.

1. Run `pnpm codegen` (requires `apps/storefront/.env` with `NEXT_PUBLIC_SALEOR_API_URL`).
   For a single app use `pnpm codegen:saleor` / `:marketplace` / `:stripe`.
2. `git status --short` — report any changed `*.generated.ts` / `generated/**` files.
3. If generated files changed, they must be committed together with the `.graphql` change.
   If `pnpm codegen` fails because the env is missing, say so and stop — don't hand-edit
   generated types.
