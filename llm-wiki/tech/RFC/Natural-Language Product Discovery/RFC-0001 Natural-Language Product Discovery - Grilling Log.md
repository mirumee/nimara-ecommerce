---
type: "RFC Grilling Log"
title: "RFC-0001 Natural-Language Product Discovery — Grilling Log"
description: "Technical grilling that shaped RFC-0001 — the Nimara-owned discovery layer over SearchService with a swappable LLM provider."
tags:
  - "rfc"
  - "grilling"
  - "decision-log"
  - "product-discovery"
created: "2026-07-14T00:00:00+00:00"
timestamp: "2026-07-14T00:00:00+00:00"
---

# RFC-0001 Natural-Language Product Discovery — Grilling Log

## Purpose

Durable record of the user-visible technical grilling that shaped [RFC-0001](RFC-0001%20Natural-Language%20Product%20Discovery.md). Decisions, recommendations, answers, and rejected options — not a raw transcript. Pairs with its RFC and, downstream, feeds the ADR that accepts or rejects it.

## Session 1 — 2026-07-14

### Session Context

- PRD: [PRD-001 Natural-Language Product Discovery](../../../prd/PRD-001%20Natural-Language%20Product%20Discovery.md)
- Trigger: PRD-001 defers the whole technical solution; this RFC decides how Nimara delivers single-turn NL discovery.
- Base system / system of record: Saleor storefront (`apps/storefront`) over the existing swappable `SearchService`; the configured search provider stays the authoritative source of products — discovery adds no store of its own.
- Starting facts: PRD-001 + grilling log; strategy ([Do Not Pursue](../../../market/strategy/Do%20Not%20Pursue.md): no proprietary index; [Table Stakes vs Differentiators](../../../market/research/Table%20Stakes%20vs%20Differentiators.md): AI recs = table stakes, UCP/MCP separate); code map (SearchService contract, saleor/algolia/dummy providers, provider-manifest selector, no LLM/vector code anywhere); deep research on primary sources (Vercel AI SDK Apache-2.0, structured-output/tool-calling, Algolia NeuralSearch enterprise-gated, Saleor FTS lexical-only) and an LLM cost comparison across 16 models incl. AWS Bedrock.
- Facilitator: `rfc-author`
- Outcome: `shared-understanding-confirmed`

### Decision Drivers

