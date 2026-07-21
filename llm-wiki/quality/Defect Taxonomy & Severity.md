---
type: "QA Taxonomy"
title: "Defect Taxonomy & Severity"
description: "A tracker-neutral vocabulary for classifying defects by behavior and product surface and for assigning severity from user and system impact."
tags:
  - "qa"
  - "taxonomy"
  - "severity"
  - "triage"
created: "2026-06-30T00:00:00+00:00"
timestamp: "2026-07-21T00:00:00+00:00"
---

## Content

### Defect type

- **Functional** — behavior contradicts the product contract.
- **Validation** — valid input is rejected, invalid input is accepted, or feedback is wrong.
- **Visual or layout** — presentation, spacing, clipping, overlap, or responsive behavior.
- **Accessibility** — semantics, keyboard operation, focus, contrast, or assistive output.
- **Performance** — user-visible latency, excessive work, or resource use.
- **Metadata or discovery** — page metadata, indexing, sitemap, or share-card behavior.
- **Data or protocol contract** — request, response, serialization, or status semantics.
- **Race or timing** — behavior depends incorrectly on ordering or latency.
- **Internationalization** — locale, translation, currency, address, or regional behavior.
- **Security or privacy** — authorization, integrity, disclosure, or unsafe trust boundary.
- **Integration** — failure at an external service, webhook, or synchronization boundary.

### Product surface

Use the narrowest durable surface from the current repository structure:

- storefront shell, catalog, search, cart, checkout, account, content, or metadata;
- marketplace catalog, orders, configuration, ledger, payouts, or connected accounts;
- payment application;
- shared domain, foundation, infrastructure, feature, or UI package;
- documentation, build, deployment, or automated tests.

### Severity rubric

- **Critical** — a core path is broadly unavailable, security is compromised, or money/data
  integrity is at immediate risk with no safe workaround.
- **High** — substantial user or operational impact, including a blocked core path for a
  meaningful segment or a correctness risk with a limited workaround.
- **Medium** — degraded behavior with bounded scope or a practical workaround.
- **Low** — cosmetic or narrow edge behavior with negligible task impact.

Severity describes impact, not implementation effort, age, or ownership. Raise it when the
blast radius, likelihood, or integrity risk increases; lower it only when evidence narrows
those factors.

### When filing a bug, include

Include the defect type, product surface, severity rationale, environment and revision when
known, preconditions, minimal reproduction, expected and actual behavior, affected scope,
and durable evidence. Separate observed facts from hypotheses about the cause. Link related
requirements or implementation evidence when stable public links exist.

### Generalise before filing

If the same behavior recurs across inputs, describe the equivalence class and use specific
inputs as representatives. Do not generalize beyond the representatives unless the governing
rule or implementation proves the wider scope.

## Related Notes

[Quality & Testing (MOC)](Quality%20%26%20Testing%20%28MOC%29.md)
[Coverage Maps](Coverage%20Maps.md)
