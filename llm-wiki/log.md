# Directory Update Log

## 2026-07-13
* **Template**: Added [DERBY Design Doc Template](_templates/DERBY.md) — a port of the Mirumee DERBY design page (problem, requirements, proposed solution, cross-cutting considerations). DERBY is a proposal only; the verdict and outcome live in an ADR. Registered it under Templates in `index.md`; kept the Nygard [ADR Template](_templates/ADR.md) separate.
* **Structure**: Added the `tech/DERBY/` folder and [DERBY MOC](tech/DERBY/DERBY%20MOC.md) as the register for DERBY proposals, mirroring `tech/ADR/`. Cross-linked ADR and DERBY: the [ADR Template](_templates/ADR.md) now names the DERBY it resolves and links both MOCs. Updated the folder tree in `AGENTS.md` and the `index.md` catalogue.

## 2026-07-10
* **Grilling log**: Added the decision record and reusable template for [EPIC-001 Natural-Language Product Discovery](product/epics/EPIC-001%20Natural-Language%20Product%20Discovery.md), including the business interview, exclusions, deferred technical branches, and unresolved decisions.
* **Epic refinement**: Renamed [EPIC-001 Natural-Language Product Discovery](product/epics/EPIC-001%20Natural-Language%20Product%20Discovery.md), promoted it to `analyzing`, and replaced the client-delivery framing with the agreed market-parity hypothesis, validation thresholds, falsification, and MVP boundaries.

## 2026-07-09
* **Creation**: Added an OKF placeholder for [3 - UCP-MCP Agentic Discovery](product/strategy/initiatives/3%20-%20UCP-MCP%20Agentic%20Discovery.md), which was referenced by the initiative index.
* **Update**: Reworked `llm-wiki/` into OKF v0.1-style documents: YAML frontmatter for concept files, standard Markdown cross-links, and OKF reserved-file structure for `index.md` and `log.md`.
* **Lint**: Renamed `README.md` to `AGENTS.md`, added `index.md`, `log.md`, and `sources/`, and updated the wiki-maintenance conventions for the LLM-wiki pattern.
