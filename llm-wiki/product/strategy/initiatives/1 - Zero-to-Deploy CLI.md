---
type: "Strategic Initiative"
title: "1 - Zero-to-Deploy CLI"
description: "Research-derived proposal to reduce the path from repository checkout to a deployed Nimara environment."
tags:
  - "strategy"
  - "developer-experience"
  - "deployment"
created: "2026-06-16T00:00:00+00:00"
timestamp: "2026-07-15T11:10:59+02:00"
status: "research_proposal"
knowledge_status: "mixed"
implementation_status: "not_observed"
direction_status: "planned"
verified_at: "2026-07-15T09:50:07+00:00"
code_branch: "main"
code_commit: "e32732ea85f7e6cfb807b462c7bbc47e6f569603"
scope_paths:
  - "package.json"
  - "terraform"
  - "apps/docs"
---

# Content

## Research proposal

The June 2026 strategy research proposed a guided CLI that would turn initial configuration,
local setup, and deployment into one coherent onboarding path for a storefront developer. The
proposal ranks this as a high-impact adoption initiative. Current product direction supports,
but still plans, CLI/monorepo and related R&D work.

## Current implementation

The reviewed `main` snapshot contains root scripts, application-specific setup documentation,
environment examples, and Terraform modules, but no dedicated Zero-to-Deploy CLI was observed.
These ingredients should not be mistaken for an integrated, supported onboarding product.

## Direction and gaps

CLI/monorepo work is planned, while onboarding documentation is active. The integrated CLI is
therefore planned, not implemented; documentation activity is an adjacent path rather than
evidence that the CLI exists. Runtime success metrics such as time-to-first-local-storefront and
time-to-deploy are absent from the current knowledge.

## Evidence

- Directional source: [Initiative Prioritization](./Initiative%20Prioritization.md).
- Code baseline: [Main e32732e Snapshot](../../../sources/codebase/Main%20e32732e%20Snapshot.md).

# Related Notes

[Storefront](../../../system/applications/Storefront.md)
[Deployment And Observability](../../../tech/integrations/Deployment%20And%20Observability.md)
[Storefront Developer](../../personas/Storefront%20Developer.md)
