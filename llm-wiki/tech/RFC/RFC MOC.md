---
type: "Map of Content"
title: "RFC MOC"
description: "Map of Content and register for RFC design proposals — problem-to-solution design pages that precede an accepting or rejecting ADR."
tags:
  - "rfc"
  - "design-doc"
  - "moc"
created: "2026-07-13T00:00:00+00:00"
---

## Content

An RFC is a design **proposal** for a non-trivial change — problem, requirements,
proposed solution, and cross-cutting considerations (see `_templates/RFC.md`). An RFC
does not record the verdict: the decision to accept or reject it, and the eventual
outcome, live in an [ADR](../ADR/ADR%20MOC.md).

**Conventions**

- File name is `RFC-NNNN <Title>` (zero-padded, monotonically increasing, never reused).
- Competing approaches may be separate RFCs; cross-link them under Alternative solutions.
- `status` in frontmatter moves `draft → in_review → final`.
- Register every new RFC below in the same change, and link the ADR that resolves it.

## Register

<!-- Newest last. Format: - RFC-NNNN Title - Status - resolving ADR - one-line summary -->

- [RFC-0001 Newsletter Subscription](RFC-0001%20Newsletter%20Subscription.md) - in_review - resolved by [ADR-0003](../ADR/ADR-0003%20Newsletter%20Subscription%20Is%20Configuration-Gated%20With%20No%20Default%20Provider.md), [ADR-0004](../ADR/ADR-0004%20Brevo%20Is%20The%20Reference%20Newsletter%20Provider%20Adapter.md), [ADR-0005](../ADR/ADR-0005%20The%20Newsletter%20Subscribe%20Contract%20Is%20Provider-Neutral%20And%20Membership-Blind.md) - Configuration-gated storefront newsletter capability behind a provider-neutral subscribe boundary, with one maintained email-provider adapter and no subscriber data held by Nimara.

## Related Notes

[ADR MOC](../ADR/ADR%20MOC.md)
