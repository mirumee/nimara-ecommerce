---
type: "Application"
title: "Documentation"
description: "Versioned Docusaurus documentation site with strict link validation, search, and generated llms.txt exports."
tags:
  - "application"
  - "documentation"
  - "docusaurus"
created: "2026-07-15T09:50:07+00:00"
timestamp: "2026-07-15T11:10:59+02:00"
knowledge_status: "current"
implementation_status: "wired"
direction_status: "active"
verified_at: "2026-07-15T09:50:07+00:00"
code_branch: "main"
code_commit: "e32732ea85f7e6cfb807b462c7bbc47e6f569603"
scope_paths:
  - "apps/docs"
---

# Content

## Current implementation

The docs application publishes versioned Docusaurus content. On the reviewed `main`, `2.0.x`
is served at the root while `1.15.0` and `1.14.0` remain accessible as unmaintained versions.
Topics include onboarding, local development, storefront configuration, Saleor CMS, channels,
UCP, Stripe, marketplace, i18n, release workflow, and Terraform.

The build enables Algolia search and Mermaid, fails on broken links/anchors, and generates
`llms.txt` plus `llms-full.txt` for the newest version.

## Boundaries

Public docs are explanatory evidence, not the authority for current implementation. Versioned
documents may lag code. The ADR under `apps/docs/adr/` is outside the published docs content,
and an i18n document exists without sidebar registration.

## Direction and gaps

Documentation remains active under operational stabilization. Current direction prioritizes
onboarding completeness, explicit environment requirements, and reliable documentation search.
The Docusaurus migration is complete and the code already emits both LLM text files, although
their broader product scope remains in refinement; this is direction/implementation drift, not
evidence that every related requirement is finished.

## Evidence

Primary paths: `apps/docs/docusaurus.config.ts`, `apps/docs/versions.json`,
`apps/docs/versioned_docs`, `apps/docs/versioned_sidebars`, and `apps/docs/src/plugins/llms-txt.ts`.

# Related Notes

[Nimara](../Nimara.md)
[Deployment And Observability](../../tech/integrations/Deployment%20And%20Observability.md)
