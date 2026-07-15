---
type: "Map of Content"
title: "Quality & Testing (MOC)"
description: "Map-of-content and entry point for Quality Assurance — how agents (and people) test, retest, and report defects on Nimara. Start here."
tags:
  - "qa"
  - "testing"
  - "moc"
  - "index"
  - "agents"
created: "2026-06-30T00:00:00+00:00"
timestamp: "2026-06-30T00:00:00+00:00"
---

## Content

### What this section is for

This is the QA brain for **agents working on Nimara**. Read it before running a test or verifying
a reported defect so you do not rediscover environment constraints, test methods, or verdict
rules. Knowledge lives in these notes; executable runbooks live as skills under `skills/qa/`.

> Pairing convention (same as the rest of this wiki): notes = read-context, **skills = runbooks** that cite them. The QA skills read these notes the way `prd-author` reads `[Storefront Developer](../product/personas/Storefront%20Developer.md)`.

### Read-me-first (the 80%)

1. [Environments & Access Matrix](./Environments%20%26%20Access%20Matrix.md) — which env, which channel, what you can/can't reach. **Biggest source of wasted effort if skipped.**
2. [Bug Retest & Triage Process](./Bug%20Retest%20%26%20Triage%20Process.md) — the canonical verification flow: understand, plan, check prerequisites, execute, conclude, and record evidence.
3. [Verdict & Evidence Policy](./Verdict%20%26%20Evidence%20Policy.md) — evidence-only; "could not reproduce" is not "fixed".

### Methods & data

- [Test Method Playbooks](./Test%20Method%20Playbooks.md) — for bug class X, use technique Y (throttling, response inspection, geometry, Lighthouse, code inspection…).
- [Test Data & Fixtures](./Test%20Data%20%26%20Fixtures.md) — Stripe cards, addresses, postcodes, known products, i18n address rules.
- [Coverage Maps](./Coverage%20Maps.md) — equivalence partitions so you test _classes_, not random cases.

### Discipline

- [Verdict & Evidence Policy](./Verdict%20%26%20Evidence%20Policy.md) — evidence-only; "could not reproduce" ≠ "fixed".
- [Defect Taxonomy & Severity](./Defect%20Taxonomy%20%26%20Severity.md) — how to classify and prioritise what you find.
- [Known Flaky, Blocked & Backend-Only](./Known%20Flaky%2C%20Blocked%20%26%20Backend-Only.md) — where NOT to force a verdict.

### Who does this

- [QA Engineer (Test Agent)](../product/personas/QA%20Engineer%20%28Test%20Agent%29.md) — the persona this section serves.

### Skills (runbooks)

- `skills/qa/bug-retest-triage` — one reported defect, full verification flow.
- `skills/qa/test-case-design` — equivalence-partition a feature into a covering test set.
- `skills/qa/regression-sweep` — broad health check across a surface (SEO, perf, page-type matrix).

### Recording verification work

Every verification records the environment, channel, build or commit, preconditions, method,
decisive evidence, outcome, and caveats. The execution workflow may choose its own artifact
location; transient queue state and external workflow mechanics do not belong in this encyclopedia.

## Related Notes

[Environments & Access Matrix](./Environments%20%26%20Access%20Matrix.md)
[Bug Retest & Triage Process](./Bug%20Retest%20%26%20Triage%20Process.md)
[QA Engineer (Test Agent)](../product/personas/QA%20Engineer%20%28Test%20Agent%29.md)
[Product Strategy 2026 (MOC)](../product/strategy/Product%20Strategy%202026%20%28MOC%29.md)
