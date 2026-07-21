---
type: "Operational Record"
title: "Saleor Schema Regeneration and Compatibility Check"
description: "Runbook for regenerating GraphQL types from a target Saleor deployment, reviewing compatibility changes, and refreshing schema-note freshness evidence."
tags:
  - "operations"
  - "saleor"
  - "graphql"
  - "codegen"
  - "schema"
created: "2026-07-21T00:00:00+00:00"
timestamp: "2026-07-21T00:00:00+00:00"
id: "OPS-0007"
status: "active"
owner: "platform-engineering"
kind: "runbook"
relations:
  implementations: []
  product_records:
    - "[Saleor Commerce Backend](../product/integrations/INT-0006%20Saleor%20Commerce%20Backend.md)"
---

# Trigger

Use this runbook when changing the target Saleor deployment or version, after GraphQL documents
change, when code generation fails, or when the committed schema and curated Saleor notes may no
longer match the backend used for build and deployment.

# Preconditions

- Select the exact Saleor GraphQL endpoint and record its environment, version evidence, channels,
  applications, and intended repository ref. Never generate from an untrusted or ambiguous endpoint.
- Set `NEXT_PUBLIC_SALEOR_API_URL` in `apps/storefront/.env`, because root code-generation scripts
  load that file. Confirm network access and any schema-introspection policy before starting.
- Start from a clean, reviewable worktree for generated files. Preserve current generated output and
  the existing `packages/codegen/schema.ts` hash in Git so rollback is possible.
- Identify affected storefront, marketplace, Stripe-application, webhook, and infrastructure tests.

# Procedure

1. Run `pnpm codegen`. The root script generates the shared Saleor schema and operations, then the
   separate marketplace and Stripe application clients to avoid fragment conflicts.
2. Treat a zero exit with `Skipping Saleor codegen: NEXT_PUBLIC_SALEOR_API_URL is not set` as a skip,
   not success. Verify the endpoint was loaded and generated files or their timestamps/hashes reflect
   the intended run.
3. Review every generated diff, especially removed fields, changed nullability, new enum values,
   scalar changes, webhook payloads, and mutations used by checkout, orders, marketplace, and
   payments. Do not commit an unexplained bulk regeneration.
4. Update application code and GraphQL documents until TypeScript, lint, tests, and affected builds
   pass against the regenerated clients.
5. Run `pnpm wiki:saleor:check`. A changed `packages/codegen/schema.ts` intentionally makes every
   curated Saleor schema note stale because the stamp covers the whole schema.
6. Review each stale note against the new generated schema. Update inaccurate content, then obtain
   the new stamp with `pnpm wiki:saleor:hash` and set it only after that review.
7. Commit generated output, compatible consumers, reviewed schema-note updates, and verification
   evidence together. Deploy them only to environments whose Saleor schema matches the reviewed
   target.

# Verification

- `pnpm codegen` runs against the recorded endpoint without a skip and produces no unexplained diff.
- Type checking, lint, relevant unit tests, and affected storefront, marketplace, and Stripe builds
  pass with the regenerated clients.
- `pnpm wiki:saleor:check` reports every curated note `OK` and no stale or unstamped note.
- Confirm a representative catalog query, customer/cart mutation, checkout completion, marketplace
  operation, and payment webhook contract against a safe environment before promotion.
- Record the target endpoint identity, backend version evidence, repository SHA, generated schema
  hash, and test results without storing tokens or customer data.

# Escalation

- Do not fix a stale-note check by changing hashes without reviewing the notes. The stamp is evidence
  of review, not a compatibility bypass.
- A Git rollback can restore generated files and application code, but it cannot roll back the live
  Saleor schema. Deploy the previous application only to a compatible backend or coordinate a
  separate backend rollback.
- Stop promotion for removed fields, incompatible webhook payloads, changed payment semantics,
  unexplained large schema churn, or generated output from the wrong Saleor endpoint.
- If only one generated client fails, use the scoped root commands (`codegen:saleor`,
  `codegen:marketplace`, or `codegen:stripe`) to isolate diagnosis, then run the complete codegen and
  verification sequence before release.

# Provenance

- This procedure is anchored at exact commit
  [`75d6bc55edddf431adcc348009a1c226f77cc005`](https://github.com/mirumee/nimara-ecommerce/tree/75d6bc55edddf431adcc348009a1c226f77cc005),
  including the
  [GraphQL code-generation configuration](https://github.com/mirumee/nimara-ecommerce/blob/75d6bc55edddf431adcc348009a1c226f77cc005/packages/codegen/codegen.ts),
  [code-generation scripts](https://github.com/mirumee/nimara-ecommerce/blob/75d6bc55edddf431adcc348009a1c226f77cc005/packages/codegen/package.json),
  [Turbo task contract](https://github.com/mirumee/nimara-ecommerce/blob/75d6bc55edddf431adcc348009a1c226f77cc005/turbo.json),
  and
  [schema-note freshness checker](https://github.com/mirumee/nimara-ecommerce/blob/75d6bc55edddf431adcc348009a1c226f77cc005/scripts/wiki-saleor-check.mjs).
