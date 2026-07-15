---
type: "Integration Note"
title: "Deployment And Observability"
description: "Build, deployment, CI, logging, error reporting, tracing, and performance telemetry across Nimara applications."
tags:
  - "integration"
  - "deployment"
  - "observability"
  - "ci"
created: "2026-07-15T09:50:07+00:00"
timestamp: "2026-07-15T11:10:59+02:00"
knowledge_status: "current"
implementation_status: "partial"
direction_status: "active"
verified_at: "2026-07-15T09:50:07+00:00"
code_branch: "main"
code_commit: "e32732ea85f7e6cfb807b462c7bbc47e6f569603"
scope_paths:
  - "terraform"
  - ".github/workflows"
  - "apps/storefront/src/instrumentation.ts"
  - "apps/storefront/sentry.common.config.ts"
  - "apps/stripe/sentry.common.config.ts"
  - "apps/marketplace/Dockerfile"
---

# Content

## Current implementation

Turborepo coordinates build, codegen, lint, test, and E2E tasks. Storefront and Stripe have
structured logging plus Sentry; storefront additionally supports OpenTelemetry and consent-gated
Vercel Speed Insights. Marketplace has structured logging but no equivalent Sentry/OTel surface.

Terraform modules target storefront deployment on Vercel. Marketplace provides standalone Next
output and a Dockerfile. Main CI runs lint/format/tests on PRs and pushes to develop/staging;
E2E/Lighthouse runs manually.

## Direction and gaps

Deployment configuration contains drift: Terraform requests Node 22 while the repository requires
Node 24, and main push is not a trigger for the primary CI workflow. Runtime deployments and
monitor health were not verified. Operational stabilization is active and environment
documentation is under verification, while trunk CI, E2E expansion, and
performance/accessibility monitoring are planned. Established observability/environment work
does not close the Node-version, CI-trigger, manual-E2E, or runtime-health gaps.

## Evidence

Root package/Turbo config, Terraform, GitHub workflows, instrumentation, logging, and Sentry files.

# Related Notes

[Tracking Consent And Observability](../../system/capabilities/Tracking%20Consent%20And%20Observability.md)
[Documentation](../../system/applications/Documentation.md)
[Automated Tests](../../system/applications/Automated%20Tests.md)
