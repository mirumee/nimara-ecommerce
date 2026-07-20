---
type: "Map of Content"
title: "ADR MOC"
description: "Map of Content for architecture decision records (ADRs) — the chronological register of significant technical decisions and their rationale."
tags:
  - "adr"
  - "moc"
created: "2026-07-08T00:00:00+00:00"
timestamp: "2026-07-20T00:00:00+00:00"
---

## Content

Architecture Decision Records capture **why** the system looks the way it does. Each ADR
is one standalone note following the [Michael Nygard template](https://github.com/architecture-decision-record/architecture-decision-record/tree/main/locales/en/templates/decision-record-template-by-michael-nygard):
**Status → Context → Decision → Consequences** (see `_templates/ADR.md`).

**Conventions**

- **One decision per note.** File name is `ADR-NNNN <Title>` (zero-padded, monotonically
  increasing, never reused) — e.g. `ADR-0001 Use RAG over fine-tuning`.
- **ADRs are immutable once `accepted`.** Don't rewrite a decision — supersede it: create a
  new ADR, set the old one's `status` to `superseded`, and link the new ADR in
  `superseded_by`.
- Register every new ADR in the register below in the same change.

## Register

<!-- Newest last. Format: - ADR-NNNN Title - Status - one-line summary -->

_No ADRs recorded yet._

## Related Notes

[Product Strategy 2026 (MOC)](../../market/strategy/Product%20Strategy%202026%20%28MOC%29.md)
