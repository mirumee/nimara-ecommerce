---
type: "Map of Content"
title: "Technical Architecture (MOC)"
description: "Entry point for Nimara runtime flows, architectural boundaries, integrations, and architecture decisions."
tags:
  - "architecture"
  - "moc"
  - "flows"
created: "2026-07-10T00:00:00+02:00"
timestamp: "2026-07-10T00:00:00+02:00"
status: "verified"
owner: "architecture"
verified_at: "2026-07-10T00:00:00+02:00"
source_refs:
  - "repo:AGENTS.md"
  - "repo:.agents/skills/project-guidelines/SKILL.md"
---

# Content

## Architectural boundary

Nimara is a layered monorepo. `domain` owns pure types and business rules; `foundation`
contains integration-agnostic utilities; `infrastructure` owns external API access,
serialization, and use cases; `ui` owns reusable presentation; `features` composes behavior;
and `apps` wire concrete services, routing, environment, and deployment concerns.

Dependencies point toward stable layers. Apps do not import other apps, infrastructure does
not depend on features or UI, and domain does not depend on frameworks or external providers.
Runtime operations that can fail normally cross infrastructure boundaries as `Result` values.

## Runtime flows

1. [Storefront Data Flow](tech/flows/Storefront%20Data%20Flow.md) — request composition,
   service registry, feature provider, use case, and Saleor serialization.
2. [Checkout and Payment Flow](tech/flows/Checkout%20and%20Payment%20Flow.md) — standard and
   marketplace checkout, PaymentIntent initialization, Saleor transactions, and order completion.
3. [Marketplace Ledger and Payout Flow](tech/flows/Marketplace%20Ledger%20and%20Payout%20Flow.md)
   — paid order ingestion, Stripe settlement, locked batches, and Connect Transfers.
4. [Marketplace Authentication Flow](tech/flows/Marketplace%20Authentication%20Flow.md) —
   App Bridge/login tokens, route authorization, vendor resolution, and UI gating.
5. [Cache and Webhook Invalidation Flow](tech/flows/Cache%20and%20Webhook%20Invalidation%20Flow.md)
   — tagged reads, signed Saleor webhooks, and targeted revalidation.

## Decisions

Architecture decisions are registered in [ADR MOC](tech/ADR/ADR%20MOC.md). Runtime-flow pages
describe what the repository currently does; ADRs preserve why durable choices were made.

## Maintenance contract

A flow is updated when its invariant, ownership boundary, failure semantics, or externally
observable sequence changes. Moving code without changing those facts does not require a wiki
update. Each verified flow lists repository sources and a concrete verification path.

# Related Notes

[ADR MOC](tech/ADR/ADR%20MOC.md)
[Product Strategy 2026 (MOC)](product/strategy/Product%20Strategy%202026%20%28MOC%29.md)
[Quality & Testing (MOC)](quality/Quality%20%26%20Testing%20%28MOC%29.md)
[Operations (MOC)](operations/Operations%20%28MOC%29.md)
[LLM Wiki Usefulness Review](operations/LLM%20Wiki%20Usefulness%20Review.md)
