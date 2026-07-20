# Directory Update Log

## 2026-07-20

- **Record contracts**: Added complete location, filename, lifecycle, relationship,
  immutability, review-owner, and registration contracts for IMP, CAP, FLOW, INT, QA, and
  OPS. Added their MOCs and empty locations without creating content records, and aligned
  templates and retrieval navigation with the new model.
- **Schema repair**: Unified specialized record templates with the governing contract:
  human-readable record types, singular accountable `owner`, ISO 8601 `created` and
  `timestamp`, lower-case `snake_case` statuses, and `PRD` relation names and references.
  Added the required authored-record placeholders to PRD, RFC, and ADR templates and aligned
  the RFC authoring skill and ADR/RFC registers with the canonical lifecycle vocabulary.
- **Template link repair**: Made active template links resolve from each record's authored
  location, converted record-specific ADR/RFC/PRD examples to non-clickable paths, and
  aligned RFC authoring guidance with the one-way RFC-to-PRD relation.

## 2026-07-17

- **Schema**: Defined canonical common frontmatter and specialized PRD, RFC, and ADR contracts
  in `AGENTS.md`, including identifiers, lifecycle states, template instantiation, and
  relationship rules. Backfilled deterministic IDs and persona links for PRD-002 and PRD-003.
- **Link maintenance**: Repaired the wiki for GitHub-relative Markdown resolution: all 327 local links now resolve, `index.md` exactly covers all 55 non-reserved Markdown records, renamed market/PRD paths use their current locations, and active entries for the deleted task artifact and absent RFC documents were removed. Historical mentions of missing artifacts were preserved as text.
- **Lint**: Audited the full wiki graph, schema, related skills, QMD retrieval, Git/GitHub integration, source provenance, and developer-harness coverage. Findings and prioritized recommendations are recorded in the [LLM Wiki Review](../LLM_WIKI_REVIEW.md); no reported wiki defects were auto-fixed.
- **Index maintenance**: Reconciled `index.md` with the current wiki tree: updated PRD paths and titles, registered the record templates and product task artifact, separated ADR and RFC catalogues, completed truncated descriptions, and removed entries for deleted notes.

## 2026-07-16

- **RFC**: Added `RFC-0002 Provider-Native Natural-Language Product Discovery` (`status: Draft`) — a competing approach to `RFC-0001` serving the same [PRD-001](prd/PRD-001%20Natural-Language%20Product%20Discovery.md): discovery as an optional capability of the search provider (Algolia Agent Studio holds the prompt, model, and limits), with the agent returning product ids plus reasons and the storefront joining them to real records. No new dependency or infrastructure. Registered in the [RFC MOC](tech/RFC/RFC%20MOC.md) and `index.md`; cross-linked with RFC-0001 and PRD-001 in both directions. The two RFCs are mutually exclusive — one ADR should resolve both.

## 2026-07-14

- **RFC**: Added `RFC-0001 Natural-Language Product Discovery` (`status: Draft`) — an opt-in, provider-agnostic NL discovery layer that composes the existing `SearchService` with a separate swappable `LLMProvider` boundary; hybrid LLM query-plan + grounded re-rank grounded in the real catalog; reference adapter AWS Bedrock (Llama 4 Scout), swappable. Registered it in the [RFC MOC](tech/RFC/RFC%20MOC.md) and `index.md`, and cross-linked it with [PRD-001](prd/PRD-001%20Natural-Language%20Product%20Discovery.md) in both directions. Resolving ADR pending.
- **PRD terminology**: Standardized the product-document model as PRD (Product Requirements Document), including `PRD-*` identifiers, `product/prds/` paths, templates, grilling logs, links, and authoring skills.
- **Structure**: Added `tech/saleor/` with [Saleor Schema (MOC)](tech/saleor/Saleor%20Schema%20%28MOC%29.md) and six curated, version-stamped notes (Products & Variants, Checkout & Payments, Orders & Fulfillment, Account & Auth, Shop/Channels/Warehouses, Attributes & Metadata). Registered them in `index.md` and documented the `Saleor Schema Note` type in `AGENTS.md`.
- **Tooling**: Notes carry a `saleor_schema_hash` stamp (short sha256 of `packages/codegen/schema.ts`, the de-facto Saleor version pin). Added `pnpm wiki:saleor:hash` / `pnpm wiki:saleor:check` (`scripts/wiki-saleor-check.mjs`) and a freshness rule in the `llm-wiki` skill: verify before citing, restamp after `pnpm codegen`.
- **Template**: Added [Saleor Schema Note Template](_templates/saleor-schema-note.md).

## 2026-07-13

- **Template**: Added [RFC Design Doc Template](_templates/RFC.md) — a port of the Mirumee RFC design page (problem, requirements, proposed solution, cross-cutting considerations). RFC is a proposal only; the verdict and outcome live in an ADR. Registered it under Templates in `index.md`; kept the Nygard [ADR Template](_templates/ADR.md) separate.
- **Structure**: Added the `tech/RFC/` folder and [RFC MOC](tech/RFC/RFC%20MOC.md) as the register for RFC proposals, mirroring `tech/ADR/`. Cross-linked ADR and RFC: the [ADR Template](_templates/ADR.md) now names the RFC it resolves and links both MOCs. Updated the folder tree in `AGENTS.md` and the `index.md` catalogue.

## 2026-07-10

- **Grilling log**: Added the decision record and reusable template for [PRD-001 Natural-Language Product Discovery](prd/PRD-001%20Natural-Language%20Product%20Discovery.md), including the business interview, exclusions, deferred technical branches, and unresolved decisions.
- **PRD refinement**: Renamed [PRD-001 Natural-Language Product Discovery](prd/PRD-001%20Natural-Language%20Product%20Discovery.md), promoted it to `analyzing`, and replaced the client-delivery framing with the agreed market-parity hypothesis, validation thresholds, falsification, and MVP boundaries.

## 2026-07-09

- **Creation**: Added an OKF placeholder for `3 - UCP-MCP Agentic Discovery`, which was referenced by the initiative index.
- **Update**: Reworked `llm-wiki/` into OKF v0.1-style documents: YAML frontmatter for concept files, standard Markdown cross-links, and OKF reserved-file structure for `index.md` and `log.md`.
- **Lint**: Renamed `README.md` to `AGENTS.md`, added `index.md`, `log.md`, and `sources/`, and updated the wiki-maintenance conventions for the LLM-wiki pattern.
