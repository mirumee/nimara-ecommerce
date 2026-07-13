---
type: "Technical Reference"
title: "Terraform Deployment"
description: "Deploying the Nimara storefront to Vercel as infrastructure-as-code with the terraform/storefront module — private vs public tfvars, and the plan/apply flow."
tags:
  - "nimara"
  - "terraform"
  - "deployment"
  - "vercel"
  - "infrastructure"
  - "reference"
resource: "/sources/nimara-docs/using-terraform.mdx"
nimara_version: "2.0.x"
created: "2026-07-13T00:00:00+00:00"
timestamp: "2026-07-13T00:00:00+00:00"
---

## Content

> **Nimara version:** 2.0.x — these notes are synthesized from the archived [Nimara platform docs](/sources/nimara-docs/using-terraform.mdx) at this version. Re-synthesize them if the docs are bumped to a different Nimara version.

The storefront can be deployed to Vercel as **infrastructure-as-code** using the `terraform/storefront` module (source: [using-terraform](/sources/nimara-docs/using-terraform.mdx)) — useful for automating deployments and managing config across environments. See also the manual [Storefront](/tech/nimara/Storefront.md) Vercel deploy.

### Prerequisites
[Terraform](https://developer.hashicorp.com/terraform/install) installed, a Vercel account, a fork of the [Nimara repo](https://github.com/mirumee/nimara-ecommerce), and a configured Saleor instance.

### Flow
1. Clone the fork; `cd nimara-ecommerce/terraform/storefront`; `terraform init`.
2. **Private tfvars** — `cp example.private.auto.tfvars private.auto.tfvars`. Holds secrets (Vercel team ID/API token, and the `private_environment_variables` map: `SALEOR_APP_TOKEN`, `AUTH_SECRET`, `STRIPE_SECRET_KEY`). **Not committed** — add to `.gitignore`. Replace `CHANGE_ME` placeholders; see [Environment Variables](/tech/nimara/Environment%20Variables.md) for what each value is.
3. **Public tfvars** — `cp example.public.auto.tfvars public.auto.tfvars`. Committable; sets `github_repository`, `github_production_branch` (default `main`), `vercel_project_name`, `additional_environments`, and the `public_environment_variables` map (`NEXT_PUBLIC_SALEOR_API_URL`, `NEXT_PUBLIC_DEFAULT_CHANNEL`, `NEXT_PUBLIC_STOREFRONT_URL`, `NEXT_PUBLIC_STRIPE_PUBLIC_KEY`, `NEXT_PUBLIC_PAYMENT_APP_ID`), each with per-target (`production`/`preview`/`development`) values.
4. `terraform plan` to preview, then `terraform apply` (type `yes`) to create the Vercel resources and deploy.
5. Push to the GitHub repo to trigger the Vercel deployment.

Env-var meanings and how-to-obtain are covered in [Environment Variables](/tech/nimara/Environment%20Variables.md); the branch/release flow that drives Vercel environments is in [Release Workflow](/tech/nimara/Release%20Workflow.md).

## Related Notes
[Nimara Platform (MOC)](/tech/nimara/Nimara%20Platform%20%28MOC%29.md)
[Storefront](/tech/nimara/Storefront.md)
[Environment Variables](/tech/nimara/Environment%20Variables.md)
[Release Workflow](/tech/nimara/Release%20Workflow.md)
