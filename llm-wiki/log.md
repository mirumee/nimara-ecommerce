# Directory Update Log

## 2026-07-14
* **PRD terminology**: Standardized the product-document model as PRD (Product Requirements Document), including `PRD-*` identifiers, `product/prds/` paths, templates, grilling logs, links, and authoring skills.
* **Structure**: Added `tech/saleor/` with [Saleor Schema (MOC)](tech/saleor/Saleor%20Schema%20%28MOC%29.md) and six curated, version-stamped notes (Products & Variants, Checkout & Payments, Orders & Fulfillment, Account & Auth, Shop/Channels/Warehouses, Attributes & Metadata). Registered them in `index.md` and documented the `Saleor Schema Note` type in `AGENTS.md`.
* **Tooling**: Notes carry a `saleor_schema_hash` stamp (short sha256 of `packages/codegen/schema.ts`, the de-facto Saleor version pin). Added `pnpm wiki:saleor:hash` / `pnpm wiki:saleor:check` (`scripts/wiki-saleor-check.mjs`) and a freshness rule in the `llm-wiki` skill: verify before citing, restamp after `pnpm codegen`.
* **Template**: Added [Saleor Schema Note Template](_templates/saleor-schema-note.md).

## 2026-07-13
* **Template**: Added [RFC Design Doc Template](_templates/RFC.md) — a port of the Mirumee RFC design page (problem, requirements, proposed solution, cross-cutting considerations). RFC is a proposal only; the verdict and outcome live in an ADR. Registered it under Templates in `index.md`; kept the Nygard [ADR Template](_templates/ADR.md) separate.
* **Structure**: Added the `tech/RFC/` folder and [RFC MOC](tech/RFC/RFC%20MOC.md) as the register for RFC proposals, mirroring `tech/ADR/`. Cross-linked ADR and RFC: the [ADR Template](_templates/ADR.md) now names the RFC it resolves and links both MOCs. Updated the folder tree in `AGENTS.md` and the `index.md` catalogue.

## 2026-07-10
* **Grilling log**: Added the decision record and reusable template for [PRD-001 Natural-Language Product Discovery](product/prds/PRD-001%20Natural-Language%20Product%20Discovery.md), including the business interview, exclusions, deferred technical branches, and unresolved decisions.
* **PRD refinement**: Renamed [PRD-001 Natural-Language Product Discovery](product/prds/PRD-001%20Natural-Language%20Product%20Discovery.md), promoted it to `analyzing`, and replaced the client-delivery framing with the agreed market-parity hypothesis, validation thresholds, falsification, and MVP boundaries.

## 2026-07-09
* **Creation**: Added an OKF placeholder for [3 - UCP-MCP Agentic Discovery](product/strategy/initiatives/3%20-%20UCP-MCP%20Agentic%20Discovery.md), which was referenced by the initiative index.
* **Update**: Reworked `llm-wiki/` into OKF v0.1-style documents: YAML frontmatter for concept files, standard Markdown cross-links, and OKF reserved-file structure for `index.md` and `log.md`.
* **Lint**: Renamed `README.md` to `AGENTS.md`, added `index.md`, `log.md`, and `sources/`, and updated the wiki-maintenance conventions for the LLM-wiki pattern.
