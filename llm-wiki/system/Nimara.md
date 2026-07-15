---
type: "System Overview"
title: "Nimara"
description: "Canonical overview of Nimara: implementation on main, current product direction, applications, capabilities, architecture, integrations, and known boundaries."
tags:
  - "nimara"
  - "system"
  - "overview"
created: "2026-07-15T09:50:07+00:00"
timestamp: "2026-07-15T11:10:59+02:00"
knowledge_status: "current"
implementation_status: "wired"
direction_status: "active"
verified_at: "2026-07-15T09:50:07+00:00"
code_branch: "main"
code_commit: "e32732ea85f7e6cfb807b462c7bbc47e6f569603"
scope_paths:
  - "apps"
  - "packages"
  - "package.json"
  - "pnpm-workspace.yaml"
  - "turbo.json"
---

# Content

Nimara is an open-source, code-first commerce ecosystem built around Saleor. It is not only a
storefront: the repository contains a customer storefront and protocol facade, a marketplace
vendor and operator application with settlement infrastructure, a standalone Stripe payment
application, public documentation, and black-box automated tests.

## System map

| Surface                                                | Primary role                                                                          | Implementation state                              |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------- | ------------------------------------------------- |
| [Storefront](./applications/Storefront.md)             | Customer shopping, account, checkout, CMS/search composition, ACP/UCP APIs            | Wired; integrations are conditional               |
| [Marketplace](./applications/Marketplace.md)           | Vendor operations, Saleor App, vendor-scoped GraphQL, Connect payments and settlement | Conditional on Saleor/Stripe; ledger is optional  |
| [Stripe App](./applications/Stripe%20App.md)           | Saleor Payment Gateway App backed by Stripe PaymentIntents                            | Conditional; cancel/refund actions are incomplete |
| [Documentation](./applications/Documentation.md)       | Versioned public developer documentation and LLM exports                              | Wired as a Docusaurus build                       |
| [Automated Tests](./applications/Automated%20Tests.md) | Playwright checks for selected storefront journeys                                    | Partial and storefront-only                       |

## Product capabilities

The implemented capability map spans catalog and discovery, cart and checkout, payments,
customer accounts, CMS and localization, marketplace operations, ledger and transfer batches,
consent-aware tracking, and agentic commerce protocols. Start with
[Capabilities](./capabilities/Capabilities%20%28MOC%29.md).

## Architecture

Nimara is a pnpm/Turborepo monorepo. Storefront composition uses a typed, lazy service registry
and provider selectors; shared packages separate domain vocabulary, integrations, feature UI,
foundation helpers, UI primitives, i18n, configuration, and GraphQL code generation. The
declared layer direction is useful guidance but is not fully enforced in the reviewed snapshot:
`foundation` imports higher-level packages in several places.

See [Architecture](../tech/architecture/Architecture%20%28MOC%29.md) and
[Integrations](../tech/integrations/Integrations%20%28MOC%29.md).

## Notable current boundaries

- [Product Reviews](./capabilities/Product%20Reviews.md) is a hard-coded custom-PDP placeholder,
  not the verified-review system described by its PRD.
- Storefront newsletter subscription reports success without subscribing, order confirmation is
  static, and sitemap generation covers only a fixed US context and a limited product set.
- [Agentic Commerce](./capabilities/Agentic%20Commerce.md) is substantial but includes dummy AP2
  verification, exact-version matching, an in-memory idempotency model, and an unimplemented
  order-adjustment path.
- [Stripe App](./applications/Stripe%20App.md) cancel and refund handlers do not complete the
  requested Stripe operations.
- [Marketplace](./applications/Marketplace.md) contains unverified JWT/webhook paths and an
  incomplete financial model; [Ledger And Payouts](./capabilities/Ledger%20And%20Payouts.md)
  stops at Stripe Transfers.
- [Automated Tests](./applications/Automated%20Tests.md) cover selected storefront journeys, not
  the marketplace, Stripe App, protocols, or settlement paths.

## Direction and gaps

Current product direction treats Marketplace, TypeScript custom search, and operational
stabilization as active themes. Stripe invoice/tax expansion and CLI/monorepo work are planned.
ACP/UCP endpoint and schema delivery is treated as complete, but the implementation boundaries
above remain real; delivery scope does not prove protocol conformance or runtime readiness.

The overall direction is therefore `active`, while individual capability pages carry their own
status. Notable disagreements include consent and ledger behavior that is ahead of documented
direction, refund/protocol scopes treated as complete while code remains partial, and active
custom-search work that is not integrated into this repository snapshot.

## Evidence

Implementation facts are based on [Main e32732e Snapshot](../sources/codebase/Main%20e32732e%20Snapshot.md).
The review was static and does not prove deployment, production readiness, or runtime health.

# Related Notes

[Applications](./applications/Applications%20%28MOC%29.md)
[Capabilities](./capabilities/Capabilities%20%28MOC%29.md)
[Product Strategy 2026](../product/strategy/Product%20Strategy%202026%20%28MOC%29.md)
