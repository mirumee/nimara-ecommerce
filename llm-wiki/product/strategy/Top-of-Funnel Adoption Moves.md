---
type: "Strategy Note"
title: "Top-of-Funnel Adoption Moves"
description: "The smallest set of high-leverage moves to accelerate open-source developer adoption — the primary growth lever."
tags:
  - "strategy"
  - "adoption"
  - "developer"
  - "dx"
  - "growth"
created: "2026-06-16T00:00:00+00:00"
timestamp: "2026-07-15T11:10:59+02:00"
status: "research_hypothesis"
knowledge_status: "research"
direction_status: "active"
source_status: "incomplete_raw_source"
---

## Content

Open-source developer adoption is the top of the funnel (see [Storefront Developer](../personas/Storefront%20Developer.md)). Three focused moves:

- **Active local environment tooling:** a pre-configured Docker Compose file that spins up local PostgreSQL, Saleor, and Meilisearch instantly, eliminating local setup friction. (Supports [1 - Zero-to-Deploy CLI](./initiatives/1%20-%20Zero-to-Deploy%20CLI.md).)
- **Robust monorepo health & test coverage:** stabilize CI/CD and reach 90%+ E2E coverage on core checkout routes so the codebase never breaks on a developer's first clone.
- **High-fidelity code recipes:** replace abstract architectural docs with copy-pasteable, verified integration recipes (e.g. "Connect Payload CMS to Nimara in 3 lines"), addressing immediate implementation needs and countering tutorial fatigue (see [Developer Pain Points](../market/Developer%20Pain%20Points.md)).

CLI/monorepo and E2E/CI expansion are planned, while onboarding documentation and operational
stabilization are active. The current code contains scripts, docs, Terraform, and a partial
Playwright suite, but no integrated Zero-to-Deploy CLI or 90%+ E2E evidence.

## Related Notes

[Storefront Developer](../personas/Storefront%20Developer.md)
[1 - Zero-to-Deploy CLI](./initiatives/1%20-%20Zero-to-Deploy%20CLI.md)
[Developer Pain Points](../market/Developer%20Pain%20Points.md)
[Product Strategy 2026 (MOC)](./Product%20Strategy%202026%20%28MOC%29.md)
