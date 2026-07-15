---
type: "QA Taxonomy"
title: "Defect Taxonomy & Severity"
description: "A shared vocabulary for classifying defects by type, area, and severity so reports remain consistent and prioritizable."
tags:
  - "qa"
  - "taxonomy"
  - "severity"
  - "triage"
created: "2026-06-30T00:00:00+00:00"
timestamp: "2026-06-30T00:00:00+00:00"
---

## Content

### Defect type

`functional` · `validation` · `visual/layout` · `performance` · `SEO/metadata` · `accessibility` · `data/contract (API/HTTP)` · `race/timing` · `i18n/localization` · `security` · `backend/integration (Saleor/ERP)`.

### Area

`checkout` · `cart` · `product/PLP/PDP` · `search` · `account/auth` · `address/i18n` · `payments/Stripe` · `marketplace` · `ERP` · `Saleor` · `docs`.

### Severity rubric

- **Critical** — blocks a core path for many users with no workaround, such as a checkout shell crash.
- **High** — significant UX/loss path with a workaround, or money/data correctness risk.
- **Medium** — degrades UX, affects a narrower population, or has a practical workaround.
- **Low** — cosmetic or edge behavior, such as minor input misalignment.

### When filing a bug, include

Component/area · environment and build · clear reproduction steps · actual versus expected
behavior · affected scope (countries/channels/pages) · severity rationale · evidence location ·
known dependencies. For systemic findings, describe the complete behavior class and acceptance
criteria rather than only one observed instance.

### Generalise before filing

If a bug recurs across inputs, file the **class**, not one instance (e.g. "address admin-area missing for all S-required countries Saleor lacks choices for", not just "Russia").

## Related Notes

[Quality & Testing (MOC)](./Quality%20%26%20Testing%20%28MOC%29.md)
[Coverage Maps](./Coverage%20Maps.md)
