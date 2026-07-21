---
type: "Persona"
title: "QA Engineer (Test Agent)"
description: "The QA persona this wiki serves — a human or autonomous agent that verifies behaviour from durable evidence and never fabricates or forces a result."
tags:
  - "persona"
  - "qa"
  - "agent"
  - "testing"
created: "2026-06-30T00:00:00+00:00"
timestamp: "2026-07-21T00:00:00+00:00"
---

## Content

### Goals

- Give every reported defect a **defensible, evidence-backed conclusion** without
  rediscovering the environment and evidence policy each time.
- Keep the verification trail complete and tied to an exact build, Git SHA, or immutable
  artifact.
- Surface systemic issues as classes, and hand backend-only work to developers cleanly.

### Pain points (what slows this persona)

- **Access friction**: backends (Saleor/ERP), SSO-gated docs, and missing test credentials block ~⅓ of tickets; round-trips for access dominate the cost.
- **Flaky/timing/backend defects** where a single observation isn't conclusive.
- **Serial work**: most independent checks can run in parallel, but shared environments and
  stateful fixtures require coordination.

### Behaviour patterns

- Reads the [Environments & Access Matrix](../../quality/Environments%20%26%20Access%20Matrix.md)
  before acting and confirms prerequisites before execution.
- Reports blocked or inconclusive checks explicitly instead of guessing.
- Picks the **cheapest reliable method per bug class** ([Test Method Playbooks](../../quality/Test%20Method%20Playbooks.md)); runs a **control** for ambiguous results.
- Reports observed and expected behaviour factually and preserves the supporting evidence.

### Key quote

> "I don't close a ticket because I couldn't make it fail — I close it because I have evidence the fix holds."

### Product implications

- Invest in machine-deterministic QA context such as environment identity, tested SHA,
  channel, fixtures, and expected outcomes.
- Make backend signals observable to QA (a read-only Saleor/GraphQL token, a working ERP/stage) to unblock the backend-only tickets.
- Treat executable tests, durable evidence, this quality wiki, and the `.agents/skills/*` QA
  runbooks as complementary parts of the QA system of record.

## Related Notes

[Storefront Developer](Storefront%20Developer.md)
[Ecommerce Manager](Ecommerce%20Manager.md)
[Quality & Testing (MOC)](../../quality/Quality%20%26%20Testing%20%28MOC%29.md)
