---
type: "Architecture Note"
title: "Monorepo Layers"
description: "Observed pnpm/Turborepo workspace, package responsibilities, intended dependency flow, and current boundary deviations."
tags:
  - "architecture"
  - "monorepo"
  - "packages"
created: "2026-07-15T09:50:07+00:00"
timestamp: "2026-07-15T11:10:59+02:00"
knowledge_status: "mixed"
implementation_status: "partial"
direction_status: "planned"
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

## Workspace

Nimara uses Node 24, pnpm workspaces, and Turborepo. Applications are storefront, marketplace,
Stripe App, docs, and automated tests. Shared packages are:

| Package                           | Observed responsibility                                                               |
| --------------------------------- | ------------------------------------------------------------------------------------- |
| `domain`                          | Commerce models, contracts, errors, and `Result` vocabulary                           |
| `infrastructure`                  | External integrations, use cases, provider factories, GraphQL operations              |
| `features`                        | Reusable page and feature composition for storefront variants                         |
| `foundation`                      | Forms, address/region helpers, navigation, theme, middleware, shared UI-aware helpers |
| `ui`                              | Radix/Shadcn-style primitives and styles                                              |
| `i18n`                            | next-intl routing, locales, regions, and messages                                     |
| `codegen`                         | Saleor schema and shared GraphQL generation projects                                  |
| `config` / `eslint-config-custom` | Build, CSS, lint, and repository configuration                                        |

## Intended dependency direction

The repository guidance treats domain as a leaf, infrastructure as integration logic, features
as the composition layer, and apps as final composition roots. Domain is a genuine leaf and
applications do not import one another. Features consumes the shared layers as intended.

## Observed deviations

The reviewed code does not fully match the simplified diagram:

- infrastructure also depends on generated `codegen` types;
- UI consumes shared config;
- foundation imports i18n, UI, infrastructure, and codegen in multiple files, so it is not a leaf;
- marketplace composes much of its behavior locally in `src/app`, `src/lib`, and `src/services`
  rather than through `packages/features`.

Treat the declared dependency direction as architectural intent and the observed imports as
current reality. CLI/monorepo and Medusa/platform exploration are planned, while the broader
platform approach still requires validation. Current direction does not explicitly classify the
observed package-boundary deviations as accepted debt or active refactor work.

## Evidence

Workspace/package manifests plus imports under `packages` and `apps` at the recorded commit.

# Related Notes

[Architecture](./Architecture%20%28MOC%29.md)
[Applications](../../system/applications/Applications%20%28MOC%29.md)
[Service And Provider Architecture](./Service%20And%20Provider%20Architecture.md)
