# Directory Update Log

## 2026-07-15

- **Independent memory model**: Removed operational tracker exports, identifiers, workflow mechanics, and source-specific manifests. Temporary planning inputs now contribute only source-neutral, durable knowledge to application, capability, architecture, and strategy concepts.
- **Direction synthesis**: Recorded active Marketplace, custom-search, and stabilization work; planned invoice/tax, CLI, provider, testing, and monitoring evolution; and untracked natural-language discovery and detailed ledger direction.
- **Discrepancy record**: Documented delivery scopes that remain partial in code, implementation that is ahead of product direction, and capabilities whose runtime readiness is not established.
- **Validation**: Extended deterministic checks to reject operational tracker references and identifiers from the durable wiki while preserving link, index, schema, and code-freshness checks.
- **PRD/code reconciliation**: Added [Product Reviews](./system/capabilities/Product%20Reviews.md) and stamped the Cookie Consent, User Reviews, and Natural-Language Product Discovery PRDs with exact `main` evidence. The wiki now distinguishes the wired consent surface, the hard-coded reviews placeholder, and absent natural-language discovery from their broader planned requirements.
- **Research labeling**: Marked strategy and market notes as research rather than implementation truth, personas as reference concepts, and the missing raw strategy report body as an explicit provenance gap.
- **Current-state encyclopedia**: Added [Nimara](./system/Nimara.md) as the canonical product overview plus application and capability maps. Current implementation statements are grounded in local `main` commit `e32732ea85f7e6cfb807b462c7bbc47e6f569603`.
- **Architecture and integrations**: Added current-state notes for monorepo boundaries, provider composition, runtime flows, Saleor, Stripe, CMS/search, ACP/UCP, deployment, and observability. The notes call out observed gaps instead of treating intended architecture or roadmap as shipped behavior.
- **Evidence model**: Defined code as implementation reality, durable product knowledge as direction, design documents as expected behavior or rationale, and runtime evidence as deployment truth. Current notes carry branch, commit, verification time, and scope paths.
- **Tooling**: Added deterministic wiki validation and branch/worktree-isolated QMD collections. The root catalogue is organized around the Nimara system rather than transient delivery artifacts.

## 2026-07-14

- **PRD terminology**: Standardized the product-document model as PRD (Product Requirements Document), including `PRD-*` identifiers, `product/prds/` paths, templates, grilling logs, links, and authoring skills.
- **Structure**: Added `tech/saleor/` with [Saleor Schema (MOC)](tech/saleor/Saleor%20Schema%20%28MOC%29.md) and six curated, version-stamped notes (Products & Variants, Checkout & Payments, Orders & Fulfillment, Account & Auth, Shop/Channels/Warehouses, Attributes & Metadata). Registered them in `index.md` and documented the `Saleor Schema Note` type in `AGENTS.md`.
- **Tooling**: Notes carry a `saleor_schema_hash` stamp (short sha256 of `packages/codegen/schema.ts`, the de-facto Saleor version pin). Added `pnpm wiki:saleor:hash` / `pnpm wiki:saleor:check` (`scripts/wiki-saleor-check.mjs`) and a freshness rule in the `llm-wiki` skill: verify before citing, restamp after `pnpm codegen`.
- **Template**: Added [Saleor Schema Note Template](_templates/saleor-schema-note.md).

## 2026-07-13

- **Template**: Added [RFC Design Doc Template](_templates/RFC.md) — a port of the Mirumee RFC design page (problem, requirements, proposed solution, cross-cutting considerations). RFC is a proposal only; the verdict and outcome live in an ADR. Registered it under Templates in `index.md`; kept the Nygard [ADR Template](_templates/ADR.md) separate.
- **Structure**: Added the `tech/RFC/` folder and [RFC MOC](tech/RFC/RFC%20MOC.md) as the register for RFC proposals, mirroring `tech/ADR/`. Cross-linked ADR and RFC: the [ADR Template](_templates/ADR.md) now names the RFC it resolves and links both MOCs. Updated the folder tree in `AGENTS.md` and the `index.md` catalogue.

## 2026-07-10

- **Grilling log**: Added the decision record and reusable template for [PRD-001 Natural-Language Product Discovery](product/prds/PRD-001%20Natural-Language%20Product%20Discovery.md), including the business interview, exclusions, deferred technical branches, and unresolved decisions.
- **PRD refinement**: Renamed [PRD-001 Natural-Language Product Discovery](product/prds/PRD-001%20Natural-Language%20Product%20Discovery.md), promoted it to `analyzing`, and replaced the client-delivery framing with the agreed market-parity hypothesis, validation thresholds, falsification, and MVP boundaries.

## 2026-07-09

- **Creation**: Added an OKF placeholder for [3 - UCP-MCP Agentic Discovery](product/strategy/initiatives/3%20-%20UCP-MCP%20Agentic%20Discovery.md), which was referenced by the initiative index.
- **Update**: Reworked `llm-wiki/` into OKF v0.1-style documents: YAML frontmatter for concept files, standard Markdown cross-links, and OKF reserved-file structure for `index.md` and `log.md`.
- **Lint**: Renamed `README.md` to `AGENTS.md`, added `index.md`, `log.md`, and `sources/`, and updated the wiki-maintenance conventions for the LLM-wiki pattern.
