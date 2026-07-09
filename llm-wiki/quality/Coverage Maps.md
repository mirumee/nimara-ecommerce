---
type: "QA Reference"
title: "Coverage Maps"
description: "Equivalence partitions for key Nimara surfaces so agents test *classes* of behaviour (no gaps), not random cases — checkout flows, channels, and the address administrative-area field."
tags:
  - "qa"
  - "coverage"
  - "equivalence"
  - "checkout"
  - "addresses"
created: "2026-06-30T00:00:00+00:00"
timestamp: "2026-06-30T00:00:00+00:00"
---

## Content

Design tests by **equivalence partitioning**: enumerate the distinct behaviour classes, then cover each with a representative. This is how the address sweep found bugs the ad-hoc pass missed.

### Address administrative-area field (5 classes — full sweep done)
Source of truth: google-i18n-address `all.json`.
| Class | Rule | Expected field | Representatives |
|---|---|---|---|
| A | S required + alphabetic ids | required **select**, sorted, validated | US, RU, MX, BR, IT, IN, AE, CO, CA, AU |
| B | S required + numeric ids | required **text**, no validation | CN, JP, KR, JM |
| C | S required + empty ids | required **text**, no validation | ES, HK, IQ, CR |
| D | S not required + has subs | **hidden** | IE, TH, AR, UA, TR |
| E | S not required + no subs | **hidden** | PL, GB, FR, DE |
Test plan: `qa/triage/plans/ADDR-state-field-tests.md`; results: `qa/triage/evidence/ADDR-state-field/results.md`. Findings → MS-1238 / MS-1239 / MS-1240.

### Checkout — the main flow surface
Partition by: **channel** (US `/`, GB `/gb`), **auth** (guest vs logged-in), **cart** (single-vendor vs multi-vendor), **payment outcome** (success / declined / 3DS), and **step** (email → shipping → delivery → payment → confirmation). Cover at least: guest+US+success, guest+GB+success, logged-in attach, back-navigation, and an invalid-input per field.

### Validation surfaces (per field)
Email, phone, postal, required vs silently-required fields, card number / expiry / CVC (Stripe iframe). Each has a documented behaviour in `MEMORY.md` — reuse rather than re-derive.

### SEO / structural
Per page type (Home, PLP, PDP, CMS `/page/*`): meta/OG tags, sitemap inclusion, status codes.

### Performance
Per env (dev/stage/demo) × page type (Home/PLP/PDP), mobile + desktop Lighthouse.

## Related Notes
[Quality & Testing (MOC)](quality/Quality%20%26%20Testing%20%28MOC%29.md)
[Test Data & Fixtures](quality/Test%20Data%20%26%20Fixtures.md)
[Test Method Playbooks](quality/Test%20Method%20Playbooks.md)
[Defect Taxonomy & Severity](quality/Defect%20Taxonomy%20%26%20Severity.md)
