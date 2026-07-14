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

_No RFCs recorded yet._

## Related Notes

[ADR MOC](../ADR/ADR%20MOC.md)
