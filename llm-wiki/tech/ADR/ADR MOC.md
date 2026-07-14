---
type: "Map of Content"
title: "ADR MOC"
description: "Map of Content for architecture decision records (ADRs) — the chronological register of significant technical decisions and their rationale."
tags:
  - "adr"
  - "moc"
created: "2026-07-08T00:00:00+00:00"
timestamp: "2026-07-09T00:00:00+00:00"
---

## Content

Architecture Decision Records capture **why** the system looks the way it does. Each ADR
is one standalone note following the **DERBY-style design ADR** template (see
`_templates/ADR.md`): **Recommendation → Problem → Requirements → Proposed solution →
Cross-cutting considerations** (Security, Monitoring, Failure cases, Alternative solutions,
Dependencies, System Impacts, Documentation, QA Validation, DevOps). DERBY's H1 sections map
to H2 here so the note title stays in frontmatter and the linter can parse sections. Pre-DERBY
ADRs are kept as-is and marked `adr_format: "MADR-legacy"` in frontmatter.

**Conventions**
- **Confirm the base system before writing.** Before drafting any ADR, always ask the user
  which system the application, feature, or provider is built on — for example Saleor,
  Algolia, or a completely new greenfield app from scratch. The agent must not assume or
  guess this; without it the decision context is unanchored and the ADR risks hallucinating
  constraints or capabilities. Record the confirmed answer in the ADR's **Context** as the
  **Base system** line.
- **One decision per note.** File name is `ADR-NNNN <Title>` (zero-padded, monotonically
  increasing, never reused) — e.g. `ADR-0001 Use RAG over fine-tuning`.
- **ADRs are immutable once Accepted.** Don't rewrite a decision — supersede it: create a
  new ADR and set the old one's `status` frontmatter to `Superseded by ADR-NNNN Title`.
- Register every new ADR in the register below in the same change.

## Register

<!-- Newest last. Format: - ADR-NNNN Title - Status - one-line summary -->

- [ADR-0001 Default ReviewProvider Stores Reviews as Saleor Models](ADR-0001%20Default%20ReviewProvider%20Stores%20Reviews%20as%20Saleor%20Models.md) - Proposed - the default reviews provider persists verified reviews as Saleor Models (`Page`/`PageType`) with Saleor as the system of record; Postgres and raw metadata rejected. Note: unrelated to the code-docs register's `0001-integration-provider-architecture.md` (separate register, different subject — the numbers do not collide).
- [ADR-0002 Verified User Reviews on Saleor with nimara-mailer Invitations](ADR-0002%20Verified%20User%20Reviews%20on%20Saleor%20with%20nimara-mailer%20Invitations.md) - Proposed - a fresh, whole-system design for the Verified User Reviews epic: `reviews` as a swappable capability with a single `saleor` provider, reviews stored as Saleor Pages, per-product aggregate as product attributes, privileged writes via an app-token Server Action, and invitations sent by an extended nimara-mailer (`ORDER_FULFILLED` → AWS-native delay → `review_invitation` template). Dedicated Postgres, metadata blobs, a storefront cron + in-repo mailer, and a second SaaS provider are the weighed alternatives. Independently derived from the epic (not a revision of ADR-0001); both are `Proposed` and address the same epic from different scopes.

## Related Notes

[Product Strategy 2026 (MOC)](product/strategy/Product%20Strategy%202026%20%28MOC%29.md)
