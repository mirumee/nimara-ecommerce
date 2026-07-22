# Infrastructure

This package owns external integrations, provider implementations, GraphQL operations,
serializers, and integration-facing use-cases.

- Keep provider-neutral contracts in each capability's `types.ts`; place provider code in
  subdirectories such as `saleor/`, `stripe/`, `butter-cms/`, `algolia/`, or `dummy/`.
- Translate external responses into domain types before returning them to consumers.
- Return `AsyncResult` or `Result` for expected integration and business failures. Preserve
  the provider error context needed by callers without leaking credentials.
- Keep React components, route handlers, and app environment selection out of this package.
- Add GraphQL source documents next to their provider code and run `pnpm codegen`; never
  edit adjacent `generated.ts` files.
- This package has no unit-test script. Run affected consumer tests in addition to
  `pnpm --filter @nimara/infrastructure lint`.
