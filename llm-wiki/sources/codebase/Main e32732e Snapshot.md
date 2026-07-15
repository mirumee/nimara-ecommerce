---
type: "Source Manifest"
title: "Main e32732e Snapshot"
description: "Immutable manifest for the main-branch code snapshot used to establish the current Nimara encyclopedia on 2026-07-15."
resource: "https://github.com/mirumee/nimara-ecommerce/commit/e32732ea85f7e6cfb807b462c7bbc47e6f569603"
tags:
  - "source"
  - "codebase"
  - "main"
created: "2026-07-15T09:50:07+00:00"
timestamp: "2026-07-15T09:50:07+00:00"
source_branch: "main"
source_commit: "e32732ea85f7e6cfb807b462c7bbc47e6f569603"
source_commit_date: "2026-06-17T14:53:37+00:00"
verified_at: "2026-07-15T09:50:07+00:00"
---

# Content

This manifest identifies the repository state used to describe what Nimara implements. The
snapshot was inspected through a clean, detached Git worktree at local `main` commit
`e32732ea85f7e6cfb807b462c7bbc47e6f569603`.

## Evidence reviewed

- workspace and build configuration: `package.json`, `pnpm-workspace.yaml`, `turbo.json`;
- all application manifests and App Router surfaces under `apps/`;
- storefront service registry, provider selectors, environment schemas, ACP/UCP routes;
- marketplace GraphQL, Saleor App, Stripe Connect, payment, ledger, and payout code;
- shared package manifests, integration implementations, GraphQL operations, and domain types;
- migrations, CI workflows, Terraform, unit tests, and Playwright tests.

## Verification boundary

This was a static code and configuration review. It establishes implementation and wiring at
the recorded commit, not production deployment or runtime health. Conditional capabilities
still require their documented environment variables and external services.

# Related Notes

[Nimara](../../system/Nimara.md)
[Architecture](../../tech/architecture/Architecture%20%28MOC%29.md)
