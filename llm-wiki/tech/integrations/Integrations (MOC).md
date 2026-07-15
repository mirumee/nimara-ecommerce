---
type: "Map of Content"
title: "Integrations (MOC)"
description: "Entry point for external systems, provider families, protocols, observability, and deployment integrations used by Nimara."
tags:
  - "integrations"
  - "moc"
  - "system"
created: "2026-07-15T09:50:07+00:00"
timestamp: "2026-07-15T09:50:07+00:00"
knowledge_status: "current"
implementation_status: "not_applicable"
direction_status: "unknown"
verified_at: "2026-07-15T09:50:07+00:00"
code_branch: "main"
code_commit: "e32732ea85f7e6cfb807b462c7bbc47e6f569603"
scope_paths:
  - "apps"
  - "packages/infrastructure"
  - "terraform"
  - ".github/workflows"
---

# Content

- [Saleor](./Saleor.md) - commerce backend, GraphQL, metadata, apps, and cache webhooks.
- [Stripe](./Stripe.md) - standard Payment Gateway App plus marketplace PaymentIntent/Connect flows.
- [CMS And Search](./CMS%20And%20Search.md) - Saleor, ButterCMS, Algolia, and dummy providers.
- [ACP And UCP](./ACP%20And%20UCP.md) - agent-facing commerce protocol surfaces.
- [Deployment And Observability](./Deployment%20And%20Observability.md) - Vercel/Terraform/Docker,
  CI, logging, Sentry, tracing, and performance telemetry.

# Related Notes

[Nimara](../../system/Nimara.md)
[Capabilities](../../system/capabilities/Capabilities%20%28MOC%29.md)
[Architecture](../architecture/Architecture%20%28MOC%29.md)
