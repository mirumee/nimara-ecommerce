---
type: "Map of Content"
title: "Architecture (MOC)"
description: "Entry point for Nimara's observed monorepo, composition, runtime, and data-flow architecture."
tags:
  - "architecture"
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
  - "packages"
  - "package.json"
  - "pnpm-workspace.yaml"
  - "turbo.json"
---

# Content

- [Monorepo Layers](./Monorepo%20Layers.md) - workspace responsibilities, dependency direction,
  and observed deviations from the declared model.
- [Service And Provider Architecture](./Service%20And%20Provider%20Architecture.md) - storefront
  composition root, lazy loaders, provider catalogs, and fallback behavior.
- [Runtime And Data Flows](./Runtime%20And%20Data%20Flows.md) - storefront rendering, vendor identity,
  marketplace GraphQL, multi-vendor payment, ledger, and transfer flows.

Architecture pages describe code reality at a recorded `main` SHA. ADRs explain accepted
decisions; they do not replace verification of the implementation.

# Related Notes

[Nimara](../../system/Nimara.md)
[Integrations](../integrations/Integrations%20%28MOC%29.md)
[ADR MOC](../ADR/ADR%20MOC.md)
