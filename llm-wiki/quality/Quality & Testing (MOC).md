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

This is the QA brain for **agents working on Nimara**. Read it before touching a test or a Jira ticket so you don't rediscover the environment, the board mechanics, or the verdict rules the hard way. Knowledge lives in these notes; the executable runbooks live under `.agents/skills/`.

> Pairing convention (same as the rest of this wiki): notes = read-context, **skills = runbooks** that cite them. The QA skills read these notes the way `prd-author` reads `[Storefront Developer](../market/personas/Storefront%20Developer.md)`.

### Read-me-first (the 80%)

1. [Environments & Access Matrix](Environments%20%26%20Access%20Matrix.md) — which env, which channel, what you can/can't reach. **Biggest source of wasted effort if skipped.**
2. [Jira & Board 74 Operating Manual](Jira%20%26%20Board%2074%20Operating%20Manual.md) — column↔status mapping, transition IDs, required fields, comment rules.
3. [Bug Retest & Triage Process](Bug%20Retest%20%26%20Triage%20Process.md) — the canonical retest flow (claim only after prereqs, evidence-only verdicts).

### Methods & data

- [Test Method Playbooks](Test%20Method%20Playbooks.md) — for bug class X, use technique Y (throttling, response inspection, geometry, Lighthouse, code inspection…).
- [Test Data & Fixtures](Test%20Data%20%26%20Fixtures.md) — Stripe cards, addresses, postcodes, known products, i18n address rules.
- [Coverage Maps](Coverage%20Maps.md) — equivalence partitions so you test _classes_, not random cases.

### Discipline

- [Verdict & Evidence Policy](Verdict%20%26%20Evidence%20Policy.md) — evidence-only; "could not reproduce" ≠ "fixed".
- [Defect Taxonomy & Severity](Defect%20Taxonomy%20%26%20Severity.md) — how to classify and prioritise what you find.
- [Known Flaky, Blocked & Backend-Only](Known%20Flaky%2C%20Blocked%20%26%20Backend-Only.md) — where NOT to force a verdict.

### Who does this

- [QA Engineer (Test Agent)](../market/personas/QA%20Engineer%20%28Test%20Agent%29.md) — the persona this section serves.

### Skills (runbooks)

- `.agents/skills/bug-retest-triage` — one ticket, full retest flow.
- `.agents/skills/test-case-design` — equivalence-partition a feature into a covering test set.
- `.agents/skills/regression-sweep` — broad health check across a surface (SEO, perf, page-type matrix).

### Where the work is recorded

Live QA artifacts sit in the repo at `qa/triage/`: `plans/<KEY>.md`, `evidence/<KEY>/`, `worklist.json` (per-ticket state), `jira-actions.json` (append-only action log). The retest protocol is also encoded in repo `CLAUDE.md`. Prior E2E findings live in the agent memory `MEMORY.md`.

## Related Notes

[Environments & Access Matrix](Environments%20%26%20Access%20Matrix.md)
[Jira & Board 74 Operating Manual](Jira%20%26%20Board%2074%20Operating%20Manual.md)
[Bug Retest & Triage Process](Bug%20Retest%20%26%20Triage%20Process.md)
[QA Engineer (Test Agent)](../market/personas/QA%20Engineer%20%28Test%20Agent%29.md)
[Product Strategy 2026 (MOC)](../market/strategy/Product%20Strategy%202026%20%28MOC%29.md)
