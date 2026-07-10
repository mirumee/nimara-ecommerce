---
type: "Map of Content"
title: "ADR MOC"
description: "Map of Content for architecture decision records (ADRs) — the chronological register of significant technical decisions and their rationale."
tags:
  - "adr"
  - "moc"
created: "2026-07-08T00:00:00+00:00"
timestamp: "2026-07-10T00:00:00+02:00"
---

## Content

Architecture Decision Records capture **why** the system looks the way it does. Each ADR
is one standalone note following the [Michael Nygard template](https://github.com/architecture-decision-record/architecture-decision-record/tree/main/locales/en/templates/decision-record-template-by-michael-nygard):
**Status → Context → Decision → Consequences** (see `_templates/ADR.md`).

**Conventions**

- **One decision per note.** File name is `ADR-NNNN <Title>` (zero-padded, monotonically
  increasing, never reused) — e.g. `ADR-0001 Use RAG over fine-tuning`.
- **ADRs are immutable once Accepted.** Don't rewrite a decision — supersede it: create a
  new ADR and set the old one's `status` frontmatter to `Superseded by ADR-NNNN Title`.
- Register every new ADR in the register below in the same change.

## Register

<!-- Newest last. Format: - ADR-NNNN Title - Status - one-line summary -->

- [ADR-0001 Use Separate Charges and Transfers for Marketplace Settlement](tech/ADR/ADR-0001%20Use%20Separate%20Charges%20and%20Transfers%20for%20Marketplace%20Settlement.md) — **Accepted** — separate customer charge timing from availability-aware vendor Transfers using a ledger and locked batches.

## Related Notes

[Product Strategy 2026 (MOC)](product/strategy/Product%20Strategy%202026%20%28MOC%29.md)
[Technical Architecture (MOC)](tech/Technical%20Architecture%20%28MOC%29.md)
[Stripe Connect Split Payments Solution](product/solution/Stripe%20Connect%20Split%20Payments%20Solution.md)
