---
type: "Map of Content"
title: "Applications (MOC)"
description: "Entry point for the five application and verification surfaces that make up Nimara on main."
tags:
  - "system"
  - "applications"
  - "moc"
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
---

# Content

Nimara has three runtime commerce applications plus documentation and automated-test surfaces.

- [Storefront](./Storefront.md) - customer experience and ACP/UCP protocol facade.
- [Marketplace](./Marketplace.md) - vendor operations, Saleor App, payment orchestration, and settlement.
- [Stripe App](./Stripe%20App.md) - standalone Saleor Payment Gateway App.
- [Documentation](./Documentation.md) - versioned Docusaurus documentation and LLM exports.
- [Automated Tests](./Automated%20Tests.md) - partial, storefront-focused Playwright coverage.

Each page distinguishes static wiring from environment-dependent behavior and runtime proof.

# Related Notes

[Nimara](../Nimara.md)
[Capabilities](../capabilities/Capabilities%20%28MOC%29.md)
[Architecture](../../tech/architecture/Architecture%20%28MOC%29.md)
