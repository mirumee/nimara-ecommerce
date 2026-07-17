---
type: "RFC Grilling Log"
title: "RFC-0002 Provider-Native Natural-Language Product Discovery — Grilling Log"
description: "Technical grilling that shaped RFC-0002 — discovery as an optional capability of the search provider, using Algolia Agent Studio."
tags:
  - "rfc"
  - "grilling"
  - "decision-log"
  - "product-discovery"
  - "algolia"
created: "2026-07-16T00:00:00+00:00"
timestamp: "2026-07-16T00:00:00+00:00"
---

# RFC-0002 Provider-Native Natural-Language Product Discovery — Grilling Log

## Purpose

Durable record of the user-visible technical grilling that shaped [RFC-0002](RFC-0002%20Provider-Native%20Natural-Language%20Product%20Discovery.md). Decisions, recommendations, answers, and rejected options — not a raw transcript. Competes with [RFC-0001](RFC-0001%20Natural-Language%20Product%20Discovery.md); one ADR should resolve both.

## Session 1 — 2026-07-16

### Session Context

- PRD: [PRD-001 Natural-Language Product Discovery](../../../prd/PRD-001%20Natural-Language%20Product%20Discovery.md)
- Trigger: with RFC-0001 known, explore a competing approach where the search vendor builds discovery, not Nimara.
- Base system / system of record: Saleor storefront over `SearchService`; the configured provider (here Algolia) holds the catalog and is the authoritative source. The private `nimara-search-algolia-backend` app (Python/Lambda) indexes Saleor → Algolia and stays on the write path only.
- Starting facts: PRD-001 + grilling log; code map (storefront calls Algolia directly via `algoliasearch`, search-only key; app not on read path); primary-source research on Algolia Agent Studio, corrected by the user's own dashboard screenshots (GA not beta; per-item reason is prompt-shaped; custom LLM + own key; cost/step/rate limits incl. per-IP; conversations retained).
- Facilitator: `rfc-author`
- Outcome: `shared-understanding-confirmed`

### Decision Drivers

Ranked; dominant marked.

1. **Catalog validity — DOMINANT.** Only real, resolvable products shown (NFR-1, AC-5, M-4).
2. **Works on the OSS default — DOMINANT** (the driver this approach strains: discovery exists only where the provider offers it).
3. Low Nimara build/maintenance — lean code, config lives with the provider.
4. Vendor neutrality / open-source — strained (Algolia-only today; adopter's LLM key held by Algolia).
5. Non-blocking + honest fallback.
6. Privacy — raw queries off by default (not met: Algolia retains conversations).

### Decision Log

| ID    | Branch | Question | Recommendation | User answer | Resulting decision |
| :---- | :----- | :------- | :------------- | :---------- | :----------------- |
| D-001 | Grounding shape | Agent returns full product payload, or `id` + `reason`? | `id` + `reason`; storefront fetches records | **id + reason** | Agent returns product ids + a reason each; storefront joins to real records. Prices/links/availability come from the catalog, never the model. |
| D-002 | Who calls it | Storefront → Agent Studio directly, or via the Python app? | Storefront directly (search-only key suffices) | **Storefront directly** | Storefront calls Agent Studio server-side; the Python app stays at indexing, off the read path — as a proxy it would add a cold-start hop and a critical dependency for no gain. |
| D-003 | Interface principle | Common interface with provider-defined configuration? | Yes | Yes | Nimara defines the interface; how a provider is configured is the provider's business (Algolia = dashboard; a future provider could differ). |
| D-004 | Layer / boundary | Discovery = optional capability of the search provider, or a separate service? | Optional capability of the provider | Yes | Discovery is an optional operation on `SearchService`; Saleor/dummy omit it → the entry point is simply absent (AC-10 path). |
| D-005 | No-match behavior | Honest no-match + labelled classic search, or silent backfill with defaults? | Honest, labelled fallback | Yes | Honest no-match, then classic search with the original query, clearly labelled — not a silent backfill (mechanics unchanged; presentation is the difference). |
| D-006 | Privacy / retention | Require retention off, or treat as adopter's choice? | Off by default | **Flag it — no visible toggle** | Algolia retains conversations with no known disable; raw queries persisted by a third party by default → contradicts NFR-6/G-018. Provider behavior, not a knob; sent to the ADR. |
| D-007 | Prompt ownership | Reference prompt = versioned repo file, or docs prose? | Versioned file | **A (versioned file)** | The reference prompt ships as a versioned file in the repo. Known limitation: prompt fixes do **not** propagate to adopters' agents — manual re-paste. |
| D-008 | Security posture | Grounding by join; prompt as the injection defense; key placement; server-side rate limit? | Yes | Yes | Grounding = same index + join (ids real, freshness equal to classic search). Injection defense = the prompt, out of Nimara's control after setup. Adopter LLM key stored in Algolia. Server-side → only the agent-wide rate limit applies; per-IP forwarding unverified. |
| D-009 | Monitoring / failure | Accept the failure matrix, with FR-5 only partially met? | Yes | Yes | All failures degrade to classic search / honest no-match. FR-5 partial: outcome/ids/fallback/latency observable; cost and tokens are not (Nimara makes no LLM call). |
| D-010 | Docs / QA / DevOps | Near-zero infra; heavier docs; prompt as the extension point? | Yes | Yes | No new package or infra; setup lives in the adopter's Algolia dashboard; docs carry the reference prompt, data-transfer + retention disclosure, and the propagation caveat. |

### Chosen Approach and Rejected Alternatives

- **Discovery as an optional provider capability via Algolia Agent Studio** — **chosen** for this competing RFC: minimal Nimara code (one REST call + the id→record join), prompt/model/limits configured by the adopter, grounding by the join.
- **Extend `nimara-search-algolia-backend` with a discovery endpoint** — rejected: a search-only key is enough, the agent config lives in Algolia, and the join needs `SearchService` (the storefront already has it); the app would be a pure proxy adding a cold-start hop and a critical dependency. It keeps its indexing role, off the read path.

### Deferred to Implementation

- Exact prompt wording, request/response handling, and the join shape — do not change the decision. Owner: implementer.

### For the ADR

- **Works-on-the-OSS-default:** discovery exists only where a provider offers it — today Algolia alone; a `saleor`-default install gets nothing. Acceptable against S-1 / M-2?
- **NFR-6 not met:** Algolia's conversation retention contradicts the PRD and cannot be turned off by this design.
- **Plan gating unresolved:** launch blog (Build & Grow) vs pricing page (Elevate) — confirm with Algolia.

## Related Notes

[RFC-0002 Provider-Native Natural-Language Product Discovery](RFC-0002%20Provider-Native%20Natural-Language%20Product%20Discovery.md)
[RFC-0001 Natural-Language Product Discovery](RFC-0001%20Natural-Language%20Product%20Discovery.md)
[PRD-001 Natural-Language Product Discovery](../../../prd/PRD-001%20Natural-Language%20Product%20Discovery.md)
[RFC MOC](../RFC%20MOC.md)
