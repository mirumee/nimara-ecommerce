---
type: "QA Taxonomy"
title: "Defect Taxonomy & Severity"
description: "A shared vocabulary for classifying defects (type + area) and assigning severity, so reports and tickets are consistent and prioritisable."
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

### Area (maps to labels/components)
`checkout` (`BC:checkout`) · `cart` · `product/PLP/PDP` · `search` · `account/auth` · `address/i18n` · `payments/Stripe` · `marketplace` · `ERP` (`BC:erp`,`BE`) · `Saleor` · `docs`. Frontend defects: label `FE`.

### Severity rubric
- **Critical** — blocks a core path for many users with no workaround (e.g. checkout shell crash MS-1229). Map to High/Highest priority.
- **High** — significant UX/loss path with a workaround, or money/data correctness risk (billing country limited MS-1120; discounts cache MS-1102).
- **Medium** — degrades UX, narrow population, or has a workaround (most retest tickets).
- **Low** — cosmetic / edge (input misalignment MS-1166).

### When filing a bug, include
Component/area · environment(s) (`customfield_10044`) · clear repro steps · actual vs expected · affected scope (which countries/channels/pages) · evidence path · related tickets (link `Blocks`/`Relates to`). For systemic findings, file the **bug(s)** + a **`[DEV]` spec ticket** that `Blocks` them and states what/how + acceptance criteria (pattern used for MS-1238/1239/1240).

### Generalise before filing
If a bug recurs across inputs, file the **class**, not one instance (e.g. "address admin-area missing for all S-required countries Saleor lacks choices for", not just "Russia").

## Related Notes
[Quality & Testing (MOC)](quality/Quality%20%26%20Testing%20%28MOC%29.md)
[Coverage Maps](quality/Coverage%20Maps.md)
[Jira & Board 74 Operating Manual](quality/Jira%20%26%20Board%2074%20Operating%20Manual.md)
