---
type: "Map of Content"
title: "RFC MOC"
description: "Map of Content and register for RFC design proposals — problem-to-solution design pages that precede an accepting or rejecting ADR."
tags:
  - "rfc"
  - "design-doc"
  - "moc"
created: "2026-07-13T00:00:00+00:00"
timestamp: "2026-07-13T00:00:00+00:00"
---

## Content

An RFC is a design **proposal** for a non-trivial change — problem, requirements,
proposed solution, and cross-cutting considerations (see `_templates/RFC.md`). An RFC
does not record the verdict: the decision to accept or reject it, and the eventual
outcome, live in an [ADR](../ADR/ADR%20MOC.md).

**Conventions**

- File name is `RFC-NNNN <Title>` (zero-padded, monotonically increasing, never reused).
- Competing approaches may be separate RFCs; cross-link them under Alternative solutions.
- `status` in frontmatter moves `Draft → In Review → Final`.
- Register every new RFC below in the same change, and link the ADR that resolves it.

## Register

<!-- Newest last. Format: - RFC-NNNN Title - Status - resolving ADR - one-line summary -->

- [RFC-0001 Natural-Language Product Discovery](Natural-Language%20Product%20Discovery/RFC-0001%20Natural-Language%20Product%20Discovery.md) — Draft — resolving ADR: _pending_ — opt-in, provider-agnostic NL discovery layer over `SearchService`; hybrid LLM query-plan + grounded re-rank; reference adapter AWS Bedrock (Llama 4 Scout), swappable. Serves [PRD-001](../../prd/PRD-001%20Natural-Language%20Product%20Discovery.md). Competes with RFC-0002.
- [RFC-0002 Provider-Native Natural-Language Product Discovery](Natural-Language%20Product%20Discovery/RFC-0002%20Provider-Native%20Natural-Language%20Product%20Discovery.md) — Draft — resolving ADR: _pending_ — discovery as an optional capability of the search provider (Algolia Agent Studio); agent returns ids + reasons, storefront joins to real records; no new dependency or infrastructure. Serves [PRD-001](../../prd/PRD-001%20Natural-Language%20Product%20Discovery.md). Competes with RFC-0001 — one ADR should resolve both.

## Related Notes

[ADR MOC](../ADR/ADR%20MOC.md)
