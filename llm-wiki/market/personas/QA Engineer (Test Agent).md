---
type: "Persona"
title: "QA Engineer (Test Agent)"
description: "The QA persona this wiki serves — a human or autonomous agent that verifies behaviour on evidence, retests reported defects on a live shared board, and never fabricates or forces a result."
tags:
  - "persona"
  - "qa"
  - "agent"
  - "testing"
created: "2026-06-30T00:00:00+00:00"
timestamp: "2026-06-30T00:00:00+00:00"
---

## Content

### Goals
- Give every reported defect a **defensible, evidence-backed verdict** (still reproduces → Open, or fixed → Done) — fast, and without re-discovering the environment or board mechanics each time.
- Keep the board honest and the audit trail complete (`qa/triage/` plans, evidence, ledgers).
- Surface systemic issues as classes, and hand backend-only work to developers cleanly.

### Pain points (what slows this persona)
- **Access friction**: backends (Saleor/ERP), SSO-gated docs, and missing test credentials block ~⅓ of tickets; round-trips for access dominate the cost.
- **Hidden board mechanics**: column↔status mapping, transition IDs, required custom fields, ADF-comment and mention quirks — easy to get wrong without the [Jira & Board 74 Operating Manual](quality/Jira%20%26%20Board%2074%20Operating%20Manual.md).
- **Flaky/timing/backend defects** where a single observation isn't conclusive.
- **Serial work**: most retests are independent and would parallelise, but board writes need coordination.

### Behaviour patterns
- Reads the [Environments & Access Matrix](quality/Environments%20%26%20Access%20Matrix.md) and [Jira & Board 74 Operating Manual](quality/Jira%20%26%20Board%2074%20Operating%20Manual.md) before acting.
- **Claims a ticket only after the prereq check passes**; ASKs (and batches asks) when blocked rather than guessing.
- Picks the **cheapest reliable method per bug class** ([Test Method Playbooks](quality/Test%20Method%20Playbooks.md)); runs a **control** for ambiguous results.
- Comments factually, no AI/automation references; logs every action.

### Key quote
> "I don't close a ticket because I couldn't make it fail — I close it because I have evidence the fix holds."

### Product implications
- Invest in machine-deterministic QA context (env URLs, transition IDs, field IDs, channel prefixes) so agents — and an orchestrator fanning out workers — don't re-learn them.
- Make backend signals observable to QA (a read-only Saleor/GraphQL token, a working ERP/stage) to unblock the backend-only tickets.
- Treat `qa/triage/` + this `qa/` wiki + the `.agents/skills/*` QA runbooks as the QA system of record.

## Related Notes
[Storefront Developer](product/personas/Storefront%20Developer.md)
[Ecommerce Manager](product/personas/Ecommerce%20Manager.md)
[Quality & Testing (MOC)](quality/Quality%20%26%20Testing%20%28MOC%29.md)
