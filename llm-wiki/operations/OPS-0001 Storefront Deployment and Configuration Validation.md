---
type: "Operational Record"
title: "Storefront Deployment and Configuration Validation"
description: "Runbook for validating storefront configuration, planning Vercel infrastructure changes, deploying an immutable ref, and verifying the resulting environment."
tags:
  - "operations"
  - "deployment"
  - "storefront"
  - "vercel"
  - "terraform"
created: "2026-07-21T00:00:00+00:00"
timestamp: "2026-07-21T00:00:00+00:00"
id: "OPS-0001"
status: "active"
owner: "platform-engineering"
kind: "runbook"
relations:
  implementations: []
  product_records:
    - "[Swappable Storefront Search and Content Providers](../product/capabilities/CAP-0001%20Swappable%20Storefront%20Search%20and%20Content%20Providers.md)"
    - "[Storefront Discovery and Cart](../product/capabilities/CAP-0006%20Storefront%20Discovery%20and%20Cart.md)"
    - "[Saleor Commerce Backend](../product/integrations/INT-0006%20Saleor%20Commerce%20Backend.md)"
---

# Trigger

Use this runbook for a new storefront environment, a configuration change that requires a rebuild,
or a deployment of a branch, tag, or exact commit to Vercel. Provider changes use the dedicated
[provider rollback record](OPS-0006%20Storefront%20Provider%20Change%20and%20Rollback.md) in addition
to this deployment procedure.

# Preconditions

- Select an immutable commit SHA or release tag and record the intended Vercel project, environment,
  domain, Git branch, Saleor endpoint, and channel.
- Use Node 24.x and pnpm 9.15.9, matching the root package contract. Do not assume the Terraform
  module is runtime-current: it presently requests Node 22.x and must be reconciled with the root
  Node 24.x requirement before applying it.
- Store public and private values separately. Never commit Vercel tokens, Saleor application tokens,
  authentication secrets, Stripe secrets, or private provider credentials.
- Take an export or screenshot of the environment's current Vercel variables and domains before
  changing them. For Terraform-managed environments, retain the reviewed plan and a recoverable
  state backend.
- Confirm that the selected Saleor channel, application permissions, payment application, and any
  external search or content provider already exist.

# Procedure

1. Check out the selected ref and install the locked dependency graph with
   `pnpm install --frozen-lockfile`.
2. Prepare the storefront environment from `apps/storefront/.env.example`. Use the current
   server-side provider variables (`SEARCH_SERVICE` and `CMS_SERVICE`) and the provider-specific
   keys described by that file; do not translate them to older public variable names.
3. Run `pnpm preflight --report` with the proposed environment. Resolve every unknown provider or
   missing provider key. A green feature summary is evidence of configuration shape, not upstream
   reachability.
4. With `NEXT_PUBLIC_SALEOR_API_URL` pointing at the target backend, run `pnpm codegen` and review
   generated GraphQL changes. Then run `pnpm build:storefront` and the repository's relevant tests.
5. For Terraform-managed infrastructure, copy the example public and private variable files outside
   version control, run `terraform init`, and run `terraform plan`. Review project root, production
   branch, domains, environment targets, sensitivity flags, and the Node runtime before any apply.
6. Apply only the reviewed plan, or deploy the selected immutable ref through the Vercel project.
   Provider selection and other build-time values require a fresh build; changing a runtime setting
   without redeployment does not switch the compiled storefront.
7. Keep the previous successful deployment available until verification is complete.

# Verification

- Confirm the deployed commit or tag in Vercel and verify the expected domain and environment label.
- Check the home page, search, a product detail, cart creation, customer sign-in boundary, and the
  checkout visibility expected for the configured payment state.
- In production, verify that missing backend configuration yields empty commerce behavior rather
  than built-in sample data.
- Confirm the default channel's currency, pricing, inventory, locale, absolute storefront URL, and
  image delivery. Exercise the external search or content provider when one is selected.
- Review build and runtime logs for environment validation, GraphQL code-generation, provider
  construction, authentication, Sentry, and image-host failures.

# Escalation

- Stop before deployment when Terraform still requests Node 22.x while the repository requires Node
  24.x; update and review the infrastructure change separately.
- The manual QA workflow currently passes legacy public provider variables and upper-case provider
  values. Do not use its summary as proof of the current `SEARCH_SERVICE` / `CMS_SERVICE` selection
  until the workflow is aligned with the current configuration contract.
- Roll back by restoring the previous environment-variable snapshot and redeploying the previous
  successful immutable ref. Treat backend schema, catalog, payment, or external-provider changes as
  separate state; a Vercel rollback does not undo them.
- Escalate any deployment that serves sample data in production, exposes configuration diagnostics,
  or reaches a different Saleor domain or channel than the reviewed plan.

# Provenance

- The current deployment inputs and Terraform behavior are anchored at exact commit
  [`75d6bc55edddf431adcc348009a1c226f77cc005`](https://github.com/mirumee/nimara-ecommerce/tree/75d6bc55edddf431adcc348009a1c226f77cc005),
  including the
  [storefront environment contract](https://github.com/mirumee/nimara-ecommerce/blob/75d6bc55edddf431adcc348009a1c226f77cc005/apps/storefront/.env.example),
  [configuration preflight](https://github.com/mirumee/nimara-ecommerce/blob/75d6bc55edddf431adcc348009a1c226f77cc005/apps/storefront/scripts/preflight.mts),
  [Vercel resources](https://github.com/mirumee/nimara-ecommerce/blob/75d6bc55edddf431adcc348009a1c226f77cc005/terraform/storefront/resources.tf),
  and
  [manual QA deployment workflow](https://github.com/mirumee/nimara-ecommerce/blob/75d6bc55edddf431adcc348009a1c226f77cc005/.github/workflows/deploy.yaml).