Ranked; dominant marked (these trace to PRD NFRs and became the RFC's non-functional requirements).

1. **Catalog validity — DOMINANT.** Never show a non-existent or ineligible product (NFR-1, AC-5, M-4).
2. **Works on the OSS default — DOMINANT.** Must function on a stock install whose default provider is `saleor`.
3. **No proprietary index — DOMINANT.** Strategy forbids building/hosting a search index.
4. Vendor neutrality — no mandated SaaS; the LLM swaps behind a contract.
5. Non-blocking — off = no change; on = never blocks render or classic search.
6. Cost control — bounded, adopter-owned.
7. Privacy — raw queries off by default.
8. Layer fit — swappable-provider convention, `Result<T, E>`.

### Decision Log

| ID    | Branch | Question | Recommendation | User answer | Resulting decision |
| :---- | :----- | :------- | :------------- | :---------- | :----------------- |
| D-001 | Approach | Which approach — query-translation (A), semantic (B), or hybrid query-plan + grounded re-rank (C)? | A-now / C-ready | **C as core** | Hybrid query-plan + grounded re-rank is the core design; two constrained LLM calls bracketing a real provider search. |
| D-002 | Problem + reqs | Does the restated problem + FR/NFR frame the RFC correctly? | Accept | Yes | Problem and FR/NFR (traced to PRD) accepted as the frame. |
| D-003 | Components | Separate `DiscoveryService` composing `SearchService`, with the LLM as its own swappable boundary? | Yes — two principles | Yes | Discovery layers **over** `SearchService` (composes, no new method on it); `LLMProvider` is a separate boundary because the LLM is independent of search. |
| D-004 | API surface | Internal server-side service returning `Result` with a typed fallback reason; no public endpoint? | Yes | Yes | Internal service (Server Action / RSC); injected `SearchService` (facets + retrieval); `AsyncResult` + machine-readable fallback reason; no public REST endpoint. |
| D-005 | Data / storage | Stateless — no schema, index, or store; telemetry via events; raw-query off? | Yes | Yes | Stateless; Database changes = none; observability as emitted events; raw query off by default. |
| D-006 | Security | Treat all LLM input as data (anti-injection); secrets server-side; no custom moderation; name hard failure modes? | Yes | Yes | Untrusted-input posture; server-side secrets; provider safeguards only; unacceptable = invalid product / leaked secret / undocumented transfer. |
| D-007 | Monitoring / failure | Every failure degrades to classic search or honest no-match; alerting deployment-owned? | Yes | Yes | Failure→fallback matrix accepted; observable via events; no universal alert thresholds. |
| D-008 | Dependencies + reference adapter (U-4) | Which LLM client, and which reference adapter? | AI SDK behind a swappable boundary; adapter by cost | **AWS Bedrock, Llama 4 Scout** (values Converse model-swap + existing AWS infra) | Reference host = AWS Bedrock, default model Llama 4 Scout 17B (~$1.30/1k), swappable. Client = `@aws-sdk/client-bedrock-runtime` (recommended), thin-REST adapter as the no-dep alternative; Vercel AI SDK dropped as it partly duplicates the `LLMProvider` port. |
| D-009 | Docs / QA / DevOps | Developer-only docs; automatable no-invention gate; flag off; AWS infra (IAM, quotas, budget)? | Yes | Yes | Docs incl. provider data-transfer disclosure; hard QA gate = no invented products; global cost cap via provider account, not Nimara code. |
| D-010 | Abuse & cost | Add per-customer throttling, or only a global cap? | Global only; per-IP is the adopter's edge concern | **Global only** | No per-customer throttle in Nimara; global cap via provider account; residual "denial-of-wallet within cap" named; per-IP left to the adopter's edge/WAF. |

### Chosen Approach and Rejected Alternatives

- **Hybrid query-plan + grounded re-rank (C)** — **chosen**: satisfies the three dominant drivers unstrained and ships on the Saleor-lexical default; grounding by construction (the LLM emits query params + ids, never products).
- **Query-translation only (A)** — rejected because it fails the perceived-relevance bar on the lexical default (weak provider ranking → brittle over-tuned query). Reachable as a config where a provider's ranking is already strong.
- **Provider-native semantic (B, e.g. Algolia NeuralSearch)** — rejected as the base because it fails *works-on-the-OSS-default* (enterprise-gated, nothing on Saleor). Composes underneath the same design; became its own [RFC-0002](RFC-0002%20Provider-Native%20Natural-Language%20Product%20Discovery.md).
- **Self-hosted embeddings / vector store** — rejected because it fails *no proprietary index* outright.

### Deferred to Implementation

- Exact file/function names, prompt wording, candidate count `N`, and how the injected facet vocabulary is bounded for large catalogs — do not change the decision. Owner: implementer / (facet bound) Product + Architecture, gated on PRD Q-4.

### For the ADR

- Concrete latency/cost thresholds are adopter-owned by design (NFR-7); the reference figure is illustrative.

## Related Notes

[RFC-0001 Natural-Language Product Discovery](RFC-0001%20Natural-Language%20Product%20Discovery.md)
[RFC-0002 Provider-Native Natural-Language Product Discovery](RFC-0002%20Provider-Native%20Natural-Language%20Product%20Discovery.md)
[PRD-001 Natural-Language Product Discovery](../../../prd/PRD-001%20Natural-Language%20Product%20Discovery.md)
[RFC MOC](../RFC%20MOC.md)
